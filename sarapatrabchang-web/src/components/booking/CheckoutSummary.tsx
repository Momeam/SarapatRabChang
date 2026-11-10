import Link from "next/link";
import { Lock, HelpCircle } from "lucide-react";
import EscrowBadge from "@/components/EscrowBadge";

interface CheckoutSummaryProps {
  onConfirm: () => void;
  price?: number;
}

export default function CheckoutSummary({
  onConfirm,
  price = 650,
}: CheckoutSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">สรุปรายการจอง</h3>
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
          <p className="text-xs text-zinc-500">สุภาวดี ใจดี • บริการแม่บ้าน 1 คน</p>
        </div>
        <span className="text-sm font-bold text-zinc-900">
          ฿{price.toLocaleString()}
        </span>
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
        <span className="font-semibold text-zinc-500 block">สถานที่ให้บริการ</span>
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
          <span className="font-semibold text-zinc-900">
            ฿{price.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>ค่าธรรมเนียมการชำระเงิน</span>
          <span className="font-semibold text-emerald-600">฿0</span>
        </div>
        <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
          <span className="font-bold text-zinc-900 text-sm">ยอดชำระทั้งหมด</span>
          <span className="font-extrabold text-zinc-950 text-2xl">
            ฿{price.toLocaleString()}
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
          onClick={onConfirm}
          className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>ยืนยันการชำระเงิน ฿{price.toLocaleString()}</span>
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
  );
}

