import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/server.js";

let app;
let baseUrl;
const users = new Map();
const sessions = new Map();
const statements = [];
const bookings = new Map();
const bookingDisputes = [];
const providerOwners = new Map();
const clientProfiles = new Map();
const categoryRows = [
  { id: "maid", name: "แม่บ้าน", icon: "Sparkles", count: 1 },
  { id: "all", name: "บริการทั้งหมด", icon: "LayoutGrid", count: 1 },
];
const providerRows = [
  {
    id: "1",
    name: "ผู้ให้บริการ",
    avatar: null,
    category: "แม่บ้าน",
    categoryKey: "maid",
    serviceTitle: "ทำความสะอาดบ้าน",
    packageTitle: "แพ็กเกจพื้นฐาน",
    rating: "4.8",
    reviewCount: 2,
    completedJobs: 3,
    verified: false,
    serviceAreas: ["ห้วยขวาง", "กรุงเทพมหานคร"],
    startingPrice: "650",
    priceUnit: "งาน",
    responseTime: "ตอบกลับเมื่อได้รับข้อความ",
    experienceYears: 0,
    hasTools: false,
    workingHours: "ตามนัดหมาย",
    description: "ทำความสะอาดบ้าน",
    portfolio: [],
    features: [],
    reviews: [],
  },
];

