"use client";

import { Wallet, Briefcase, Star } from "lucide-react";

export default function ProviderStatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Stat 1: รายได้สะสม */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">รายได้สะสม (บาท)</span>
          <Wallet className="w-4 h-4 text-orange-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          ฿24,850
        </div>
        <p className="text-xs text-zinc-500 pt-1">รายได้ที่ได้รับแล้วจากงานที่เสร็จสมบูรณ์</p>
      </div>

      {/* Stat 2: งานที่กำลังดำเนินการ */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">งานที่กำลังดำเนินการ</span>
          <Briefcase className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          3 งาน
        </div>
        <p className="text-xs text-orange-600 font-medium pt-1">มีคำของานใหม่รอรันยืนยัน 1 งาน</p>
      </div>

      {/* Stat 3: คะแนนรีวิวเฉลี่ย */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold">คะแนนรีวิวเฉลี่ย</span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
          <span>★ 4.9</span>
        </div>
        <p className="text-xs text-zinc-500 pt-1">จากรีวิวของลูกค้าทั้งหมด 28 รีวิว</p>
      </div>
    </div>
  );
}

