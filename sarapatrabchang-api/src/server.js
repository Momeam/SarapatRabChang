import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categories, providers } from "./data.js";

const maxBodyBytes = 16 * 1024;

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(value));
}

async function readJsonBody(request) {
  if (!(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "กรุณาส่งข้อมูลแบบ JSON");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new HttpError(413, "PAYLOAD_TOO_LARGE", "ข้อมูลที่ส่งมีขนาดใหญ่เกินไป");
    }
    chunks.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Expected an object");
    }
    return body;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "รูปแบบ JSON ไม่ถูกต้อง");
  }
}

function requiredText(value, field, maxLength) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "VALIDATION_ERROR", `กรุณาระบุ ${field}`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw new HttpError(400, "VALIDATION_ERROR", `${field} ยาวเกินกำหนด`);
  }
  return result;
}

function validateDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "VALIDATION_ERROR", "date ต้องอยู่ในรูปแบบ YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "VALIDATION_ERROR", "วันที่ไม่ถูกต้อง");
  }
}

async function authenticate(request, { supabaseUrl, supabaseAnonKey, fetchImpl }) {
  const authorization = request.headers.authorization;
  const token =
    typeof authorization === "string"
      ? /^Bearer\s+(.+)$/i.exec(authorization)?.[1]
      : undefined;
  if (!token) {
    throw new HttpError(401, "UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนใช้งาน");
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new HttpError(503, "AUTH_NOT_CONFIGURED", "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase");
  }

  let response;
  try {
    response = await fetchImpl(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Supabase user verification failed:", error);
    throw new HttpError(502, "AUTH_PROVIDER_UNAVAILABLE", "ตรวจสอบบัญชีผู้ใช้ไม่สำเร็จ");
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(401, "INVALID_SESSION", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }
  if (!response.ok) {
    console.error("Supabase user verification returned status:", response.status);
    throw new HttpError(502, "AUTH_PROVIDER_ERROR", "Supabase ไม่สามารถตรวจสอบบัญชีได้");
  }

  let user;
  try {
    user = await response.json();
  } catch {
    throw new HttpError(502, "AUTH_PROVIDER_ERROR", "Supabase ส่งข้อมูลบัญชีไม่ถูกต้อง");
  }
  if (!user || typeof user.id !== "string" || typeof user.email !== "string") {
    throw new HttpError(502, "AUTH_PROVIDER_ERROR", "Supabase ส่งข้อมูลบัญชีไม่ครบ");
  }
  return user;
}

async function syncUser(pool, user) {
  const metadata =
    user.user_metadata && typeof user.user_metadata === "object"
      ? user.user_metadata
      : {};
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const phone = typeof metadata.phone === "string" ? metadata.phone.trim() : "";

  await pool.execute(
    `INSERT INTO users (supabase_id, email, full_name, phone)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       email = VALUES(email),
       full_name = VALUES(full_name),
       phone = VALUES(phone),
       updated_at = CURRENT_TIMESTAMP`,
    [user.id, user.email, fullName, phone],
  );
  return {
    id: user.id,
    email: user.email,
    fullName,
    phone,
    createdAt: user.created_at ?? null,
  };
}

async function searchProviders(searchParams) {
  const category = searchParams.get("category")?.trim().toLocaleLowerCase("th");
  const locations = (searchParams.get("location") ?? "")
    .split(",")
    .map((location) => location.trim().toLocaleLowerCase("th"))
    .filter(Boolean);
  const query = searchParams.get("q")?.trim().toLocaleLowerCase("th");
  return providers.filter((provider) => {
    if (category && category !== "all" && provider.categoryKey !== category) return false;
    if (
      locations.length > 0 &&
      !locations.every((location) =>
        provider.serviceAreas.some((area) =>
          area.toLocaleLowerCase("th").includes(location),
        ),
      )
    ) {
      return false;
    }
    if (
      query &&
      ![provider.name, provider.category, provider.serviceTitle]
        .some((value) => value.toLocaleLowerCase("th").includes(query))
    ) {
      return false;
    }
    return true;
  });
}

function validateBooking(body, user) {
  const providerId = requiredText(body.providerId, "providerId", 80);
  const provider = providers.find((item) => item.id === providerId);
  if (!provider) throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
  validateDate(body.date);

  if (!body.customer || typeof body.customer !== "object" || Array.isArray(body.customer)) {
    throw new HttpError(400, "VALIDATION_ERROR", "กรุณาระบุที่อยู่สำหรับให้บริการ");
  }

  const metadata =
    user.user_metadata && typeof user.user_metadata === "object"
      ? user.user_metadata
      : {};
  return {
    id: randomUUID(),
    userId: user.id,
    providerId,
    packageTitle:
      typeof body.packageTitle === "string" && body.packageTitle.trim()
        ? requiredText(body.packageTitle, "packageTitle", 120)
        : provider.serviceTitle,
    price: provider.startingPrice,
    date: body.date,
    timeSlot: requiredText(body.timeSlot, "timeSlot", 60),
    contactName:
      typeof metadata.full_name === "string" && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : user.email,
    email: user.email,
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    address: requiredText(body.customer.address, "ที่อยู่", 500),
    note:
      typeof body.customer.note === "string"
        ? body.customer.note.trim().length <= 500
          ? body.customer.note.trim()
          : requiredText(body.customer.note, "หมายเหตุ", 500)
        : "",
  };
}

export function createApp({
  pool,
  webOrigin = "http://localhost:3000",
  supabaseUrl = process.env.SUPABASE_URL,
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY,
  fetchImpl = fetch,
} = {}) {
  if (!pool) throw new Error("A MySQL connection pool is required");
  const authOptions = { supabaseUrl, supabaseAnonKey, fetchImpl };
  const allowedOrigins = new Set(
    webOrigin.split(",").map((origin) => origin.trim()).filter(Boolean),
  );

  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      sendJson(response, 403, {
        error: { code: "ORIGIN_NOT_ALLOWED", message: "ไม่อนุญาตให้เรียก API จาก origin นี้" },
      });
      return;
    }
    const corsHeaders = origin
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "Content-Type, Authorization",
          vary: "Origin",
        }
      : {};

    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url, "http://localhost");
      const segments = url.pathname.split("/").filter(Boolean);

      if (request.method === "GET" && url.pathname === "/api/health") {
        await pool.query("SELECT 1");
        sendJson(response, 200, { status: "ok", database: "connected" }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/categories") {
        sendJson(response, 200, { data: categories }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/providers") {
        const data = await searchProviders(url.searchParams);
        sendJson(response, 200, { data, total: data.length }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const user = await authenticate(request, authOptions);
        const profile = await syncUser(pool, user);
        sendJson(response, 200, { data: profile }, corsHeaders);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/bookings") {
        const user = await authenticate(request, authOptions);
        const booking = validateBooking(await readJsonBody(request), user);
        await syncUser(pool, user);
        await pool.execute(
          `INSERT INTO bookings
            (id, user_id, provider_id, package_title, price, service_date,
             time_slot, contact_name, email, phone, address, note, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
          [
            booking.id,
            booking.userId,
            booking.providerId,
            booking.packageTitle,
            booking.price,
            booking.date,
            booking.timeSlot,
            booking.contactName,
            booking.email,
            booking.phone,
            booking.address,
            booking.note,
          ],
        );
        sendJson(
          response,
          201,
          {
            data: {
              id: booking.id,
              userId: booking.userId,
              providerId: booking.providerId,
              packageTitle: booking.packageTitle,
              price: booking.price,
              date: booking.date,
              timeSlot: booking.timeSlot,
              status: "pending_payment",
            },
          },
          corsHeaders,
        );
        return;
      }

      if (
        request.method === "GET" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "bookings"
      ) {
        const user = await authenticate(request, authOptions);
        const [rows] = await pool.execute(
          `SELECT id, user_id AS userId, provider_id AS providerId,
                  package_title AS packageTitle, price, service_date AS date,
                  time_slot AS timeSlot, contact_name AS contactName,
                  email, phone, address, note, status, created_at AS createdAt
           FROM bookings
           WHERE id = ? AND user_id = ?
           LIMIT 1`,
          [segments[2], user.id],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        sendJson(response, 200, { data: rows[0] }, corsHeaders);
        return;
      }

      if (request.method === "GET" || request.method === "POST") {
        throw new HttpError(404, "NOT_FOUND", "ไม่พบ endpoint นี้");
      }
      sendJson(
        response,
        405,
        { error: { code: "METHOD_NOT_ALLOWED", message: "ไม่รองรับ HTTP method นี้" } },
        { ...corsHeaders, allow: "GET, POST, OPTIONS" },
      );
    } catch (error) {
      if (error instanceof HttpError) {
        sendJson(
          response,
          error.status,
          { error: { code: error.code, message: error.message } },
          corsHeaders,
        );
        return;
      }
      console.error("API request failed:", error);
      sendJson(
        response,
        500,
        { error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" } },
        corsHeaders,
      );
    }
  });
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const requiredEnvironment = [
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ];
  const missing = requiredEnvironment.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const { createPool } = await import("mysql2/promise");
  const pool = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
  });
  const port = Number(process.env.PORT ?? 4000);
  const app = createApp({
    pool,
    webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  });
  app.listen(port, process.env.HOST ?? "127.0.0.1", () => {
    console.log(`SarapatRabChang API listening on port ${port}`);
  });
}
