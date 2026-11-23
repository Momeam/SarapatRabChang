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
import { searchGeocode, reverseGeocode } from "./geocode.js";

const maxBodyBytes = 15 * 1024 * 1024;
const maxKycDocumentBytes = 10 * 1024 * 1024;
const maxKycRequestBytes = 30 * 1024 * 1024;
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
           ) FILTER (WHERE r.review_id IS NOT NULL) AS reviews,
           (
             SELECT COUNT(*)::int
             FROM bookings b2
             WHERE b2.provider_id = l.listing_id::text
               AND LOWER(b2.status) = 'completed'
           ) + (
             SELECT COUNT(DISTINCT o2.order_id)::int
             FROM orders o2
             WHERE o2.listing_id = l.listing_id
               AND LOWER(o2.order_status) IN ('completed', 'done', 'finished')
           ) AS completed_jobs
    FROM (
      SELECT DISTINCT r2.review_id, r2.reviewer_id, r2.rating, r2.comment, r2.created_at
      FROM reviews r2
      LEFT JOIN orders o ON o.order_id = r2.order_id
      LEFT JOIN bookings b ON b.id = r2.booking_id
      WHERE r2.listing_id = l.listing_id
         OR o.listing_id = l.listing_id
         OR b.provider_id = l.listing_id::text
    ) r
    LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
  ) stats ON TRUE
`;

const profileSelect = `
  SELECT u.id, u.email, u.full_name AS "fullName", u.phone,
         u.created_at AS "createdAt", u.avatar_url AS "avatarUrl",
         u.bio, COALESCE(pc.interests, ARRAY[]::TEXT[]) AS interests,
         COALESCE(pc.address, '') AS address,
         COALESCE(pc.tax_id, '') AS "taxId",
         COALESCE(pc.tax_address, '') AS "taxAddress",
         COALESCE(pc.tax_email, u.email) AS "taxEmail",
         LOWER(COALESCE(pf.kyc_status, '')) IN ('approved', 'verified') AS "isProvider",
         LOWER(COALESCE(pf.kyc_status, 'unverified')) AS "kycStatus",
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
    FROM (
      SELECT DISTINCT r.review_id, r.reviewer_id, r.rating, r.comment, r.created_at
      FROM service_listing l
      LEFT JOIN orders o ON o.listing_id = l.listing_id
      LEFT JOIN bookings b ON b.provider_id = l.listing_id::text
      JOIN reviews r ON r.order_id = o.order_id OR r.listing_id = l.listing_id OR r.booking_id = b.id
      WHERE l.freelance_id = pf.freelance_id
      UNION
      SELECT DISTINCT r.review_id, r.reviewer_id, r.rating, r.comment, r.created_at
      FROM reviews r
      WHERE r.reviewer_id = u.id
    ) r
    LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
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

async function readJsonBody(request, { maxBytes = maxBodyBytes } = {}) {
  if (!(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "กรุณาส่งข้อมูลแบบ JSON");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
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

function validateKycDocument(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "VALIDATION_ERROR", `กรุณาแนบ${field}`);
  }
  const name = requiredText(value.name, `ชื่อไฟล์${field}`, 255);
  if (/[\\/\r\n\0]/.test(name)) {
    throw new HttpError(400, "VALIDATION_ERROR", `ชื่อไฟล์${field}ไม่ถูกต้อง`);
  }
  const type = requiredText(value.type, `ชนิดไฟล์${field}`, 100);
  if (!["image/jpeg", "image/png", "application/pdf"].includes(type)) {
    throw new HttpError(400, "VALIDATION_ERROR", `รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF สำหรับ${field}`);
  }
  if (
    typeof value.content !== "string" ||
    value.content.length === 0 ||
    value.content.length > Math.ceil(maxKycDocumentBytes / 3) * 4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.content)
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", `ไฟล์${field}ไม่ถูกต้องหรือมีขนาดใหญ่เกิน 10 MB`);
  }
  const data = Buffer.from(value.content, "base64");
  if (data.length === 0 || data.length > maxKycDocumentBytes || data.toString("base64") !== value.content) {
    throw new HttpError(400, "VALIDATION_ERROR", `ไฟล์${field}ไม่ถูกต้องหรือมีขนาดใหญ่เกิน 10 MB`);
  }
  const hasValidSignature =
    (type === "image/jpeg" && data.length >= 3 && data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
    (type === "image/png" && data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (type === "application/pdf" && data.subarray(0, 5).toString("ascii") === "%PDF-");
  if (!hasValidSignature) {
    throw new HttpError(400, "VALIDATION_ERROR", `เนื้อหาไฟล์${field}ไม่ตรงกับชนิดไฟล์`);
  }
  return { name, type, data };
}

function validateKycSubmission(body) {
  const allowedFields = new Set([
    "fullName",
    "nationalId",
    "categoryKey",
    "bankName",
    "bankAccountNumber",
    "idDocument",
    "bankDocument",
  ]);
  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    throw new HttpError(400, "VALIDATION_ERROR", "มีข้อมูล KYC ที่ไม่รองรับ");
  }
  const nationalId = requiredText(body.nationalId, "เลขบัตรประชาชน", 13);
  if (!/^\d{13}$/.test(nationalId)) {
    throw new HttpError(400, "VALIDATION_ERROR", "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก");
  }
  return {
    fullName: requiredText(body.fullName, "ชื่อ-นามสกุลตามบัตรประชาชน", 120),
    nationalId,
    categoryKey: requiredText(body.categoryKey, "หมวดหมู่บริการ", 60),
    bankName: requiredText(body.bankName, "ธนาคาร", 100),
    bankAccountNumber: requiredText(body.bankAccountNumber, "เลขบัญชีธนาคาร", 50),
    idDocument: validateKycDocument(body.idDocument, "บัตรประชาชน"),
    bankDocument: validateKycDocument(body.bankDocument, "สมุดบัญชี"),
  };
}

