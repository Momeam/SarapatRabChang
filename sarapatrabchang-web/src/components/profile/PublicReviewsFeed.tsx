"use client";

import { Star } from "lucide-react";
import StarRating from "@/components/StarRating";
import type { ProfileReview } from "@/lib/profile";

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ระบุวันที่";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PublicReviewsFeed({ reviews }: { reviews: ProfileReview[] }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900">รีวิวจากงาน</h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ข้อมูลจากฐานข้อมูล
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            คะแนนและความคิดเห็นมาจากรีวิวที่บันทึกหลังจบงาน
          </p>
        </div>
        <span className="text-xs text-zinc-500">ทั้งหมด ({reviews.length})</span>
      </div>

      <div className="space-y-6 pt-4 border-t border-zinc-100">
        {reviews.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
            ยังไม่มีรีวิวจากงานที่เสร็จสิ้น
          </p>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="space-y-3 pb-6 border-b border-zinc-100 last:border-none last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                  {review.reviewerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{review.reviewerName}</span>
                    <div className="flex items-center text-xs">
                      <StarRating value={review.rating} size="sm" showValueText={true} />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    ผู้ใช้บริการ · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-12 whitespace-pre-wrap">
              {review.comment || "ผู้ใช้บริการไม่ได้เขียนความคิดเห็นเพิ่มเติม"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        คะแนนเฉลี่ยคำนวณจากรีวิวในรายการงานของบัญชีนี้
      </div>
    </div>
  );
}

