"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function SwitchRoleCard({
  isProvider,
  kycStatus = "unverified",
}: {
  isProvider: boolean;
  kycStatus?: string;
}) {
  const normalizedStatus = kycStatus.toLowerCase();
  const isApproved = isProvider || normalizedStatus === "approved" || normalizedStatus === "verified";
  const isPending = !isApproved && normalizedStatus === "pending";
  const isRejected = !isApproved && normalizedStatus === "rejected";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              {isApproved ? "สลับโหมดการใช้งาน" : "การยืนยันตัวตนเป็นฟรีแลนซ์ (KYC)"}
            </h2>
          </div>
          <p className="text-sm text-zinc-600 font-medium">
            {isApproved
              ? "บัญชีของคุณผ่านการอนุมัติเป็นฟรีแลนซ์แล้ว สามารถจัดการงานและบริการของคุณได้ทันที"
              : isPending
                ? "คุณได้ส่งแบบฟอร์มคำขอเป็นฟรีแลนซ์แล้ว ขณะนี้อยู่ระหว่างรอแอดมินตรวจสอบและกดยืนยันอนุมัติ"
                : isRejected
                  ? "คำขอยืนยันตัวตนเป็นฟรีแลนซ์ของคุณไม่ผ่านการอนุมัติ กรุณาตรวจสอบข้อมูลและส่งแบบฟอร์มคำขอใหม่อีกครั้ง"
                  : "ต้องการรับงานเป็นฟรีแลนซ์? กรุณากรอกข้อมูลและส่งคำขอยืนยันตัวตนผ่านแบบฟอร์ม KYC เพื่อรอแอดมินอนุมัติ"}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">สถานะปัจจุบัน:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-md border ${
                  isApproved
                    ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                    : isPending
                      ? "text-amber-800 bg-amber-50 border-amber-200"
                      : isRejected
                        ? "text-red-800 bg-red-50 border-red-200"
                        : "text-zinc-900 bg-zinc-100 border-zinc-200"
                }`}
              >
                {isApproved
                  ? "ผู้รับจ้าง (Provider • อนุมัติแล้ว)"
                  : isPending
                    ? "ส่งคำขอแล้ว (รอแอดมินอนุมัติ)"
                    : isRejected
                      ? "คำขอถูกปฏิเสธ (ต้องยื่นคำขอใหม่)"
                      : "ผู้ว่าจ้าง (Client • ยังไม่ได้ยื่นคำขอเป็นฟรีแลนซ์)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              {isApproved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isPending ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              ) : isRejected ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
              )}
              <span>
                {isApproved
                  ? "โปรไฟล์ผู้ให้บริการของคุณได้รับการยืนยันและพร้อมรับงานแล้ว"
                  : "การสมัครเป็นฟรีแลนซ์ต้องกรอกแบบฟอร์มข้อมูลส่วนตัว บัญชีธนาคาร และแนบเอกสารเพื่อให้แอดมินกดยืนยันเท่านั้น"}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <Link
            href={isApproved ? "/provider/dashboard" : "/provider/kyc"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md group"
          >
            <span>
              {isApproved
                ? "ไปหน้าแดชบอร์ดผู้ให้บริการ"
                : isPending
                  ? "ดูสถานะคำขอยืนยันตัวตน"
                  : isRejected
                    ? "กรอกแบบฟอร์มและส่งคำขอใหม่"
                    : "กรอกแบบฟอร์มส่งคำขอเป็นฟรีแลนซ์"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

