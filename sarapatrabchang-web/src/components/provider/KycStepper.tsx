"use client";

import { Check } from "lucide-react";

interface KycStepperProps {
  currentStep?: number;
}

export default function KycStepper({ currentStep = 2 }: KycStepperProps) {
  const steps = [
    { number: 1, title: "1. ข้อมูลส่วนตัว", desc: "ตรวจสอบข้อมูลให้ตรงกับเอกสาร" },
    { number: 2, title: "2. อัปโหลดเอกสาร", desc: "ขั้นตอนปัจจุบัน" },
    { number: 3, title: "3. รอตรวจสอบ", desc: "หลังส่งเอกสารยืนยันตัวตน" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div
              key={step.number}
              className={`flex items-center gap-3.5 p-3 rounded-xl transition-all ${
                isCurrent
                  ? "bg-orange-50/70 border border-orange-200/80"
                  : isDone
                  ? "bg-zinc-50 border border-zinc-200"
                  : "opacity-60 border border-transparent"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.number}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${
                    isCurrent ? "text-zinc-950" : isDone ? "text-zinc-800" : "text-zinc-500"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-zinc-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