function validateDate(value, { isLive = false } = {}) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "VALIDATION_ERROR", "date ต้องอยู่ในรูปแบบ YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "VALIDATION_ERROR", "วันที่ไม่ถูกต้อง");
  }
  if (isLive) {
    const today = new Date().toISOString().slice(0, 10);
    if (value < today) {
      throw new HttpError(400, "VALIDATION_ERROR", "ไม่สามารถเลือกวันที่ในอดีตได้");
    }
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

  const phone = registration
    ? requiredText(body.phone, "เบอร์โทรศัพท์", 10)
    : undefined;
  if (registration && !/^0\d{9}$/.test(phone)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0 (เช่น 0812345678)",
    );
  }

  return {
    email,
    password: body.password,
    ...(registration
      ? {
          fullName: requiredText(body.fullName, "ชื่อ-นามสกุล", 120),
          phone,
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
    ["phone", "เบอร์โทรศัพท์", 10, false],
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
    if (field === "phone" && value && !/^0\d{9}$/.test(value)) {
      throw new HttpError(400, "VALIDATION_ERROR", "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0");
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
    if (typeof body.avatarUrl !== "string" || body.avatarUrl.length > 5 * 1024 * 1024) {
      throw new HttpError(400, "VALIDATION_ERROR", "รูปโปรไฟล์ไม่ถูกต้องหรือมีขนาดใหญ่เกินไป");
    }
    const avatarUrl = body.avatarUrl.trim();
    if (avatarUrl) {
      try {
        const parsed = new URL(avatarUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "data:") throw new Error("Invalid protocol");
      } catch {
        throw new HttpError(400, "VALIDATION_ERROR", "รูปโปรไฟล์ต้องเป็น HTTPS URL หรือข้อมูลรูปภาพ");
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

function requireAdmin(user) {
  if (String(user.role).toLowerCase() !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "ไม่มีสิทธิ์จัดการรายการถอนเงิน");
  }
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
  validateDate(body.date, { isLive: Boolean(pool?.options) });

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
                 CASE
                   WHEN b.user_id = $1
                     AND b.status = 'pending_payment'
                   THEN NULLIF(
                     COALESCE(admin_settings.value->>'adminPromptPayPhone', '0612013936'),
                     ''
                   )
                   ELSE NULL
                 END AS "adminPromptPayPhone",
                 EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.id) AS "hasReview",
                 CASE WHEN b.user_id = $1 THEN 'customer' ELSE 'provider' END
                   AS "viewerRole"
          FROM bookings b
          JOIN service_listing l ON l.listing_id::text = b.provider_id
          JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
          JOIN users provider ON provider.id = pf.id_card_number
          JOIN service_category c ON c.category_id = l.category_id
          LEFT JOIN platform_settings admin_settings ON admin_settings.key = 'general'
          WHERE (b.user_id = $1 OR pf.id_card_number = $1)`;
}

async function getBookingParticipants(bookingId, userId, pool) {
  const { rows } = await pool.query(
    `SELECT b.id, b.status, b.user_id AS "customerUserId",
            pf.id_card_number AS "providerUserId"
     FROM bookings b
     JOIN service_listing l ON l.listing_id::text = b.provider_id
     JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
     WHERE b.id = $1
       AND (b.user_id = $2 OR pf.id_card_number = $2)
     LIMIT 1`,
    [bookingId, userId],
  );
  return rows[0] ?? null;
}

function validateBookingAction(body) {
  const action = requiredText(body.action, "action", 40);
  if (!["confirm_payment", "start_work", "deliver", "approve", "request_revision", "dispute"].includes(action)) {
    throw new HttpError(400, "INVALID_ACTION", "ไม่รองรับการดำเนินการนี้");
  }
  const photoUrls = body.photoUrls ?? [];
  if (
    !Array.isArray(photoUrls) ||
    photoUrls.length > 5 ||
    photoUrls.some((value) => typeof value !== "string" || value.length > 5 * 1024 * 1024)
  ) {
    throw new HttpError(400, "VALIDATION_ERROR", "รูปภาพไม่ถูกต้องหรือมีขนาดใหญ่เกินไป");
  }
  for (const value of photoUrls) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" && parsed.protocol !== "data:") throw new Error("Invalid protocol");
    } catch {
      throw new HttpError(400, "VALIDATION_ERROR", "รูปภาพต้องเป็น HTTPS URL หรือข้อมูลรูปภาพ");
    }
  }
  let note =
    typeof body.note === "string" && body.note.trim()
      ? requiredText(body.note, "รายละเอียด", 1000)
      : "";
  if (action === "deliver" && !note && photoUrls.length > 0) {
    note = "ส่งมอบงานพร้อมรูปภาพหลักฐาน";
  }
  if (["deliver", "request_revision", "dispute"].includes(action) && !note) {
    throw new HttpError(400, "VALIDATION_ERROR", "กรุณาระบุรายละเอียด");
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
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "data:") throw new Error("Invalid protocol");
    } catch {
      throw new HttpError(400, "VALIDATION_ERROR", "รูปภาพต้องเป็น HTTPS URL หรือข้อมูลรูปภาพ");
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

function mapSubmittedProvider(listingId, user, categoryName, listing) {
  return {
    id: String(listingId),
    name: user.fullName || user.email,
    avatar: listing.coverImageUrl,
    category: categoryName,
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
    kycStatus: row.kycStatus ?? (row.isProvider ? "approved" : "unverified"),
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
          "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

      if (request.method === "GET" && url.pathname === "/api/geocode/search") {
        const query = url.searchParams.get("q")?.trim();
        if (!query) {
          sendJson(
            response,
            200,
            { data: { results: [], matchedQuery: "", isFallback: false, fallbackLabel: null } },
            corsHeaders,
          );
          return;
        }
        const data = await searchGeocode(query);
        sendJson(response, 200, { data }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/geocode/reverse") {
        const lat = parseFloat(url.searchParams.get("lat") || "");
        const lng = parseFloat(url.searchParams.get("lng") || "");
        if (isNaN(lat) || isNaN(lng)) {
          throw new HttpError(400, "INVALID_COORDINATES", "พิกัดละติจูด/ลองจิจูดไม่ถูกต้อง");
        }
        const data = await reverseGeocode(lat, lng);
        sendJson(response, 200, { data }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/categories") {
        const kycFilter = Boolean(pool?.options)
          ? "AND LOWER(COALESCE(pf.kyc_status, '')) IN ('approved', 'verified')"
          : "";
        const { rows } = await pool.query(
          `SELECT c.category_key AS id, c.category_name AS name,
                  c.icon_name AS icon,
                  COUNT(l.listing_id) FILTER (
                    WHERE LOWER(l.status) = 'active' ${kycFilter}
                  )::int AS count
           FROM service_category c
           LEFT JOIN service_listing l ON l.category_id = c.category_id
           LEFT JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
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
        if (Boolean(pool?.options)) {
          filters.push("LOWER(COALESCE(pf.kyc_status, '')) IN ('approved', 'verified')");
        }
        const category = url.searchParams.get("category")?.trim();
        if (category && category !== "all") {
          values.push(category);
          filters.push(`sc.category_key = $${values.length}`);
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
              OR sc.category_name ILIKE $${values.length})`,
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

      if (request.method === "GET" && url.pathname === "/api/provider/dashboard") {
        const user = await authenticate(request, pool);
        const [{ rows: statsRows }, { rows: serviceRows }] = await Promise.all([
          pool.query(
            `SELECT COALESCE(job_stats.total_earnings, 0)::float AS "totalEarnings",
                    COALESCE(job_stats.active_jobs, 0)::int AS "activeJobs",
                    COALESCE(job_stats.pending_jobs, 0)::int AS "pendingJobs",
                    COALESCE(job_stats.completed_jobs, 0)::int AS "completedJobs",
                    COALESCE(review_stats.average_rating, 0)::float AS "averageRating",
                    COALESCE(review_stats.review_count, 0)::int AS "reviewCount",
                    COALESCE(pf.kyc_status, kyc_sub.status, 'unverified') AS "kycStatus"
             FROM users u
             LEFT JOIN profile_freelance pf ON pf.id_card_number = u.id
             LEFT JOIN LATERAL (
               SELECT status
               FROM provider_kyc_submissions
               WHERE user_id = u.id
               ORDER BY submitted_at DESC
               LIMIT 1
             ) kyc_sub ON TRUE
             LEFT JOIN LATERAL (
               SELECT COALESCE(
                        SUM(b.price) FILTER (WHERE LOWER(b.status) = 'completed'),
                        0
                      ) AS total_earnings,
                      COUNT(*) FILTER (
                        WHERE LOWER(b.status) IN ('in_progress', 'delivered', 'disputed')
                      ) AS active_jobs,
                      COUNT(*) FILTER (
                        WHERE LOWER(b.status) = 'paid'
                      ) AS pending_jobs,
                      COUNT(*) FILTER (
                        WHERE LOWER(b.status) = 'completed'
                      ) AS completed_jobs
               FROM service_listing l
               JOIN bookings b ON b.provider_id = l.listing_id::text
               WHERE l.freelance_id = pf.freelance_id
             ) job_stats ON TRUE
             LEFT JOIN LATERAL (
               SELECT AVG(r.rating) AS average_rating,
                      COUNT(r.review_id) AS review_count
               FROM (
                 SELECT DISTINCT r.review_id, r.rating
                 FROM service_listing l
                 LEFT JOIN orders o ON o.listing_id = l.listing_id
                 LEFT JOIN bookings b ON b.provider_id = l.listing_id::text
                 JOIN reviews r ON r.order_id = o.order_id
                                OR r.listing_id = l.listing_id
                                OR r.booking_id = b.id
                 WHERE l.freelance_id = pf.freelance_id
               ) r
             ) review_stats ON TRUE
             WHERE u.id = $1`,
            [user.id],
          ),
          pool.query(
            `SELECT l.listing_id::text AS id,
                    'SV-' || LPAD(l.listing_id::text, 3, '0') AS code,
                    c.category_name AS category,
                    c.category_key AS "categoryKey",
                    l.title,
                    COALESCE(package.tier_name, '') AS "packageDesc",
                    COALESCE(package.duration_label, '') AS duration,
                    ARRAY_TO_STRING(l.service_areas, ', ') AS location,
                    COALESCE(package.price, 0)::float AS price,
                    l.status,
                    l.description,
                    COALESCE(package.features, '[]'::jsonb) AS features,
                    l.cover_image_url AS "coverImageUrl",
                    l.portfolio
             FROM profile_freelance pf
             JOIN service_listing l ON l.freelance_id = pf.freelance_id
             JOIN service_category c ON c.category_id = l.category_id
             LEFT JOIN LATERAL (
               SELECT tier_name, duration_label, price, features
               FROM service_package
               WHERE listing_id = l.listing_id
               ORDER BY price ASC
               LIMIT 1
             ) package ON TRUE
             WHERE pf.id_card_number = $1
             ORDER BY l.listing_id DESC`,
            [user.id],
          ),
        ]);
        const stats = statsRows[0];
        if (!stats) throw new HttpError(404, "PROFILE_NOT_FOUND", "ไม่พบข้อมูลผู้ใช้");
        const services = serviceRows.map((service) => ({
          ...service,
          price: Number(service.price),
          features: service.features ?? [],
          portfolioUrls: (service.portfolio ?? []).map((item) => item.image),
        }));
        sendJson(
          response,
          200,
          {
            data: {
              stats: {
                ...stats,
                totalEarnings: Number(stats.totalEarnings),
                activeJobs: Number(stats.activeJobs),
                pendingJobs: Number(stats.pendingJobs),
                averageRating: Number(stats.averageRating),
                reviewCount: Number(stats.reviewCount),
              },
              services,
            },
          },
          corsHeaders,
        );
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "providers" &&
        segments[3] === "status"
      ) {
        const user = await authenticate(request, pool);
        if (!/^\d+$/.test(segments[2])) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
        const body = await readJsonBody(request);
        if (
          Object.keys(body).length !== 1 ||
          !["active", "paused"].includes(body.status)
        ) {
          throw new HttpError(400, "VALIDATION_ERROR", "สถานะประกาศไม่ถูกต้อง");
        }
        const { rows } = await pool.query(
          `UPDATE service_listing l
           SET status = $3
           FROM profile_freelance pf
           WHERE l.listing_id = $1
             AND pf.freelance_id = l.freelance_id
             AND pf.id_card_number = $2
           RETURNING l.listing_id::text AS id, l.status`,
          [segments[2], user.id, body.status],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
        sendJson(response, 200, { data: rows[0] }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/provider/finance") {
        const user = await authenticate(request, pool);
        const [{ rows: financeRows }, { rows: transactionRows }] = await Promise.all([
          pool.query(
            `SELECT COALESCE(earnings.total, 0)::float AS "totalEarnings",
                    COALESCE(work.total, 0)::float AS "pendingWork",
                    GREATEST(
                      COALESCE(earnings.total, 0) - COALESCE(payouts.reserved, 0),
                      0
                    )::float AS "availableBalance",
                    COALESCE(payouts.pending, 0)::float AS "pendingPayouts",
                    COALESCE(pf.kyc_status, kyc.status, 'unverified') AS "kycStatus",
                    CASE WHEN LOWER(COALESCE(kyc.status, pf.kyc_status, '')) IN ('approved', 'verified') THEN kyc.bank_name END AS "bankName",
                    CASE WHEN LOWER(COALESCE(kyc.status, pf.kyc_status, '')) IN ('approved', 'verified')
                      THEN kyc.bank_account_number END AS "bankAccountNumber"
             FROM users u
             LEFT JOIN profile_freelance pf ON pf.id_card_number = u.id
             LEFT JOIN LATERAL (
               SELECT COALESCE(SUM(b.price) FILTER (
                        WHERE b.status = 'completed'
                      ), 0) AS total
               FROM service_listing l
               JOIN bookings b ON b.provider_id = l.listing_id::text
               WHERE l.freelance_id = pf.freelance_id
             ) earnings ON TRUE
             LEFT JOIN LATERAL (
               SELECT COALESCE(SUM(b.price) FILTER (
                        WHERE b.status IN ('paid', 'in_progress', 'delivered')
                      ), 0) AS total
               FROM service_listing l
               JOIN bookings b ON b.provider_id = l.listing_id::text
               WHERE l.freelance_id = pf.freelance_id
             ) work ON TRUE
             LEFT JOIN LATERAL (
               SELECT COALESCE(SUM(amount) FILTER (
                        WHERE status IN ('pending', 'paid')
                      ), 0) AS reserved,
                      COALESCE(SUM(amount) FILTER (
                        WHERE status = 'pending'
                      ), 0) AS pending
               FROM provider_payout_requests
               WHERE freelance_id = pf.freelance_id
             ) payouts ON TRUE
             LEFT JOIN LATERAL (
               SELECT status, bank_name, bank_account_number
               FROM provider_kyc_submissions
               WHERE user_id = u.id
               ORDER BY updated_at DESC
               LIMIT 1
             ) kyc ON TRUE
             WHERE u.id = $1`,
            [user.id],
          ),
          pool.query(
            `SELECT *
             FROM (
               SELECT b.id::text AS id, 'earning' AS type,
                      b.updated_at AS "createdAt", l.title AS description,
                      b.price::float AS amount, b.status
               FROM bookings b
               JOIN service_listing l ON l.listing_id::text = b.provider_id
               JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
               WHERE pf.id_card_number = $1 AND b.status = 'completed'
               UNION ALL
               SELECT p.id::text AS id, 'withdrawal' AS type,
                      p.created_at AS "createdAt",
                      'คำขอถอนเงิน' AS description,
                      p.amount::float AS amount, p.status
               FROM provider_payout_requests p
               JOIN profile_freelance pf ON pf.freelance_id = p.freelance_id
               WHERE pf.id_card_number = $1
             ) transactions
             ORDER BY "createdAt" DESC
             LIMIT 100`,
            [user.id],
          ),
        ]);
        if (!financeRows[0]) {
          throw new HttpError(404, "PROFILE_NOT_FOUND", "ไม่พบข้อมูลผู้ใช้");
        }
        const finance = financeRows[0];
        const accountNumber = finance.bankAccountNumber;
        const maskedAccountNumber = accountNumber
          ? `${"•".repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`
          : null;
        sendJson(
          response,
          200,
          {
            data: {
              balance: {
                totalEarnings: Number(finance.totalEarnings),
                pendingWork: Number(finance.pendingWork),
                availableBalance: Number(finance.availableBalance),
                pendingPayouts: Number(finance.pendingPayouts),
                kycStatus: finance.kycStatus,
                bankName: finance.bankName,
                maskedAccountNumber,
              },
              transactions: transactionRows,
            },
          },
          corsHeaders,
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/provider/payouts") {
        const user = await authenticate(request, pool);
        const body = await readJsonBody(request);
        if (
          Object.keys(body).length !== 1 ||
          typeof body.amount !== "number" ||
          !Number.isFinite(body.amount) ||
          body.amount < 500 ||
          body.amount > 9_999_999_999.99 ||
          !Number.isInteger(body.amount * 100)
        ) {
          throw new HttpError(400, "VALIDATION_ERROR", "จำนวนเงินต้องไม่น้อยกว่า 500 บาทและมีทศนิยมไม่เกิน 2 ตำแหน่ง");
        }
        const payout = await withTransaction(pool, async (client) => {
          const { rows: providerRows } = await client.query(
            `SELECT pf.freelance_id AS "freelanceId",
                    k.submission_id AS "kycSubmissionId"
             FROM profile_freelance pf
             JOIN provider_kyc_submissions k ON k.user_id = pf.id_card_number
             WHERE pf.id_card_number = $1
               AND (LOWER(k.status) = 'approved' OR LOWER(pf.kyc_status) IN ('approved', 'verified'))
             ORDER BY k.updated_at DESC
             LIMIT 1
             FOR UPDATE OF pf`,
            [user.id],
          );
          const provider = providerRows[0];
          if (!provider) {
            throw new HttpError(403, "PAYOUT_KYC_REQUIRED", "ต้องยืนยัน KYC และบัญชีธนาคารให้ผ่านก่อนส่งคำขอถอนเงิน");
          }
          const { rows: balanceRows } = await client.query(
            `SELECT (
               COALESCE((
                 SELECT SUM(b.price)
                 FROM service_listing l
                 JOIN bookings b ON b.provider_id = l.listing_id::text
                 WHERE l.freelance_id = $1 AND b.status = 'completed'
               ), 0) -
               COALESCE((
                 SELECT SUM(amount)
                 FROM provider_payout_requests
                 WHERE freelance_id = $1 AND status IN ('pending', 'paid')
               ), 0)
             )::float AS "availableBalance"`,
            [provider.freelanceId],
          );
          const availableCents = Math.max(
            0,
            Math.round(Number(balanceRows[0]?.availableBalance ?? 0) * 100),
          );
          if (Math.round(body.amount * 100) > availableCents) {
            throw new HttpError(409, "INSUFFICIENT_BALANCE", "ยอดเงินที่ถอนได้ไม่เพียงพอ กรุณาโหลดข้อมูลใหม่");
          }
          const { rows } = await client.query(
            `INSERT INTO provider_payout_requests
               (id, freelance_id, kyc_submission_id, amount)
             VALUES ($1, $2, $3, $4)
             RETURNING id::text AS id, amount::float AS amount,
                       status, created_at AS "createdAt"`,
            [randomUUID(), provider.freelanceId, provider.kycSubmissionId, body.amount],
          );
          return rows[0];
        });
        sendJson(response, 201, { data: payout }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/payouts") {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const { rows } = await pool.query(
          `SELECT p.id::text AS id, p.created_at AS "createdAt",
                  p.amount::float AS amount, p.status,
                  COALESCE(p.status_note, '') AS "statusNote",
                  p.processed_at AS "processedAt",
                  p.updated_at AS "updatedAt",
                  COALESCE(NULLIF(u.full_name, ''), pf.first_name, u.email) AS "providerName",
                  u.email AS "providerEmail",
                  k.bank_name AS "bankName",
                  k.bank_account_number AS "bankAccountNumber"
           FROM provider_payout_requests p
           JOIN profile_freelance pf ON pf.freelance_id = p.freelance_id
           JOIN users u ON u.id = pf.id_card_number
           JOIN provider_kyc_submissions k ON k.submission_id = p.kyc_submission_id
           ORDER BY CASE WHEN p.status = 'pending' THEN 0 ELSE 1 END, p.created_at DESC`,
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "admin" &&
        segments[2] === "payouts"
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(segments[3])) {
          throw new HttpError(404, "PAYOUT_NOT_FOUND", "ไม่พบคำขอถอนเงิน");
        }
        const body = await readJsonBody(request);
        if (
          Object.keys(body).some((field) => !["status", "note"].includes(field)) ||
          !["paid", "rejected"].includes(body.status) ||
          (body.note !== undefined && typeof body.note !== "string") ||
          (body.note ?? "").length > 500 ||
          (body.status === "rejected" && !String(body.note ?? "").trim())
        ) {
          throw new HttpError(400, "VALIDATION_ERROR", "สถานะหรือหมายเหตุการถอนเงินไม่ถูกต้อง");
        }
        const { rows } = await pool.query(
          `UPDATE provider_payout_requests
           SET status = $2, status_note = $3, updated_at = CURRENT_TIMESTAMP,
               processed_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'pending'
           RETURNING id::text AS id, status, status_note AS "statusNote",
                     updated_at AS "updatedAt"`,
          [segments[3], body.status, (body.note ?? "").trim()],
        );
        if (rows.length === 0) {
          const { rows: existingRows } = await pool.query(
            "SELECT 1 FROM provider_payout_requests WHERE id = $1",
            [segments[3]],
          );
          if (existingRows.length === 0) {
            throw new HttpError(404, "PAYOUT_NOT_FOUND", "ไม่พบคำขอถอนเงิน");
          }
          throw new HttpError(409, "PAYOUT_ALREADY_PROCESSED", "คำขอนี้ได้รับการดำเนินการแล้ว");
        }
        sendJson(response, 200, { data: rows[0] }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/dashboard") {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const [
          { rows: userStats },
          { rows: kycStats },
          { rows: bookingStats },
          { rows: payoutStats },
          { rows: recentKyc },
          { rows: weeklyTrend },
          { rows: monthlyTrend },
          { rows: bookingStatuses },
        ] = await Promise.all([
          pool.query(`SELECT COUNT(*)::int AS "totalUsers" FROM users`),
          pool.query(`SELECT 
            COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingKyc",
            COUNT(*) FILTER (WHERE status = 'approved')::int AS "approvedKyc",
            COUNT(*)::int AS "totalKyc"
            FROM provider_kyc_submissions`),
          pool.query(`SELECT 
            COUNT(*)::int AS "totalBookings",
            COALESCE(SUM(price), 0)::float AS "totalVolume",
            COUNT(*) FILTER (WHERE status = 'completed')::int AS "completedBookings"
            FROM bookings`),
          pool.query(`SELECT 
            COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingPayouts",
            COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::float AS "paidAmount"
            FROM provider_payout_requests`),
          pool.query(`SELECT s.submission_id::text AS id, s.user_id::text AS "userId", s.full_name AS "fullName",
                             s.national_id AS "nationalId", s.category_key AS "categoryKey",
                             sc.category_name AS "categoryName", s.bank_name AS "bankName",
                             s.bank_account_number AS "bankAccountNumber", s.status,
                             s.submitted_at AS "submittedAt", u.email, u.phone
                      FROM provider_kyc_submissions s
                      JOIN users u ON u.id = s.user_id
                      LEFT JOIN service_category sc ON sc.category_key = s.category_key
                      ORDER BY s.submitted_at DESC
                      LIMIT 8`),
          pool.query(`WITH buckets AS (
                        SELECT bucket_index,
                               (date_trunc('week', CURRENT_DATE)::date + bucket_index)::date AS current_start,
                               (date_trunc('week', CURRENT_DATE)::date + bucket_index - 7)::date AS previous_start
                        FROM generate_series(0, 6) AS series(bucket_index)
                      )
                      SELECT TO_CHAR(current_start, 'YYYY-MM-DD') AS label,
                             COALESCE(SUM(b.price) FILTER (
                               WHERE b.created_at >= current_start
                                 AND b.created_at < current_start + INTERVAL '1 day'
                             ), 0)::float AS revenue,
                             COUNT(b.id) FILTER (
                               WHERE b.created_at >= current_start
                                 AND b.created_at < current_start + INTERVAL '1 day'
                             )::int AS bookings,
                             COALESCE(SUM(b.price) FILTER (
                               WHERE b.created_at >= previous_start
                                 AND b.created_at < previous_start + INTERVAL '1 day'
                             ), 0)::float AS "previousRevenue",
                             COUNT(b.id) FILTER (
                               WHERE b.created_at >= previous_start
                                 AND b.created_at < previous_start + INTERVAL '1 day'
                             )::int AS "previousBookings"
                      FROM buckets
                      LEFT JOIN bookings b
                        ON (b.created_at >= current_start
                            AND b.created_at < current_start + INTERVAL '1 day')
                        OR (b.created_at >= previous_start
                            AND b.created_at < previous_start + INTERVAL '1 day')
                      GROUP BY bucket_index, current_start
                      ORDER BY bucket_index`),
          pool.query(`WITH buckets AS (
                        SELECT bucket_index,
                               (date_trunc('month', CURRENT_DATE)::date
                                 - INTERVAL '11 months' + bucket_index * INTERVAL '1 month')::date AS current_start,
                               (date_trunc('month', CURRENT_DATE)::date
                                 - INTERVAL '23 months' + bucket_index * INTERVAL '1 month')::date AS previous_start
                        FROM generate_series(0, 11) AS series(bucket_index)
                      )
                      SELECT TO_CHAR(current_start, 'YYYY-MM') AS label,
                             COALESCE(SUM(b.price) FILTER (
                               WHERE b.created_at >= current_start
                                 AND b.created_at < current_start + INTERVAL '1 month'
                             ), 0)::float AS revenue,
                             COUNT(b.id) FILTER (
                               WHERE b.created_at >= current_start
                                 AND b.created_at < current_start + INTERVAL '1 month'
                             )::int AS bookings,
                             COALESCE(SUM(b.price) FILTER (
                               WHERE b.created_at >= previous_start
                                 AND b.created_at < previous_start + INTERVAL '1 month'
                             ), 0)::float AS "previousRevenue",
                             COUNT(b.id) FILTER (
                               WHERE b.created_at >= previous_start
                                 AND b.created_at < previous_start + INTERVAL '1 month'
                             )::int AS "previousBookings"
                      FROM buckets
                      LEFT JOIN bookings b
                        ON (b.created_at >= current_start
                            AND b.created_at < current_start + INTERVAL '1 month')
                        OR (b.created_at >= previous_start
                            AND b.created_at < previous_start + INTERVAL '1 month')
                      GROUP BY bucket_index, current_start
                      ORDER BY bucket_index`),
          pool.query(`SELECT status, COUNT(*)::int AS count
                      FROM bookings
                      GROUP BY status
                      ORDER BY status`),
        ]);
        sendJson(
          response,
          200,
          {
            data: {
              totalUsers: userStats[0]?.totalUsers ?? 0,
              pendingKyc: kycStats[0]?.pendingKyc ?? 0,
              approvedKyc: kycStats[0]?.approvedKyc ?? 0,
              totalBookings: bookingStats[0]?.totalBookings ?? 0,
              totalVolume: bookingStats[0]?.totalVolume ?? 0,
              completedBookings: bookingStats[0]?.completedBookings ?? 0,
              pendingPayouts: payoutStats[0]?.pendingPayouts ?? 0,
              paidAmount: payoutStats[0]?.paidAmount ?? 0,
              recentKyc,
              trends: {
                weekly: weeklyTrend,
                monthly: monthlyTrend,
              },
              bookingStatuses,
            },
          },
          corsHeaders,
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/kyc") {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const { rows } = await pool.query(
          `SELECT s.submission_id::text AS id, s.user_id::text AS "userId", s.full_name AS "fullName",
                  s.national_id AS "nationalId", s.category_key AS "categoryKey",
                  sc.category_name AS "categoryName", s.bank_name AS "bankName",
                  s.bank_account_number AS "bankAccountNumber",
                  s.id_document_name AS "idDocumentName", s.id_document_type AS "idDocumentType",
                  s.bank_document_name AS "bankDocumentName", s.bank_document_type AS "bankDocumentType",
                  s.status, s.submitted_at AS "submittedAt", s.updated_at AS "updatedAt",
                  u.email, u.phone
           FROM provider_kyc_submissions s
           JOIN users u ON u.id = s.user_id
           LEFT JOIN service_category sc ON sc.category_key = s.category_key
           ORDER BY s.submitted_at DESC`,
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        request.method === "GET" &&
        segments.length === 6 &&
        segments[0] === "api" &&
        segments[1] === "admin" &&
        segments[2] === "kyc" &&
        segments[4] === "document" &&
        ["id", "bank"].includes(segments[5])
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const submissionId = segments[3];
        const docType = segments[5];
        const colData = docType === "id" ? "id_document_data" : "bank_document_data";
        const colMime = docType === "id" ? "id_document_type" : "bank_document_type";
        const colName = docType === "id" ? "id_document_name" : "bank_document_name";
        const { rows } = await pool.query(
          `SELECT ${colData} AS data, ${colMime} AS mime, ${colName} AS name
           FROM provider_kyc_submissions
           WHERE submission_id = $1`,
          [submissionId],
        );
        if (rows.length === 0 || !rows[0].data) {
          throw new HttpError(404, "DOCUMENT_NOT_FOUND", "ไม่พบเอกสาร");
        }
        const fileBuffer = rows[0].data;
        response.writeHead(200, {
          ...corsHeaders,
          "content-type": rows[0].mime,
          "content-length": fileBuffer.length,
          "content-disposition": `inline; filename="${encodeURIComponent(rows[0].name)}"`,
        });
        response.end(fileBuffer);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "admin" &&
        segments[2] === "kyc"
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const submissionId = segments[3];
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(submissionId)) {
          throw new HttpError(404, "KYC_NOT_FOUND", "ไม่พบคำขอยืนยันตัวตน");
        }
        const body = await readJsonBody(request);
        const status = requiredText(body.status, "status", 20);
        if (!["approved", "rejected"].includes(status)) {
          throw new HttpError(400, "INVALID_STATUS", "สถานะต้องเป็น approved หรือ rejected");
        }
        const updated = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `SELECT submission_id, user_id, full_name
             FROM provider_kyc_submissions
             WHERE submission_id = $1
             FOR UPDATE`,
            [submissionId],
          );
          const submission = rows[0];
          if (!submission) throw new HttpError(404, "KYC_NOT_FOUND", "ไม่พบคำขอยืนยันตัวตน");

          await client.query(
            `UPDATE provider_kyc_submissions
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE submission_id = $2`,
            [status, submissionId],
          );

          await client.query(
            `INSERT INTO profile_freelance (id_card_number, first_name, kyc_status)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_card_number) DO UPDATE
             SET kyc_status = EXCLUDED.kyc_status,
                 first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profile_freelance.first_name)`,
            [submission.user_id, submission.full_name, status],
          );

          if (status === "approved") {
            await client.query(
              `UPDATE users SET role = 'freelance' WHERE id = $1 AND role NOT IN ('admin')`,
              [submission.user_id],
            );
          }

          const notifTitle =
            status === "approved"
              ? "คำขอยืนยันตัวตน (KYC) ได้รับการอนุมัติแล้ว!"
              : "คำขอยืนยันตัวตน (KYC) ไม่ผ่านการอนุมัติ";
          const notifDesc =
            status === "approved"
              ? "ยินดีด้วย! คุณสามารถเริ่มลงประกาศบริการและรับงานในฐานะผู้ให้บริการได้แล้ว"
              : body.note || "เอกสารหรือข้อมูลไม่ตรงตามเงื่อนไข กรุณาตรวจสอบและยื่นเอกสารใหม่อีกครั้ง";
          await client.query(
            `INSERT INTO notifications (id, user_id, type, title, description, link)
             VALUES ($1, $2, 'order', $3, $4, '/provider/dashboard')`,
            [randomUUID(), submission.user_id, notifTitle, notifDesc],
          );

          return { id: submissionId, status };
        });

        sendJson(response, 200, { data: updated }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/jobs") {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const { rows } = await pool.query(
          `SELECT l.listing_id::text AS id,
                  'SV-' || LPAD(l.listing_id::text, 3, '0') AS code,
                  l.title,
                  COALESCE(l.description, '') AS description,
                  LOWER(l.status) AS status,
                  COALESCE(l.service_areas, '{}') AS "serviceAreas",
                  l.cover_image_url AS "coverImageUrl",
                  COALESCE(l.portfolio, '[]'::jsonb) AS portfolio,
                  sc.category_key AS "categoryKey",
                  sc.category_name AS "categoryName",
                  COALESCE(package.tier_name, '') AS "packageName",
                  COALESCE(package.duration_label, '') AS duration,
                  COALESCE(package.price, 0)::float AS price,
                  COALESCE(package.features, '[]'::jsonb) AS features,
                  COALESCE(NULLIF(u.full_name, ''), pf.first_name, u.email) AS "freelancerName",
                  u.email AS "freelancerEmail",
                  u.id::text AS "freelancerUserId",
                  COALESCE(pf.kyc_status, 'unverified') AS "kycStatus"
           FROM service_listing l
           JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
           JOIN users u ON u.id = pf.id_card_number
           JOIN service_category sc ON sc.category_id = l.category_id
           LEFT JOIN LATERAL (
             SELECT tier_name, duration_label, price, features
             FROM service_package
             WHERE listing_id = l.listing_id
             ORDER BY price ASC
             LIMIT 1
           ) package ON TRUE
           ORDER BY l.listing_id DESC`,
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        (request.method === "PATCH" || request.method === "DELETE") &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "admin" &&
        segments[2] === "jobs"
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const listingId = segments[3];
        if (!/^\d+$/.test(listingId)) {
          throw new HttpError(404, "JOB_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
        if (request.method === "DELETE") {
          const { rows } = await pool.query(
            `DELETE FROM service_listing WHERE listing_id = $1 RETURNING listing_id::text AS id`,
            [listingId],
          );
          if (rows.length === 0) {
            throw new HttpError(404, "JOB_NOT_FOUND", "ไม่พบประกาศบริการ");
          }
          sendJson(response, 200, { data: { id: listingId, deleted: true } }, corsHeaders);
          return;
        }
        const body = await readJsonBody(request);
        const nextStatus = requiredText(body.status, "status", 20).toLowerCase();
        if (!["active", "paused", "rejected", "pending"].includes(nextStatus)) {
          throw new HttpError(400, "INVALID_STATUS", "สถานะประกาศไม่ถูกต้อง");
        }
        const reason = typeof body.reason === "string" ? body.reason.trim() : "";
        const updated = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `UPDATE service_listing l
             SET status = $2
             FROM profile_freelance pf
             WHERE l.listing_id = $1 AND pf.freelance_id = l.freelance_id
             RETURNING l.listing_id::text AS id, l.title, l.status, pf.id_card_number AS "ownerId"`,
            [listingId, nextStatus],
          );
          if (rows.length === 0) {
            throw new HttpError(404, "JOB_NOT_FOUND", "ไม่พบประกาศบริการ");
          }
          const job = rows[0];
          const notifTitle =
            nextStatus === "active"
              ? `ประกาศ "${job.title}" ได้รับการอนุมัติแล้ว`
              : nextStatus === "rejected"
                ? `ประกาศ "${job.title}" ไม่ผ่านการอนุมัติ`
                : `ประกาศ "${job.title}" ถูกเปลี่ยนสถานะเป็น ${nextStatus}`;
          const notifDesc =
            reason ||
            (nextStatus === "active"
              ? "ประกาศบริการของคุณเปิดแสดงบนหน้าแพลตฟอร์มเรียบร้อยแล้ว"
              : "กรุณาตรวจสอบรายละเอียดประกาศบริการของคุณ");
          await client.query(
            `INSERT INTO notifications (id, user_id, type, title, description, link)
             VALUES ($1, $2, 'order', $3, $4, '/provider/services')`,
            [randomUUID(), job.ownerId, notifTitle, notifDesc],
          );
          return { id: job.id, status: job.status };
        });
        sendJson(response, 200, { data: updated }, corsHeaders);
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/disputes") {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        await pool.query(`
          ALTER TABLE booking_disputes
          ADD COLUMN IF NOT EXISTS resolution_note TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ
        `);
        const { rows } = await pool.query(
          `SELECT COALESCE(d.id::text, b.id::text) AS id,
                  b.id::text AS "bookingId",
                  COALESCE(d.reason, NULLIF(b.status_note, ''), 'แจ้งข้อพิพาทจากผู้ว่าจ้าง') AS reason,
                  COALESCE(d.status, CASE WHEN b.status = 'disputed' THEN 'open' ELSE 'resolved' END) AS status,
                  COALESCE(d.resolution_note, '') AS "resolutionNote",
                  COALESCE(d.created_at, b.updated_at, b.created_at) AS "createdAt",
                  d.resolved_at AS "resolvedAt",
                  b.package_title AS "packageTitle",
                  b.price::float AS amount,
                  b.status AS "bookingStatus",
                  b.delivery_note AS "deliveryNote",
                  b.delivery_photo_urls AS "deliveryPhotoUrls",
                  l.title AS "serviceTitle",
                  COALESCE(NULLIF(client.full_name, ''), b.contact_name, client.email) AS "clientName",
                  client.email AS "clientEmail",
                  COALESCE(NULLIF(provider.full_name, ''), pf.first_name, provider.email) AS "freelancerName",
                  provider.email AS "freelancerEmail",
                  COALESCE(chat.messages, '[]'::jsonb) AS messages
           FROM bookings b
           LEFT JOIN booking_disputes d ON d.booking_id = b.id
           JOIN users client ON client.id = b.user_id
           JOIN service_listing l ON l.listing_id::text = b.provider_id
           JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
           JOIN users provider ON provider.id = pf.id_card_number
           LEFT JOIN LATERAL (
             SELECT JSONB_AGG(
                      JSONB_BUILD_OBJECT(
                        'id', m.id::text,
                        'body', m.body,
                        'senderRole', CASE WHEN m.sender_user_id = b.user_id THEN 'customer' ELSE 'provider' END,
                        'senderName', COALESCE(NULLIF(u2.full_name, ''), u2.email),
                        'createdAt', m.created_at
                      )
                      ORDER BY m.created_at ASC
                    ) AS messages
             FROM booking_messages m
             JOIN users u2 ON u2.id = m.sender_user_id
             WHERE m.booking_id = b.id
           ) chat ON TRUE
           WHERE d.id IS NOT NULL OR b.status = 'disputed'
           ORDER BY COALESCE(d.created_at, b.updated_at) DESC`,
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "admin" &&
        segments[2] === "disputes"
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        const disputeOrBookingId = segments[3];
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(disputeOrBookingId)) {
          throw new HttpError(404, "DISPUTE_NOT_FOUND", "ไม่พบรายการข้อพิพาท");
        }
        const body = await readJsonBody(request);
        const winner = requiredText(body.winner, "winner", 20).toUpperCase();
        if (!["CLIENT", "FREELANCER"].includes(winner)) {
          throw new HttpError(400, "INVALID_DECISION", "ผลการตัดสินต้องเป็น CLIENT หรือ FREELANCER");
        }
        const note = requiredText(body.note, "บันทึกคำตัดสินของแอดมิน", 1000);

        const resolved = await withTransaction(pool, async (client) => {
          await client.query(`
            ALTER TABLE booking_disputes
            ADD COLUMN IF NOT EXISTS resolution_note TEXT NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ
          `);
          const { rows } = await client.query(
            `SELECT b.id AS "bookingId", b.user_id AS "clientUserId",
                    pf.id_card_number AS "providerUserId", l.title AS "serviceTitle",
                    d.id AS "disputeId"
             FROM bookings b
             LEFT JOIN booking_disputes d ON d.booking_id = b.id
             JOIN service_listing l ON l.listing_id::text = b.provider_id
             JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
             WHERE d.id = $1 OR b.id = $1
             LIMIT 1`,
            [disputeOrBookingId],
          );
          const item = rows[0];
          if (!item) {
            throw new HttpError(404, "DISPUTE_NOT_FOUND", "ไม่พบรายการข้อพิพาท");
          }
          const nextBookingStatus = winner === "FREELANCER" ? "completed" : "in_progress";
          const statusNote =
            winner === "FREELANCER"
              ? `[แอดมินตัดสินอนุมัติงานให้ฟรีแลนซ์] ${note}`
              : `[แอดมินตัดสินให้ผู้ว่าจ้าง / แก้ไขหรือคืนสิทธิ์] ${note}`;

          await client.query(
            `UPDATE bookings
             SET status = $2, status_note = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [item.bookingId, nextBookingStatus, statusNote],
          );

          if (item.disputeId) {
            await client.query(
              `UPDATE booking_disputes
               SET status = $2, resolution_note = $3, resolved_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [item.disputeId, winner === "FREELANCER" ? "resolved_freelancer" : "resolved_client", note],
            );
          } else {
            await client.query(
              `INSERT INTO booking_disputes (id, booking_id, raised_by_user_id, reason, status, resolution_note, resolved_at)
               VALUES ($1, $2, $3, 'ข้อพิพาทงานบริการ', $4, $5, CURRENT_TIMESTAMP)`,
              [
                randomUUID(),
                item.bookingId,
                item.clientUserId,
                winner === "FREELANCER" ? "resolved_freelancer" : "resolved_client",
                note,
              ],
            );
          }

          await client.query(
            `INSERT INTO notifications (id, user_id, booking_id, type, title, description, link)
             VALUES ($1, $2, $3, 'order', $4, $5, $6),
                    ($7, $8, $3, 'order', $4, $5, $9)`,
            [
              randomUUID(),
              item.clientUserId,
              item.bookingId,
              `ผลการตัดสินข้อพิพาท: ${item.serviceTitle}`,
              statusNote,
              `/orders/${item.bookingId}`,
              randomUUID(),
              item.providerUserId,
              `/provider/jobs/${item.bookingId}`,
            ],
          );

          return {
            id: disputeOrBookingId,
            bookingId: item.bookingId,
            status: winner === "FREELANCER" ? "resolved_freelancer" : "resolved_client",
            bookingStatus: nextBookingStatus,
            resolutionNote: note,
          };
        });
        sendJson(response, 200, { data: resolved }, corsHeaders);
        return;
      }

      if (
        (request.method === "GET" || request.method === "PATCH") &&
        url.pathname === "/api/admin/settings"
      ) {
        const user = await authenticate(request, pool);
        requireAdmin(user);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS platform_settings (
            key VARCHAR(100) PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        const defaultSettings = {
          siteName: "SarapatRabChang (สารพัดรับจ้าง)",
          adminEmail: "admin@sarapatrabchang.com",
          supportPhone: "02-123-4567",
          announcement: "ยินดีต้อนรับสู่แพลตฟอร์มสารพัดรับจ้าง ศูนย์รวมฟรีแลนซ์คุณภาพ",
          platformFeePercent: 5,
          minPayoutAmount: 500,
          adminPromptPayPhone: "0612013936",
          isMaintenance: false,
          allowRegister: true,
        };
        if (request.method === "GET") {
          const { rows } = await pool.query(
            `SELECT value FROM platform_settings WHERE key = 'general' LIMIT 1`,
          );
          sendJson(
            response,
            200,
            { data: { ...defaultSettings, ...(rows[0]?.value ?? {}) } },
            corsHeaders,
          );
          return;
        }
        const body = await readJsonBody(request);
        const adminPromptPayPhone =
          typeof body.adminPromptPayPhone === "string"
            ? body.adminPromptPayPhone.trim()
            : defaultSettings.adminPromptPayPhone;
        if (adminPromptPayPhone && !/^0\d{9}$/.test(adminPromptPayPhone)) {
          throw new HttpError(
            400,
            "VALIDATION_ERROR",
            "เบอร์ PromptPay ของแอดมินต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0",
          );
        }
        const merged = {
          siteName: typeof body.siteName === "string" && body.siteName.trim() ? body.siteName.trim().slice(0, 120) : defaultSettings.siteName,
          adminEmail: typeof body.adminEmail === "string" && body.adminEmail.trim() ? body.adminEmail.trim().slice(0, 120) : defaultSettings.adminEmail,
          supportPhone: typeof body.supportPhone === "string" && body.supportPhone.trim() ? body.supportPhone.trim().slice(0, 40) : defaultSettings.supportPhone,
          announcement: typeof body.announcement === "string" ? body.announcement.trim().slice(0, 300) : defaultSettings.announcement,
          platformFeePercent: Number.isFinite(Number(body.platformFeePercent)) ? Math.max(0, Math.min(50, Number(body.platformFeePercent))) : defaultSettings.platformFeePercent,
          minPayoutAmount: Number.isFinite(Number(body.minPayoutAmount)) ? Math.max(100, Number(body.minPayoutAmount)) : defaultSettings.minPayoutAmount,
          adminPromptPayPhone,
          isMaintenance: Boolean(body.isMaintenance),
          allowRegister: body.allowRegister === undefined ? true : Boolean(body.allowRegister),
        };
        await pool.query(
          `INSERT INTO platform_settings (key, value, updated_at)
           VALUES ('general', $1::jsonb, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(merged)],
        );
        sendJson(response, 200, { data: merged }, corsHeaders);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/change-password") {
        const user = await authenticate(request, pool);
        const body = await readJsonBody(request);
        const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
        const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
        if (!currentPassword) {
          throw new HttpError(400, "VALIDATION_ERROR", "กรุณาระบุรหัสผ่านปัจจุบัน");
        }
        if (
          newPassword.length < 8 ||
          newPassword.length > 128 ||
          !/[A-Za-z]/.test(newPassword) ||
          !/[0-9]/.test(newPassword)
        ) {
          throw new HttpError(
            400,
            "VALIDATION_ERROR",
            "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข",
          );
        }
        const { rows } = await pool.query(
          `SELECT password_hash AS "passwordHash" FROM users WHERE id = $1 LIMIT 1`,
          [user.id],
        );
        if (!rows[0] || !(await verifyPassword(currentPassword, rows[0].passwordHash))) {
          throw new HttpError(401, "INVALID_PASSWORD", "รหัสผ่านปัจจุบันไม่ถูกต้อง");
        }
        const nextHash = await hashPassword(newPassword);
        await pool.query(
          `UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [user.id, nextHash],
        );
        sendJson(response, 200, { data: { updated: true } }, corsHeaders);
        return;
      }

      if (
        request.method === "DELETE" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "providers"
      ) {
        const user = await authenticate(request, pool);
        if (!/^\d+$/.test(segments[2])) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
        const { rows } = await pool.query(
          `DELETE FROM service_listing l
           USING profile_freelance pf
           WHERE l.listing_id = $1
             AND pf.freelance_id = l.freelance_id
             AND pf.id_card_number = $2
           RETURNING l.listing_id::text AS id`,
          [segments[2], user.id],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการหรือคุณไม่มีสิทธิ์ลบ");
        }
        sendJson(response, 200, { data: { id: rows[0].id, deleted: true } }, corsHeaders);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "providers"
      ) {
        const user = await authenticate(request, pool);
        if (!/^\d+$/.test(segments[2])) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
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
        const updated = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `UPDATE service_listing l
             SET category_id = $3,
                 title = $4,
                 description = $5,
                 service_areas = $6,
                 cover_image_url = $7,
                 portfolio = $8
             FROM profile_freelance pf
             WHERE l.listing_id = $1
               AND pf.freelance_id = l.freelance_id
               AND pf.id_card_number = $2
             RETURNING l.listing_id`,
            [
              segments[2],
              user.id,
              category.category_id,
              listing.title,
              listing.description,
              listing.serviceAreas,
              listing.coverImageUrl,
              JSON.stringify(listing.portfolio),
            ],
          );
          if (rows.length === 0) {
            throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
          }
          const listingId = rows[0].listing_id;
          const { rows: packageRows } = await client.query(
            `UPDATE service_package
             SET tier_name = $2, price = $3, duration_days = 0,
                 duration_label = $4, features = $5
             WHERE listing_id = $1
             RETURNING package_id`,
            [
              listingId,
              listing.packageName,
              listing.price,
              listing.durationLabel,
              JSON.stringify(listing.features),
            ],
          );
          if (packageRows.length === 0) {
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
          }
          return listingId;
        });
        sendJson(
          response,
          200,
          { data: mapSubmittedProvider(updated, user, category.category_name, listing) },
          corsHeaders,
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/providers") {
        const user = await authenticate(request, pool);
        const listing = validateProviderSubmission(await readJsonBody(request));
        if (Boolean(pool?.options)) {
          const { rows: freelanceCheck } = await pool.query(
            `SELECT pf.freelance_id, pf.kyc_status, k.status AS kyc_sub_status
             FROM users u
             LEFT JOIN profile_freelance pf ON pf.id_card_number = u.id
             LEFT JOIN provider_kyc_submissions k ON k.user_id = u.id
             WHERE u.id = $1`,
            [user.id],
          );
          const kycStatus = (freelanceCheck[0]?.kyc_status || freelanceCheck[0]?.kyc_sub_status || "").toLowerCase();
          if (kycStatus !== "approved" && kycStatus !== "verified") {
            throw new HttpError(403, "KYC_REQUIRED", "ต้องได้รับการอนุมัติการยืนยันตัวตน (KYC) ก่อนจึงจะสามารถลงประกาศรับงานได้");
          }
        }
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
          { data: mapSubmittedProvider(created, user, category.category_name, listing) },
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

      if (request.method === "GET" && url.pathname === "/api/kyc") {
        const user = await authenticate(request, pool);
        const { rows } = await pool.query(
          `SELECT status, full_name AS "fullName",
                  category_key AS "categoryKey", submitted_at AS "submittedAt"
           FROM provider_kyc_submissions
           WHERE user_id = $1
           LIMIT 1`,
          [user.id],
        );
        let data = rows[0] ?? null;
        if (!data && Boolean(pool?.options)) {
          const { rows: pfRows } = await pool.query(
            `SELECT kyc_status AS status, first_name AS "fullName"
             FROM profile_freelance
             WHERE id_card_number = $1
             LIMIT 1`,
            [user.id],
          );
          if (pfRows[0]?.status && pfRows[0].status !== "unverified") {
            data = {
              status: pfRows[0].status,
              fullName: pfRows[0].fullName || user.fullName || user.email,
              categoryKey: null,
              submittedAt: null,
            };
          }
        }
        sendJson(response, 200, { data }, corsHeaders);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/kyc") {
        const user = await authenticate(request, pool);
        const submission = validateKycSubmission(
          await readJsonBody(request, { maxBytes: maxKycRequestBytes }),
        );
        const { rows: categoryRows } = await pool.query(
          `SELECT category_key
           FROM service_category
           WHERE category_key = $1
           LIMIT 1`,
          [submission.categoryKey],
        );
        if (categoryRows.length === 0) {
          throw new HttpError(400, "INVALID_CATEGORY", "ไม่พบหมวดหมู่บริการที่เลือก");
        }

        const saved = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `INSERT INTO provider_kyc_submissions
               (submission_id, user_id, full_name, national_id, category_key,
                bank_name, bank_account_number, id_document_name,
                id_document_type, id_document_data, bank_document_name,
                bank_document_type, bank_document_data, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
             ON CONFLICT (user_id) DO UPDATE
             SET full_name = EXCLUDED.full_name,
                 national_id = EXCLUDED.national_id,
                 category_key = EXCLUDED.category_key,
                 bank_name = EXCLUDED.bank_name,
                 bank_account_number = EXCLUDED.bank_account_number,
                 id_document_name = EXCLUDED.id_document_name,
                 id_document_type = EXCLUDED.id_document_type,
                 id_document_data = EXCLUDED.id_document_data,
                 bank_document_name = EXCLUDED.bank_document_name,
                 bank_document_type = EXCLUDED.bank_document_type,
                 bank_document_data = EXCLUDED.bank_document_data,
                 status = 'pending',
                 submitted_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE provider_kyc_submissions.status = 'rejected'
             RETURNING status, full_name AS "fullName",
                       category_key AS "categoryKey", submitted_at AS "submittedAt"`,
            [
              randomUUID(),
              user.id,
              submission.fullName,
              submission.nationalId,
              submission.categoryKey,
              submission.bankName,
              submission.bankAccountNumber,
              submission.idDocument.name,
              submission.idDocument.type,
              submission.idDocument.data,
              submission.bankDocument.name,
              submission.bankDocument.type,
              submission.bankDocument.data,
            ],
          );
          if (rows.length === 0) {
            throw new HttpError(409, "KYC_ALREADY_SUBMITTED", "มีคำขอ KYC ที่กำลังตรวจสอบหรือผ่านการยืนยันแล้ว");
          }
          await client.query(
            `INSERT INTO profile_freelance
               (id_card_number, first_name, bank_account_info, kyc_status)
             VALUES ($1, $2, $3, 'pending')
             ON CONFLICT (id_card_number) DO UPDATE
             SET first_name = EXCLUDED.first_name,
                 bank_account_info = EXCLUDED.bank_account_info,
                 kyc_status = 'pending'`,
            [user.id, submission.fullName, submission.bankAccountNumber],
          );
          return rows[0];
        });
        sendJson(response, 201, { data: saved }, corsHeaders);
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

        if (typeof user.passwordHash === "string" && !user.passwordHash.startsWith("scrypt$")) {
          const upgradedHash = await hashPassword(credentials.password);
          await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [upgradedHash, user.id]);
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

      if (request.method === "POST" && url.pathname === "/api/bookings/inquire") {
        const user = await authenticate(request, pool);
        const body = await readJsonBody(request);
        const providerId = requiredText(body.providerId, "providerId", 80);
        if (!/^\d+$/.test(providerId)) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบผู้ให้บริการ");
        }
        const { rows: listingRows } = await pool.query(
          `SELECT l.title AS "serviceTitle", package.tier_name AS "packageTitle",
                  COALESCE(package.price, 0)::float AS "startingPrice",
                  pf.id_card_number AS "providerUserId",
                  l.listing_id AS "listingId"
           FROM service_listing l
           JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
           LEFT JOIN LATERAL (
             SELECT tier_name, price
             FROM service_package
             WHERE listing_id = l.listing_id
             ORDER BY price ASC
             LIMIT 1
           ) package ON TRUE
           WHERE l.listing_id::text = $1
           LIMIT 1`,
          [providerId],
        );
        const listing = listingRows[0];
        if (!listing) {
          throw new HttpError(404, "PROVIDER_NOT_FOUND", "ไม่พบประกาศบริการ");
        }
        if (listing.providerUserId && listing.providerUserId === user.id) {
          throw new HttpError(400, "SELF_CHAT_NOT_ALLOWED", "ไม่สามารถเริ่มการสนทนากับประกาศบริการของตนเองได้");
        }

        const { rows: existingRows } = await pool.query(
          `${bookingAccessQuery()}
           AND b.user_id = $1 AND b.provider_id = $2 AND b.status NOT IN ('completed', 'cancelled')
           ORDER BY b.created_at DESC
           LIMIT 1`,
          [user.id, providerId],
        );
        if (existingRows.length > 0) {
          sendJson(response, 200, { data: existingRows[0] }, corsHeaders);
          return;
        }

        const newBookingId = randomUUID();
        const now = new Date().toISOString().slice(0, 10);
        await pool.query(
          `INSERT INTO bookings
             (id, user_id, provider_id, package_title, price, service_date,
              time_slot, contact_name, email, phone, address, note, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending_payment')`,
          [
            newBookingId,
            user.id,
            providerId,
            listing.packageTitle || listing.serviceTitle || "บริการ",
            listing.startingPrice || 0,
            now,
            "09:00-12:00",
            user.fullName || user.email,
            user.email,
            user.phone || "0000000000",
            "ติดต่อสอบถามผ่านแชทก่อนจอง",
            "เริ่มการสนทนาสอบถามบริการ",
          ],
        );
        const { rows: createdRows } = await pool.query(
          `${bookingAccessQuery()} AND b.id = $2 LIMIT 1`,
          [user.id, newBookingId],
        );
        sendJson(response, 201, { data: createdRows[0] ?? { id: newBookingId } }, corsHeaders);
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

      if (request.method === "GET" && url.pathname === "/api/notifications") {
        const user = await authenticate(request, pool);
        const { rows } = await pool.query(
          `SELECT n.id::text AS id, n.type, n.title, n.description,
                  n.created_at AS "createdAt", n.read_at IS NOT NULL AS read, n.link
           FROM notifications n
           LEFT JOIN bookings b ON b.id = n.booking_id
           WHERE n.user_id = $1
           ORDER BY n.created_at DESC
           LIMIT 50`,
          [user.id],
        );
        sendJson(response, 200, { data: rows }, corsHeaders);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "notifications" &&
        segments[2] === "read-all"
      ) {
        const user = await authenticate(request, pool);
        const body = await readJsonBody(request);
        const type = body.type === undefined
          ? null
          : requiredText(body.type, "type", 20);
        if (type !== null && !["order", "message", "payment", "review"].includes(type)) {
          throw new HttpError(400, "INVALID_NOTIFICATION_TYPE", "ประเภทการแจ้งเตือนไม่ถูกต้อง");
        }
        const { rows } = await pool.query(
          `UPDATE notifications n
           SET read_at = COALESCE(n.read_at, CURRENT_TIMESTAMP)
           WHERE n.user_id = $1
             AND ($2::text IS NULL OR n.type = $2)
           RETURNING n.id::text AS id`,
          [user.id, type],
        );
        sendJson(response, 200, { data: { updated: rows.length } }, corsHeaders);
        return;
      }

      if (
        request.method === "PATCH" &&
        segments.length === 3 &&
        segments[0] === "api" &&
        segments[1] === "notifications"
      ) {
        const user = await authenticate(request, pool);
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(segments[2])) {
          throw new HttpError(404, "NOTIFICATION_NOT_FOUND", "ไม่พบการแจ้งเตือน");
        }
        const { rows } = await pool.query(
          `UPDATE notifications n
           SET read_at = COALESCE(n.read_at, CURRENT_TIMESTAMP)
           WHERE n.id = $2
             AND n.user_id = $1
           RETURNING n.id::text AS id`,
          [user.id, segments[2]],
        );
        if (rows.length === 0) {
          throw new HttpError(404, "NOTIFICATION_NOT_FOUND", "ไม่พบการแจ้งเตือน");
        }
        sendJson(response, 200, { data: { updated: 1 } }, corsHeaders);
        return;
      }

      if (
        (request.method === "GET" || request.method === "POST") &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "bookings" &&
        segments[3] === "messages"
      ) {
        const user = await authenticate(request, pool);
        const bookingId = segments[2];
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(bookingId)) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        const booking = await getBookingParticipants(bookingId, user.id, pool);
        if (!booking) throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");

        if (request.method === "GET") {
          const { rows } = await pool.query(
            `SELECT m.id::text AS id, m.body,
                    CASE WHEN m.sender_user_id = $2 THEN 'customer' ELSE 'provider' END
                      AS "senderRole",
                    COALESCE(NULLIF(sender.full_name, ''), sender.email) AS "senderName",
                    m.created_at AS "createdAt"
             FROM (
               SELECT id, sender_user_id, body, created_at
               FROM booking_messages
               WHERE booking_id = $1
               ORDER BY created_at DESC
               LIMIT 100
             ) m
             JOIN users sender ON sender.id = m.sender_user_id
             ORDER BY m.created_at ASC`,
            [bookingId, booking.customerUserId],
          );
          sendJson(response, 200, { data: rows }, corsHeaders);
          return;
        }

        if (booking.status === "completed") {
          throw new HttpError(
            400,
            "BOOKING_COMPLETED",
            "งานนี้เสร็จสมบูรณ์แล้ว การสนทนาถูกปิดเรียบร้อยแล้ว ไม่สามารถส่งข้อความเพิ่มเติมได้",
          );
        }

        const message = requiredText(
          (await readJsonBody(request)).message,
          "ข้อความ",
          2000,
        );
        const saved = await withTransaction(pool, async (client) => {
          const { rows } = await client.query(
            `INSERT INTO booking_messages (id, booking_id, sender_user_id, body)
             VALUES ($1, $2, $3, $4)
             RETURNING id::text AS id, body, created_at AS "createdAt"`,
            [randomUUID(), bookingId, user.id, message],
          );
          const result = {
            ...rows[0],
            senderRole: user.id === booking.customerUserId ? "customer" : "provider",
            senderName: user.fullName || user.email,
          };
          if (user.id === booking.providerUserId) {
            await client.query(
              `INSERT INTO notifications
                 (id, user_id, booking_id, type, title, description, link)
               VALUES ($1, $2, $3, 'message', $4, $5, $6)`,
              [
                randomUUID(),
                booking.customerUserId,
                bookingId,
                `ข้อความใหม่จาก ${result.senderName}`,
                message,
                `/orders/${bookingId}#chat`,
              ],
            );
          }
          return result;
        });
        sendJson(
          response,
          201,
          { data: saved },
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
            confirm_payment: { role: "customer", from: ["pending_payment"], to: "paid" },
            start_work: { role: "provider", from: ["paid"], to: "in_progress" },
            deliver: { role: "provider", from: ["in_progress"], to: "delivered" },
            approve: { role: "customer", from: ["delivered"], to: "completed" },
            request_revision: { role: "customer", from: ["delivered"], to: "in_progress" },
            dispute: { role: "customer", from: ["paid", "in_progress", "delivered"], to: "disputed" },
          };
          const transition = transitions[action.action];
          if (viewerRole !== transition.role) {
            throw new HttpError(403, "BOOKING_ACTION_FORBIDDEN", "ไม่มีสิทธิ์ดำเนินการนี้");
          }
          const allowedFrom = Array.isArray(transition.from) ? transition.from : [transition.from];
          if (!allowedFrom.includes(booking.status)) {
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
                booking.status,
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
              [booking.id, transition.to, action.note, booking.status],
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
                booking.status,
              ],
            );
          }
          if (update.rows.length !== 1) {
            throw new HttpError(409, "INVALID_BOOKING_STATE", "สถานะรายการจองเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลใหม่");
          }
          if (action.action === "dispute") {
            await client.query(
              `INSERT INTO booking_disputes (id, booking_id, raised_by_user_id, reason, status)
               VALUES ($1, $2, $3, $4, 'open')`,
              [randomUUID(), booking.id, user.id, action.note],
            );
            if (booking.providerUserId) {
              await client.query(
                `INSERT INTO notifications
                   (id, user_id, booking_id, type, title, description, link)
                 VALUES ($1, $2, $3, 'order', 'รายการจองถูกส่งเรื่องข้อพิพาท', $4, $5)`,
                [
                  randomUUID(),
                  booking.providerUserId,
                  booking.id,
                  action.note || "ลูกค้าได้ส่งเรื่องข้อพิพาทให้แอดมินตรวจสอบ",
                  `/provider/jobs/${booking.id}`,
                ],
              );
            }
          }
          if (viewerRole === "provider") {
            const title = action.action === "deliver"
              ? "ผู้ให้บริการส่งมอบงานแล้ว"
              : "ผู้ให้บริการเริ่มดำเนินงานแล้ว";
            const description = action.action === "deliver"
              ? action.note || "กรุณาตรวจสอบงานที่ส่งมอบ"
              : "ผู้ให้บริการเริ่มดำเนินงานตามนัดหมายแล้ว";
            await client.query(
              `INSERT INTO notifications
                 (id, user_id, booking_id, type, title, description, link)
               VALUES ($1, $2, $3, 'order', $4, $5, $6)`,
              [
                randomUUID(),
                booking.userId,
                booking.id,
                title,
                description,
                `/orders/${booking.id}`,
              ],
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

      if (
        request.method === "POST" &&
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "bookings" &&
        segments[3] === "reviews"
      ) {
        const user = await authenticate(request, pool);
        const bookingId = segments[2];
        if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(bookingId)) {
          throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        }
        const body = await readJsonBody(request);
        const rating = Number(body.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          throw new HttpError(400, "INVALID_RATING", "คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5");
        }
        const comment = typeof body.comment === "string" ? body.comment.trim() : "";

        const { rows: bookingRows } = await pool.query(
          `SELECT b.id, b.user_id AS "userId", b.provider_id AS "providerId", b.status,
                  l.listing_id AS "listingId", pf.id_card_number AS "providerUserId"
           FROM bookings b
           LEFT JOIN service_listing l ON l.listing_id::text = b.provider_id
           LEFT JOIN profile_freelance pf ON pf.freelance_id = l.freelance_id
           WHERE b.id = $1`,
          [bookingId],
        );
        const booking = bookingRows[0];
        if (!booking) throw new HttpError(404, "BOOKING_NOT_FOUND", "ไม่พบรายการจอง");
        if (booking.userId !== user.id) {
          throw new HttpError(403, "FORBIDDEN", "เฉพาะผู้ว่าจ้างเท่านั้นที่สามารถรีวิวได้");
        }
        if (booking.status !== "completed") {
          throw new HttpError(400, "BOOKING_NOT_COMPLETED", "สามารถรีวิวได้เฉพาะงานที่เสร็จสมบูรณ์แล้วเท่านั้น");
        }

        const { rows: existingReview } = await pool.query(
          `SELECT 1 FROM reviews WHERE booking_id = $1 LIMIT 1`,
          [booking.id],
        );
        if (existingReview.length > 0) {
          throw new HttpError(409, "REVIEW_ALREADY_EXISTS", "คุณได้ส่งรีวิวสำหรับงานนี้ไปแล้ว");
        }

        const { rows: reviewRows } = await pool.query(
          `INSERT INTO reviews (booking_id, listing_id, reviewer_id, rating, comment)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING review_id AS "id", rating, comment, created_at AS "createdAt"`,
          [booking.id, booking.listingId ?? null, user.id, rating, comment],
        );

        if (booking.providerUserId) {
          await pool.query(
            `INSERT INTO notifications (id, user_id, booking_id, type, title, description, link)
             VALUES ($1, $2, $3, 'review', 'ได้รับรีวิวใหม่สำหรับงาน', $4, $5)`,
            [
              randomUUID(),
              booking.providerUserId,
              booking.id,
              comment ? `คะแนน ${rating} ดาว: "${comment.slice(0, 50)}"` : `ได้รับคะแนน ${rating} ดาว`,
              `/provider/jobs/${booking.id}`,
            ],
          );
        }

        sendJson(response, 201, { data: reviewRows[0] }, corsHeaders);
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
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });
  pool.on("error", (err) => {
    console.error("Database pool idle client error:", err.message);
  });
  const originalPoolQuery = pool.query.bind(pool);
  pool.query = async function resilientQuery(...args) {
    let retries = 0;
    while (true) {
      try {
        return await originalPoolQuery(...args);
      } catch (err) {
        retries++;
        const isTransient =
          err.code === "ECONNRESET" ||
          err.code === "57P01" ||
          err.code === "08006" ||
          err.code === "08001" ||
          err.code === "08004" ||
          err.message?.includes("Connection terminated") ||
          err.message?.includes("connection timeout") ||
          err.message?.includes("socket hang up");
        if (isTransient && retries <= 2) {
          console.warn(`Transient DB connection error (${err.message}). Retrying attempt ${retries}...`);
          await new Promise((resolve) => setTimeout(resolve, 500 * retries));
          continue;
        }
        throw err;
      }
    }
  };
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    await pool.end();
    throw error;
  }
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
  createApp({
    pool,
    webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  }).listen(port, host, () => {
    console.log(`SarapatRabChang API listening on port ${port}`);
  });
}
