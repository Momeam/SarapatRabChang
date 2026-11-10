"use client";

import { CreditCard, QrCode, Smartphone } from "lucide-react";

type PaymentType = "card" | "promptpay" | "mobile";

interface PaymentTypeSelectorProps {
  selected: PaymentType;
  onChange: (type: PaymentType) => void;
  amount: number;
}

const OPTIONS: { key: PaymentType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    key: "card",
    icon: <CreditCard className="w-5 h-5" />,
    label: "บัตรเครดิต",
    desc: "Visa / Mastercard • ชำระเต็มจำนวน",
  },
  {
    key: "promptpay",
    icon: <QrCode className="w-5 h-5" />,
    label: "พร้อมเพย์ (PromptPay)",
    desc: "สแกน QR Code ผ่านแอปธนาคาร",
  },
  {
    key: "mobile",
    icon: <Smartphone className="w-5 h-5" />,
    label: "โมบายแบงก์กิ้ง (Mobile Banking)",
    desc: "ชำระผ่านแอปธนาคารที่คุณใช้งาน",
  },
];

export default function PaymentTypeSelector({
  selected,
  onChange,
  amount,
}: PaymentTypeSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-zinc-900">เลือกวิธีชำระเงิน</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          ยอดที่ต้องชำระ: ฿{amount} • ไม่มีค่าธรรมเนียมเพิ่มเติม
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <div
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              selected === opt.key
                ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payChoice"
                checked={selected === opt.key}
                onChange={() => onChange(opt.key)}
                className="text-orange-500 focus:ring-orange-500"
              />
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                {opt.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                <p className="text-xs text-zinc-500">{opt.desc}</p>
              </div>
            </div>
            {selected === opt.key && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">
                เลือกแล้ว
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

