import Link from "next/link";
import { CalendarDays, MapPin, UserRound } from "lucide-react";

interface CheckoutSummaryProps {
  onConfirm: () => void;
  isSubmitting: boolean;
  providerName: string;
  serviceTitle: string;
  packageTitle: string;
  date: string;
  timeSlot: string;
  address: string;
  contactName: string;
  phone: string;
  price: number;
}

export default function CheckoutSummary({
  onConfirm,
  isSubmitting,
  providerName,
  serviceTitle,
  packageTitle,
  date,
  timeSlot,
  address,
  contactName,
  phone,
  price,
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
          <h4 className="text-sm font-bold text-zinc-900">{serviceTitle}</h4>
          <p className="text-xs text-zinc-500">
            {providerName} • {packageTitle}
          </p>
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
        <p className="font-bold text-zinc-900 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          {date} • {timeSlot}
        </p>
      </div>

      {/* Location */}
      <div className="space-y-1 text-xs pb-4 border-b border-zinc-100">
        <span className="font-semibold text-zinc-500 block">สถานที่ให้บริการ</span>
        <p className="text-zinc-800 leading-relaxed font-medium flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{address}</span>
        </p>
        <p className="text-zinc-500 font-semibold pt-1 flex items-center gap-1.5">
          <UserRound className="w-3.5 h-3.5" />
          {contactName || "ข้อมูลจากบัญชีผู้ใช้"}{phone ? ` • ${phone}` : ""}
        </p>
      </div>

      {/* Booking total */}
      <div className="space-y-2 text-xs pt-1">
        <div className="flex justify-between text-zinc-600">
          <span>ราคาที่บันทึกในรายการ</span>
          <span className="font-semibold text-zinc-900">
            ฿{price.toLocaleString()}
          </span>
        </div>
        <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
          <span className="font-bold text-zinc-900 text-sm">ยอดรายการจอง</span>
          <span className="font-extrabold text-zinc-950 text-2xl">
            ฿{price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CTA button */}
      <div className="space-y-3 pt-2">
        <p className="text-[11px] text-amber-700 text-center">
          ระบบจะบันทึกรายการจองและสถานะเท่านั้น ยังไม่มีการตัดเงินจริงหรือโอนเงิน
        </p>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isSubmitting ? "กำลังบันทึก..." : "ยืนยันและบันทึกรายการจอง"}</span>
        </button>
      </div>
    </div>
  );
}

