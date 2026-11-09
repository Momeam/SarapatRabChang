"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import {
  CheckCircle2,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
  Send,
  Star,
} from "lucide-react";

export default function ReviewRatingPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = (params?.id as string) || "SRP-691105-024";

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState(
    "มาตรงเวลา เตรียมอุปกรณ์มาครบ ทำความสะอาดพื้นและเฟอร์นิเจอร์เรียบร้อย โดยเฉพาะครัวกับห้องน้ำสะอาดมากค่ะ งานครบตามที่ตกลง คุ้มค่ากับราคา ฿650 จะกลับมาใช้บริการอีกค่ะ"
  );
  const [submitted, setSubmitted] = useState(false);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return "5 / 5 ดีเยี่ยม";
      case 4:
        return "4 / 5 ดีมาก";
      case 3:
        return "3 / 5 ปานกลาง";
      case 2:
        return "2 / 5 พอใช้";
      default:
        return "1 / 5 ควรปรับปรุง";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/profile");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">
            บัญชีของฉัน
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">ประเมินและให้คะแนน</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ประเมินและให้คะแนน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ขอบคุณที่ใช้บริการ แบ่งปันประสบการณ์ของคุณเพื่อช่วยให้คนใกล้บ้านเลือกบริการได้มั่นใจขึ้น
          </p>
        </div>

        {/* Success Escrow Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900">
                  งานเสร็จสมบูรณ์ • อนุมัติรับงานแล้ว
                </h3>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                คุณอนุมัติรับงานเมื่อ 5 พ.ย. 2569 เวลา 12:30 น. ระบบปล่อยเงิน ฿650 ให้สุภาวดี ใจดี เรียบร้อยแล้ว
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            รอให้คะแนน
          </span>
        </div>

        {/* Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Review Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-zinc-900">
                รีวิวบริการของคุณ
              </h3>

              {/* Provider info pill */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  ส
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    สุภาวดี ใจดี
                  </h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ยืนยันตัวตนแล้ว • แม่บ้าน</span>
                  </p>
                </div>
              </div>

              {/* Interactive Stars */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  ให้คะแนนดาวและรีวิวบริการ
                </label>
                <p className="text-xs text-zinc-500">
                  คุณพึงพอใจกับบริการครั้งนี้มากน้อยแค่ไหน?
                </p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <StarRating
                    value={rating}
                    interactive={true}
                    size="lg"
                    onChange={(val) => setRating(val)}
                  />
                  <span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg w-fit">
                    {getRatingLabel(rating)}
                  </span>
                </div>
              </div>

              {/* Text Review */}
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

              {/* Guidelines Box */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1 text-xs">
                <span className="font-bold text-zinc-800 block">
                  รีวิวที่เป็นประโยชน์ เริ่มจากประสบการณ์จริง
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  กรุณาใช้ถ้อยคำสุภาพ และไม่ระบุเบอร์โทรศัพท์ ที่อยู่ หรือข้อมูลส่วนตัวในรีวิว ความคิดเห็นของคุณช่วยพัฒนาคุณภาพบริการในชุมชน sarapatrabchang
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">
                  สรุปการจอง
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  เสร็จสมบูรณ์
                </span>
              </div>

              <div className="text-xs text-zinc-500">
                หมายเลขงาน:{" "}
                <span className="font-mono font-semibold text-zinc-800">
                  {jobId}
                </span>
              </div>

              {/* Provider Info */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  ส
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    สุภาวดี ใจดี
                  </h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ยืนยันตัวตนแล้ว • แม่บ้าน</span>
                  </p>
                </div>
              </div>

              {/* Service details */}
              <div className="space-y-1.5 text-xs text-zinc-600 pb-3 border-b border-zinc-100">
                <h5 className="font-bold text-zinc-900 text-sm">
                  ทำความสะอาดคอนโดและบ้าน
                </h5>
                <p>คอนโดสะอาดสบาย</p>
                <p className="text-zinc-500">
                  พื้นที่ไม่เกิน 40 ตร.ม. • แม่บ้าน 1 คน • ระยะเวลา 3 ชั่วโมง
                </p>
              </div>

              {/* Schedule & Place */}
              <div className="space-y-2 text-xs pb-3 border-b border-zinc-100">
                <div className="flex justify-between">
                  <span className="text-zinc-500">วันที่นัดหมาย</span>
                  <span className="font-semibold text-zinc-900">5 พ.ย. 2569</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">เวลาบริการ</span>
                  <span className="font-semibold text-zinc-900">
                    09:00–12:00 น.
                  </span>
                </div>
                <div className="text-zinc-500 pt-1">
                  คอนโดของคุณพิมพ์ชนก • ห้วยขวาง กรุงเทพฯ
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-zinc-500">ราคาที่ตกลง</span>
                <span className="text-xl font-extrabold text-zinc-950">
                  ฿650
                </span>
              </div>

              {/* Payment released check */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ชำระเงินให้ผู้ให้บริการแล้ว</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  ยอด ฿650 จากระบบประกันกลางถูกปล่อยหลังคุณอนุมัติรับงาน ไม่มียอดค้างชำระสำหรับงานนี้
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

