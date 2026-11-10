import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/server.js";

const authenticatedUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "person@example.com",
  user_metadata: { full_name: "ผู้ใช้จริง", phone: "0812345678" },
  created_at: "2026-01-01T00:00:00.000Z",
};

let app;
let baseUrl;
let statements;

const pool = {
  async query(sql) {
    statements.push({ sql, params: [] });
    return [[{ 1: 1 }]];
  },
  async execute(sql, params) {
    statements.push({ sql, params });
    if (sql.includes("SELECT id, user_id")) {
      return [[{ id: params[0], userId: params[1], email: authenticatedUser.email }]];
    }
    return [{ affectedRows: 1 }];
  },
};

before(async () => {
  statements = [];
  app = createApp({
    pool,
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "test-anon-key",
    webOrigin: "http://localhost:3000",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://example.supabase.co/auth/v1/user");
      if (options.headers.authorization === "Bearer invalid") {
        return new Response("{}", { status: 401 });
      }
      assert.equal(options.headers.authorization, "Bearer valid");
      return Response.json(authenticatedUser);
    },
  });
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${app.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    app.close((error) => (error ? reject(error) : resolve())),
  );
});

test("health checks MySQL and reports readiness", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", database: "connected" });
});

test("category and provider endpoints return data and filter comma-separated locations", async () => {
  const categoryResponse = await fetch(`${baseUrl}/api/categories`);
  const categories = await categoryResponse.json();
  assert.equal(categoryResponse.status, 200);
  assert.ok(categories.data.some((category) => category.id === "maid"));

  const providerUrl = new URL("/api/providers", baseUrl);
  providerUrl.searchParams.set("category", "maid");
  providerUrl.searchParams.set("location", "ห้วยขวาง, กรุงเทพมหานคร");
  const providerResponse = await fetch(providerUrl);
  const result = await providerResponse.json();
  assert.equal(providerResponse.status, 200);
  assert.equal(result.total, 1);
  assert.equal(result.data[0].id, "cleaning");
});

test("auth profile is fetched from Supabase and synchronized to MySQL", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization: "Bearer valid" },
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.data.email, authenticatedUser.email);
  assert.equal(result.data.fullName, "ผู้ใช้จริง");
  assert.ok(statements.some(({ sql }) => sql.includes("INSERT INTO users")));
});

test("auth routes reject missing and invalid credentials", async () => {
  const missing = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(missing.status, 401);

  const invalid = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization: "Bearer invalid" },
  });
  assert.equal(invalid.status, 401);
});

test("booking data uses the signed-in user and parameterized MySQL queries", async () => {
  const response = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      authorization: "Bearer valid",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "cleaning",
      packageTitle: "คอนโดสะอาด",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: {
        contactName: "ปลอม",
        address: "กรุงเทพมหานคร",
      },
    }),
  });
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.data.userId, authenticatedUser.id);
  assert.equal(result.data.price, 650);

  const insert = statements.find(({ sql }) => sql.includes("INSERT INTO bookings"));
  assert.ok(insert);
  assert.ok(insert.sql.includes("VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')"));
  assert.equal(insert.params[1], authenticatedUser.id);
  assert.equal(insert.params[7], authenticatedUser.user_metadata.full_name);
});

test("booking reads are scoped to the authenticated user", async () => {
  const response = await fetch(`${baseUrl}/api/bookings/booking-id`, {
    headers: { authorization: "Bearer valid" },
  });
  assert.equal(response.status, 200);
  const query = statements.find(({ sql }) => sql.includes("SELECT id, user_id"));
  assert.ok(query.sql.includes("WHERE id = ? AND user_id = ?"));
  assert.deepEqual(query.params, ["booking-id", authenticatedUser.id]);
});

test("booking validation and CORS reject invalid requests", async () => {
  const invalid = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      authorization: "Bearer valid",
      "content-type": "application/json",
    },
    body: JSON.stringify({ providerId: "cleaning", date: "not-a-date" }),
  });
  assert.equal(invalid.status, 400);

  const rejectedOrigin = await fetch(`${baseUrl}/api/health`, {
    headers: { origin: "https://untrusted.example" },
  });
  assert.equal(rejectedOrigin.status, 403);
});
