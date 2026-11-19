"use client";

import { useState, useRef } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, Upload, X } from "lucide-react";
import { BookingAction, BookingStatus } from "@/lib/booking";

interface WorkApprovalCardProps {
  providerName: string;
  amount: number;
  status: BookingStatus;
  viewerRole: "customer" | "provider";
  isSubmitting: boolean;
  error: string | null;
  notice: string | null;
  onAction: (action: BookingAction, note?: string, photoUrls?: string[]) => void;
}

export default function WorkApprovalCard({
  providerName,
  amount,
  status,
  viewerRole,
  isSubmitting,
  error,
  notice,
  onAction,
}: WorkApprovalCardProps) {
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = isSubmitting;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) return;
    const filesToRead = files.slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          const result = event.target.result;
          setPhotos((prev) => (prev.length < 5 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-zinc-900">จัดการสถานะงาน</h4>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
          รายการนี้ราคา ฿{amount.toLocaleString()} • การเปลี่ยนสถานะไม่ทำธุรกรรมหรือโอนเงินจริง
        </p>
      </div>

      {viewerRole === "customer" && status === "pending_payment" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction("confirm_payment")}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold"
        >
          บันทึกสถานะชำระเงิน (ทดสอบระบบ)
        </button>
      )}

      {viewerRole === "provider" && status === "paid" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction("start_work")}
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold"
        >
          เริ่มดำเนินงาน
        </button>
      )}

      {viewerRole === "provider" && status === "in_progress" && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-zinc-700">
            ข้อความส่งมอบงาน
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white p-3 font-normal"
              placeholder="สรุปงานที่ทำเสร็จแล้ว"
            />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700">
                รูปภาพหลักฐานส่งมอบงาน (ไม่เกิน 5 รูป)
              </label>
              <span className="text-[11px] text-zinc-500">{photos.length}/5 รูป</span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 group bg-zinc-100">
                    <img src={photo} alt={`หลักฐานที่ ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow"
                      title="ลบรูป"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 5 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="deliver-proof-upload"
                />
                <label
                  htmlFor="deliver-proof-upload"
                  className="w-full py-2.5 px-3 border-2 border-dashed border-zinc-300 hover:border-orange-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white/70 hover:bg-orange-50/50 transition-colors text-xs text-zinc-600 hover:text-orange-600 font-medium"
                >
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>อัปโหลดไฟล์รูปภาพหลักฐาน</span>
                </label>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={disabled || !note.trim() || photos.length > 5}
            onClick={() => onAction("deliver", note, photos)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold"
          >
            ส่งมอบงานให้ลูกค้าตรวจ
          </button>
        </div>
      )}

      {viewerRole === "customer" && status === "delivered" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-700">
            ตรวจสอบงานของ {providerName} แล้วเลือกยืนยันหรือส่งคำขอแก้ไข/ข้อพิพาท
          </p>
          <label className="block text-xs font-semibold text-zinc-700">
            รายละเอียด (ใช้เมื่อขอแก้ไขหรือแจ้งข้อพิพาท)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white p-3 font-normal"
              placeholder="อธิบายสิ่งที่ต้องการให้แก้ไขหรือปัญหาที่พบ"
            />
          </label>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("approve")}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            ยืนยันตรวจรับงาน
          </button>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-1 text-xs">
            <button
              type="button"
              disabled={disabled || !note.trim()}
              onClick={() => onAction("request_revision", note)}
              className="text-zinc-600 hover:text-zinc-900 disabled:opacity-50 font-medium flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ส่งคำขอแก้ไขงาน
            </button>
            <button
              type="button"
              disabled={disabled || !note.trim()}
              onClick={() => onAction("dispute", note)}
              className="text-rose-600 hover:text-rose-700 disabled:opacity-50 font-medium flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              แจ้งข้อพิพาท
            </button>
          </div>
        </div>
      )}

      {viewerRole === "customer" && status === "paid" && (
        <p className="text-xs text-zinc-600">รอผู้ให้บริการเริ่มดำเนินงาน</p>
      )}
      {viewerRole === "customer" && status === "in_progress" && (
        <p className="text-xs text-zinc-600">ผู้ให้บริการกำลังดำเนินงาน</p>
      )}
      {viewerRole === "provider" && status === "delivered" && (
        <p className="text-xs text-zinc-600">ส่งมอบงานแล้ว กำลังรอลูกค้าตรวจรับ</p>
      )}
      {status === "completed" && (
        <p className="text-xs font-semibold text-emerald-700">ลูกค้าตรวจรับงานแล้ว</p>
      )}
      {status === "disputed" && (
        <p className="text-xs font-semibold text-rose-700">ข้อพิพาทนี้ถูกบันทึกแล้ว</p>
      )}

      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      {notice && <p role="status" className="text-xs text-emerald-700">{notice}</p>}
      {isSubmitting && (
        <p className="text-xs text-zinc-500">กำลังบันทึกสถานะ...</p>
      )}
    </div>
  );
}
