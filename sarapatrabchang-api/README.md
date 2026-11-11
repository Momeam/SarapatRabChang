# SarapatRabChang API

Backend สำหรับ Supabase Authentication และ PostgreSQL ใช้ Supabase ตรวจสอบบัญชี/เซสชัน และ PostgreSQL เก็บโปรไฟล์ที่ซิงก์จากบัญชีรวมถึงรายการจอง API จะไม่รับข้อมูลระบุตัวตนจาก request body; ชื่อ อีเมล และเบอร์โทรมาจากบัญชีที่ Supabase ยืนยันแล้ว

## ตั้งค่า

ต้องใช้ Node.js 20 ขึ้นไป, ฐานข้อมูล PostgreSQL (เช่น Neon) และโปรเจกต์ Supabase:

1. สร้างฐานข้อมูล PostgreSQL และนำเข้า `schema.sql`
2. คัดลอก `.env.example` เป็น `.env` แล้วกำหนด `DATABASE_URL` และค่า Supabase
3. ใน `sarapatrabchang-web` คัดลอก `.env.example` ของเว็บเป็น `.env.local` และใส่ URL/anon key ของ Supabase ชุดเดียวกัน
4. รัน backend จาก root ของ workspace:

   ```powershell
   cd C:\400\SarapatRabChang\sarapatrabchang-api
   npm install
   npm run dev
   ```

5. รันเว็บในอีก terminal จาก root ของ workspace:

   ```powershell
   cd C:\400\SarapatRabChang\sarapatrabchang-web
   npm run dev
   ```

ห้ามส่งหรือ commit secret/service-role key; ใช้ Supabase anon key สำหรับ client และ API เท่านั้น

## Endpoints

- `GET /api/health` — ตรวจการเชื่อมต่อ PostgreSQL
- `GET /api/categories` และ `GET /api/providers` — ข้อมูลตัวอย่างสำหรับหน้าค้นหาปัจจุบัน
- `GET /api/auth/me` — ยืนยัน Bearer token กับ Supabase และซิงก์โปรไฟล์เข้าตาราง `users`
- `POST /api/bookings` — สร้างการจองโดยผูกกับ Supabase user ที่ยืนยันแล้ว
- `GET /api/bookings/:id` — อ่านการจองของผู้ใช้ที่ล็อกอินเท่านั้น

ส่ง session access token ใน `Authorization: Bearer <access_token>` สำหรับ endpoints ที่ต้องล็อกอิน

## ข้อจำกัดปัจจุบัน

บัญชีผู้ใช้และการจองจริงถูกตรวจสอบ/เก็บใน Supabase และ PostgreSQL ตามลำดับ แต่รายการหมวดหมู่และผู้ให้บริการยังเป็นข้อมูลตัวอย่างจาก `src/data.js` จนกว่าจะมีข้อมูลบริการจริงและเปลี่ยน API ไปอ่านตารางบริการ การชำระเงินจริงและการยืนยันตัวตนด้วยเอกสารยังไม่เชื่อมต่อ

ทดสอบ API ด้วย `npm test` โดยไม่ต้องมีเซิร์ฟเวอร์ฐานข้อมูลทดสอบ
