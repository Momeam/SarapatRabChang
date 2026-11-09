import { ShieldCheck } from "lucide-react";

interface EscrowBadgeProps {
  variant?: "inline" | "box" | "compact";
  className?: string;
  amount?: number;
  providerName?: string;
}

export default function EscrowBadge({
  variant = "box",
  className = "",
  amount,
  providerName,
}: EscrowBadgeProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-zinc-600 ${className}`}>
        <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
        <span>ชำระเงินอย่างปลอดภัยผ่านระบบ sarapatrabchang (Escrow)</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-orange-200/80 bg-orange-50/60 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900">
            ชำระเงินปลอดภัยผ่านระบบประกันกลาง (Escrow)
          </h4>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            {amount && providerName
              ? `เงิน ฿${amount.toLocaleString()} จะถูกเก็บไว้ในระบบประกันกลาง ยังไม่โอนให้${providerName} จนกว่าคุณจะตรวจสอบงานและอนุมัติรับงานหลังให้บริการเสร็จสิ้น`
              : "เงินจะถูกเก็บไว้ในระบบอย่างปลอดภัย และจะส่งมอบให้ผู้ให้บริการหลังจากที่คุณตรวจสอบและกดยืนยันตรวจรับงานเรียบร้อยแล้วเท่านั้น"}
          </p>
        </div>
      </div>
    </div>
  );
}

