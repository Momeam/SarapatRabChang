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

`npm run db:setup` สร้างตาราง `users`, `profile_freelance`, `profile_client`, `service_category`, `service_listing`, `service_package`, `quotations`, `orders`, `milestones`, `submissions`, `reviews`, `disputes`, `sessions`, `bookings`, `booking_disputes`, `booking_messages`, `notifications`, `provider_kyc_submissions` และ `provider_payout_requests` ใน Neon รวมถึงเพิ่มคอลัมน์ที่จำเป็นให้ตารางเดิมโดยไม่ลบข้อมูล และเพิ่มหมวดหมู่บริการเริ่มต้นหากยังไม่มี `users.id` ยังคงเป็น UUID; `profile_freelance.id_card_number`, `profile_client.client_id`, `reviews.reviewer_id` และ `disputes.raised_by_user_id` จึงอ้างถึง `users.id` ด้วย UUID ไม่ใช่เลขจำนวนเต็มตามภาพ ส่วน `service_category.category_id` เป็น Primary Key และ `service_listing` เป็นตารางที่อ้างอิงหมวดหมู่ด้วย Foreign Key

`WEB_ORIGIN` ต้องมี origin ของเว็บ (ค่าตัวอย่างรองรับทั้ง `localhost` และ `127.0.0.1`) Session cookie มีอายุ 7 วัน; production จะใช้ Secure cookie โดยอัตโนมัติ

## Endpoints

- `GET /api/health` — ตรวจการเชื่อมต่อ Neon PostgreSQL
- `GET /api/categories` — อ่านหมวดหมู่และจำนวนประกาศจาก Neon
- `GET /api/providers` และ `GET /api/providers/:id` — ค้นหา/อ่านประกาศที่เผยแพร่จาก Neon
- `POST /api/providers` — สร้างโปรไฟล์ผู้ให้บริการ ประกาศ และแพ็กเกจใน Neon (ต้องเข้าสู่ระบบ)
- `GET /api/provider/dashboard` — อ่านสถิติและประกาศของผู้ให้บริการที่เข้าสู่ระบบ
- `PATCH /api/providers/:id` — แก้ไขประกาศของเจ้าของรายการและบันทึกแพ็กเกจใน Neon
- `PATCH /api/providers/:id/status` — เผยแพร่หรือหยุดเผยแพร่ประกาศของเจ้าของรายการ
- `GET /api/provider/finance` — อ่านยอดคำนวณจากงานที่เสร็จแล้ว ยอดงานที่ยังไม่เสร็จ และประวัติคำขอถอนของผู้ให้บริการ
- `POST /api/provider/payouts` — สร้างคำขอถอนโดยตรวจ KYC ที่อนุมัติแล้วและยอดคงเหลือ พร้อมกันยอดใน transaction
- `GET /api/admin/payouts` และ `PATCH /api/admin/payouts/:id` — ให้แอดมินอ่านรายการค้างและบันทึกผลโอนหรือปฏิเสธคำขอ
- `POST /api/auth/register` — สร้างบัญชีและ session
- `POST /api/auth/login` — ตรวจอีเมล/รหัสผ่านและสร้าง session
- `POST /api/auth/logout` — ลบ session ปัจจุบัน
- `GET /api/auth/me` — อ่านบัญชีจาก session cookie; ส่ง `data: null` เมื่อยังไม่ได้เข้าสู่ระบบ
- `GET /api/profile` — อ่านข้อมูลโปรไฟล์ส่วนตัวและรีวิวจากงานของบัญชีที่เข้าสู่ระบบ
- `PATCH /api/profile` — บันทึกชื่อ เบอร์โทร คำแนะนำตัว รูปโปรไฟล์ ความสนใจ ที่อยู่ และข้อมูลใบกำกับภาษีของบัญชีที่เข้าสู่ระบบ
- `GET /api/kyc` — อ่านสถานะ KYC ของบัญชีที่เข้าสู่ระบบ โดยไม่ส่งเลขบัตรหรือข้อมูลธนาคารกลับ
- `POST /api/kyc` — บันทึกข้อมูลยืนยันตัวตนและไฟล์บัตรประชาชน/สมุดบัญชีใน Neon (JPG, PNG หรือ PDF ไม่เกิน 10 MB ต่อไฟล์; ต้องเข้าสู่ระบบ)
- `POST /api/bookings` — สร้างรายการจองของผู้ใช้ที่ล็อกอิน
- `GET /api/bookings` — แสดงรายการที่ผู้ใช้จองหรือเป็นผู้ให้บริการ
- `GET /api/bookings/:id` — อ่านรายการจองของเจ้าของรายการหรือผู้ให้บริการ
- `POST /api/bookings/:id/actions` — เปลี่ยนสถานะตามบทบาท เช่น เริ่มงาน ส่งมอบ ตรวจรับ ขอแก้ไข หรือแจ้งข้อพิพาท
- `GET /api/bookings/:id/messages` และ `POST /api/bookings/:id/messages` — อ่าน/ส่งข้อความที่บันทึกไว้ของงาน โดยจำกัดสิทธิ์เฉพาะผู้ว่าจ้างและผู้ให้บริการของงานนั้น
- `GET /api/notifications` — อ่านการแจ้งเตือนของงานที่ผู้ใช้เป็นผู้ว่าจ้างเท่านั้น
- `PATCH /api/notifications/:id` และ `PATCH /api/notifications/read-all` — ทำเครื่องหมายว่าอ่านแล้ว; `read-all` รับ `{ "type": "message" }` เพื่อเลือกประเภทได้

ข้อความใหม่และการเริ่ม/ส่งมอบงานจากผู้ให้บริการจะสร้างการแจ้งเตือนให้ผู้ว่าจ้างโดยอัตโนมัติ หน้า `/messages` อ่านรายการงานและข้อความจาก API เดียวกัน และบันทึกข้อความลงฐานข้อมูล

## หมายเหตุ

ข้อมูล KYC และไฟล์เอกสารจัดเก็บในตารางที่ไม่เปิดให้อ่านผ่าน endpoint สาธารณะ; endpoint อ่านสถานะจะคืนเฉพาะชื่อ สถานะ และหมวดหมู่ ไม่คืนเลขบัตร บัญชีธนาคาร หรือเนื้อหาเอกสาร ข้อมูลบัญชีธนาคารจะแสดงเต็มเฉพาะ endpoint สำหรับแอดมินที่ตรวจรายการถอน ส่วนผู้ให้บริการเห็นเลขบัญชีที่ปกปิดแล้ว คำขอถอนจะกันยอดจากงานที่สถานะ `completed` และต้องมี KYC ที่อนุมัติแล้ว อย่างไรก็ตามยังไม่มี payment gateway, การตัดเงินจริง, Escrow หรือการโอนเงินอัตโนมัติ สถานะ `paid` หมายถึงแอดมินบันทึกผลหลังโอนผ่านธนาคารแยกต่างหากเท่านั้น; การยืนยันสถานะชำระเงินบนหน้าติดตามงานเป็นสถานะทดสอบ ระบบสมัครสมาชิกยังไม่มีการยืนยันอีเมลหรือรีเซ็ตรหัสผ่าน ควรเพิ่ม rate limiting และระบบยืนยันอีเมลก่อนใช้งานจริง

ทดสอบ API ด้วย `npm test` โดยไม่ต้องมีฐานข้อมูลทดสอบ
