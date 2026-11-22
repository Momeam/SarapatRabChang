"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, MessageSquarePlus, ExternalLink } from "lucide-react";
import StarRating from "@/components/StarRating";
import type { ProfileReview } from "@/lib/profile";
import { Booking, formatJobCode } from "@/lib/booking";
import { requestApi } from "@/lib/api";

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ระบุวันที่";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PublicReviewsFeedProps {
  reviews: ProfileReview[];
  unreviewedBookings?: Booking[];
  onReviewSubmitted?: () => void;
}

export default function PublicReviewsFeed({
  reviews,
  unreviewedBookings = [],
  onReviewSubmitted,
}: PublicReviewsFeedProps) {
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenReview = (bookingId: string) => {
    setActiveBookingId(bookingId);
    setRating(5);
    setComment("");
    setError(null);
  };

  const handleSubmitReview = async (bookingId: string) => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await requestApi(`/api/bookings/${encodeURIComponent(bookingId)}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      setActiveBookingId(null);
      setComment("");
      setSuccessMsg("บันทึกรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็นของคุณ!");
      onReviewSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งรีวิวไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

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
            คะแนนและความคิดเห็นมาจากรีวิวที่บันทึกหลังจบงาน (สามารถรีวิวงานที่ลืมรีวิวได้ที่นี่)
          </p>
        </div>
        <span className="text-xs text-zinc-500">ทั้งหมด ({reviews.length})</span>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Unreviewed Completed Jobs Section */}
      {unreviewedBookings.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs sm:text-sm font-bold text-orange-950">
                งานที่เสร็จสมบูรณ์แล้ว รอการรีวิวจากคุณ ({unreviewedBookings.length} งาน)
              </h4>
            </div>
            <span className="text-[11px] text-orange-700">
              ให้คะแนนย้อนหลังได้ทันที
            </span>
          </div>

          <div className="space-y-3">
            {unreviewedBookings.map((booking) => {
              const isEditing = activeBookingId === booking.id;
              return (
                <div
                  key={booking.id}
                  className="rounded-xl border border-orange-200/80 bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900">
                          {booking.serviceTitle}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          #{formatJobCode(booking.id)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        ผู้ให้บริการ: <strong className="text-zinc-700">{booking.providerName}</strong> • แพ็กเกจ{" "}
                        {booking.packageTitle} (฿{booking.price.toLocaleString()})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(booking.id)}
                          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>เขียนรีวิวให้ช่าง</span>
                        </button>
                      )}
                      <Link
                        href={`/orders/${encodeURIComponent(booking.id)}`}
                        className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>ดูงาน</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-3 border-t border-zinc-100 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                          ให้คะแนนความพึงพอใจ:
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-300"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-bold text-zinc-700">
                            {rating}.0 / 5.0
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          ความคิดเห็นเพิ่มเติม:
                        </label>
                        <textarea
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="บอกเล่าประสบการณ์การใช้บริการของคุณ..."
                          className="w-full rounded-xl border border-zinc-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {error && (
                        <p role="alert" className="text-xs text-red-600">
                          {error}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setActiveBookingId(null)}
                          className="px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => void handleSubmitReview(booking.id)}
                          className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? "กำลังบันทึก..." : "บันทึกรีวิว"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6 pt-2">
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
