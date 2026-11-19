"use client";

import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

interface ServiceFormImagesProps {
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  portfolioUrls: string[];
  setPortfolioUrls: (urls: string[]) => void;
}

export default function ServiceFormImages({
  coverImageUrl,
  setCoverImageUrl,
  portfolioUrls,
  setPortfolioUrls,
}: ServiceFormImagesProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFileChange = (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSuccess(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-zinc-950">3. รูปภาพบริการ</h3>
        <p className="text-xs text-zinc-500 mt-1">
          เลือกอัปโหลดไฟล์รูปภาพจากอุปกรณ์ของคุณ (JPG, PNG หรือ WebP)
        </p>
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-800">
            ภาพปกบริการ (Cover Image) <span className="text-red-500">*</span>
          </span>
          {coverImageUrl && (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> เลือกภาพปกแล้ว
            </span>
          )}
        </div>

        {coverImageUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 group aspect-video max-h-56 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt="ภาพปกบริการ"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-100 shadow transition"
              >
                เปลี่ยนรูปภาพ
              </button>
              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow transition"
                title="ลบรูปภาพ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => coverInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/50 hover:bg-orange-50/20 transition-all group"
          >
            <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-bold text-zinc-700">คลิกเพื่อเลือกไฟล์รูปภาพหน้าปก</p>
            <p className="text-[11px] text-zinc-400 mt-1">รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5 MB</p>
          </div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0], setCoverImageUrl)}
        />
      </div>

      {/* Portfolio Images Upload */}
      <div className="space-y-3 pt-2 border-t border-zinc-100">
        <span className="text-xs font-semibold text-zinc-800 block">
          รูปภาพผลงานตัวอย่าง (เลือกได้สูงสุด 3 รูป)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {portfolioUrls.map((url, index) => (
            <div key={index} className="space-y-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">ผลงานชิ้นที่ {index + 1}</span>

              {url ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group aspect-4/3 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`ผลงาน ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => portfolioInputRefs[index].current?.click()}
                      className="px-2.5 py-1 bg-white text-zinc-900 rounded-md text-[11px] font-semibold hover:bg-zinc-100 shadow transition"
                    >
                      เปลี่ยน
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...portfolioUrls];
                        next[index] = "";
                        setPortfolioUrls(next);
                      }}
                      className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 shadow transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => portfolioInputRefs[index].current?.click()}
                  className="border border-dashed border-zinc-300 hover:border-orange-500 rounded-xl p-4 text-center cursor-pointer bg-zinc-50/50 hover:bg-orange-50/10 transition-all aspect-4/3 flex flex-col items-center justify-center group"
                >
                  <ImageIcon className="w-6 h-6 text-zinc-300 group-hover:text-orange-500 mb-1 transition-colors" />
                  <span className="text-[11px] font-semibold text-zinc-600">แนบไฟล์ผลงาน</span>
                </div>
              )}

              <input
                ref={portfolioInputRefs[index]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e.target.files?.[0], (dataUrl) => {
                    const next = [...portfolioUrls];
                    next[index] = dataUrl;
                    setPortfolioUrls(next);
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
