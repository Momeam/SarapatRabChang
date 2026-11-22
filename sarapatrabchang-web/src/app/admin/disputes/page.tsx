"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Scale,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Wallet,
  Image as ImageIcon,
} from "lucide-react";
import { requestApi } from "@/lib/api";

interface DisputeMessage {
  id: string;
  body: string;
  senderRole: "customer" | "provider";
  senderName: string;
  createdAt: string;
}

interface AdminDisputeItem {
  id: string;
  bookingId: string;
  reason: string;
  status: string;
  resolutionNote: string;
  createdAt: string;
  resolvedAt: string | null;
  packageTitle: string;
  amount: number;
  bookingStatus: string;
  deliveryNote: string;
  deliveryPhotoUrls: string[];
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  messages: DisputeMessage[];
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDisputeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestApi<AdminDisputeItem[]>("/api/admin/disputes");
      setDisputes(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev || data[0].id);
      }
    } catch (err) {
      setAlertMsg({
        message: err instanceof Error ? err.message : "โหลดข้อมูลข้อพิพาทไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestApi<AdminDisputeItem[]>("/api/admin/disputes")
      .then((data) => {
        if (!active) return;
        setDisputes(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setAdminNote(data[0].resolutionNote || "");
        }
      })
      .catch((err) => {
        if (active) {
          setAlertMsg({
            message: err instanceof Error ? err.message : "โหลดข้อมูลข้อพิพาทไม่สำเร็จ",
            type: "error",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentDispute = disputes.find((d) => d.id === selectedId) ?? disputes[0] ?? null;
  const isResolved = currentDispute
    ? currentDispute.status.startsWith("resolved") && currentDispute.bookingStatus !== "disputed"
    : false;

  const handleSelectDispute = (item: AdminDisputeItem) => {
    setSelectedId(item.id);
    setAdminNote(item.resolutionNote || "");
    setAlertMsg(null);
  };

  const handleDecision = async (winner: "CLIENT" | "FREELANCER") => {
    if (!currentDispute) return;
    if (!adminNote.trim()) {
      setAlertMsg({ message: "กรุณาพิมพ์บันทึกคำตัดสิน (เหตุผล) ของ Admin ก่อนทำการตัดสิน", type: "error" });
      return;
    }

    const winnerLabel =
      winner === "CLIENT"
        ? `ผู้ว่าจ้าง (${currentDispute.clientName})`
        : `ผู้ให้บริการ (${currentDispute.freelancerName})`;
    if (
      !window.confirm(
        `ยืนยันคำตัดสินให้ ${winnerLabel} สำหรับงาน "${currentDispute.serviceTitle}" (฿${currentDispute.amount.toLocaleString()}) ใช่หรือไม่?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setAlertMsg(null);
    try {
      const updated = await requestApi<{
        id: string;
        status: string;
        bookingStatus: string;
        resolutionNote: string;
      }>(`/api/admin/disputes/${encodeURIComponent(currentDispute.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ winner, note: adminNote.trim() }),
      });

      setDisputes((prev) =>
        prev.map((item) =>
          item.id === currentDispute.id
            ? {
                ...item,
                status: updated.status,
                bookingStatus: updated.bookingStatus,
                resolutionNote: updated.resolutionNote,
              }
            : item
        )
      );
      setAlertMsg({
        message: `บันทึกคำตัดสินสำเร็จ! ระบบได้อัปเดตสถานะงานและส่งการแจ้งเตือนให้ทั้งสองฝ่ายเรียบร้อยแล้ว`,
        type: "success",
      });
    } catch (err) {
      setAlertMsg({
        message: err instanceof Error ? err.message : "บันทึกคำตัดสินไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ระบบพิจารณาข้อพิพาท (Dispute Resolution)</h1>
          <p className="text-gray-400 text-sm mt-1">
            ตรวจสอบประวัติการจ้างงาน ข้อความแชทจริง และหลักฐานการส่งมอบงานจากฐานข้อมูลก่อนตัดสินข้อพิพาท
          </p>
        </div>
        <button
          onClick={loadDisputes}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl text-zinc-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {alertMsg && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            alertMsg.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{alertMsg.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-[#171717] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f97316]" />
          กำลังโหลดรายการข้อพิพาท...
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-[#171717] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">ไม่มีข้อพิพาทในระบบ</h3>
          <p className="text-xs text-gray-500 mt-1">
            เมื่อผู้ว่าจ้างกดแจ้งข้อพิพาทในหน้าติดตามงาน รายการพร้อมประวัติแชทและหลักฐานจะปรากฏที่นี่โดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selector Pills if multiple disputes exist */}
          <div className="flex flex-wrap gap-2">
            {disputes.map((d) => {
              const active = d.id === currentDispute?.id;
              const resolved = d.status.startsWith("resolved") && d.bookingStatus !== "disputed";
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDispute(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                    active
                      ? "bg-[#f97316] text-white border-[#f97316]"
                      : "bg-[#171717] text-gray-300 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <span>#{d.bookingId.slice(0, 8).toUpperCase()}</span>
                  <span>• {d.serviceTitle}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      resolved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {resolved ? "ตัดสินแล้ว" : "รอตัดสิน"}
                  </span>
                </button>
              );
            })}
          </div>

          {currentDispute && (
            <div className="bg-[#171717] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-800 gap-3">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#f97316]" />
                  <span>
                    ข้อพิพาทงาน #{currentDispute.bookingId.slice(0, 8).toUpperCase()} • {currentDispute.serviceTitle}
                  </span>
                </h2>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400 text-xs">สถานะ:</span>
                  {isResolved ? (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ตัดสินแล้ว
                    </span>
                  ) : (
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> รอการตัดสินจากแอดมิน
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left: Real Chat Evidence */}
                <div className="lg:col-span-2 border border-gray-800 bg-black/40 rounded-xl p-5 flex flex-col h-[420px]">
                  <div className="flex items-center gap-2 mb-4 text-gray-200 font-semibold text-sm pb-3 border-b border-gray-800">
                    <MessageSquare className="w-4 h-4 text-[#f97316]" />
                    ประวัติการสนทนาในงานนี้ ({currentDispute.messages.length} ข้อความ)
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-2 custom-scrollbar">
                    {currentDispute.messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-12">ยังไม่มีประวัติข้อความสนทนาในรายการจองนี้</p>
                    ) : (
                      currentDispute.messages.map((msg) => {
                        const isProvider = msg.senderRole === "provider";
                        return (
                          <div key={msg.id} className={`flex flex-col ${isProvider ? "items-end" : "items-start"}`}>
                            <p className="text-[11px] text-gray-500 mb-1">
                              {isProvider ? "ผู้ให้บริการ" : "ผู้ว่าจ้าง"} ({msg.senderName}) •{" "}
                              {new Date(msg.createdAt).toLocaleString("th-TH")}
                            </p>
                            <div
                              className={`p-3 rounded-xl max-w-lg ${
                                isProvider
                                  ? "bg-[#f97316]/20 border border-[#f97316]/40 text-gray-100 rounded-tr-none"
                                  : "bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none"
                              }`}
                            >
                              {msg.body}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Case Details & Delivery Proof */}
                <div className="border border-gray-800 bg-black/40 rounded-xl p-5 flex flex-col justify-between space-y-5 text-xs">
                  <div className="space-y-4">
                    <div className="font-semibold text-sm text-gray-200 pb-3 border-b border-gray-800">
                      รายละเอียดคู่กรณี & หลักฐาน
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-400">คู่กรณี:</p>
                      <div className="p-3 rounded-lg bg-black/50 border border-gray-800 space-y-1.5">
                        <p className="text-gray-200">
                          <span className="text-blue-400 font-semibold">ผู้ว่าจ้าง:</span> {currentDispute.clientName} (
                          {currentDispute.clientEmail})
                        </p>
                        <p className="text-gray-200">
                          <span className="text-[#f97316] font-semibold">ฟรีแลนซ์:</span>{" "}
                          {currentDispute.freelancerName} ({currentDispute.freelancerEmail})
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/60 p-4 rounded-xl border border-gray-800 text-center">
                      <p className="text-xs text-gray-400">มูลค่างาน ({currentDispute.packageTitle})</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        ฿ {currentDispute.amount.toLocaleString("th-TH")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 mb-1">สาเหตุข้อพิพาทที่แจ้ง:</p>
                      <p className="text-red-300 font-medium bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
                        {currentDispute.reason}
                      </p>
                    </div>

                    {currentDispute.deliveryNote && (
                      <div>
                        <p className="text-gray-400 mb-1">ข้อความส่งมอบงานจากฟรีแลนซ์:</p>
                        <p className="text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-gray-800">
                          {currentDispute.deliveryNote}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-400 mb-2">
                        รูปหลักฐานส่งมอบงาน ({currentDispute.deliveryPhotoUrls?.length ?? 0} รูป)
                      </p>
                      {currentDispute.deliveryPhotoUrls && currentDispute.deliveryPhotoUrls.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {currentDispute.deliveryPhotoUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block h-16 rounded-lg overflow-hidden border border-gray-700 bg-zinc-900"
                            >
                              <img src={url} alt={`หลักฐาน ${idx + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" /> ไม่มีรูปภาพหลักฐานส่งมอบ
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Decision Box */}
              <div
                className={`border rounded-xl p-5 transition ${
                  isResolved ? "border-green-500/40 bg-green-950/10" : "border-[#f97316]/50 bg-[#f97316]/5"
                }`}
              >
                <label className="block mb-2 text-gray-200 font-semibold text-sm">
                  บันทึกคำตัดสินของ Admin:
                </label>

                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-black border border-gray-700 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#f97316] resize-none mb-4 disabled:opacity-50"
                  placeholder="พิมพ์เหตุผลหรือคำตัดสินข้อพิพาทที่นี่ (ข้อความนี้จะถูกบันทึกในระบบและส่งแจ้งเตือนไปยังทั้งสองฝ่าย)..."
                />

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleDecision("CLIENT")}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 border border-gray-600 text-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-800 hover:text-white transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    ตัดสินให้ผู้ว่าจ้าง (ส่งกลับแก้ไข / คืนสิทธิ์ผู้ว่าจ้าง)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision("FREELANCER")}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#f97316] text-white rounded-xl text-xs font-bold hover:bg-[#ea580c] transition flex items-center gap-2 shadow-lg shadow-[#f97316]/20 disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    ตัดสินให้ฟรีแลนซ์ชนะ (ปิดงานสมบูรณ์ & รับรายได้)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