const pool = {
  async query(sql, params = []) {
    statements.push({ sql, params });
    if (sql.trim() === "SELECT 1" || ["BEGIN", "COMMIT", "ROLLBACK"].includes(sql)) {
      return { rows: [] };
    }
    if (sql.includes("SELECT c.category_key AS id")) {
      return { rows: categoryRows.filter((category) => category.id !== "all") };
    }
    if (sql.includes("SELECT l.listing_id::text AS id") && sql.includes("FROM service_listing l")) {
      return {
        rows: providerRows.filter((provider) =>
          !params.some((param) => typeof param === "string" && !param.startsWith("%")) ||
          params.includes(provider.categoryKey),
        ),
      };
    }
    if (sql.includes("SELECT category_id, category_name")) {
      return { rows: [{ category_id: 1, category_name: "แม่บ้าน" }] };
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
    if (sql.includes("UPDATE users") && sql.includes("SET full_name = COALESCE")) {
      const user = [...users.values()].find((item) => item.id === params[0]);
      if (!user) return { rows: [] };
      if (params[1] !== null) user.fullName = params[1];
      if (params[2] !== null) user.phone = params[2];
      if (params[3] !== null) user.bio = params[3];
      if (params[4] !== null) user.avatarUrl = params[4];
      return { rows: [{ id: user.id }] };
    }
    if (sql.includes("INSERT INTO profile_client")) {
      const [userId, interests, address, taxId, taxAddress, taxEmail] = params;
      const profile = clientProfiles.get(userId) ?? {
        interests: [],
        address: "",
        taxId: "",
        taxAddress: "",
        taxEmail: "",
      };
      if (interests !== null) profile.interests = interests;
      if (address !== null) profile.address = address;
      if (taxId !== null) profile.taxId = taxId;
      if (taxAddress !== null) profile.taxAddress = taxAddress;
      if (taxEmail !== null) profile.taxEmail = taxEmail;
      clientProfiles.set(userId, profile);
      return { rows: [] };
    }
    if (sql.includes("LEFT JOIN profile_client pc")) {
      const user = [...users.values()].find((item) => item.id === params[0]);
      if (!user) return { rows: [] };
      const profile = clientProfiles.get(user.id) ?? {};
      return {
        rows: [{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          createdAt: user.createdAt,
          avatarUrl: user.avatarUrl ?? "",
          bio: user.bio ?? "",
          interests: profile.interests ?? [],
          address: profile.address ?? "",
          taxId: profile.taxId ?? "",
          taxAddress: profile.taxAddress ?? "",
          taxEmail: profile.taxEmail || user.email,
          isProvider: [...providerOwners.values()].includes(user.id),
          rating: 0,
          reviewCount: 0,
          reviews: [],
        }],
      };
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
    if (sql.includes("INSERT INTO profile_freelance")) {
      providerOwners.set("2", params[0]);
      return { rows: [{ freelance_id: 1 }] };
    }
    if (sql.includes("INSERT INTO service_listing")) {
      return { rows: [{ listing_id: 2 }] };
    }
    if (sql.includes("INSERT INTO service_package")) {
      return { rows: [] };
    }
    if (sql.includes('SELECT l.title AS "serviceTitle"')) {
      return params[0] === "1"
        ? { rows: [{ serviceTitle: "ทำความสะอาดบ้าน", packageTitle: "แพ็กเกจพื้นฐาน", startingPrice: 650 }] }
        : { rows: [] };
    }
    if (sql.includes("INSERT INTO bookings")) {
      bookings.set(params[0], {
        id: params[0],
        userId: params[1],
        providerId: params[2],
        packageTitle: params[3],
        price: params[4],
        date: params[5],
        timeSlot: params[6],
        contactName: params[7],
        email: params[8],
        phone: params[9],
        address: params[10],
        note: params[11],
        status: "pending_payment",
        statusNote: "",
        deliveryNote: "",
        deliveryPhotoUrls: [],
        deliveredAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { rows: [] };
    }
    if (sql.includes("FROM bookings b") && sql.includes("FOR UPDATE OF b")) {
      const booking = bookings.get(params[0]);
      return {
        rows: booking
          ? [{ id: booking.id, userId: booking.userId, status: booking.status, providerUserId: providerOwners.get(booking.providerId) }]
          : [],
      };
    }
    if (sql.includes("UPDATE bookings") && sql.includes("SET status")) {
      const booking = bookings.get(params[0]);
      const expectedStatus = params[params.length - 1];
      if (!booking || booking.status !== expectedStatus) return { rows: [] };
      booking.status = params[1];
      if (sql.includes("delivered_at = CURRENT_TIMESTAMP")) {
        booking.deliveryNote = params[2];
        booking.deliveryPhotoUrls = JSON.parse(params[3]);
        booking.deliveredAt = new Date().toISOString();
      } else if (sql.includes("delivery_photo_urls = '[]'::jsonb")) {
        booking.statusNote = params[2];
        booking.deliveryNote = "";
        booking.deliveryPhotoUrls = [];
        booking.deliveredAt = null;
      } else {
        booking.statusNote = params[2];
      }
      return { rows: [{ status: booking.status, updatedAt: booking.updatedAt }] };
    }
    if (sql.includes("INSERT INTO booking_disputes")) {
      bookingDisputes.push(params);
      return { rows: [] };
    }
    if (sql.includes("FROM bookings b")) {
      const viewerId = params[0];
      const results = [...bookings.values()].filter((booking) => {
        return booking.userId === viewerId || providerOwners.get(booking.providerId) === viewerId;
      }).filter((booking) => !params[1] || booking.id === params[1]).map((booking) => ({
        ...booking,
        serviceTitle: providerRows[0].serviceTitle,
        category: providerRows[0].category,
        providerName: providerRows[0].name,
        viewerRole: booking.userId === viewerId ? "customer" : "provider",
      }));
      return { rows: results };
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
  assert.ok(categoryResult.data.some((category) => category.id === "all"));

  const providerUrl = new URL("/api/providers", baseUrl);
  providerUrl.searchParams.set("category", "maid");
  providerUrl.searchParams.set("location", "ห้วยขวาง, กรุงเทพมหานคร");
  const providerResponse = await fetch(providerUrl);
  const result = await providerResponse.json();
  assert.equal(providerResponse.status, 200);
  assert.equal(result.total, 1);
  assert.equal(result.data[0].id, "1");
  assert.equal(result.data[0].startingPrice, 650);
  const providerQuery = statements.find(({ sql }) => sql.includes("FROM service_listing l"));
  assert.ok(providerQuery);
  assert.ok(providerQuery.params.includes("%ห้วยขวาง%"));
  assert.ok(providerQuery.params.includes("%กรุงเทพมหานคร%"));
});

test("providers can be published to PostgreSQL by signed-in users", async () => {
  const authResponse = await register("provider@example.com");
  const response = await fetch(`${baseUrl}/api/providers`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      categoryKey: "maid",
      title: "ทำความสะอาดบ้าน",
      location: "ห้วยขวาง, กรุงเทพมหานคร",
      description: "ดูแลบ้านและคอนโด",
      packageName: "แพ็กเกจพื้นฐาน",
      price: 650,
      duration: "3 ชั่วโมง",
      features: ["ถูพื้น"],
      coverImageUrl: "https://images.example.com/cover.jpg",
      portfolioUrls: ["https://images.example.com/work.jpg"],
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.data.id, "2");
  assert.equal(result.data.verified, false);
  const listingInsert = statements.find(({ sql }) => sql.includes("INSERT INTO service_listing"));
  const packageInsert = statements.find(({ sql }) => sql.includes("INSERT INTO service_package"));
  assert.deepEqual(listingInsert.params.slice(2), [
    "ทำความสะอาดบ้าน",
    "ดูแลบ้านและคอนโด",
    ["ห้วยขวาง", "กรุงเทพมหานคร"],
    "https://images.example.com/cover.jpg",
    JSON.stringify([{
      title: "ผลงาน 1",
      image: "https://images.example.com/work.jpg",
      filename: "",
    }]),
  ]);
  assert.deepEqual(packageInsert.params, [2, "แพ็กเกจพื้นฐาน", 650, "3 ชั่วโมง", JSON.stringify(["ถูพื้น"])]);
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

test("profile data is read from and saved to the authenticated user's database row", async () => {
  const authResponse = await register("profile@example.com");
  const cookie = cookieFrom(authResponse);

  const readResponse = await fetch(`${baseUrl}/api/profile`, {
    headers: { cookie },
  });
  const initial = await readResponse.json();
  assert.equal(readResponse.status, 200);
  assert.equal(initial.data.email, "profile@example.com");
  assert.equal(initial.data.fullName, "ผู้ใช้จริง");
  assert.equal(initial.data.phone, "0812345678");
  assert.deepEqual(initial.data.interests, []);
  const profileQuery = statements.find(({ sql }) => sql.includes("LEFT JOIN profile_client pc"));
  assert.ok(profileQuery.sql.includes("JOIN reviews r ON r.order_id = o.order_id"));

  const updateResponse = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({
      fullName: "ชื่อใหม่",
      phone: "0899999999",
      bio: "ข้อความแนะนำตัว",
      avatarUrl: "https://images.example.com/avatar.jpg",
      interests: ["แม่บ้าน", "ช่างไฟ"],
      address: "กรุงเทพมหานคร",
      taxId: "1234567890123",
      taxAddress: "ที่อยู่สำหรับใบกำกับภาษี",
      taxEmail: "billing@example.com",
    }),
  });
  const updated = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(updated.data.fullName, "ชื่อใหม่");
  assert.equal(updated.data.phone, "0899999999");
  assert.equal(updated.data.bio, "ข้อความแนะนำตัว");
  assert.equal(updated.data.avatarUrl, "https://images.example.com/avatar.jpg");
  assert.deepEqual(updated.data.interests, ["แม่บ้าน", "ช่างไฟ"]);
  assert.equal(updated.data.address, "กรุงเทพมหานคร");
  assert.equal(updated.data.taxId, "1234567890123");
  assert.equal(updated.data.taxEmail, "billing@example.com");

  const updateQuery = statements.find(({ sql }) =>
    sql.includes("UPDATE users") && sql.includes("SET full_name = COALESCE"),
  );
  assert.deepEqual(updateQuery.params.slice(0, 3), [
    users.get("profile@example.com").id,
    "ชื่อใหม่",
    "0899999999",
  ]);
});

test("profile updates require authentication and reject unsafe or unsupported values", async () => {
  const anonymous = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bio: "ไม่ควรถูกบันทึก" }),
  });
  assert.equal(anonymous.status, 401);

  const authResponse = await register("profile-validation@example.com");
  const invalid = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({ avatarUrl: "http://insecure.example.com/avatar.jpg" }),
  });
  assert.equal(invalid.status, 400);

  const unsupported = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({ userId: "someone-else", bio: "เปลี่ยนข้อมูลผู้อื่น" }),
  });
  assert.equal(unsupported.status, 400);
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
      providerId: "1",
      packageTitle: "แพ็กเกจพื้นฐาน",
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
  assert.equal(insert.params[7], "ปลอม");
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
      providerId: "1",
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
  const query = statements.find(({ sql }) => sql.includes("AND b.id = $2"));
  assert.ok(query.sql.includes("b.user_id = $1 OR pf.id_card_number = $1"));
  assert.deepEqual(query.params, [users.get("booking-read@example.com").id, created.id]);

  const otherUserAuth = await register("booking-other@example.com");
  const privateBooking = await fetch(`${baseUrl}/api/bookings/${created.id}`, {
    headers: { cookie: cookieFrom(otherUserAuth) },
  });
  assert.equal(privateBooking.status, 404);
});

