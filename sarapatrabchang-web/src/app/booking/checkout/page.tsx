"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EscrowBadge from "@/components/EscrowBadge";
import {
  Check,
  QrCode,
  CreditCard,
  Smartphone,
  MapPin,
  Lock,
  ArrowLeft,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"promptpay" | "card" | "mobile">("promptpay");

  // e-Tax states
  const [needTaxInvoice, setNeedTaxInvoice] = useState(true);
  const [taxType, setTaxType] = useState<"individual" | "corporate">("individual");
  const [taxId, setTaxId] = useState("1-1002-00345-67-8");
  const [taxName, setTaxName] = useState("พิมพ์ชนก ใจดี");
  const [taxAddress, setTaxAddress] = useState(
    "88/12 ซอยสุขุมวิท 39 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110"
  );
  const [taxEmail, setTaxEmail] = useState("pimchanok@example.com");

  const handleConfirmPayment = () => {
    if (paymentMethod === "card") {
      // If user wants to enter credit card directly as in Wireframe Page 6
      router.push("/booking/payment");
    } else {
      // PromptPay / Mobile banking confirmed -> go to Order Tracking (Page 8)
      router.push("/orders/SRP-691105-024");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าหลัก
          </Link>
          <span>/</span>
          <Link href="/services/cleaning" className="hover:text-orange-600">
            บริการช่างและแม่บ้าน
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">ชำระเงิน</span>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-center max-w-xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">เลือกบริการ</span>
            </div>

            <div className="flex-1 h-0.5 bg-emerald-500 mx-3"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">รายละเอียดงานและสถานที่</span>
            </div>

            <div className="flex-1 h-0.5 bg-orange-500 mx-3"></div>

            {/* Step 3 (Active) */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-950">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shadow-xs">
                3
              </div>
              <span>ชำระเงิน</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ตรวจสอบและชำระเงิน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบรายละเอียดการจอง เลือกวิธีชำระเงิน และระบุข้อมูลใบกำกับภาษี
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Methods & e-Tax Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  เลือกวิธีชำระเงิน
                </h3>
                <p className="text-xs text-zinc-500">
                  เลือกช่องทางที่สะดวกสำหรับคุณ
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. PromptPay */}
                <label
                  onClick={() => setPaymentMethod("promptpay")}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    paymentMethod === "promptpay"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "promptpay"}
                      onChange={() => setPaymentMethod("promptpay")}
                      className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-900">
                        พร้อมเพย์ (PromptPay QR Code)
                      </p>
                      <p className="text-xs text-zinc-500">
                        สแกนจ่ายผ่านแอปธนาคารของคุณได้ทุกธนาคาร
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ฟรีค่าธรรมเนียม
                  </span>
                </label>

                {/* PromptPay QR Simulation Box if selected */}
                {paymentMethod === "promptpay" && (
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-24 h-24 bg-white p-2 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-center shrink-0">
                      {/* Stylized QR placeholder */}
                      <div className="w-full h-full border border-dashed border-zinc-400 p-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-zinc-900"></div>
                          <div className="w-4 h-4 bg-zinc-900"></div>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-500 text-center font-bold">
                          PROMPTPAY
                        </div>
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-zinc-900"></div>
                          <div className="w-2 h-2 bg-zinc-900 self-end"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-zinc-900">
                        QR สำหรับชำระเงินจะแสดงหลังกดยืนยันรายการ
                      </p>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        ระบบจะสร้าง QR Code พร้อมยอดเงิน ฿650 สำหรับสแกนจ่ายผ่าน Mobile Banking ได้ทันที
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-900">
                        บัตรเครดิต / บัตรเดบิต
                      </p>
                      <p className="text-xs text-zinc-500">
                        Visa, Mastercard และ JCB
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-orange-600 font-semibold underline">
                    กรอกข้อมูลบัตร
                  </span>
                </label>

                {/* 3. Mobile Banking */}
                <label
                  onClick={() => setPaymentMethod("mobile")}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    paymentMethod === "mobile"
                      ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "mobile"}
                      onChange={() => setPaymentMethod("mobile")}
                      className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-zinc-900">
                        โมบายแบงก์กิ้ง (Mobile Banking)
                      </p>
                      <p className="text-xs text-zinc-500">
                        ชำระผ่านแอปธนาคารที่รองรับ
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* e-Tax Invoice Section */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="etax"
                  checked={needTaxInvoice}
                  onChange={(e) => setNeedTaxInvoice(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-zinc-300"
                />
                <label
                  htmlFor="etax"
                  className="text-sm font-bold text-zinc-900 cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>ต้องการรับใบกำกับภาษีแบบอิเล็กทรอนิกส์ (e-Tax Invoice)</span>
                </label>
              </div>

              {needTaxInvoice && (
                <div className="space-y-4 pt-3 border-t border-zinc-100">
                  {/* Tax Type Radios */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-2">
                      ประเภทผู้ขอใบกำกับภาษี
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                        <input
                          type="radio"
                          name="taxtype"
                          checked={taxType === "individual"}
                          onChange={() => setTaxType("individual")}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span>บุคคลธรรมดา</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                        <input
                          type="radio"
                          name="taxtype"
                          checked={taxType === "corporate"}
                          onChange={() => setTaxType("corporate")}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span>นิติบุคคล/บริษัท</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        เลขประจำตัวผู้เสียภาษี (Tax ID)
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="กรอกเลขประจำตัวผู้เสียภาษี 13 หลัก"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        ชื่อ-นามสกุล / ชื่อบริษัท
                      </label>
                      <input
                        type="text"
                        value={taxName}
                        onChange={(e) => setTaxName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      ที่อยู่ตามบัตรประชาชน / ที่อยู่จดทะเบียน
                    </label>
                    <textarea
                      rows={2}
                      value={taxAddress}
                      onChange={(e) => setTaxAddress(e.target.value)}
                      className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      อีเมลรับเอกสาร
                    </label>
                    <input
                      type="email"
                      value={taxEmail}
                      onChange={(e) => setTaxEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    ⓘ ระบบจะจัดส่งใบกำกับภาษีเข้าอีเมลนี้โดยอัตโนมัติเมื่อชำระเงินสำเร็จ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Escrow Protection */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">
                  สรุปรายการจอง
                </h3>
                <Link
                  href="/booking/details"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  แก้ไข
                </Link>
              </div>

              {/* Service item */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900">
                    ทำความสะอาดคอนโดและบ้าน
                  </h4>
                  <p className="text-xs text-zinc-500">
                    สุภาวดี ใจดี • บริการแม่บ้าน 1 คน
                  </p>
                </div>
                <span className="text-sm font-bold text-zinc-900">฿650</span>
              </div>

              {/* Date & Time */}
              <div className="space-y-1 text-xs pb-4 border-b border-zinc-100">
                <span className="font-semibold text-zinc-500 block">
                  วันและเวลาเข้ารับบริการ
                </span>
                <p className="font-bold text-zinc-900">
                  10 พฤศจิกายน 2569 • 09:00–12:00 น.
                </p>
                <p className="text-[11px] text-zinc-400">
                  วันและเวลาเป็นข้อมูลตัวอย่างประกอบ
                </p>
              </div>

              {/* Location */}
              <div className="space-y-1 text-xs pb-4 border-b border-zinc-100">
                <span className="font-semibold text-zinc-500 block">
                  สถานที่ให้บริการ
                </span>
                <p className="text-zinc-800 leading-relaxed font-medium">
                  88/12 ซอยสุขุมวิท 39 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110
                </p>
                <p className="text-zinc-500 font-semibold pt-1">
                  พิมพ์ชนก ใจดี • 081 234 5678
                </p>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between text-zinc-600">
                  <span>ค่าบริการ</span>
                  <span className="font-semibold text-zinc-900">฿650</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>ค่าธรรมเนียมการชำระเงิน</span>
                  <span className="font-semibold text-emerald-600">฿0</span>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-sm">
                    ยอดชำระทั้งหมด
                  </span>
                  <span className="font-extrabold text-zinc-950 text-2xl">
                    ฿650
                  </span>
                </div>
              </div>

              {/* Escrow Badge */}
              <EscrowBadge />

              {/* CTA button */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] text-zinc-400 text-center">
                  เมื่อยืนยันการชำระเงิน ถือว่าคุณยอมรับข้อกำหนดการใช้บริการและนโยบายการยกเลิกการจอง
                </p>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>ยืนยันการชำระเงิน ฿650</span>
                </button>
                <div className="text-center">
                  <a
                    href="#help"
                    className="text-xs text-zinc-500 hover:text-orange-600 inline-flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>มีปัญหาในการชำระเงิน? ติดต่อศูนย์ช่วยเหลือ</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 border-t border-zinc-200">
          <Link
            href="/booking/details"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปแก้ไขรายละเอียดงานและสถานที่</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

