"use client";

import { CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

interface WorkApprovalCardProps {
  providerName: string;
  amount: number;
  onApprove: () => void;
}

export default function WorkApprovalCard({
  providerName,
  amount,
  onApprove,
}: WorkApprovalCardProps) {
  return (
    <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-zinc-900">ตรวจรับงานก่อนปล่อยเงิน</h4>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
          กรุณาตรวจสอบผลงานให้ครบถ้วน เมื่อกดอนุมัติ ระบบจะปล่อยเงินที่พักไว้{" "}
          <strong>฿{amount}</strong> ให้{providerName} และเปลี่ยนสถานะงานเป็นเสร็จสมบูรณ์
        </p>
      </div>

      <button
        type="button"
        onClick={onApprove}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span>ตรวจสอบงานและอนุมัติรับงาน</span>
      </button>

      <div className="flex items-center justify-center gap-6 pt-1 text-xs">
        <button
          type="button"
          onClick={() => alert("ระบบได้ส่งคำขอแก้ไขงานไปยังผู้ให้บริการเรียบร้อยแล้ว")}
          className="text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>ส่งคำขอแก้ไขงาน</span>
        </button>
        <span className="text-zinc-300">•</span>
        <button
          type="button"
          onClick={() =>
            alert(
              "เปิดคำร้องแจ้งข้อพิพาท/ขอคืนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชม."
            )
          }
          className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>แจ้งข้อพิพาท/ขอคืนเงิน</span>
        </button>
      </div>
    </div>
  );
}

