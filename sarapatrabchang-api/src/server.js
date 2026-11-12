import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearSessionCookie,
  createSessionToken,
  getSessionToken,
  hashPassword,
  hashSessionToken,
  sessionCookie,
  toPublicUser,
  verifyPassword,
} from "./auth.js";
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

function isLoopbackDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return (
      url.origin === origin &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
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

function validateCredentials(body, { registration = false } = {}) {
  const email = requiredText(body.email, "อีเมล", 320).toLocaleLowerCase("en-US");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "VALIDATION_ERROR", "รูปแบบอีเมลไม่ถูกต้อง");
  }
  if (typeof body.password !== "string" || body.password.length > 128) {
    throw new HttpError(400, "VALIDATION_ERROR", "รหัสผ่านไม่ถูกต้อง");
  }
  if (
    registration &&
    (body.password.length < 8 ||
      !/[A-Za-z]/.test(body.password) ||
      !/[0-9]/.test(body.password))
  ) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข",
    );
  }

  return {
    email,
    password: body.password,
    ...(registration
      ? {
          fullName: requiredText(body.fullName, "ชื่อ-นามสกุล", 120),
          phone: requiredText(body.phone, "เบอร์โทรศัพท์", 30),
        }
      : {}),
  };
}

async function authenticate(request, pool) {
  const token = getSessionToken(request);
  if (!token) throw new HttpError(401, "UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนใช้งาน");

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role, u.full_name AS "fullName", u.phone,
            u.created_at AS "createdAt"
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [hashSessionToken(token)],
  );
  if (rows.length === 0) {
    throw new HttpError(401, "INVALID_SESSION", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }
  return rows[0];
}

function searchProviders(searchParams) {
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
    contactName: user.fullName || user.email,
    email: user.email,
    phone: user.phone ?? "",
    address: requiredText(body.customer.address, "ที่อยู่", 500),
    note:
      typeof body.customer.note === "string"
        ? body.customer.note.trim().length <= 500
          ? body.customer.note.trim()
          : requiredText(body.customer.note, "หมายเหตุ", 500)
        : "",
  };
}

async function withTransaction(pool, callback) {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    const result = await callback(client);
    await client.query("COMMIT");
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function createApp({
  pool,
  webOrigin = "http://localhost:3000",
} = {}) {
  if (!pool) throw new Error("A PostgreSQL connection pool is required");
  const allowedOrigins = new Set(
    webOrigin.split(",").map((origin) => origin.trim()).filter(Boolean),
  );

  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (
      origin &&
      !allowedOrigins.has(origin) &&
      !isLoopbackDevelopmentOrigin(origin)
    ) {
      sendJson(response, 403, {
        error: { code: "ORIGIN_NOT_ALLOWED", message: "ไม่อนุญาตให้เรียก API จาก origin นี้" },
      });
      return;
    }
    const corsHeaders = origin
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-allow-credentials": "true",
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
        const data = searchProviders(url.searchParams);
        sendJson(response, 200, { data, total: data.length }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        let user;
        try {
          user = await authenticate(request, pool);
        } catch (error) {
          if (error instanceof HttpError && error.status === 401) {
            sendJson(response, 200, { data: null }, corsHeaders);
            return;
          }
          throw error;
        }
        sendJson(response, 200, { data: toPublicUser(user) }, corsHeaders);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/register") {
        const credentials = validateCredentials(await readJsonBody(request), {
          registration: true,
        });
        const passwordHash = await hashPassword(credentials.password);
        const token = createSessionToken();
        const user = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `INSERT INTO users (id, email, password_hash, full_name, phone)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email, role, full_name AS "fullName", phone,
                       created_at AS "createdAt"`,
            [
              randomUUID(),
              credentials.email,
              passwordHash,
              credentials.fullName,
              credentials.phone,
            ],
          );
          if (rows.length === 0) {
            throw new HttpError(409, "EMAIL_IN_USE", "อีเมลนี้มีบัญชีอยู่แล้ว");
          }
          await client.query(
            `INSERT INTO sessions (token_hash, user_id, expires_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')`,
            [hashSessionToken(token), rows[0].id],
          );
          return rows[0];
        });
        sendJson(
          response,
          201,
          { data: toPublicUser(user) },
          { ...corsHeaders, "set-cookie": sessionCookie(token) },
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const credentials = validateCredentials(await readJsonBody(request));
        const { rows } = await pool.query(
          `SELECT id, email, role, password_hash AS "passwordHash",
                  full_name AS "fullName", phone, created_at AS "createdAt"
           FROM users
           WHERE email = $1
           LIMIT 1`,
          [credentials.email],
        );
        const user = rows[0];
        if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
          throw new HttpError(401, "INVALID_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        const token = createSessionToken();
        await pool.query(
          `INSERT INTO sessions (token_hash, user_id, expires_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')`,
          [hashSessionToken(token), user.id],
        );
        sendJson(
          response,
          200,
          { data: toPublicUser(user) },
          { ...corsHeaders, "set-cookie": sessionCookie(token) },
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const token = getSessionToken(request);
        if (token) {
          await pool.query("DELETE FROM sessions WHERE token_hash = $1", [
            hashSessionToken(token),
          ]);
        }
        sendJson(
          response,
          200,
          { data: { signedOut: true } },
          { ...corsHeaders, "set-cookie": clearSessionCookie() },
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/bookings") {
        const user = await authenticate(request, pool);
        const booking = validateBooking(await readJsonBody(request), user);
        await pool.query(
          `INSERT INTO bookings
            (id, user_id, provider_id, package_title, price, service_date,
             time_slot, contact_name, email, phone, address, note, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending_payment')`,
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
        const user = await authenticate(request, pool);
        const { rows } = await pool.query(
          `SELECT id, user_id AS "userId", provider_id AS "providerId",
                  package_title AS "packageTitle", price, service_date AS date,
                  time_slot AS "timeSlot", contact_name AS "contactName",
                  email, phone, address, note, status, created_at AS "createdAt"
           FROM bookings
           WHERE id = $1 AND user_id = $2
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
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    await pool.end();
    throw error;
  }
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? "127.0.0.1";
  createApp({
    pool,
    webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  }).listen(port, host, () => {
    console.log(`SarapatRabChang API listening on port ${port}`);
  });
}
