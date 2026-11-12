"use client";

import { useState } from "react";
import { FileText, ShieldCheck, ArrowRight } from "lucide-react";

interface QuotationFormProps {
  onSuccess: () => void;
}

export default function QuotationForm({ onSuccess }: QuotationFormProps) {
  const [price, setPrice] = useState("1200");
  const [scope, setScope] = useState(
    "ทำความสะอาดระเบียง ขัดพื้น ขจัดคราบฝุ่นสะสม พร้อมเช็ดกระจกบานเลื่อนทั้ง 2 ด้าน"
  );
  const [appointmentDate, setAppointmentDate] = useState("15 พ.ย. 2569 เวลา 09:00 น.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numPrice = parseFloat(price) || 0;
  const platformFee = Math.round(numPrice * 0.05);
  const netIncome = numPrice - platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-orange-500" />
        <div>
          <h3 className="text-base font-bold text-zinc-950">ออกใบเสนอราคา (Quotation)</h3>
          <p className="text-xs text-zinc-500">ระบุราคาและขอบเขตงานเพื่อให้ลูกค้าอนุมัติก่อนเริ่มงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            ราคาที่เสนอ (บาท)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            ขอบเขตงานที่เสนอ
          </label>
          <textarea
            rows={4}
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            วันที่นัดหมายงาน
          </label>
          <input
            type="text"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Calculation summary */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>ค่าบริการที่เสนอ</span>
            <span className="font-mono font-medium">฿{numPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>ค่าธรรมเนียมระบบ (5%)</span>
            <span className="font-mono text-zinc-400">-฿{platformFee.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-950">
            <span>รายได้สุทธิที่จะได้รับ</span>
            <span className="font-mono text-emerald-600 text-sm">
              ฿{netIncome.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{isSubmitting ? "กำลังส่ง..." : "ส่งใบเสนอราคาให้ลูกค้า"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>เงินจะถูกพักไว้ในระบบ Escrow ทันทีที่ลูกค้ากดอนุมัติใบเสนอราคา</span>
        </div>
      </form>
    </div>
  );
}

