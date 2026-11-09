"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EscrowBadge from "@/components/EscrowBadge";
import {
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function PersonalPaymentPage() {
  const router = useRouter();

  const [paymentType, setPaymentType] = useState<"card" | "promptpay" | "mobile">("card");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("PHIMCHANOK S.");
  const [expiry, setExpiry] = useState("08 / 29");
  const [cvv, setCvv] = useState("123");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/orders/SRP-691105-024");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">
            บัญชีของฉัน
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">ชำระเงินส่วนบุคคล</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ชำระเงินส่วนบุคคล
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบรายละเอียดการจองและเลือกวิธีชำระเงินอย่างปลอดภัย
          </p>
        </div>

        {/* Escrow Banner Top Notice */}
        <EscrowBadge
          amount={650}
          providerName="สุภาวดี ใจดี"
          className="border-orange-200 bg-white"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  เลือกวิธีชำระเงิน
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ยอดที่ต้องชำระ: ฿650 • ไม่มีค่าธรรมเนียมเพิ่มเติม
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="space-y-3">
                {/* Credit Card Option */}
                <div
                  onClick={() => setPaymentType("card")}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentType === "card"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payChoice"
                      checked={paymentType === "card"}
                      onChange={() => setPaymentType("card")}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">บัตรเครดิต</p>
                      <p className="text-xs text-zinc-500">
                        Visa / Mastercard • ชำระเต็มจำนวน
                      </p>
                    </div>
                  </div>
                  {paymentType === "card" && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">
                      เลือกแล้ว
                    </span>
                  )}
                </div>

                {/* PromptPay Option */}
                <div
                  onClick={() => setPaymentType("promptpay")}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentType === "promptpay"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payChoice"
                      checked={paymentType === "promptpay"}
                      onChange={() => setPaymentType("promptpay")}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        พร้อมเพย์ (PromptPay)
                      </p>
                      <p className="text-xs text-zinc-500">
                        สแกน QR Code ผ่านแอปธนาคาร
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Banking Option */}
                <div
                  onClick={() => setPaymentType("mobile")}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentType === "mobile"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payChoice"
                      checked={paymentType === "mobile"}
                      onChange={() => setPaymentType("mobile")}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        โมบายแบงก์กิ้ง (Mobile Banking)
                      </p>
                      <p className="text-xs text-zinc-500">
                        ชำระผ่านแอปธนาคารที่คุณใช้งาน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Card Inputs Form */}
              {paymentType === "card" && (
                <form onSubmit={handlePay} className="space-y-4 pt-4 border-t border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900">
                    ข้อมูลบัตรเครดิต
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      หมายเลขบัตร
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <CreditCard className="w-5 h-5 text-zinc-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      ชื่อผู้ถือบัตร
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="เช่น PHIMCHANOK S."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        วันหมดอายุ (เดือน/ปี)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        รหัสความปลอดภัย (CVV)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      ข้อมูลบัตรถูกเข้ารหัส และจะไม่แสดงให้ผู้ให้บริการทราบ
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">
                  สรุปการจอง
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                  รอชำระเงิน
                </span>
              </div>

              <div className="text-xs text-zinc-500">
                หมายเลขงาน:{" "}
                <span className="font-mono font-semibold text-zinc-800">
                  SRP-691105-024
                </span>
              </div>

              {/* Provider Info */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  ส
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    สุภาวดี ใจดี
                  </h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ยืนยันตัวตนแล้ว • แม่บ้าน</span>
                  </p>
                </div>
              </div>

              {/* Service details */}
              <div className="space-y-1.5 text-xs text-zinc-600 pb-3 border-b border-zinc-100">
                <h5 className="font-bold text-zinc-900 text-sm">
                  ทำความสะอาดคอนโดและบ้าน
                </h5>
                <p>คอนโดสะอาดสบาย</p>
                <p className="text-zinc-500">
                  พื้นที่ไม่เกิน 40 ตร.ม. • แม่บ้าน 1 คน • ระยะเวลา 3 ชั่วโมง
                </p>
              </div>

              {/* Booking schedule & location */}
              <div className="space-y-2 text-xs pb-3 border-b border-zinc-100">
                <div className="flex justify-between">
                  <span className="text-zinc-500">วันที่นัดหมาย</span>
                  <span className="font-semibold text-zinc-900">5 พ.ย. 2569</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">เวลาบริการ</span>
                  <span className="font-semibold text-zinc-900">
                    09:00–12:00 น.
                  </span>
                </div>
                <div className="text-zinc-500 pt-1">
                  คอนโดของคุณพิมพ์ชนก • ห้วยขวาง กรุงเทพฯ
                </div>
              </div>

              {/* Price details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ราคาที่ตกลง</span>
                  <span className="font-semibold text-zinc-900">฿650</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">วิธีชำระเงิน</span>
                  <span className="font-semibold text-zinc-900">บัตรเครดิต</span>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-sm">
                    ยอดชำระทั้งหมด
                  </span>
                  <span className="font-extrabold text-zinc-950 text-2xl">
                    ฿650
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  รวมบริการตามข้อตกลง • ไม่มีค่าใช้จ่ายเพิ่มเติม
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handlePay}
                  className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>ยืนยันและชำระเงิน</span>
                </button>
                <p className="text-[10px] text-zinc-400 text-center leading-tight">
                  เมื่อยืนยัน ถือว่าคุณยอมรับข้อตกลงการจองและการชำระเงินผ่านระบบประกันกลาง
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

