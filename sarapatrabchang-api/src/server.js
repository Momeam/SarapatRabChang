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

const maxBodyBytes = 16 * 1024;
const providerSelect = `
  SELECT l.listing_id::text AS id,
         COALESCE(NULLIF(u.full_name, ''), pf.first_name, u.email) AS name,
         COALESCE(u.avatar_url, pf.avatar_url, l.cover_image_url) AS avatar,
         sc.category_name AS category,
         sc.category_key AS "categoryKey",
         l.title AS "serviceTitle",
         COALESCE(stats.rating, 0)::float AS rating,
         COALESCE(stats.review_count, 0)::int AS "reviewCount",
         COALESCE(stats.completed_jobs, 0)::int AS "completedJobs",
         COALESCE(stats.reviews, '[]'::jsonb) AS reviews,
         LOWER(COALESCE(pf.kyc_status, '')) IN ('approved', 'verified') AS verified,
         l.service_areas AS "serviceAreas",
         package.price::float AS "startingPrice",
         package.tier_name AS "packageTitle",
         package.duration_label AS duration,
         package.features AS features,
         l.price_unit AS "priceUnit",
         COALESCE(pf.response_time, 'ตอบกลับเมื่อได้รับข้อความ') AS "responseTime",
         COALESCE(pf.experience_years, 0)::int AS "experienceYears",
         COALESCE(pf.has_tools, FALSE) AS "hasTools",
         COALESCE(pf.working_hours, 'ตามนัดหมาย') AS "workingHours",
         l.description,
         l.portfolio
  FROM service_listing l
  JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
  JOIN users u ON u.id = pf.id_card_number
  JOIN service_category sc ON sc.category_id = l.category_id
  JOIN LATERAL (
    SELECT price, tier_name, duration_label, features
    FROM service_package
    WHERE listing_id = l.listing_id
    ORDER BY price ASC
    LIMIT 1
  ) package ON TRUE
  LEFT JOIN (
    SELECT o.listing_id,
           AVG(r.rating)::float AS rating,
           COUNT(r.review_id)::int AS review_count,
           JSONB_AGG(
             JSONB_BUILD_OBJECT(
               'id', r.review_id::text,
               'reviewerName', COALESCE(NULLIF(reviewer.full_name, ''), 'ผู้ใช้บริการ'),
               'rating', r.rating,
               'comment', COALESCE(r.comment, ''),
               'createdAt', r.created_at
             )
             ORDER BY r.created_at DESC
           ) FILTER (WHERE r.review_id IS NOT NULL) AS reviews,
           COUNT(DISTINCT o.order_id) FILTER (
             WHERE LOWER(o.order_status) IN ('completed', 'done', 'finished')
           )::int AS completed_jobs
    FROM orders o
    LEFT JOIN reviews r ON r.order_id = o.order_id
    LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
    GROUP BY o.listing_id
  ) stats ON stats.listing_id = l.listing_id
`;

const profileSelect = `
  SELECT u.id, u.email, u.full_name AS "fullName", u.phone,
         u.created_at AS "createdAt", u.avatar_url AS "avatarUrl",
         u.bio, COALESCE(pc.interests, ARRAY[]::TEXT[]) AS interests,
         COALESCE(pc.address, '') AS address,
         COALESCE(pc.tax_id, '') AS "taxId",
         COALESCE(pc.tax_address, '') AS "taxAddress",
         COALESCE(pc.tax_email, u.email) AS "taxEmail",
         (pf.freelance_id IS NOT NULL) AS "isProvider",
         COALESCE(review_stats.rating, 0)::float AS rating,
         COALESCE(review_stats.review_count, 0)::int AS "reviewCount",
         COALESCE(review_stats.reviews, '[]'::jsonb) AS reviews
  FROM users u
  LEFT JOIN profile_client pc ON pc.client_id = u.id
  LEFT JOIN profile_freelance pf ON pf.id_card_number = u.id
  LEFT JOIN LATERAL (
    SELECT AVG(r.rating)::float AS rating,
           COUNT(r.review_id)::int AS review_count,
           JSONB_AGG(
             JSONB_BUILD_OBJECT(
               'id', r.review_id::text,
               'reviewerName', COALESCE(NULLIF(reviewer.full_name, ''), 'ผู้ใช้บริการ'),
               'rating', r.rating,
               'comment', COALESCE(r.comment, ''),
               'createdAt', r.created_at
             )
             ORDER BY r.created_at DESC
           ) FILTER (WHERE r.review_id IS NOT NULL) AS reviews
    FROM service_listing l
    JOIN orders o ON o.listing_id = l.listing_id
    JOIN reviews r ON r.order_id = o.order_id
    LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
    WHERE l.freelance_id = pf.freelance_id
  ) review_stats ON TRUE
  WHERE u.id = $1
`;

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

