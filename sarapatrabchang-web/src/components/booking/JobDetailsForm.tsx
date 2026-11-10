"use client";

import { UploadCloud, CheckCircle2, Lock } from "lucide-react";

interface JobDetailsFormProps {
  jobNote: string;
  setJobNote: (note: string) => void;
  contactName: string;
  setContactName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  addressDetail: string;
  setAddressDetail: (address: string) => void;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function JobDetailsForm({
  jobNote,
  setJobNote,
  contactName,
  setContactName,
  phone,
  setPhone,
  addressDetail,
  setAddressDetail,
  uploadedImages,
  setUploadedImages,
}: JobDetailsFormProps) {
  return (
    <div className="space-y-6">
      {/* Job Details Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-zinc-900">
            รายละเอียดงานเพิ่มเติม / หมายเหตุถึงช่าง
          </label>
          <span className="text-xs text-zinc-400">{jobNote.length} / 500</span>
        </div>
        <textarea
          rows={4}
          maxLength={500}
          value={jobNote}
          onChange={(e) => setJobNote(e.target.value)}
          placeholder="เช่น แอร์อยู่ชั้น 2 มีน้ำหยด หรือมีข้อควรทราบก่อนเข้าบริการ เช่น มีสัตว์เลี้ยง หรือจุดจอดรถ"
          className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-zinc-400"
        />

        {/* Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            อัปโหลดรูปภาพบริเวณที่ต้องการให้ทำงาน (ถ้ามี)
          </label>
          <label className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all text-center group">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const names = Array.from(e.target.files).map((f) => f.name);
                  setUploadedImages((prev) => [...prev, ...names].slice(0, 5));
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 transition-colors mb-2" />
            <span className="text-xs font-semibold text-zinc-700">
              คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">
              JPG, PNG สูงสุด 5 รูป • ไม่เกิน 10 MB ต่อรูป
            </span>
          </label>

          {uploadedImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedImages.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200/60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Information & Address */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900">
          ข้อมูลติดต่อและที่อยู่
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              ชื่อผู้ติดต่อ
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            ที่อยู่โดยละเอียด (บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล)
          </label>
          <textarea
            rows={3}
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>ข้อมูลนี้ใช้สำหรับติดต่อและเข้ารับบริการตามการจองเท่านั้น</span>
        </div>
      </div>
    </div>
  );
}