test("booking lifecycle actions persist status and delivery evidence", async () => {
  const customerAuth = await register("booking-lifecycle@example.com");
  const providerAuth = await register("booking-provider@example.com");
  providerOwners.set("1", users.get("booking-provider@example.com").id);
  const createResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(customerAuth),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "1",
      packageTitle: "แพ็กเกจพื้นฐาน",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: { address: "กรุงเทพมหานคร" },
    }),
  });
  const { data: created } = await createResponse.json();

  const customerBookings = await fetch(`${baseUrl}/api/bookings`, {
    headers: { cookie: cookieFrom(customerAuth) },
  });
  assert.equal((await customerBookings.json()).data.length, 1);

  const confirmPayment = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(customerAuth), "content-type": "application/json" },
    body: JSON.stringify({ action: "confirm_payment" }),
  });
  assert.equal(confirmPayment.status, 200);

  const startWork = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(providerAuth), "content-type": "application/json" },
    body: JSON.stringify({ action: "start_work" }),
  });
  assert.equal(startWork.status, 200);
  assert.equal(bookings.get(created.id).status, "in_progress");

  const deliver = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(providerAuth), "content-type": "application/json" },
    body: JSON.stringify({
      action: "deliver",
      note: "งานเสร็จแล้ว",
      photoUrls: ["https://images.example.com/delivery.jpg"],
    }),
  });
  const deliverResult = await deliver.json();
  assert.equal(deliver.status, 200, JSON.stringify(deliverResult));

  const approve = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(customerAuth), "content-type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  assert.equal(approve.status, 200);
  assert.equal(bookings.get(created.id).status, "completed");
  assert.deepEqual(bookings.get(created.id).deliveryPhotoUrls, [
    "https://images.example.com/delivery.jpg",
  ]);
});

