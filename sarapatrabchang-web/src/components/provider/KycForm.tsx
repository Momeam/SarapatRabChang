"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";

interface KycFormProps {
  initialName: string;
}

export default function KycForm({ initialName }: KycFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName || "พิมพ์ชนก ใจดี");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [category, setCategory] = useState("cleaning");

  const [idFileUploaded, setIdFileUploaded] = useState(false);
  const [bankFileUploaded, setBankFileUploaded] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-950">ส่งเอกสารยืนยันตัวตนเรียบร้อยแล้ว</h3>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            เจ้าหน้าที่จะตรวจสอบเอกสารของคุณภายใน 24 ชม. ในระหว่างนี้คุณสามารถเข้าสู่แดชบอร์ดและเริ่มเตรียมประกาศบริการได้เลย
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/provider/dashboard")}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-950 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>ไปที่แดชบอร์ดผู้รับจ้าง</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. ข้อมูลส่วนตัว */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-zinc-950">1. ข้อมูลส่วนตัว</h3>
          <p className="text-xs text-zinc-500 mt-1">ใช้ชื่อและข้อมูลของเจ้าของบัญชีในการยืนยันตัวตน</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              ชื่อ-นามสกุลตามบัตรประชาชน
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              เลขบัตรประจำตัวประชาชน 13 หลัก
            </label>
            <input
              type="text"
              maxLength={13}
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-wider"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">กรอกเฉพาะตัวเลข โดยไม่ต้องเว้นวรรคหรือใส่ขีด</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              ความเชี่ยวชาญ / หมวดหมู่บริการหลัก
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="cleaning">ทำความสะอาด (แม่บ้าน, คอนโด, ดูดไรฝุ่น)</option>
              <option value="electrician">ช่างซ่อมบำรุง / ช่างไฟฟ้า-ประปา</option>
              <option value="gardening">ดูแลและจัดสวน / ตัดแต่งกิ่งไม้</option>
              <option value="aircon">ล้างและซ่อมแอร์</option>
              <option value="other">บริการอื่น ๆ</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">
              เช่น ทำความสะอาด ช่างซ่อมบำรุง จัดสวน หรือบริการอื่น ๆ
            </p>
          </div>
        </div>
      </div>

      {/* 2. อัปโหลดเอกสาร */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-zinc-950">2. อัปโหลดเอกสาร</h3>
          <p className="text-xs text-zinc-500 mt-1">
            ใช้ภาพที่ชัดเจน เห็นข้อมูลครบทุกมุม และเป็นเอกสารของเจ้าของบัญชีเท่านั้น
          </p>
        </div>

        <div className="space-y-4">
          {/* Upload ID Card */}
          <div
            onClick={() => setIdFileUploaded(!idFileUploaded)}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              idFileUploaded
                ? "border-emerald-500 bg-emerald-50/40"
                : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
            }`}
          >
            {idFileUploaded ? (
              <div className="space-y-2">
                <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-700">แนบไฟล์รูปบัตรประชาชนแล้ว: id_card_front.jpg</p>
                <p className="text-[11px] text-zinc-500">คลิกอีกครั้งหากต้องการเปลี่ยนไฟล์</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800">อัปโหลดรูปถ่ายบัตรประชาชน</h4>
                <p className="text-xs text-zinc-500">เห็นชื่อ-นามสกุล เลขบัตร และวันหมดอายุชัดเจน</p>
                <p className="text-xs text-zinc-400">ลากไฟล์มาวางที่นี่ หรือเลือกไฟล์จากอุปกรณ์</p>
                <span className="inline-block mt-2 px-4 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50">
                  เลือกไฟล์
                </span>
                <p className="text-[10px] text-zinc-400 pt-1">JPG, PNG หรือ PDF • ขนาดไม่เกิน 10 MB ต่อไฟล์</p>
              </div>
            )}
          </div>

          {/* Upload Bank Book */}
          <div
            onClick={() => setBankFileUploaded(!bankFileUploaded)}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              bankFileUploaded
                ? "border-emerald-500 bg-emerald-50/40"
                : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
            }`}
          >
            {bankFileUploaded ? (
              <div className="space-y-2">
                <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-700">แนบไฟล์รูปหน้าสมุดบัญชีแล้ว: bank_book.jpg</p>
                <p className="text-[11px] text-zinc-500">คลิกอีกครั้งหากต้องการเปลี่ยนไฟล์</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800">อัปโหลดรูปถ่ายหน้าสมุดบัญชีธนาคาร (สำหรับรับเงินโอน)</h4>
                <p className="text-xs text-zinc-500">ชื่อบัญชีต้องตรงกับชื่อ-นามสกุลบนบัตรประชาชน</p>
                <p className="text-xs text-zinc-400">ลากไฟล์มาวางที่นี่ หรือเลือกไฟล์จากอุปกรณ์</p>
                <span className="inline-block mt-2 px-4 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50">
                  เลือกไฟล์
                </span>
                <p className="text-[10px] text-zinc-400 pt-1">JPG, PNG หรือ PDF • ขนาดไม่เกิน 10 MB ต่อไฟล์</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600">
            เอกสารใช้สำหรับยืนยันตัวตนและบัญชีรับเงินเท่านั้น ไม่แสดงบนโปรไฟล์สาธารณะ
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50"
        >
          {isSubmitting ? "กำลังส่งเอกสาร..." : "ส่งเอกสารยืนยันตัวตน"}
        </button>

        <p className="text-center text-[11px] text-zinc-400">
          ตรวจสอบข้อมูลและแนบเอกสารทั้ง 2 รายการให้ครบก่อนส่ง
        </p>
      </div>
    </form>
  );
}