function validateProfileUpdate(body) {
  const allowedFields = new Set([
    "fullName",
    "phone",
    "bio",
    "avatarUrl",
    "interests",
    "address",
    "taxId",
    "taxAddress",
    "taxEmail",
  ]);
  const bodyFields = Object.keys(body);
  if (
    bodyFields.length === 0 ||
    bodyFields.some((field) => !allowedFields.has(field))
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "ไม่มีข้อมูลโปรไฟล์ที่รองรับให้อัปเดต");
  }

  const updates = {};
  const textFields = [
    ["fullName", "ชื่อ-นามสกุล", 120, true],
    ["phone", "เบอร์โทรศัพท์", 30, false],
    ["bio", "คำแนะนำตัว", 300, false],
    ["address", "ที่อยู่", 500, false],
    ["taxId", "เลขประจำตัวผู้เสียภาษี", 50, false],
    ["taxAddress", "ที่อยู่ใบกำกับภาษี", 500, false],
    ["taxEmail", "อีเมลรับเอกสาร", 320, false],
  ];
  for (const [field, label, maxLength, required] of textFields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    if (typeof body[field] !== "string") {
      throw new HttpError(400, "VALIDATION_ERROR", `${label}ไม่ถูกต้อง`);
    }
    const value = body[field].trim();
    if (required && !value) {
      throw new HttpError(400, "VALIDATION_ERROR", `กรุณาระบุ${label}`);
    }
    if (value.length > maxLength) {
      throw new HttpError(400, "VALIDATION_ERROR", `${label}ยาวเกินกำหนด`);
    }
    if (
      field === "taxEmail" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      throw new HttpError(400, "VALIDATION_ERROR", "รูปแบบอีเมลรับเอกสารไม่ถูกต้อง");
    }
    updates[field] = value;
  }

  if (Object.prototype.hasOwnProperty.call(body, "avatarUrl")) {
    if (typeof body.avatarUrl !== "string" || body.avatarUrl.length > 2048) {
      throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์รูปโปรไฟล์ไม่ถูกต้อง");
    }
    const avatarUrl = body.avatarUrl.trim();
    if (avatarUrl) {
      try {
        if (new URL(avatarUrl).protocol !== "https:") throw new Error("Invalid protocol");
      } catch {
        throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์รูปโปรไฟล์ต้องเป็น HTTPS URL");
      }
    }
    updates.avatarUrl = avatarUrl;
  }

  if (Object.prototype.hasOwnProperty.call(body, "interests")) {
    if (
      !Array.isArray(body.interests) ||
      body.interests.length > 20 ||
      body.interests.some((item) => typeof item !== "string")
    ) {
      throw new HttpError(400, "VALIDATION_ERROR", "ประเภทงานที่สนใจไม่ถูกต้อง");
    }
    const interests = body.interests.map((item) =>
      requiredText(item, "ประเภทงานที่สนใจ", 50),
    );
    if (new Set(interests.map((item) => item.toLocaleLowerCase("th-TH"))).size !== interests.length) {
      throw new HttpError(400, "VALIDATION_ERROR", "ไม่สามารถเพิ่มประเภทงานซ้ำได้");
    }
    updates.interests = interests;
  }

  return updates;
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

