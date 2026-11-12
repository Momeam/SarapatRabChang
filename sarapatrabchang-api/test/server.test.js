import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/server.js";

let app;
let baseUrl;
const users = new Map();
const sessions = new Map();
const statements = [];
const bookings = new Map();

const pool = {
  async query(sql, params = []) {
    statements.push({ sql, params });
    if (sql.includes("SELECT 1") || ["BEGIN", "COMMIT", "ROLLBACK"].includes(sql)) {
      return { rows: [] };
    }
    if (sql.includes("INSERT INTO users")) {
      const [id, email, passwordHash, fullName, phone] = params;
      if (users.has(email)) return { rows: [] };
      const user = {
        id,
        email,
        passwordHash,
        role: "User",
        fullName,
        phone,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      users.set(email, user);
      return { rows: [user] };
    }
    if (sql.includes("FROM users") && sql.includes("WHERE email = $1")) {
      const user = users.get(params[0]);
      return { rows: user ? [user] : [] };
    }
    if (sql.includes("INSERT INTO sessions")) {
      sessions.set(params[0], params[1]);
      return { rows: [] };
    }
    if (sql.includes("FROM sessions s")) {
      const userId = sessions.get(params[0]);
      const user = [...users.values()].find((item) => item.id === userId);
      return {
        rows: user
          ? [{
              id: user.id,
              email: user.email,
              role: user.role,
              fullName: user.fullName,
              phone: user.phone,
              createdAt: user.createdAt,
            }]
          : [],
      };
    }
    if (sql.includes("DELETE FROM sessions")) {
      sessions.delete(params[0]);
      return { rows: [] };
    }
    if (sql.includes("INSERT INTO bookings")) {
      bookings.set(params[0], params);
      return { rows: [] };
    }
    if (sql.includes("SELECT id, user_id")) {
      return {
        rows: bookings.has(params[0])
          ? [{ id: params[0], userId: params[1], email: "person@example.com" }]
          : [],
      };
    }
    return { rows: [] };
  },
  async connect() {
    return {
      query: this.query.bind(this),
      release() {},
    };
  },
};

before(async () => {
  app = createApp({ pool, webOrigin: "http://localhost:3000" });
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${app.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    app.close((error) => (error ? reject(error) : resolve())),
  );
});

async function register(email = "person@example.com", extra = {}) {
  return fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password: "example123",
      fullName: "ผู้ใช้จริง",
      phone: "0812345678",
      ...extra,
    }),
  });
}

function cookieFrom(response) {
  return response.headers.get("set-cookie").split(";")[0];
}

test("health checks PostgreSQL and reports readiness", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", database: "connected" });
});

test("category and provider endpoints return data and filter comma-separated locations", async () => {
  const categoryResponse = await fetch(`${baseUrl}/api/categories`);
  const categoryResult = await categoryResponse.json();
  assert.equal(categoryResponse.status, 200);
  assert.ok(categoryResult.data.some((category) => category.id === "maid"));

  const providerUrl = new URL("/api/providers", baseUrl);
  providerUrl.searchParams.set("category", "maid");
  providerUrl.searchParams.set("location", "ห้วยขวาง, กรุงเทพมหานคร");
  const providerResponse = await fetch(providerUrl);
  const result = await providerResponse.json();
  assert.equal(providerResponse.status, 200);
  assert.equal(result.total, 1);
  assert.equal(result.data[0].id, "cleaning");
});

test("auth status returns an empty session for anonymous and expired users", async () => {
  const anonymous = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(anonymous.status, 200);
  assert.deepEqual(await anonymous.json(), { data: null });

  const expired = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: `srbc_session=${"a".repeat(43)}` },
  });
  assert.equal(expired.status, 200);
  assert.deepEqual(await expired.json(), { data: null });
});

