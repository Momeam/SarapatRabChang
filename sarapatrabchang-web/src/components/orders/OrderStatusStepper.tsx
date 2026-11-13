"use client";

import { Check } from "lucide-react";
import { BookingStatus, bookingStatusLabels } from "@/lib/booking";

interface OrderStatusStepperProps {
  status: BookingStatus;
  createdAt: string;
  deliveredAt: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "รอดำเนินการ";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderStatusStepper({
  status,
  createdAt,
  deliveredAt,
}: OrderStatusStepperProps) {
  const serviceStarted = ["in_progress", "delivered", "completed", "disputed"].includes(status);
  const workCompleted = status === "completed";
  const currentStep =
    status === "paid"
      ? 1
      : status === "completed"
        ? -1
        : status === "pending_payment"
          ? 0
          : 2;
  const steps = [
    { label: "บันทึกรายการจอง", date: formatDate(createdAt), done: true },
    { label: "ดำเนินงาน", date: serviceStarted ? "เริ่มดำเนินงานแล้ว" : "รอเริ่มงาน", done: serviceStarted },
    { label: "ส่งมอบและตรวจรับ", date: formatDate(deliveredAt), done: workCompleted },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          สถานะการให้บริการ
        </h3>
        <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
          {bookingStatusLabels[status]}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => {
          const active = currentStep === index && !step.done;
          return (
            <div key={step.label} className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-emerald-500"
                    : active
                      ? "bg-orange-500 ring-4 ring-orange-100"
                      : "bg-zinc-300"
                }`}
              >
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-zinc-950">{step.label}</p>
                <p className="text-xs text-zinc-400">{step.date}</p>
              </div>
            </div>
          );
        })}
      </div>
      {status === "disputed" && (
        <p className="mt-5 text-xs text-rose-700">
          รายการนี้ถูกแจ้งข้อพิพาทแล้ว ยังไม่มีการดำเนินการทางการเงินในระบบ
        </p>
      )}
    </div>
  );
}
