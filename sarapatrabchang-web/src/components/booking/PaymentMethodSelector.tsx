"use client";

import { QrCode, CreditCard, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  paymentMethod: "promptpay" | "card" | "mobile";
  setPaymentMethod: (m: "promptpay" | "card" | "mobile") => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-zinc-900">เลือกวิธีชำระเงิน</h3>
        <p className="text-xs text-zinc-500">เลือกช่องทางที่สะดวกสำหรับคุณ</p>
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

        {/* PromptPay QR Preview when selected */}
        {paymentMethod === "promptpay" && (
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-24 h-24 bg-white p-2 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-center shrink-0">
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
              <p className="text-xs text-zinc-500">Visa, Mastercard และ JCB</p>
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
              <p className="text-xs text-zinc-500">ชำระผ่านแอปธนาคารที่รองรับ</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

