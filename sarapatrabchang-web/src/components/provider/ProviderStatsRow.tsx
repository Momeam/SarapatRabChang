"use client";

import { Wallet, Briefcase, Star } from "lucide-react";
import { ProviderDashboardStats } from "@/types";

export default function ProviderStatsRow({
  stats,
}: {
  stats: ProviderDashboardStats;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">มูลค่างานที่เสร็จแล้ว (บาท)</span>
          <Wallet className="w-4 h-4 text-orange-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          ฿{stats.totalEarnings.toLocaleString("th-TH")}
        </div>
        <p className="text-xs text-zinc-500 pt-1">
          รวมจากงานที่เสร็จแล้ว • ยังไม่รวมการโอนเงินจริง
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">งานที่กำลังดำเนินการ</span>
          <Briefcase className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          {stats.activeJobs} งาน
        </div>
        <p className="text-xs text-orange-600 font-medium pt-1">
          มีงานใหม่รอยืนยัน {stats.pendingJobs} งาน
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">คะแนนรีวิวเฉลี่ย</span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
          <span>★ {stats.reviewCount ? stats.averageRating.toFixed(1) : "—"}</span>
        </div>
        <p className="text-xs text-zinc-500 pt-1">
          จากรีวิวของลูกค้าทั้งหมด {stats.reviewCount} รีวิว
        </p>
      </div>
    </div>
  );
}