async function validateBooking(body, user, pool) {
  const providerId = requiredText(body.providerId, "providerId", 80);
  if (!/^\d+$/.test(providerId)) {
    throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
  }
  const { rows } = await pool.query(
    `SELECT l.title AS "serviceTitle", package.tier_name AS "packageTitle",
            package.price::float AS "startingPrice"
     FROM service_listing l
     JOIN LATERAL (
       SELECT tier_name, price
       FROM service_package
       WHERE listing_id = l.listing_id
       ORDER BY price ASC
       LIMIT 1
     ) package ON TRUE
     WHERE l.listing_id = $1 AND LOWER(l.status) = 'active'
     LIMIT 1`,
    [providerId],
  );
  const provider = rows[0];
  if (!provider) throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
  validateDate(body.date);

  if (!body.customer || typeof body.customer !== "object" || Array.isArray(body.customer)) {
    throw new HttpError(400, "VALIDATION_ERROR", "กรุณาระบุที่อยู่สำหรับให้บริการ");
  }
  const packageTitle =
    typeof body.packageTitle === "string" && body.packageTitle.trim()
      ? requiredText(body.packageTitle, "packageTitle", 120)
      : provider.packageTitle;
  if (packageTitle !== provider.packageTitle) {
    throw new HttpError(400, "INVALID_PACKAGE", "ไม่พบแพ็กเกจที่เลือก");
  }

  return {
    id: randomUUID(),
    userId: user.id,
    providerId,
    packageTitle,
    price: provider.startingPrice,
    date: body.date,
    timeSlot: requiredText(body.timeSlot, "timeSlot", 60),
    contactName:
      typeof body.customer.contactName === "string" && body.customer.contactName.trim()
        ? requiredText(body.customer.contactName, "ชื่อผู้ติดต่อ", 120)
        : user.fullName || "ผู้ใช้บริการ",
    email: user.email,
    phone:
      typeof body.customer.phone === "string" && body.customer.phone.trim()
        ? requiredText(body.customer.phone, "เบอร์โทรศัพท์", 30)
        : user.phone ?? "",
    address: requiredText(body.customer.address, "ที่อยู่", 500),
    note:
      typeof body.customer.note === "string"
        ? body.customer.note.trim().length <= 500
          ? body.customer.note.trim()
          : requiredText(body.customer.note, "หมายเหตุ", 500)
        : "",
  };
}

function bookingAccessQuery() {
  return `SELECT b.id, b.provider_id AS "providerId",
                 b.package_title AS "packageTitle", b.price::float AS price,
                 b.service_date AS date, b.time_slot AS "timeSlot",
                 b.contact_name AS "contactName", b.phone, b.address,
                 b.note, b.status, b.status_note AS "statusNote",
                 b.delivery_note AS "deliveryNote",
                 b.delivery_photo_urls AS "deliveryPhotoUrls",
                 b.delivered_at AS "deliveredAt",
                 b.created_at AS "createdAt", b.updated_at AS "updatedAt",
                 l.title AS "serviceTitle", c.category_name AS category,
                 COALESCE(NULLIF(provider.full_name, ''), NULLIF(pf.first_name, ''), 'ผู้ให้บริการ')
                   AS "providerName",
                 CASE WHEN b.user_id = $1 THEN 'customer' ELSE 'provider' END
                   AS "viewerRole"
          FROM bookings b
          JOIN service_listing l ON l.listing_id::text = b.provider_id
          JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
          JOIN users provider ON provider.id = pf.id_card_number
          JOIN service_category c ON c.category_id = l.category_id
          WHERE (b.user_id = $1 OR pf.id_card_number = $1)`;
}

function validateBookingAction(body) {
  const action = requiredText(body.action, "action", 40);
  if (!["confirm_payment", "start_work", "deliver", "approve", "request_revision", "dispute"].includes(action)) {
    throw new HttpError(400, "INVALID_ACTION", "ไม่รองรับการดำเนินการนี้");
  }
  const note =
    typeof body.note === "string" && body.note.trim()
      ? requiredText(body.note, "รายละเอียด", 1000)
      : "";
  if (["deliver", "request_revision", "dispute"].includes(action) && !note) {
    throw new HttpError(400, "VALIDATION_ERROR", "กรุณาระบุรายละเอียด");
  }
  const photoUrls = body.photoUrls ?? [];
  if (
    !Array.isArray(photoUrls) ||
    photoUrls.length > 5 ||
    photoUrls.some((value) => typeof value !== "string" || value.length > 2048)
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์รูปภาพไม่ถูกต้อง");
  }
  for (const value of photoUrls) {
    try {
      if (new URL(value).protocol !== "https:") throw new Error("Invalid protocol");
    } catch {
      throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์รูปภาพต้องเป็น HTTPS URL");
    }
  }
  return { action, note, photoUrls };
}

