"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function ServiceFormImages() {
  const [images, setImages] = useState<{ [key: string]: boolean }>({
    cover: true,
    work2: false,
    work3: false,
  });

  const toggleSlot = (key: string) => {
    setImages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const slots = [
    { key: "cover", label: "ภาพปกประกาศ", isPrimary: true },
    { key: "work2", label: "ผลงาน 2", isPrimary: false },
    { key: "work3", label: "ผลงาน 3", isPrimary: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-zinc-950">3. อัปโหลดรูปภาพผลงานที่ผ่านมา</h3>
        <p className="text-xs text-zinc-500 mt-1">
          ลากและวางรูปภาพลงในช่อง หรือเลือกไฟล์จากอุปกรณ์ รูปแรกใช้เป็นภาพปกประกาศ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const isUploaded = images[slot.key];
          return (
            <div
              key={slot.key}
              onClick={() => toggleSlot(slot.key)}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                isUploaded
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
              }`}
            >
              {isUploaded ? (
                <div className="space-y-1.5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-zinc-900">{slot.label}</div>
                  <span className="inline-block text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
                    แนบรูปแล้ว
                  </span>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <ImageIcon className="w-6 h-6 text-zinc-400 mx-auto" />
                  <div className="text-xs font-bold text-zinc-800">{slot.label}</div>
                  <p className="text-[11px] text-zinc-400">วางรูปภาพที่นี่</p>
                  <span className="inline-block px-3 py-1 bg-white border border-zinc-300 rounded-lg text-[11px] font-semibold text-zinc-700 shadow-xs">
                    เลือกรูปภาพ
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-400">
        JPG หรือ PNG • ไม่เกิน 10 MB ต่อรูป • ใช้ผลงานจริงของคุณ
      </p>
    </div>
  );
}

