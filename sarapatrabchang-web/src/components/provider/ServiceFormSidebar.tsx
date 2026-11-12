"use client";

import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface ServiceFormSidebarProps {
  title: string;
  category: string;
  location: string;
  packageName: string;
  price: string;
  duration: string;
  displayName: string;
}

export default function ServiceFormSidebar({
  title,
  category,
  location,
  packageName,
  price,
  duration,
  displayName,
}: ServiceFormSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* KYC Badge Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-950">ยืนยันตัวตน KYC แล้ว</h3>
        </div>
        <p className="text-xs text-zinc-600">
          บัญชีผู้รับจ้างพร้อมสร้างและเผยแพร่ประกาศบริการ
        </p>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-950 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          ข้อมูลบนหน้าหลัก (ตัวอย่าง)
        </h3>

        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
          <div className="text-[11px] text-zinc-500 font-medium">
            {category || "แม่บ้าน"} • {location.split(",")[0] || "กรุงเทพมหานคร"}
          </div>

          <h4 className="text-sm font-bold text-zinc-950 leading-snug">
            {title || "ทำความสะอาดคอนโดและบ้าน"}
          </h4>

          <div className="text-xs text-zinc-600 font-medium">
            {displayName}
          </div>

          <div className="text-xs text-zinc-500">
            {packageName || "คอนโดขนาดเล็ก"} • {duration || "3 ชั่วโมง"}
          </div>

          <div className="pt-2 border-t border-zinc-200/70 flex items-baseline gap-1">
            <span className="text-xs text-zinc-500">เริ่มต้น</span>
            <span className="text-base font-extrabold text-zinc-950">
              ฿{price || "650"}
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 italic">
            ภาพปกจะแสดงหลังเผยแพร่ประกาศ
          </p>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-950">ก่อนเผยแพร่ประกาศ</h3>
        <div className="space-y-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-900">01 ระบุชื่อบริการให้เข้าใจง่าย</span>
            <p className="text-zinc-500 text-[11px]">ใช้คำที่ลูกค้ามักใช้ค้นหา</p>
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-900">02 กำหนดราคาและขอบเขตงานให้ชัดเจน</span>
            <p className="text-zinc-500 text-[11px]">ระบุสิ่งที่รวมและไม่รวมในแพ็กเกจ</p>
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-900">03 เลือกพื้นที่ที่คุณเดินทางไปให้บริการได้</span>
            <p className="text-zinc-500 text-[11px]">เพื่อหลีกเลี่ยงการปฏิเสธงานภายหลัง</p>
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-900">04 เพิ่มภาพผลงานเพื่อช่วยลูกค้าตัดสินใจ</span>
            <p className="text-zinc-500 text-[11px]">ภาพจริงช่วยเพิ่มความน่าเชื่อถือ</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

