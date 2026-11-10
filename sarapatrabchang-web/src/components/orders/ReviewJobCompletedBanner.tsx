"use client";

import { Check } from "lucide-react";

interface ReviewJobCompletedBannerProps {
  providerName: string;
  amount: number;
  approvedAt: string;
}

export default function ReviewJobCompletedBanner({
  providerName,
  amount,
  approvedAt,
}: ReviewJobCompletedBannerProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-zinc-900">
            งานเสร็จสมบูรณ์ • อนุมัติรับงานแล้ว
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            คุณอนุมัติรับงานเมื่อ {approvedAt} ระบบปล่อยเงิน ฿{amount} ให้{providerName}{" "}
            เรียบร้อยแล้ว
          </p>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
        รอให้คะแนน
      </span>
    </div>
  );
}

