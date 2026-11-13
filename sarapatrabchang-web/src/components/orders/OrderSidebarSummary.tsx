"use client";

import Link from "next/link";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { Booking, bookingStatusLabels } from "@/lib/booking";

interface OrderSidebarSummaryProps {
  booking: Booking;
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderSidebarSummary({ booking }: OrderSidebarSummaryProps) {
  const isComplete = booking.status === "completed";
  const statusClasses = isComplete
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : booking.status === "disputed"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-amber-50 text-amber-700 border-amber-200/60";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-zinc-900">สรุปรายการจอง</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClasses}`}>
          {bookingStatusLabels[booking.status]}
        </span>
      </div>

      <div className="text-xs text-zinc-500">
        หมายเลขงาน:{" "}
        <span className="font-mono font-semibold text-zinc-800">{booking.id}</span>
      </div>

      <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
          {booking.providerName.slice(0, 1)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900">{booking.providerName}</h4>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {booking.category}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-zinc-600 pb-3 border-b border-zinc-100">
        <h5 className="font-bold text-zinc-900 text-sm">{booking.serviceTitle}</h5>
        <p>แพ็กเกจ {booking.packageTitle}</p>
        {booking.note && <p className="text-zinc-500">{booking.note}</p>}
      </div>

      <div className="space-y-2 text-xs pb-3 border-b border-zinc-100">
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">วันที่นัดหมาย</span>
          <span className="font-semibold text-zinc-900">{formatDate(booking.date)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-zinc-500">เวลาบริการ</span>
          <span className="font-semibold text-zinc-900">{booking.timeSlot.replace("-", "–")} น.</span>
        </div>
        <p className="text-zinc-500 pt-1">{booking.address}</p>
        <p className="text-zinc-500">
          {booking.contactName}{booking.phone ? ` • ${booking.phone}` : ""}
        </p>
      </div>

      <div className="flex justify-between items-baseline pt-1">
        <span className="text-xs text-zinc-500">ราคาแพ็กเกจ</span>
        <span className="text-xl font-extrabold text-zinc-950">
          ฿{booking.price.toLocaleString()}
        </span>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900">
        สถานะในหน้านี้ใช้ติดตามรายการเท่านั้น ไม่มีการตัดเงินจริงหรือโอนเงิน
      </div>

      <Link
        href="/messages"
        className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl border border-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4 text-zinc-500" />
        <span>ไปที่ข้อความ</span>
      </Link>
    </div>
  );
}
