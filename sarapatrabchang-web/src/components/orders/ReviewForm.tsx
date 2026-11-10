"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import StarRating from "@/components/StarRating";

interface ReviewFormProps {
  providerName: string;
  providerRole: string;
  initialRating?: number;
  initialText?: string;
  onSubmit: (rating: number, text: string) => void;
  submitted: boolean;
}

const RATING_LABELS: Record<number, string> = {
  5: "5 / 5 ดีเยี่ยม",
  4: "4 / 5 ดีมาก",
  3: "3 / 5 ปานกลาง",
  2: "2 / 5 พอใช้",
  1: "1 / 5 ควรปรับปรุง",
};

export default function ReviewForm({
  providerName,
  providerRole,
  initialRating = 5,
  initialText = "",
  onSubmit,
  submitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, reviewText);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
      <h3 className="text-base font-bold text-zinc-900">รีวิวบริการของคุณ</h3>

      {/* Provider info pill */}
      <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
          {providerName.slice(0, 1)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900">{providerName}</h4>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ยืนยันตัวตนแล้ว • {providerRole}</span>
          </p>
        </div>
      </div>

      {/* Star picker */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-800">
          ให้คะแนนดาวและรีวิวบริการ
        </label>
        <p className="text-xs text-zinc-500">คุณพึงพอใจกับบริการครั้งนี้มากน้อยแค่ไหน?</p>
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
          <StarRating
            value={rating}
            interactive={true}
            size="lg"
            onChange={(val) => setRating(val)}
          />
          <span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg w-fit">
            {RATING_LABELS[rating] ?? ""}
          </span>
        </div>
      </div>

      {/* Text review + submit */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1.5">
            เขียนข้อความรีวิว
          </label>
          <textarea
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="เล่าประสบการณ์จริงเกี่ยวกับคุณภาพงาน ความตรงต่อเวลา และการสื่อสาร"
            className="w-full p-3.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 leading-relaxed"
          />
          <p className="text-[11px] text-zinc-400 mt-1">
            เล่าประสบการณ์จริงเกี่ยวกับคุณภาพงาน ความตรงต่อเวลา และการสื่อสาร
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <span className="text-xs text-zinc-500">
            รีวิวจะแสดงบนโปรไฟล์ของผู้ให้บริการในชื่อ{" "}
            <strong className="text-zinc-800">พิมพ์ชนก ส.</strong>
          </span>
          <button
            type="submit"
            disabled={submitted}
            className="w-full sm:w-auto py-2.5 px-6 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitted ? "ส่งรีวิวเรียบร้อย..." : "ส่งรีวิว"}</span>
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1 text-xs">
        <span className="font-bold text-zinc-800 block">
          รีวิวที่เป็นประโยชน์ เริ่มจากประสบการณ์จริง
        </span>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          กรุณาใช้ถ้อยคำสุภาพ และไม่ระบุเบอร์โทรศัพท์ ที่อยู่ หรือข้อมูลส่วนตัวในรีวิว
          ความคิดเห็นของคุณช่วยพัฒนาคุณภาพบริการในชุมชน sarapatrabchang
        </p>
      </div>
    </div>
  );
}

