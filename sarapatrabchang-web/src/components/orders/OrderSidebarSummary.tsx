"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";

interface OrderSidebarSummaryProps {
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
  /** "pending" = orange escrow box | "completed" = green paid box */
  escrowState: "pending" | "completed";
  status: string;
}

export default function OrderSidebarSummary({
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
  escrowState,
  status,
}: OrderSidebarSummaryProps) {
  const statusClasses =
    escrowState === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200/60";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">สรุปการจอง</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClasses}`}>
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

      {/* Schedule & Place */}
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

      {/* Price */}
      <div className="flex justify-between items-baseline pt-1">
        <span className="text-xs text-zinc-500">ราคาที่ตกลง</span>
        <span className="text-xl font-extrabold text-zinc-950">฿{price}</span>
      </div>

      {/* Escrow / payment state box */}
      {escrowState === "pending" ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>เงินยังอยู่ในระบบประกันกลาง</span>
          </div>
          <div className="flex items-baseline justify-between text-xs pt-1">
            <span className="text-zinc-600">ยอดที่พักไว้</span>
            <span className="text-base font-bold text-zinc-900">฿{price}</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            ยังไม่โอนให้ผู้ให้บริการจนกว่าคุณจะอนุมัติรับงาน หากงานไม่ตรงข้อตกลง
            สามารถขอแก้ไขหรือแจ้งข้อพิพาทได้
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ชำระเงินให้ผู้ให้บริการแล้ว</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            ยอด ฿{price} จากระบบประกันกลางถูกปล่อยหลังคุณอนุมัติรับงาน
            ไม่มียอดค้างชำระสำหรับงานนี้
          </p>
        </div>
      )}

      {/* Chat button (only on pending state) */}
      {escrowState === "pending" && (
        <Link
          href="/messages"
          className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl border border-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <span>พูดคุยกับผู้ให้บริการ</span>
        </Link>
      )}
    </div>
  );
}

