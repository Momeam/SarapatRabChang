"use client";

import { Mail, Phone, Lock, Plus } from "lucide-react";

interface ContactAddressCardProps {
  email: string;
  phone: string;
}

export default function ContactAddressCard({ email, phone }: ContactAddressCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">ข้อมูลติดต่อและที่อยู่</h3>
            <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> เฉพาะเจ้าของบัญชี
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">ข้อมูลส่วนนี้ไม่แสดงต่อสาธารณะ</p>
        </div>

        {/* Email & Phone */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block">อีเมลที่เชื่อมโยง • ยืนยันแล้ว</span>
                <span className="font-medium text-zinc-900">{email}</span>
              </div>
            </div>
            <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block">เบอร์โทรศัพท์ • ยืนยันแล้ว</span>
                <span className="font-medium text-zinc-900">{phone}</span>
              </div>
            </div>
            <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
          </div>
        </div>

        {/* Saved addresses */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700">ที่อยู่ที่บันทึกไว้</span>
            <button
              type="button"
              disabled
              className="text-xs text-zinc-400 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> เพิ่มที่อยู่
            </button>
          </div>
          <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-500">
            ยังไม่มีที่อยู่ที่บันทึกไว้
          </p>
        </div>
      </div>
    </div>
  );
}