test("registration hashes passwords and issues a secure session cookie", async () => {
  const response = await register();
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.data.email, "person@example.com");
  assert.equal(result.data.role, "User");
  assert.equal(result.data.user_metadata.full_name, "ผู้ใช้จริง");
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.match(response.headers.get("set-cookie"), /SameSite=Lax/);
  assert.match(users.get("person@example.com").passwordHash, /^scrypt\$/);
  assert.equal(JSON.stringify(result).includes("passwordHash"), false);

  const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: cookieFrom(response) },
  });
  const profile = await profileResponse.json();
  assert.equal(profileResponse.status, 200);
  assert.equal(profile.data.id, result.data.id);
  assert.equal(profile.data.role, "User");
});

test("registration validates input and rejects duplicate email addresses", async () => {
  assert.equal((await register()).status, 409);

  const selfAssignedAdmin = await register("self-admin@example.com", { role: "Admin" });
  assert.equal(selfAssignedAdmin.status, 201);
  assert.equal((await selfAssignedAdmin.json()).data.role, "User");

  const invalid = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "bad-email",
      password: "short",
      fullName: "",
      phone: "",
    }),
  });
  assert.equal(invalid.status, 400);
});

test("login rejects invalid passwords and accepts valid credentials", async () => {
  const invalid = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "person@example.com", password: "wrongpass1" }),
  });
  assert.equal(invalid.status, 401);

  users.get("person@example.com").role = "Admin";
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "PERSON@example.com", password: "example123" }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.data.email, "person@example.com");
  assert.equal(result.data.role, "Admin");
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
});

test("logout revokes the active session", async () => {
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "person@example.com", password: "example123" }),
  });
  const cookie = cookieFrom(loginResponse);
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { cookie },
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);

  const profile = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } });
  assert.equal(profile.status, 200);
  assert.deepEqual(await profile.json(), { data: null });
});

test("booking data uses the signed-in user and parameterized PostgreSQL queries", async () => {
  const authResponse = await register("booking@example.com");
  const response = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "cleaning",
      packageTitle: "คอนโดสะอาด",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: { contactName: "ปลอม", address: "กรุงเทพมหานคร" },
    }),
  });
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.data.userId, users.get("booking@example.com").id);
  assert.equal(result.data.price, 650);

  const insert = statements.find(({ sql }) => sql.includes("INSERT INTO bookings"));
  assert.ok(insert);
  assert.equal(insert.params[1], users.get("booking@example.com").id);
  assert.equal(insert.params[7], "ผู้ใช้จริง");
});

test("booking reads are scoped to the authenticated user", async () => {
  const authResponse = await register("booking-read@example.com");
  const createResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "cleaning",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: { address: "กรุงเทพมหานคร" },
    }),
  });
  const { data: created } = await createResponse.json();
  const response = await fetch(`${baseUrl}/api/bookings/${created.id}`, {
    headers: { cookie: cookieFrom(authResponse) },
  });
  assert.equal(response.status, 200);
  const query = statements.find(({ sql }) => sql.includes("SELECT id, user_id"));
  assert.ok(query.sql.includes("WHERE id = $1 AND user_id = $2"));
  assert.deepEqual(query.params, [created.id, users.get("booking-read@example.com").id]);
});

test("booking validation and CORS handle local development ports safely", async () => {
  const authResponse = await register("booking-invalid@example.com");
  const invalid = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({ providerId: "cleaning", date: "not-a-date" }),
  });
  assert.equal(invalid.status, 400);

  const rejectedOrigin = await fetch(`${baseUrl}/api/health`, {
    headers: { origin: "https://untrusted.example" },
  });
  assert.equal(rejectedOrigin.status, 403);

  const localOrigin = await fetch(`${baseUrl}/api/health`, {
    headers: { origin: "http://localhost:3002" },
  });
  assert.equal(localOrigin.status, 200);
  assert.equal(
    localOrigin.headers.get("access-control-allow-origin"),
    "http://localhost:3002",
  );
});
