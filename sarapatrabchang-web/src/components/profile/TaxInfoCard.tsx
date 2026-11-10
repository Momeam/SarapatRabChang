"use client";

import { Edit3 } from "lucide-react";

interface TaxInfoCardProps {
  displayName: string;
  email: string;
}

export default function TaxInfoCard({ displayName, email }: TaxInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">ข้อมูลใบกำกับภาษีเริ่มต้น</h3>
          <button className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> แก้ไขข้อมูลภาษี
          </button>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 block">ประเภทและชื่อ</span>
            <span className="font-bold text-zinc-900">บุคคลธรรมดา • {displayName}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">เลขประจำตัวผู้เสียภาษี</span>
            <span className="font-mono text-zinc-700">ยังไม่ได้ระบุ</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">ที่อยู่ใบกำกับภาษี</span>
            <span className="text-zinc-600 leading-tight block">ยังไม่ได้ระบุ</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">อีเมลรับเอกสาร</span>
            <span className="text-zinc-700 font-medium">{email}</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-100 pt-3">
        ข้อมูลใบกำกับภาษีจะใช้งานได้เมื่อเพิ่มและยืนยันข้อมูลจริง
      </p>
    </div>
  );
}

