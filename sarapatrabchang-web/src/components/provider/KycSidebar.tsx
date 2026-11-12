"use client";

import Link from "next/link";
import { User, FileText, Clock, ArrowLeft } from "lucide-react";

interface KycSidebarProps {
  displayName: string;
  email: string;
}

export default function KycSidebar({ displayName, email }: KycSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
          <User className="w-4 h-4 text-orange-500" />
          สมัครด้วยบัญชีเดิมของคุณ
        </h3>
        <div>
          <h4 className="text-base font-bold text-zinc-900">{displayName}</h4>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{email}</p>
        </div>
        <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200/70">
          โปรไฟล์ ที่อยู่ และรีวิวเดิมยังคงอยู่ ไม่ต้องสร้างบัญชีใหม่
        </p>
      </div>

      {/* Checklist Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          เตรียมเอกสารให้พร้อม
        </h3>
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-zinc-900">01 บัตรประชาชนที่ยังไม่หมดอายุ</span>
            <p className="text-zinc-600">ถ่ายภาพด้านหน้าบัตรให้เห็นข้อมูลชัดเจน</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-zinc-900">02 หน้าสมุดบัญชีธนาคาร</span>
            <p className="text-zinc-600">เห็นชื่อธนาคาร เลขบัญชี และชื่อเจ้าของบัญชี</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-zinc-900">03 ชื่อในเอกสารต้องตรงกัน</span>
            <p className="text-zinc-600">ใช้เอกสารและบัญชีธนาคารของตนเอง</p>
          </div>
        </div>
      </div>

      {/* After Submission Info Card */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-600" />
          หลังส่งเอกสาร
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed">
          สถานะจะเปลี่ยนเป็น <span className="font-semibold text-zinc-900">&quot;รอตรวจสอบ&quot;</span> และคุณสามารถติดตามผลจากบัญชีของคุณ
        </p>
        <p className="text-xs text-orange-700 font-medium bg-orange-50/80 p-2.5 rounded-xl border border-orange-200">
          ต้องผ่านการยืนยันตัวตน KYC ก่อนเริ่มโพสต์บริการและรับงาน
        </p>
      </div>

      {/* Back to profile link */}
      <div className="text-center pt-2">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปหน้าโปรไฟล์และข้อมูลส่วนตัว</span>
        </Link>
      </div>
    </aside>
  );
}