function validateProviderSubmission(body) {
  const categoryKey = requiredText(body.categoryKey, "หมวดหมู่บริการ", 60);
  const title = requiredText(body.title, "ชื่อบริการ", 200);
  const packageName = requiredText(body.packageName, "ชื่อแพ็กเกจ", 50);
  const durationLabel = requiredText(body.duration, "ระยะเวลาให้บริการ", 50);
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 5000) {
    throw new HttpError(400, "VALIDATION_ERROR", "รายละเอียดบริการยาวเกินกำหนด");
  }
  const serviceAreas = requiredText(body.location, "พื้นที่ให้บริการ", 1000)
    .split(",")
    .map((area) => area.trim())
    .filter(Boolean);
  if (
    serviceAreas.length === 0 ||
    serviceAreas.length > 20 ||
    serviceAreas.some((area) => area.length > 100)
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "ระบุพื้นที่ให้บริการได้ไม่เกิน 20 พื้นที่");
  }
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000000) {
    throw new HttpError(400, "VALIDATION_ERROR", "ราคาบริการไม่ถูกต้อง");
  }
  const features = body.features ?? [];
  if (
    !Array.isArray(features) ||
    features.length > 20 ||
    features.some((feature) => typeof feature !== "string" || feature.trim().length > 200)
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "รายละเอียดแพ็กเกจไม่ถูกต้อง");
  }
  const portfolioUrls = body.portfolioUrls ?? [];
  if (!Array.isArray(portfolioUrls) || portfolioUrls.length > 3) {
    throw new HttpError(400, "VALIDATION_ERROR", "แนบลิงก์รูปภาพได้ไม่เกิน 3 รูป");
  }
  if (
    body.coverImageUrl !== undefined &&
    typeof body.coverImageUrl !== "string"
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์ภาพปกไม่ถูกต้อง");
  }
  const imageUrls = [body.coverImageUrl, ...portfolioUrls]
    .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
    .map((imageUrl) => imageUrl.trim());
  if (imageUrls.length > 4) {
    throw new HttpError(400, "VALIDATION_ERROR", "แนบลิงก์รูปภาพได้ไม่เกิน 4 รูป");
  }
  for (const imageUrl of imageUrls) {
    try {
      if (new URL(imageUrl).protocol !== "https:") throw new Error("Invalid protocol");
    } catch {
      throw new HttpError(400, "VALIDATION_ERROR", "ลิงก์รูปภาพต้องเป็น HTTPS URL");
    }
  }
  const coverImageUrl = imageUrls[0] ?? null;
  const portfolio = imageUrls.slice(1).map((image, index) => ({
    title: `ผลงาน ${index + 1}`,
    image,
    filename: "",
  }));

  return {
    categoryKey,
    title,
    packageName,
    durationLabel,
    description,
    serviceAreas,
    price,
    features: features.map((feature) => feature.trim()).filter(Boolean),
    coverImageUrl,
    portfolio,
  };
}

function mapProvider(row) {
  return {
    ...row,
    rating: Number(row.rating),
    reviewCount: Number(row.reviewCount),
    completedJobs: Number(row.completedJobs),
    startingPrice: Number(row.startingPrice),
    experienceYears: Number(row.experienceYears),
    serviceAreas: row.serviceAreas ?? [],
    portfolio: row.portfolio ?? [],
    features: row.features ?? [],
    reviews: row.reviews ?? [],
  };
}

function mapProfile(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    phone: row.phone ?? "",
    createdAt: row.createdAt,
    avatarUrl: row.avatarUrl ?? "",
    bio: row.bio ?? "",
    interests: row.interests ?? [],
    address: row.address ?? "",
    taxId: row.taxId ?? "",
    taxAddress: row.taxAddress ?? "",
    taxEmail: row.taxEmail ?? row.email,
    isProvider: Boolean(row.isProvider),
    rating: Number(row.rating),
    reviewCount: Number(row.reviewCount),
    reviews: row.reviews ?? [],
  };
}

