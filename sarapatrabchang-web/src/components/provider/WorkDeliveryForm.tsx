"use client";

import { useState } from "react";
import { AlertCircle, UploadCloud, FileCheck, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

interface WorkDeliveryFormProps {
  onSuccess: () => void;
  onBackToChat: () => void;
}

export default function WorkDeliveryForm({ onSuccess, onBackToChat }: WorkDeliveryFormProps) {
  const [description, setDescription] = useState(
    "ได้ทำการเช็ดเก็บรายละเอียดคราบฝุ่นบริเวณขอบบานกระจกและรางเลื่อนระเบียงเรียบร้อยแล้วค่ะ แนบรูปถ่ายตรวจสอบให้เรียบร้อยค่ะ"
  );
  const [hasFile, setHasFile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left 2 Cols: Delivery Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Revision Alert Box */}
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>คำขอแก้ไขงานจากผู้จ้าง:</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed pl-6">
            &quot;ตรงขอบบานกระจกระเบียงยังมีคราบฝุ่นอยู่นิดหน่อยค่ะ รบกวนช่วยเช็ดเก็บรายละเอียดตรงจุดนี้ให้หน่อยนะคะ นอกนั้นเรียบร้อยดีมากค่ะ&quot;
          </p>
        </div>

        {/* Delivery Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">ส่งมอบงานงวดที่ 2</h3>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              งวดที่ 2 / 2 • ระยะส่งมอบแก้ไข
            </span>
          </div>

          {/* File Upload Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-800">
              แนบไฟล์หรือรูปภาพผลงานหลังแก้ไข
            </label>
            <div
              onClick={() => setHasFile(!hasFile)}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                hasFile
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
              }`}
            >
              {hasFile ? (
                <div className="space-y-2">
                  <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-800">แนบไฟล์แล้ว: ระเบียงสะอาด_หลังแก้ไข.jpg</p>
                  <p className="text-[11px] text-zinc-400">คลิกหากต้องการเปลี่ยนไฟล์</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-700">ลากไฟล์ผลงานมาวางที่นี่ หรือเลือกไฟล์</p>
                  <span className="inline-block px-3 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 shadow-xs">
                    เลือกไฟล์
                  </span>
                  <p className="text-[10px] text-zinc-400 pt-1">JPG, PNG หรือ PDF ไม่เกิน 20 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-800">
              อธิบายสิ่งที่ทำ / สรุปสาระสำคัญของงาน
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "กำลังส่งมอบ..." : "ยืนยันการส่งมอบงาน"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Right 1 Col: Milestone Summary Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-950">สรุปงวดงาน</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">งวดงาน</span>
              <span className="font-semibold text-zinc-900">งวดที่ 2 • ตรวจสอบและแก้ไข</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">ยอดเงินงวดนี้</span>
              <span className="font-bold font-mono text-zinc-950 text-sm">฿550.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">กำหนดส่งมอบ</span>
              <span className="font-medium text-zinc-900">16 พ.ย. 2569</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-start gap-2 text-[11px] text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>เงินจะถูกโอนเข้าบัญชีของคุณหลังจากผู้จ้างกดอนุมัติงาน</span>
          </div>

          <button
            type="button"
            onClick={onBackToChat}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปคุยกับผู้จ้าง</span>
          </button>
        </div>
      </div>
    </div>
  );
}

