"use client";

import { Image as ImageIcon, MessageSquare } from "lucide-react";

interface DeliveryProofGalleryProps {
  providerName: string;
  providerMessage: string;
  deliveredAt: string | null;
  photos: string[];
}

export default function DeliveryProofGallery({
  providerName,
  providerMessage,
  deliveredAt,
  photos,
}: DeliveryProofGalleryProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900">หลักฐานการส่งมอบงาน</h3>
        <span className="text-xs text-zinc-400">รูปภาพ {photos.length} ไฟล์</span>
      </div>

      {deliveredAt ? (
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1.5 text-xs">
          <span className="font-bold text-zinc-900 block">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
            ข้อความจาก{providerName}
          </span>
          <p className="text-zinc-600 leading-relaxed">{providerMessage}</p>
          <p className="text-[11px] text-zinc-400 pt-1">
            ส่งมอบเมื่อ {new Date(deliveredAt).toLocaleString("th-TH")}
          </p>
        </div>
      ) : (
        <p className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 text-xs text-zinc-500">
          ผู้ให้บริการยังไม่ได้ส่งมอบงาน
        </p>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photoUrl, index) => (
            <a
              key={photoUrl}
              href={photoUrl}
              target="_blank"
              rel="noreferrer"
              className="space-y-1.5"
            >
              <div className="h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                <img
                  src={photoUrl}
                  alt={`หลักฐานส่งมอบงาน ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-orange-600 text-center inline-flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                เปิดรูปภาพ {index + 1}
              </p>
            </a>
          ))}
        </div>
      ) : deliveredAt ? (
        <p className="text-xs text-zinc-400">ไม่มีรูปภาพแนบมา</p>
      ) : null}
    </div>
  );
}
