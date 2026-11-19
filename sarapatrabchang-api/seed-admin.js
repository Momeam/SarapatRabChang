import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./src/auth.js";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const email = "admin@sarapatrabchang.com";
  const password = "Admin1234!";
  const passwordHash = await hashPassword(password);

  const { rows } = await pool.query(
    `INSERT INTO users (id, email, password_hash, role, full_name, phone)
     VALUES ($1, $2, $3, 'Admin', 'ผู้ดูแลระบบ สารพัดรับจ้าง (Super Admin)', '0812345678')
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         role = 'Admin',
         full_name = EXCLUDED.full_name
     RETURNING id, email, role, full_name`,
    [randomUUID(), email, passwordHash],
  );

  console.log("Admin account successfully created/updated:");
  console.log(JSON.stringify(rows[0], null, 2));

  await pool.end();
}

main().catch((err) => {
  console.error("Error creating admin account:", err);
  process.exit(1);
});