test("booking lifecycle rejects wrong actors, invalid states, and non-HTTPS proof", async () => {
  const customerAuth = await register("booking-guard@example.com");
  const providerAuth = await register("booking-guard-provider@example.com");
  providerOwners.set("1", users.get("booking-guard-provider@example.com").id);
  const createResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(customerAuth),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "1",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: { address: "กรุงเทพมหานคร" },
    }),
  });
  const { data: created } = await createResponse.json();
  const forbidden = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(providerAuth), "content-type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  assert.equal(forbidden.status, 403);

  const invalidProof = await fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
    method: "POST",
    headers: { cookie: cookieFrom(customerAuth), "content-type": "application/json" },
    body: JSON.stringify({ action: "deliver", note: "ส่งมอบ", photoUrls: ["http://example.com/image.jpg"] }),
  });
  assert.equal(invalidProof.status, 400);
});

test("booking revisions reset delivery evidence and disputes are persisted", async () => {
  const customerAuth = await register("booking-dispute@example.com");
  const providerAuth = await register("booking-dispute-provider@example.com");
  providerOwners.set("1", users.get("booking-dispute-provider@example.com").id);
  const createResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(customerAuth),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      providerId: "1",
      date: "2026-11-20",
      timeSlot: "09:00-12:00",
      customer: { address: "กรุงเทพมหานคร" },
    }),
  });
  const { data: created } = await createResponse.json();
  const sendAction = (cookie, action, note = "") =>
    fetch(`${baseUrl}/api/bookings/${created.id}/actions`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({
        action,
        note,
        photoUrls: action === "deliver" ? ["https://images.example.com/work.jpg"] : [],
      }),
    });

  assert.equal((await sendAction(cookieFrom(customerAuth), "confirm_payment")).status, 200);
  assert.equal((await sendAction(cookieFrom(providerAuth), "start_work")).status, 200);
  assert.equal((await sendAction(cookieFrom(providerAuth), "deliver", "ส่งงาน")).status, 200);
  assert.equal((await sendAction(cookieFrom(customerAuth), "request_revision", "ขอแก้ไข")).status, 200);
  assert.equal(bookings.get(created.id).status, "in_progress");
  assert.deepEqual(bookings.get(created.id).deliveryPhotoUrls, []);

  assert.equal((await sendAction(cookieFrom(providerAuth), "deliver", "ส่งงานอีกครั้ง")).status, 200);
  assert.equal((await sendAction(cookieFrom(customerAuth), "dispute", "งานไม่ตรงข้อตกลง")).status, 200);
  assert.equal(bookings.get(created.id).status, "disputed");
  assert.equal(bookingDisputes.at(-1)[1], created.id);
});

test("booking validation and CORS handle local development ports safely", async () => {
  const authResponse = await register("booking-invalid@example.com");
  const invalid = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      cookie: cookieFrom(authResponse),
      "content-type": "application/json",
    },
    body: JSON.stringify({ providerId: "1", date: "not-a-date" }),
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
