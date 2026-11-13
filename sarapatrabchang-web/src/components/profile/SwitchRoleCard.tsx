"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2 } from "lucide-react";

export default function SwitchRoleCard({ isProvider }: { isProvider: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">สลับโหมดการใช้งาน</h2>
          </div>
          <p className="text-sm text-zinc-600 font-medium">
            {isProvider
              ? "จัดการงานและบริการของคุณด้วยบัญชีเดิม"
              : "พร้อมรับงานที่คุณถนัดแล้วหรือยัง? เริ่มต้นเป็นผู้รับจ้างด้วยโปรไฟล์และบัญชีเดิมของคุณ"}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">โหมดปัจจุบัน:</span>
              <span className="font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">
                {isProvider ? "ผู้รับจ้าง (Provider)" : "ผู้ว่าจ้าง (Client)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isProvider
                  ? "โปรไฟล์ผู้ให้บริการเชื่อมกับบัญชีนี้แล้ว"
                  : "ใช้บัญชีเดิมในการรับงาน (ต้องยืนยันตัวตน KYC ก่อนเริ่มโพสต์บริการ)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 ml-1 shrink-0" />
              <span>
                {isProvider
                  ? "ข้อมูลผู้ว่าจ้างและผู้รับจ้างยังใช้บัญชีเดียวกัน"
                  : "ข้อมูลส่วนตัว ที่อยู่ และรีวิวเดิมยังคงอยู่"}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <Link
            href={isProvider ? "/provider/dashboard" : "/provider/kyc"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md group"
          >
            <span>{isProvider ? "ไปหน้าแดชบอร์ดผู้ให้บริการ" : "เปลี่ยนเป็นโหมดผู้รับจ้าง / สมัครเป็นฟรีแลนซ์"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

