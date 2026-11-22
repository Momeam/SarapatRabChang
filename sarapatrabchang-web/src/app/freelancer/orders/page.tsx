"use client";

import { useState, useRef, useEffect } from "react";
import { requestApi } from "@/lib/api";
import { Booking, bookingStatusLabels } from "@/lib/booking";

interface BookingChatMessage {
  id: string;
  body: string;
  senderRole: "customer" | "provider";
  senderName: string;
  createdAt: string;
}

export default function FreelancerOrdersPage() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<BookingChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [tabFilter, setTabFilter] = useState<"active" | "completed">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delivery modal state
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliverNote, setDeliverNote] = useState("");
  const [deliverPhotos, setDeliverPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    requestApi<Booking[]>("/api/bookings")
      .then((res) => {
        if (!active) return;
        const providerOrders = res.filter((b) => b.viewerRole === "provider");
        setOrders(providerOrders);
        if (providerOrders.length > 0) {
          setSelectedOrderId(providerOrders[0].id);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    let active = true;
    requestApi<BookingChatMessage[]>(
      `/api/bookings/${encodeURIComponent(selectedOrderId)}/messages`
    )
      .then((msgs) => {
        if (active) setChatMessages(msgs);
      })
      .catch(() => {
        if (active) setChatMessages([]);
      });
    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const visibleOrders = tabFilter === "active" ? activeOrders : completedOrders;
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedOrderId) return;
    setIsSending(true);
    try {
      const saved = await requestApi<BookingChatMessage>(
        `/api/bookings/${encodeURIComponent(selectedOrderId)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: inputText.trim() }),
        }
      );
      setChatMessages((prev) => [...prev, saved]);
      setInputText("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartWork = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await requestApi<Booking>(
        `/api/bookings/${encodeURIComponent(selectedOrder.id)}/actions`,
        {
          method: "POST",
          body: JSON.stringify({ action: "start_work" }),
        }
      );
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "เริ่มงานไม่สำเร็จ");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - deliverPhotos.length;
    files.slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          const url = ev.target.result;
          setDeliverPhotos((prev) => (prev.length < 5 ? [...prev, url] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeliverWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !deliverNote.trim()) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await requestApi<Booking>(
        `/api/bookings/${encodeURIComponent(selectedOrder.id)}/actions`,
        {
          method: "POST",
          body: JSON.stringify({
            action: "deliver",
            note: deliverNote.trim(),
            photoUrls: deliverPhotos,
          }),
        }
      );
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setShowDeliverModal(false);
      setDeliverNote("");
      setDeliverPhotos([]);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "ส่งมอบงานไม่สำเร็จ");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden text-white">
      {/* Left Panel: Order List */}
      <div className="w-1/3 border-r border-gray-800 bg-[#171717] flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800 bg-black/40">
          <h2 className="text-lg font-bold text-white mb-2">ออเดอร์ที่ได้รับ</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTabFilter("active")}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                tabFilter === "active"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-transparent text-gray-400 border-transparent hover:text-white"
              }`}
            >
              กำลังดำเนินการ ({activeOrders.length})
            </button>
            <button
              onClick={() => setTabFilter("completed")}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                tabFilter === "completed"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-transparent text-gray-400 border-transparent hover:text-white"
              }`}
            >
              เสร็จสิ้น ({completedOrders.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <p className="p-6 text-center text-xs text-gray-500">กำลังโหลดรายการงาน...</p>
          ) : visibleOrders.length === 0 ? (
            <p className="p-6 text-center text-xs text-gray-500">ไม่มีรายการงานในหมวดนี้</p>
          ) : (
            visibleOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`p-4 border-b border-gray-800 transition cursor-pointer ${
                  selectedOrderId === order.id
                    ? "bg-gray-800 border-l-4 border-[#f97316]"
                    : "bg-transparent border-l-4 border-transparent hover:bg-gray-800/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-white text-sm">{order.contactName}</h3>
                  <span className="text-[10px] text-gray-500">{order.date.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mb-2">{order.serviceTitle}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-yellow-500">
                    {bookingStatusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Workspace & Chat */}
      {selectedOrder ? (
        <div className="w-2/3 bg-[#0a0a0a] flex flex-col relative">
          <div className="p-4 border-b border-gray-800 bg-[#171717] flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-white text-lg flex items-center">
                {selectedOrder.contactName}
                <span className="ml-3 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded text-xs font-normal">
                  {bookingStatusLabels[selectedOrder.status]}
                </span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {selectedOrder.serviceTitle} ({selectedOrder.packageTitle})
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                ฿ {selectedOrder.price.toLocaleString("th-TH")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                นัดหมาย: {selectedOrder.date.slice(0, 10)} ({selectedOrder.timeSlot})
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-500 text-xs py-12">
                ยังไม่มีข้อความสนทนา เริ่มต้นพูดคุยกับผู้ว่าจ้างได้เลย
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id}>
                  {msg.senderRole === "customer" ? (
                    <div className="flex justify-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 mb-1 ml-1">
                          {msg.senderName} • {new Date(msg.createdAt).toLocaleString("th-TH")}
                        </span>
                        <div className="bg-gray-800 text-gray-200 p-3 rounded-xl rounded-tl-sm max-w-md text-sm border border-gray-700">
                          {msg.body}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 mb-1 mr-1">
                          คุณ ({msg.senderName}) • {new Date(msg.createdAt).toLocaleString("th-TH")}
                        </span>
                        <div className="bg-[#f97316]/20 border border-[#f97316]/40 text-gray-200 p-3 rounded-xl rounded-tr-sm max-w-md text-sm">
                          {msg.body}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#171717] shrink-0">
            <div className="flex space-x-3 mb-3 pb-3 border-b border-gray-800 overflow-x-auto items-center">
              {selectedOrder.status === "paid" && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleStartWork}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition font-semibold"
                >
                  รับงานและเริ่มดำเนินงาน
                </button>
              )}
              {selectedOrder.status === "in_progress" && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowDeliverModal(true)}
                  className="text-xs bg-[#f97316] hover:bg-opacity-90 text-white px-4 py-1.5 rounded-lg transition flex items-center font-semibold shadow-lg shadow-[#f97316]/20"
                >
                  <i className="fa-solid fa-box-open mr-1.5"></i> ส่งมอบงานให้ลูกค้าตรวจรับ
                </button>
              )}
              <span className="text-xs text-gray-400">
                สถานที่: {selectedOrder.address}
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                placeholder="พิมพ์ข้อความตอบกลับผู้ว่าจ้าง..."
                className="flex-1 bg-black border border-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:border-[#f97316] text-sm"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="bg-[#f97316] disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center ml-3 hover:bg-opacity-90 transition"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-2/3 bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-12">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
            <i className="fa-regular fa-comments text-4xl text-gray-600"></i>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">เลือกออเดอร์เพื่อเปิดห้องทำงาน</h3>
          <p className="text-sm text-gray-500 max-w-md">
            คลิกเลือกออเดอร์จากเมนูด้านซ้ายเพื่อพูดคุยกับผู้ว่าจ้างและส่งมอบงานจริง
          </p>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliverModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleDeliverWork}
            className="bg-[#171717] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-base font-bold text-white">ส่งมอบงานให้ผู้ว่าจ้างตรวจรับ</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">ข้อความสรุปงานที่ทำเสร็จแล้ว</label>
              <textarea
                rows={3}
                value={deliverNote}
                onChange={(e) => setDeliverNote(e.target.value)}
                required
                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#f97316]"
                placeholder="ระบุรายละเอียดงานที่ดำเนินการเสร็จเรียบร้อย..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                อัปโหลดไฟล์รูปภาพหลักฐาน ({deliverPhotos.length}/5 รูป)
              </label>
              {deliverPhotos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {deliverPhotos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDeliverPhotos((p) => p.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 text-white rounded-full text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {deliverPhotos.length < 5 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 border border-dashed border-gray-600 hover:border-[#f97316] rounded-xl text-xs text-gray-300"
                  >
                    + เลือกไฟล์รูปภาพหลักฐาน
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-xs text-gray-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isUpdatingStatus || !deliverNote.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white disabled:opacity-50"
              >
                {isUpdatingStatus ? "กำลังส่งมอบ..." : "ยืนยันส่งมอบงาน"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
