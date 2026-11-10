"use client";

import { CheckCircle2, Lock } from "lucide-react";

interface BookingOrderSummaryProps {
  jobId: string;
  providerName: string;
  providerRole: string;
  serviceName: string;
  serviceDesc: string;
  serviceSpec: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  price: number;
  paymentMethod: string;
  status: string;
  statusColor?: "amber" | "emerald";
  onPay: () => void;
}

export default function BookingOrderSummary({
  jobId,
  providerName,
  providerRole,
  serviceName,
  serviceDesc,
  serviceSpec,
  appointmentDate,
  appointmentTime,
  location,
  price,
  paymentMethod,
  status,
  statusColor = "amber",
  onPay,
}: BookingOrderSummaryProps) {
  const statusClasses =
    statusColor === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200/60";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">สรุปการจอง</h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClasses}`}
        >
          {status}
        </span>
      </div>

      <div className="text-xs text-zinc-500">
        หมายเลขงาน:{" "}
        <span className="font-mono font-semibold text-zinc-800">{jobId}</span>
      </div>

      {/* Provider Info */}
      <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
          {providerName.slice(0, 1)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900">{providerName}</h4>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ยืนยันตัวตนแล้ว • {providerRole}</span>
          </p>
        </div>
      </div>

      {/* Service details */}
      <div className="space-y-1.5 text-xs text-zinc-600 pb-3 border-b border-zinc-100">
        <h5 className="font-bold text-zinc-900 text-sm">{serviceName}</h5>
        <p>{serviceDesc}</p>
        <p className="text-zinc-500">{serviceSpec}</p>
      </div>

      {/* Booking schedule & location */}
      <div className="space-y-2 text-xs pb-3 border-b border-zinc-100">
        <div className="flex justify-between">
          <span className="text-zinc-500">วันที่นัดหมาย</span>
          <span className="font-semibold text-zinc-900">{appointmentDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">เวลาบริการ</span>
          <span className="font-semibold text-zinc-900">{appointmentTime}</span>
        </div>
        <div className="text-zinc-500 pt-1">{location}</div>
      </div>

      {/* Price details */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-zinc-500">ราคาที่ตกลง</span>
          <span className="font-semibold text-zinc-900">฿{price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">วิธีชำระเงิน</span>
          <span className="font-semibold text-zinc-900">{paymentMethod}</span>
        </div>
        <div className="pt-2 border-t border-zinc-100 flex justify-between items-baseline">
          <span className="font-bold text-zinc-900 text-sm">ยอดชำระทั้งหมด</span>
          <span className="font-extrabold text-zinc-950 text-2xl">฿{price}</span>
        </div>
        <p className="text-[11px] text-zinc-400">
          รวมบริการตามข้อตกลง • ไม่มีค่าใช้จ่ายเพิ่มเติม
        </p>
      </div>

      {/* Submit CTA */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onPay}
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
  );
}

