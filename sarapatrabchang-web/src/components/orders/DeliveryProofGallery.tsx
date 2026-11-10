"use client";

import { Check } from "lucide-react";

interface DeliveryProofGalleryProps {
  providerName: string;
  providerMessage: string;
  deliveredAt: string;
  photos: { src: string; alt: string; label: string; filename: string }[];
  checklist: string[];
}

export default function DeliveryProofGallery({
  providerName,
  providerMessage,
  deliveredAt,
  photos,
  checklist,
}: DeliveryProofGalleryProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">ตรวจสอบผลงานที่ส่งมอบ</h3>
        <span className="text-xs text-zinc-400">รูปภาพ {photos.length} ไฟล์</span>
      </div>

      {/* Provider message */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1.5 text-xs">
        <span className="font-bold text-zinc-900 block">ข้อความจาก{providerName}</span>
        <p className="text-zinc-600 leading-relaxed">"{providerMessage}"</p>
        <p className="text-[11px] text-zinc-400 pt-1">ส่งมอบเมื่อ {deliveredAt}</p>
      </div>

      {/* Photos grid */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.label} className="space-y-1.5">
            <div className="h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] font-medium text-zinc-700 text-center">{photo.label}</p>
            <p className="text-[10px] text-orange-600 text-center hover:underline cursor-pointer">
              {photo.filename} • ดูไฟล์
            </p>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="pt-4 border-t border-zinc-100 space-y-2.5">
        <h4 className="text-xs font-bold text-zinc-900">รายการงานตามข้อตกลง</h4>
        <ul className="space-y-2 text-xs text-zinc-600">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

