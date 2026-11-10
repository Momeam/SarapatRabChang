import { Check } from "lucide-react";

interface BookingStepperProps {
  currentStep: 1 | 2 | 3;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-center max-w-xl mx-auto">
        {/* Step 1 */}
        <div
          className={`flex items-center gap-2 text-xs font-semibold ${
            currentStep > 1 ? "text-zinc-500" : "text-zinc-950 font-bold"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              currentStep > 1
                ? "bg-emerald-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
          </div>
          <span className="hidden sm:inline">เลือกบริการ</span>
        </div>

        <div
          className={`flex-1 h-0.5 mx-3 ${
            currentStep >= 2 ? "bg-orange-500" : "bg-zinc-200"
          }`}
        ></div>

        {/* Step 2 */}
        <div
          className={`flex items-center gap-2 text-xs ${
            currentStep === 2
              ? "text-zinc-950 font-bold"
              : currentStep > 2
              ? "text-zinc-500 font-semibold"
              : "text-zinc-400 font-medium"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === 2
                ? "bg-orange-500 text-white shadow-xs"
                : currentStep > 2
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 text-zinc-400 border border-zinc-200"
            }`}
          >
            {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
          </div>
          <span>รายละเอียดงานและสถานที่</span>
        </div>

        <div
          className={`flex-1 h-0.5 mx-3 ${
            currentStep === 3 ? "bg-orange-500" : "bg-zinc-200"
          }`}
        ></div>

        {/* Step 3 */}
        <div
          className={`flex items-center gap-2 text-xs ${
            currentStep === 3
              ? "text-zinc-950 font-bold"
              : "text-zinc-400 font-medium"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === 3
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-400 border border-zinc-200"
            }`}
          >
            3
          </div>
          <span className="hidden sm:inline">ชำระเงิน</span>
        </div>
      </div>
    </div>
  );
}

