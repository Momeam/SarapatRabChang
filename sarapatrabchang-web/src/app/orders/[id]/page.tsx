"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EscrowBadge from "@/components/EscrowBadge";
import {
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = (params?.id as string) || "SRP-691105-024";

  const [activeModal, setActiveModal] = useState<"approve" | "revise" | "dispute" | null>(null);

  const handleApprove = () => {
    // Navigate to Review and Rating (Page 9)
    router.push(`/orders/${jobId}/review`);
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
          <span className="text-zinc-900 font-medium">
            ติดตามงานและตรวจรับงานส่วนบุคคล
          </span>
        </div>

        {/* Title & Metadata */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ติดตามงานและตรวจรับงานส่วนบุคคล
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            หมายเลขงาน:{" "}
            <span className="font-mono font-semibold text-zinc-800">
              {jobId}
            </span>{" "}
            • นัดหมาย 5 พ.ย. 2569 เวลา 09:00–12:00 น.
          </p>
        </div>

        {/* Status Stepper Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">
            สถานะการให้บริการ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: Paid */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-zinc-900">ชำระเงินแล้ว</p>
                <p className="text-xs text-zinc-400">2 พ.ย. 2569 • 10:18 น.</p>
              </div>
            </div>

            {/* Step 2: In Progress */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-zinc-900">กำลังดำเนินการ</p>
                <p className="text-xs text-zinc-400">5 พ.ย. 2569 • 09:00 น.</p>
              </div>
            </div>

            {/* Step 3: Delivered (Active inspection) */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 ring-4 ring-orange-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-zinc-950">ส่งมอบงาน</p>
                  <span className="text-[11px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    ส่งมอบแล้ว • รอคุณตรวจรับงาน
                  </span>
                </div>
                <p className="text-xs text-zinc-400">5 พ.ย. 2569 • 12:00 น.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Proofs & Inspection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">
                  ตรวจสอบผลงานที่ส่งมอบ
                </h3>
                <span className="text-xs text-zinc-400">รูปภาพ 3 ไฟล์</span>
              </div>

              {/* Provider Message */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1.5 text-xs">
                <span className="font-bold text-zinc-900 block">
                  ข้อความจากสุภาวดี ใจดี
                </span>
                <p className="text-zinc-600 leading-relaxed">
                  “ทำความสะอาดครบตามแพ็กเกจแล้วค่ะ ทั้งพื้น เฟอร์นิเจอร์ ครัว และห้องน้ำ 1 ห้อง แนบภาพหลังทำงานให้ตรวจสอบ ขอบคุณที่ใช้บริการค่ะ”
                </p>
                <p className="text-[11px] text-zinc-400 pt-1">
                  ส่งมอบเมื่อ 5 พ.ย. 2569 เวลา 12:00 น.
                </p>
              </div>

              {/* Photos Gallery */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <div className="h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
                      alt="ห้องนั่งเล่น"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-zinc-700 text-center">
                    พื้นและห้องนั่งเล่น
                  </p>
                  <p className="text-[10px] text-orange-600 text-center hover:underline cursor-pointer">
                    ห้องนั่งเล่น.jpg • ดูไฟล์
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400"
                      alt="ห้องครัว"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-zinc-700 text-center">
                    ห้องครัว
                  </p>
                  <p className="text-[10px] text-orange-600 text-center hover:underline cursor-pointer">
                    ห้องครัว.jpg • ดูไฟล์
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"
                      alt="ห้องน้ำ"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-zinc-700 text-center">
                    ห้องน้ำ 1 ห้อง
                  </p>
                  <p className="text-[10px] text-orange-600 text-center hover:underline cursor-pointer">
                    ห้องน้ำ.jpg • ดูไฟล์
                  </p>
                </div>
              </div>

              {/* Agreed Checklist */}
              <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-900">
                  รายการงานตามข้อตกลง
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>กวาด ดูดฝุ่น และถูพื้นทุกห้อง</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>เช็ดฝุ่นเฟอร์นิเจอร์และพื้นผิวทั่วไป</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ทำความสะอาดห้องน้ำ 1 ห้อง และครัว</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>อุปกรณ์และน้ำยาทำความสะอาดพื้นฐาน</span>
                  </li>
                </ul>
              </div>

              {/* Escrow Release Card */}
              <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    ตรวจรับงานก่อนปล่อยเงิน
                  </h4>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    กรุณาตรวจสอบผลงานให้ครบถ้วน เมื่อกดอนุมัติ ระบบจะปล่อยเงินที่พักไว้{" "}
                    <strong>฿650</strong> ให้สุภาวดี ใจดี และเปลี่ยนสถานะงานเป็นเสร็จสมบูรณ์
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApprove}
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
                    onClick={() => alert("เปิดคำร้องแจ้งข้อพิพาท/ขอคืนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชม.")}
                    className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>แจ้งข้อพิพาท/ขอคืนเงิน</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Job Summary & Escrow Note */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900">
                  สรุปการจอง
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                  รอตรวจรับงาน
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

              {/* Escrow Box in Summary */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>เงินยังอยู่ในระบบประกันกลาง</span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-zinc-600">ยอดที่พักไว้</span>
                  <span className="text-base font-bold text-zinc-900">฿650</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  ยังไม่โอนให้ผู้ให้บริการจนกว่าคุณจะอนุมัติรับงาน หากงานไม่ตรงข้อตกลง สามารถขอแก้ไขหรือแจ้งข้อพิพาทได้
                </p>
              </div>

              {/* Chat action button */}
              <Link
                href="/messages"
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl border border-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <span>พูดคุยกับผู้ให้บริการ</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

