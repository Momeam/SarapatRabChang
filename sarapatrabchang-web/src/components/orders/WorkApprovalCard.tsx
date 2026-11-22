"use client";

import { useState, useRef } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, Upload, X, Scale, ShieldAlert } from "lucide-react";
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

const DISPUTE_REASONS = [
  "ผู้ให้บริการไม่มาตามเวลานัดหมาย / ไม่สามารถติดต่อได้",
  "งานไม่เสร็จสมบูรณ์ / คุณภาพงานไม่ตรงตามที่ตกลงกัน",
  "เกิดความเสียหายต่อทรัพย์สินหรือสถานที่",
  "ผู้ให้บริการปฏิเสธที่จะแก้ไขงานตามเงื่อนไข",
  "อื่นๆ (โปรดระบุรายละเอียดด้านล่าง)",
];

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
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedDisputeCategory, setSelectedDisputeCategory] = useState(DISPUTE_REASONS[0]);
  const [disputeDetail, setDisputeDetail] = useState("");
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionDetail, setRevisionDetail] = useState("");
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

  const handleOpenDispute = () => {
    setSelectedDisputeCategory(DISPUTE_REASONS[0]);
    setDisputeDetail(note.trim());
    setIsDisputeModalOpen(true);
  };

  const handleConfirmDispute = () => {
    const reasonText = disputeDetail.trim()
      ? `[${selectedDisputeCategory}] ${disputeDetail.trim()}`
      : selectedDisputeCategory;
    onAction("dispute", reasonText);
    setIsDisputeModalOpen(false);
  };

  const handleRequestRevision = () => {
    if (note.trim()) {
      onAction("request_revision", note.trim());
      return;
    }
    setRevisionDetail("");
    setIsRevisionModalOpen(true);
  };

  const handleConfirmRevision = () => {
    const text = revisionDetail.trim() || "ขอให้ตรวจสอบและแก้ไขงานเพิ่มเติมตามขอบเขตที่ตกลงไว้";
    onAction("request_revision", text);
    setIsRevisionModalOpen(false);
  };

  const canDeliver = Boolean((note.trim() || photos.length > 0) && photos.length <= 5);

  return (
    <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-zinc-900">จัดการสถานะงาน</h4>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
          รายการนี้ราคา ฿{amount.toLocaleString("th-TH")} • การเปลี่ยนสถานะไม่ทำธุรกรรมหรือโอนเงินจริง
        </p>
      </div>

      {viewerRole === "customer" && status === "pending_payment" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction("confirm_payment")}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
        >
          บันทึกสถานะชำระเงิน (ทดสอบระบบ)
        </button>
      )}

      {viewerRole === "provider" && status === "paid" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction("start_work")}
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
        >
          เริ่มดำเนินงาน
        </button>
      )}

      {viewerRole === "provider" && status === "in_progress" && (
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-500">
            สามารถพิมพ์สรุปงาน หรือแนบรูปภาพหลักฐานอย่างใดอย่างหนึ่ง (หรือทั้งสองอย่าง) เพื่อส่งมอบงานได้ทันที
          </p>
          <label className="block text-xs font-semibold text-zinc-700">
            ข้อความส่งมอบงาน (ระบุข้อความ หรือแนบรูปด้านล่าง)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white p-3 font-normal"
              placeholder="สรุปงานที่ทำเสร็จแล้ว (หรือแนบรูปภาพด้านล่าง)"
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
            disabled={disabled || !canDeliver}
            onClick={() =>
              onAction("deliver", note.trim() || "ส่งมอบงานพร้อมรูปภาพหลักฐาน", photos)
            }
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
          >
            ส่งมอบงานให้ลูกค้าตรวจ
          </button>
        </div>
      )}

      {viewerRole === "customer" && status === "delivered" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-700 leading-relaxed">
            ผู้ให้บริการ <span className="font-semibold text-zinc-900">{providerName}</span> ได้ส่งมอบงานแล้ว กรุณาตรวจสอบผลงานก่อนกดยืนยัน หากมีส่วนที่ต้องแก้ไขสามารถส่งคำขอแก้ไข หรือหากมีข้อพิพาทสามารถแจ้งเรื่องให้แอดมินกลางตรวจสอบได้
          </p>

          <label className="block text-xs font-semibold text-zinc-700">
            รายละเอียด (ใช้เมื่อขอแก้ไขหรือแจ้งข้อพิพาท)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white p-3 font-normal text-xs"
              placeholder="อธิบายสิ่งที่ต้องการให้แก้ไขหรือปัญหาที่พบ..."
            />
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("approve")}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            ยืนยันตรวจรับงาน
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              disabled={disabled}
              onClick={handleRequestRevision}
              className="py-2.5 px-3 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              ส่งคำขอแก้ไขงาน
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleOpenDispute}
              className="py-2.5 px-3 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              แจ้งข้อพิพาท
            </button>
          </div>
        </div>
      )}

      {viewerRole === "customer" && (status === "paid" || status === "in_progress") && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-zinc-600">
            {status === "paid"
              ? "ชำระเงินเรียบร้อยแล้ว กำลังรอผู้ให้บริการเริ่มดำเนินงาน"
              : "ผู้ให้บริการกำลังดำเนินงานตามนัดหมาย"}
          </p>
          <div className="border-t border-zinc-200/80 pt-3">
            <button
              type="button"
              disabled={disabled}
              onClick={handleOpenDispute}
              className="w-full py-2 px-3 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              พบปัญหา / ผู้ให้บริการไม่มาตามนัด? แจ้งข้อพิพาทให้แอดมิน
            </button>
          </div>
        </div>
      )}

      {viewerRole === "provider" && status === "delivered" && (
        <p className="text-xs text-zinc-600">ส่งมอบงานแล้ว กำลังรอลูกค้าตรวจรับ</p>
      )}

      {status === "completed" && (
        <div className="p-3.5 rounded-xl bg-emerald-100/60 border border-emerald-300 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>ลูกค้าตรวจรับงานเรียบร้อยแล้ว การบริการเสร็จสมบูรณ์</span>
        </div>
      )}

      {status === "disputed" && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <Scale className="w-4 h-4 text-rose-600 shrink-0" />
            <span>เรื่องนี้อยู่ระหว่างการตรวจสอบข้อพิพาทโดยแอดมินกลาง</span>
          </div>
          <p className="text-zinc-600 leading-relaxed">
            ระบบได้รับคำร้องข้อพิพาทแล้ว ทีมงานแอดมินกลางกำลังตรวจสอบหลักฐาน รายละเอียดงาน และประวัติการสนทนาเพื่อพิจารณาข้อยุติที่เป็นธรรม
          </p>
        </div>
      )}

      {error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">{error}</p>}
      {notice && <p role="status" className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">{notice}</p>}
      {isSubmitting && (
        <p className="text-xs text-zinc-500">กำลังบันทึกสถานะ...</p>
      )}

      {/* Request Revision Modal */}
      {isRevisionModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRevisionModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">ส่งคำขอแก้ไขงาน</h3>
                  <p className="text-[11px] text-zinc-500">ระบุรายละเอียดสิ่งที่ต้องการให้ผู้ให้บริการปรับแก้</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1.5">
                  รายละเอียดสิ่งที่ต้องการให้แก้ไข:
                </label>
                <textarea
                  value={revisionDetail}
                  onChange={(e) => setRevisionDetail(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  autoFocus
                  placeholder="อธิบายจุดที่ยังไม่เรียบร้อยหรือสิ่งที่ต้องการให้ช่างแก้ไขเพิ่มเติม..."
                  className="w-full p-3 border border-zinc-300 rounded-xl bg-white text-zinc-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-xl text-zinc-700 font-semibold hover:bg-zinc-100 transition text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirmRevision}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                ยืนยันส่งคำขอแก้ไขงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDisputeModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">แจ้งข้อพิพาทให้แอดมินกลาง</h3>
                  <p className="text-[11px] text-zinc-500">ส่งเรื่องเพื่อให้แอดมินเข้าตรวจสอบและระงับข้อพิพาท</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1.5">
                  เลือกหัวข้อปัญหา / สาเหตุข้อพิพาท:
                </label>
                <select
                  value={selectedDisputeCategory}
                  onChange={(e) => setSelectedDisputeCategory(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-xl bg-white text-zinc-800 focus:outline-none focus:border-rose-500"
                >
                  {DISPUTE_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1.5">
                  รายละเอียดเหตุผลและปัญหาที่พบ:
                </label>
                <textarea
                  value={disputeDetail}
                  onChange={(e) => setDisputeDetail(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="อธิบายสิ่งที่เกิดขึ้น เช่น นัดหมายเวลาใด ช่างไม่มา หรือผลงานเสียหายอย่างไร..."
                  className="w-full p-3 border border-zinc-300 rounded-xl bg-white text-zinc-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <span className="font-bold">หมายเหตุ:</span> เมื่อส่งข้อพิพาทแล้ว สถานะของงานจะเปลี่ยนเป็น &ldquo;อยู่ระหว่างตรวจสอบข้อพิพาท&rdquo; และเรื่องจะถูกส่งไปยังหน้ากระดานแอดมินทันที
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-xl text-zinc-700 font-semibold hover:bg-zinc-100 transition text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirmDispute}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                ยืนยันส่งข้อพิพาทให้แอดมิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
