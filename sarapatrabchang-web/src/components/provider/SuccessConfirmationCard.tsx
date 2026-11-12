"use client";

import { CheckCircle2, X } from "lucide-react";

interface SuccessConfirmationCardProps {
  type: "quotation" | "delivery" | "withdrawal";
  onClose: () => void;
}

export default function SuccessConfirmationCard({
  type,
  onClose,
}: SuccessConfirmationCardProps) {
  const content = {
    quotation: {
      title: "ส่งใบเสนอราคาแล้ว",
      description:
        "ลูกค้าได้รับใบเสนอราคาเพิ่มเติมของคุณแล้ว เมื่อลูกค้ากดยืนยันยอดเงินจะถูกจองในระบบ Escrow ทันที",
      buttonText: "เข้าใจแล้ว",
    },
    delivery: {
      title: "ส่งมอบงานเรียบร้อยแล้ว",
      description:
        "ระบบได้แจ้งเตือนให้ผู้ว่าจ้างตรวจสอบผลงานงวดที่ 2 แล้ว เมื่อผู้ว่าจ้างอนุมัติยอดเงินจะเข้ากระเป๋าของคุณทันที",
      buttonText: "ตกลง",
    },
    withdrawal: {
      title: "รับคำขอถอนเงินแล้ว",
      description:
        "ระบบกำลังดำเนินการโอนเงินเข้าบัญชีธนาคารกสิกรไทยของคุณ ยอดเงินจะเข้าภายใน 1-2 วันทำการ",
      buttonText: "ปิดหน้าต่าง",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-950 text-white rounded-2xl border border-zinc-800 p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{content.title}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {content.description}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-md"
          >
            {content.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

