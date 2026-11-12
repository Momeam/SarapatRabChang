import { readFile } from "node:fs/promises";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const { rows: userColumns } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'users'`,
  );
  const existingUserColumns = new Set(userColumns.map(({ column_name }) => column_name));
  if (existingUserColumns.size > 0 && !existingUserColumns.has("id")) {
    const { rows: primaryKeys } = await client.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = current_schema()
         AND tc.table_name = 'users'
         AND tc.constraint_type = 'PRIMARY KEY'`,
    );
    if (primaryKeys.length !== 1 || !/^[a-z_][a-z0-9_]*$/i.test(primaryKeys[0].column_name)) {
      throw new Error("The existing users table has no supported primary key.");
    }
    await client.query(
      `ALTER TABLE users RENAME COLUMN "${primaryKeys[0].column_name}" TO id`,
    );
    existingUserColumns.add("id");
  }

  if (existingUserColumns.size > 0 && !existingUserColumns.has("password_hash")) {
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM users");
    if (rows[0].count > 0) {
      throw new Error(
        "Existing accounts need a verified password reset before this schema can be applied.",
      );
    }
    await client.query(
      "ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''",
    );
    await client.query("ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT");
  }

  const { rows: migratedUserColumns } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'users'`,
  );
  const migratedColumns = new Set(migratedUserColumns.map(({ column_name }) => column_name));
  const requiredUserColumns = ["id", "email", "password_hash", "full_name", "phone", "created_at"];
  if (
    migratedColumns.size > 0 &&
    requiredUserColumns.some((column) => !migratedColumns.has(column))
  ) {
    throw new Error("The existing users table does not match the supported schema.");
  }

  await client.query(schema);
  await client.query("COMMIT");
  await client.query("SELECT 1");
  console.log("Neon database schema is ready.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
