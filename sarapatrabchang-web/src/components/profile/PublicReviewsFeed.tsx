"use client";

import { useState } from "react";
import { Send, CornerDownRight } from "lucide-react";
import StarRating from "@/components/StarRating";
import { mockProfileReviews } from "@/data/mockData";

type Review = (typeof mockProfileReviews)[number];

export default function PublicReviewsFeed() {
  const [reviews, setReviews] = useState<Review[]>(mockProfileReviews);
  const [commentText, setCommentText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "jobs">("all");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      authorName: "ผู้ใช้งาน sarapatrabchang",
      authorRole: "ผู้ใช้งานทั่วไป",
      rating: 5.0,
      date: "วันนี้",
      content: commentText,
    };
    setReviews([newRev, ...reviews]);
    setCommentText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900">
              ความคิดเห็นและรีวิวบนโปรไฟล์ (Public Comments)
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              สาธารณะ
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            ทุกคนสามารถอ่านได้ • กรุณาแสดงความคิดเห็นอย่างสุภาพและไม่เปิดเผยข้อมูลส่วนตัว
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(["all", "jobs"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeFilter === f ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {f === "all" ? `ทั้งหมด (${reviews.length})` : `รีวิวจากงาน (${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Write comment */}
      <form onSubmit={handlePost} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            maxLength={500}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="เขียนความคิดเห็นบนโปรไฟล์นี้..."
            className="w-full p-3.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <span className="absolute bottom-3 right-3 text-[11px] text-zinc-400">
            {commentText.length} / 500
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-400">
            คะแนนดาวมาจากรีวิวหลังจบงาน • ความคิดเห็นทั่วไปไม่จำเป็นต้องให้คะแนน
          </p>
          <button
            type="submit"
            className="py-2 px-5 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>โพสต์ความคิดเห็น</span>
          </button>
        </div>
      </form>

      {/* Reviews list */}
      <div className="space-y-6 pt-4 border-t border-zinc-100">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="space-y-3 pb-6 border-b border-zinc-100 last:border-none last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                  {rev.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{rev.authorName}</span>
                    <div className="flex items-center text-xs">
                      <StarRating value={rev.rating} size="sm" showValueText={true} />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {rev.authorRole} · {rev.date}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-12">{rev.content}</p>

            <div className="pl-12 flex items-center gap-4 text-xs">
              <button className="text-orange-600 font-semibold hover:underline">ตอบกลับ</button>
            </div>

            {rev.reply && (
              <div className="ml-12 mt-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-orange-500" />
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                    พ
                  </div>
                  <span className="font-bold text-xs text-zinc-900">{rev.reply.authorName}</span>
                  <span className="text-[10px] text-zinc-400">· {rev.reply.date}</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed pl-5">{rev.reply.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <span className="text-xs text-zinc-400">แสดงครบทั้ง {reviews.length} รีวิวแล้ว</span>
        <p className="text-[10px] text-zinc-400 mt-1">
          ชื่อ รูปบุคคล ที่อยู่ และรีวิวเป็นข้อมูลสมมติสำหรับประกอบการออกแบบ • ไม่บันทึกข้อมูลหรือโพสต์จริง
        </p>
      </div>
    </div>
  );
}

