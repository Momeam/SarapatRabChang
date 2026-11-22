import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const scrypt = (password, salt, keyLength, options) =>
  new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, scryptOptions);
  return `scrypt$16384$8$1$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password, encodedHash) {
  if (typeof encodedHash !== "string" || typeof password !== "string") return false;
  if (!encodedHash.startsWith("scrypt$")) {
    return password === encodedHash;
  }
  const parts = encodedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltHex, hashHex] = parts;
  if (n !== "16384" || r !== "8" || p !== "1" || !/^[a-f0-9]{32}$/i.test(saltHex)) {
    return false;
  }
  if (!/^[a-f0-9]{128}$/i.test(hashHex)) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(
    password,
    Buffer.from(saltHex, "hex"),
    expected.length,
    scryptOptions,
  );
  return timingSafeEqual(expected, actual);
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(request) {
  const cookieHeader = request.headers.cookie;
  if (typeof cookieHeader !== "string") return null;
  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("srbc_session="));
  if (!sessionCookie) return null;
  const token = sessionCookie.slice("srbc_session=".length);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export function sessionCookie(
  token,
  {
    secure = process.env.NODE_ENV === "production",
    sameSite = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "None" : "Lax"),
  } = {},
) {
  const isSecure = secure || sameSite.toLowerCase() === "none";
  return [
    `srbc_session=${token}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    "Max-Age=604800",
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");
}

export function clearSessionCookie({
  secure = process.env.NODE_ENV === "production",
  sameSite = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "None" : "Lax"),
} = {}) {
  const isSecure = secure || sameSite.toLowerCase() === "none";
  return [
    "srbc_session=",
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    "Max-Age=0",
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");
}

export function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    user_metadata: {
      full_name: row.fullName,
      phone: row.phone,
    },
    created_at: row.createdAt,
  };
}
