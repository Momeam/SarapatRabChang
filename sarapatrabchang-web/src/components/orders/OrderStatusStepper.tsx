"use client";

import { Check, CheckCircle2 } from "lucide-react";

interface Step {
  label: string;
  date: string;
  done: boolean;
  active?: boolean;
  activeBadge?: string;
}

const STEPS: Step[] = [
  { label: "ชำระเงินแล้ว", date: "2 พ.ย. 2569 • 10:18 น.", done: true },
  { label: "กำลังดำเนินการ", date: "5 พ.ย. 2569 • 09:00 น.", done: true },
  {
    label: "ส่งมอบงาน",
    date: "5 พ.ย. 2569 • 12:00 น.",
    done: true,
    active: true,
    activeBadge: "ส่งมอบแล้ว • รอคุณตรวจรับงาน",
  },
];

export default function OrderStatusStepper() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">
        สถานะการให้บริการ
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div key={step.label} className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 ${
                step.active
                  ? "bg-orange-500 ring-4 ring-orange-100"
                  : "bg-emerald-500"
              }`}
            >
              <Check className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-zinc-950">{step.label}</p>
                {step.activeBadge && (
                  <span className="text-[11px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    {step.activeBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">{step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

