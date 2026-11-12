# SarapatRabChang API

API ใช้ Neon PostgreSQL สำหรับบัญชีผู้ใช้, session และรายการจอง ระบบล็อกอินจัดการโดย API เอง ไม่ใช้บริการ Auth ภายนอก รหัสผ่านเก็บเป็น scrypt hash และ session cookie เป็น HttpOnly; ฐานข้อมูลเก็บเฉพาะ hash ของ session token

## ตั้งค่า

ต้องใช้ Node.js 20 ขึ้นไป:

1. คัดลอก `.env.example` เป็น `.env` แล้วตั้ง `DATABASE_URL` เป็น Neon connection string ห้าม commit ไฟล์ `.env`
2. ติดตั้ง dependencies และสร้างตาราง:

   ```powershell
   npm install
   npm run db:setup
   ```

3. เริ่ม API:

   ```powershell
   npm run dev
   ```

4. ใน `sarapatrabchang-web` คัดลอก `.env.example` เป็น `.env.local` และกำหนด `NEXT_PUBLIC_API_URL` ให้ตรงกับ host ของ API จากนั้นเริ่มเว็บด้วย `npm run dev`

หากเปิดเว็บผ่าน IP ของเครื่องแทน `localhost` ให้ตั้ง `HOST=0.0.0.0` ใน API และเพิ่ม origin ของเว็บ เช่น `http://<IP-ของเครื่อง>:3000` ใน `WEB_ORIGIN` จากนั้นรีสตาร์ต API เว็บจะใช้ IP เดียวกันเรียก API โดยอัตโนมัติ

`npm run db:setup` สร้างตาราง `users`, `profile_freelance`, `profile_client`, `service_category`, `service_listing`, `service_package`, `quotations`, `orders`, `milestones`, `submissions`, `reviews`, `disputes`, `sessions` และ `bookings` ใน Neon รวมถึงเพิ่มคอลัมน์ `username` และ `role` ให้ตาราง `users` เดิมโดยไม่ลบข้อมูลเดิม เพื่อให้เข้ากับ API ปัจจุบัน `users.id` ยังคงเป็น UUID; `profile_freelance.id_card_number`, `profile_client.client_id`, `reviews.reviewer_id` และ `disputes.raised_by_user_id` จึงอ้างถึง `users.id` ด้วย UUID ไม่ใช่เลขจำนวนเต็มตามภาพ ส่วน `service_category.category_id` เป็น Primary Key และ `service_listing` เป็นตารางที่อ้างอิงหมวดหมู่ด้วย Foreign Key

`WEB_ORIGIN` ต้องมี origin ของเว็บ (ค่าตัวอย่างรองรับทั้ง `localhost` และ `127.0.0.1`) Session cookie มีอายุ 7 วัน; production จะใช้ Secure cookie โดยอัตโนมัติ

## Endpoints

- `GET /api/health` — ตรวจการเชื่อมต่อ Neon PostgreSQL
- `GET /api/categories` และ `GET /api/providers` — ข้อมูลตัวอย่างสำหรับหน้าค้นหา
- `POST /api/auth/register` — สร้างบัญชีและ session
- `POST /api/auth/login` — ตรวจอีเมล/รหัสผ่านและสร้าง session
- `POST /api/auth/logout` — ลบ session ปัจจุบัน
- `GET /api/auth/me` — อ่านบัญชีจาก session cookie; ส่ง `data: null` เมื่อยังไม่ได้เข้าสู่ระบบ
- `POST /api/bookings` — สร้างรายการจองของผู้ใช้ที่ล็อกอิน
- `GET /api/bookings/:id` — อ่านรายการจองของผู้ใช้ที่ล็อกอินเท่านั้น

## หมายเหตุ

ระบบสมัครสมาชิกยังไม่มีการยืนยันอีเมลหรือรีเซ็ตรหัสผ่าน และ API จองพร้อมใช้งาน แต่หน้า checkout ปัจจุบันยังเป็น mock flow ไม่ได้ส่งรายการจองจริง ควรเพิ่ม rate limiting และระบบยืนยันอีเมลก่อนใช้งานจริง

ทดสอบ API ด้วย `npm test` โดยไม่ต้องมีฐานข้อมูลทดสอบ