async function getProfile(userId, pool) {
  const { rows } = await pool.query(profileSelect, [userId]);
  if (!rows[0]) throw new HttpError(404, "PROFILE_NOT_FOUND", "ไม่พบข้อมูลโปรไฟล์");
  return mapProfile(rows[0]);
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
          "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
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
        const { rows } = await pool.query(
          `SELECT c.category_key AS id, c.category_name AS name,
                  c.icon_name AS icon,
                  COUNT(l.listing_id) FILTER (
                    WHERE LOWER(l.status) = 'active'
                  )::int AS count
           FROM service_category c
           LEFT JOIN service_listing l ON l.category_id = c.category_id
           WHERE c.category_key IS NOT NULL
           GROUP BY c.category_id, c.category_key, c.category_name,
                    c.icon_name, c.display_order
           ORDER BY c.display_order, c.category_name`,
        );
        const total = rows.reduce((count, category) => count + category.count, 0);
        sendJson(
          response,
          200,
          { data: [...rows, { id: "all", name: "บริการทั้งหมด", icon: "LayoutGrid", count: total }] },
          corsHeaders,
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/providers") {
        const values = [];
        const filters = ["LOWER(l.status) = 'active'"];
        const category = url.searchParams.get("category")?.trim();
        if (category && category !== "all") {
          values.push(category);
          filters.push(`c.category_key = $${values.length}`);
        }
        const locations = (url.searchParams.get("location") ?? "")
          .split(",")
          .map((location) => location.trim())
          .filter(Boolean);
        for (const location of locations) {
          values.push(`%${location}%`);
          filters.push(
            `EXISTS (
               SELECT 1 FROM UNNEST(l.service_areas) AS area
               WHERE area ILIKE $${values.length}
             )`,
          );
        }
        const query = url.searchParams.get("q")?.trim();
        if (query) {
          values.push(`%${query}%`);
          filters.push(
            `(u.full_name ILIKE $${values.length}
              OR l.title ILIKE $${values.length}
              OR l.description ILIKE $${values.length}
              OR c.category_name ILIKE $${values.length})`,
          );
        }
        const { rows } = await pool.query(
          `${providerSelect}
           WHERE ${filters.join(" AND ")}
           ORDER BY rating DESC, l.listing_id DESC`,
          values,
        );
        const data = rows.map(mapProvider);
        sendJson(response, 200, { data, total: data.length }, corsHeaders);
        return;
      }

      if (
        request.method === "GET" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "providers"
      ) {
        if (!/^\d+$/.test(segments[2])) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
        }
        const { rows } = await pool.query(
          `${providerSelect}
           WHERE l.listing_id = $1 AND LOWER(l.status) = 'active'
           LIMIT 1`,
          [segments[2]],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
        }
        sendJson(response, 200, { data: mapProvider(rows[0]) }, corsHeaders);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/providers") {
        const user = await authenticate(request, pool);
        const listing = validateProviderSubmission(await readJsonBody(request));
        const { rows: categoryRows } = await pool.query(
          `SELECT category_id, category_name
           FROM service_category
           WHERE category_key = $1
           LIMIT 1`,
          [listing.categoryKey],
        );
        const category = categoryRows[0];
        if (!category) {
          throw new HttpError(400, "INVALID_CATEGORY", "ไม่พบหมวดหมู่บริการที่เลือก");
        }
        const created = await withTransaction(pool, async (client) => {
          const { rows: profileRows } = await client.query(
            `INSERT INTO profile_freelance (id_card_number, first_name, kyc_status)
             VALUES ($1, $2, 'pending')
             ON CONFLICT (id_card_number) DO UPDATE
             SET first_name = EXCLUDED.first_name
             RETURNING freelance_id`,
            [user.id, user.fullName || user.email],
          );
          const { rows: listingRows } = await client.query(
            `INSERT INTO service_listing
              (freelance_id, category_id, title, status, description, service_areas,
               cover_image_url, portfolio)
             VALUES ($1, $2, $3, 'active', $4, $5, $6, $7)
             RETURNING listing_id`,
            [
              profileRows[0].freelance_id,
              category.category_id,
              listing.title,
              listing.description,
              listing.serviceAreas,
              listing.coverImageUrl,
              JSON.stringify(listing.portfolio),
            ],
          );
          const listingId = listingRows[0].listing_id;
          await client.query(
            `INSERT INTO service_package
              (listing_id, tier_name, price, duration_days, duration_label, features)
             VALUES ($1, $2, $3, 0, $4, $5)`,
            [
              listingId,
              listing.packageName,
              listing.price,
              listing.durationLabel,
              JSON.stringify(listing.features),
            ],
          );
          return listingId;
        });
        sendJson(
          response,
          201,
          {
            data: {
              id: String(created),
              name: user.fullName || user.email,
              avatar: listing.coverImageUrl,
              category: category.category_name,
              categoryKey: listing.categoryKey,
              serviceTitle: listing.title,
              rating: 0,
              reviewCount: 0,
              completedJobs: 0,
              verified: false,
              serviceAreas: listing.serviceAreas,
              startingPrice: listing.price,
              packageTitle: listing.packageName,
              duration: listing.durationLabel,
              priceUnit: "งาน",
              responseTime: "ตอบกลับเมื่อได้รับข้อความ",
              experienceYears: 0,
              hasTools: false,
              workingHours: "ตามนัดหมาย",
              description: listing.description,
              portfolio: listing.portfolio,
              features: listing.features,
              reviews: [],
            },
          },
          corsHeaders,
        );
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

      if (request.method === "GET" && url.pathname === "/api/profile") {
        const user = await authenticate(request, pool);
        sendJson(response, 200, { data: await getProfile(user.id, pool) }, corsHeaders);
        return;
      }

      if (request.method === "PATCH" && url.pathname === "/api/profile") {
        const user = await authenticate(request, pool);
        const updates = validateProfileUpdate(await readJsonBody(request));
        await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `UPDATE users
             SET full_name = COALESCE($2, full_name),
                 phone = COALESCE($3, phone),
                 bio = COALESCE($4, bio),
                 avatar_url = COALESCE($5, avatar_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id`,
            [
              user.id,
              updates.fullName ?? null,
              updates.phone ?? null,
              updates.bio ?? null,
              updates.avatarUrl ?? null,
            ],
          );
          if (rows.length === 0) {
            throw new HttpError(404, "PROFILE_NOT_FOUND", "ไม่พบข้อมูลโปรไฟล์");
          }
          await client.query(
            `INSERT INTO profile_client
               (client_id, interests, address, tax_id, tax_address, tax_email)
             VALUES ($1, COALESCE($2, '{}'::TEXT[]), $3, $4, $5, $6)
             ON CONFLICT (client_id) DO UPDATE
             SET interests = COALESCE($2, profile_client.interests),
                 address = COALESCE($3, profile_client.address),
                 tax_id = COALESCE($4, profile_client.tax_id),
                 tax_address = COALESCE($5, profile_client.tax_address),
                 tax_email = COALESCE($6, profile_client.tax_email)`,
            [
              user.id,
              updates.interests ?? null,
              updates.address ?? null,
              updates.taxId ?? null,
              updates.taxAddress ?? null,
              updates.taxEmail ?? null,
            ],
          );
        });
        sendJson(response, 200, { data: await getProfile(user.id, pool) }, corsHeaders);
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
        const booking = await validateBooking(await readJsonBody(request), user, pool);
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

      if (request.method === "GET" && url.pathname === "/api/bookings") {
        const user = await authenticate(request, pool);
        const { rows } = await pool.query(
          `${bookingAccessQuery()}
           ORDER BY b.created_at DESC`,
          [user.id],
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        request.method === "GET" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "bookings"
      ) {
        const user = await authenticate(request, pool);
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(segments[2])) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        const { rows } = await pool.query(
          `${bookingAccessQuery()}
           AND b.id = $2
           LIMIT 1`,
          [user.id, segments[2]],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        sendJson(response, 200, { data: rows[0] }, corsHeaders);
        return;
      }

      if (
        request.method === "POST" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "bookings" &&
        segments[3] === "actions"
      ) {
        const user = await authenticate(request, pool);
        const action = validateBookingAction(await readJsonBody(request));
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(segments[2])) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        const result = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `SELECT b.id, b.user_id AS "userId", b.status,
                    pf.id_card_number AS "providerUserId"
             FROM bookings b
             JOIN service_listing l ON l.listing_id::text = b.provider_id
             JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
             WHERE b.id = $1
             FOR UPDATE OF b`,
            [segments[2]],
          );
          const booking = rows[0];
          if (!booking) throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");

          const viewerRole =
            booking.userId === user.id
              ? "customer"
              : booking.providerUserId === user.id
                ? "provider"
                : null;
          if (!viewerRole) throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");

          const transitions = {
            confirm_payment: { role: "customer", from: "pending_payment", to: "paid" },
            start_work: { role: "provider", from: "paid", to: "in_progress" },
            deliver: { role: "provider", from: "in_progress", to: "delivered" },
            approve: { role: "customer", from: "delivered", to: "completed" },
            request_revision: { role: "customer", from: "delivered", to: "in_progress" },
            dispute: { role: "customer", from: "delivered", to: "disputed" },
          };
          const transition = transitions[action.action];
          if (viewerRole !== transition.role) {
            throw new HttpError(403, "BOOKING_ACTION_FORBIDDEN", "ไม่มีสิทธิ์ดำเนินการนี้");
          }
          if (booking.status !== transition.from) {
            throw new HttpError(409, "INVALID_BOOKING_STATE", "สถานะรายการจองเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลใหม่");
          }

          let update;
          if (action.action === "deliver") {
            update = await client.query(
              `UPDATE bookings
               SET status = $2, delivery_note = $3, delivery_photo_urls = $4::jsonb,
                   delivered_at = CURRENT_TIMESTAMP, status_note = '', updated_at = CURRENT_TIMESTAMP
               WHERE id = $1 AND status = $5
               RETURNING status, updated_at AS "updatedAt"`,
              [
                booking.id,
                transition.to,
                action.note,
                JSON.stringify(action.photoUrls),
                transition.from,
              ],
            );
          } else if (action.action === "request_revision") {
            update = await client.query(
              `UPDATE bookings
               SET status = $2, status_note = $3, delivery_note = '',
                   delivery_photo_urls = '[]'::jsonb, delivered_at = NULL,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $1 AND status = $4
               RETURNING status, updated_at AS "updatedAt"`,
              [booking.id, transition.to, action.note, transition.from],
            );
          } else {
            update = await client.query(
              `UPDATE bookings SET status = $2, status_note = $3,
                    updated_at = CURRENT_TIMESTAMP
               WHERE id = $1 AND status = $4
               RETURNING status, updated_at AS "updatedAt"`,
              [
                booking.id,
                transition.to,
                action.action === "dispute" ? action.note : "",
                transition.from,
              ],
            );
          }
          if (update.rows.length !== 1) {
            throw new HttpError(409, "INVALID_BOOKING_STATE", "สถานะรายการจองเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลใหม่");
          }
          if (action.action === "dispute") {
            await client.query(
              `INSERT INTO booking_disputes (id, booking_id, raised_by_user_id, reason)
               VALUES ($1, $2, $3, $4)`,
              [randomUUID(), booking.id, user.id, action.note],
            );
          }
          const updated = await client.query(
            `${bookingAccessQuery()}
             AND b.id = $2
             LIMIT 1`,
            [user.id, booking.id],
          );
          if (updated.rows.length !== 1) {
            throw new HttpError(500, "BOOKING_REFRESH_FAILED", "บันทึกสถานะแล้วแต่โหลดข้อมูลไม่สำเร็จ");
          }
          return updated.rows[0];
        });
        sendJson(response, 200, { data: result }, corsHeaders);
        return;
      }

      if (request.method === "GET" || request.method === "POST" || request.method === "PATCH") {
        throw new HttpError(404, "NOT_FOUND", "ไม่พบ endpoint นี้");
      }
      sendJson(
        response,
        405,
        { error: { code: "METHOD_NOT_ALLOWED", message: "ไม่รองรับ HTTP method นี้" } },
        { ...corsHeaders, allow: "GET, POST, PATCH, OPTIONS" },
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
