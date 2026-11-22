"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Send, MessageSquare, Briefcase } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import { requestApi } from "@/lib/api";
import { Booking, bookingStatusLabels } from "@/lib/booking";

interface BookingChatMessage {
  id: string;
  body: string;
  senderRole: "customer" | "provider";
  senderName: string;
  createdAt: string;
}

const EMPTY_MESSAGES: BookingChatMessage[] = [];

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBookingDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProviderMessagesContent() {
  const searchParams = useSearchParams();
  const queryBookingId = searchParams.get("bookingId");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messageLoad, setMessageLoad] = useState<{
    bookingId: string;
    messages: BookingChatMessage[];
    error?: string;
  } | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeBooking =
    bookings.find((booking) => booking.id === selectedBookingId) ?? bookings[0] ?? null;
  const activeBookingId = activeBooking?.id ?? "";
  const isLoadingMessages = Boolean(
    activeBookingId && messageLoad?.bookingId !== activeBookingId,
  );
  const messages =
    messageLoad?.bookingId === activeBookingId ? messageLoad.messages : EMPTY_MESSAGES;
  const messageLoadError =
    messageLoad?.bookingId === activeBookingId ? messageLoad.error : "";

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLocaleLowerCase("th-TH");
    return !query || [booking.contactName, booking.serviceTitle, booking.packageTitle]
      .some((value) => value.toLocaleLowerCase("th-TH").includes(query));
  });

  useEffect(() => {
    let active = true;
    requestApi<Booking[]>("/api/bookings")
      .then((result) => {
        if (!active) return;
        const providerBookings = result.filter((booking) => booking.viewerRole === "provider");
        setBookings(providerBookings);

        if (queryBookingId) {
          const match = providerBookings.find((b) => b.id === queryBookingId);
          if (match) {
            setSelectedBookingId(match.id);
            setIsMobileConversationOpen(true);
          } else if (providerBookings.length > 0) {
            setSelectedBookingId(providerBookings[0].id);
          }
        } else if (providerBookings.length > 0) {
          setSelectedBookingId((prev) => prev || providerBookings[0].id);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setBookingError(
            cause instanceof Error ? cause.message : "โหลดรายการแชทไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingBookings(false);
      });

    return () => {
      active = false;
    };
  }, [queryBookingId]);

  useEffect(() => {
    if (!activeBookingId) return;

    let active = true;
    requestApi<BookingChatMessage[]>(
      `/api/bookings/${encodeURIComponent(activeBookingId)}/messages`,
    )
      .then((result) => {
        if (active) {
          setMessageLoad({ bookingId: activeBookingId, messages: result });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setMessageLoad({
            bookingId: activeBookingId,
            messages: [],
            error: cause instanceof Error ? cause.message : "โหลดข้อความไม่สำเร็จ",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeBooking || isSending) return;

    setIsSending(true);
    setSendError("");
    try {
      const saved = await requestApi<BookingChatMessage>(
        `/api/bookings/${encodeURIComponent(activeBooking.id)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: body }),
        },
      );
      setMessageLoad((current) =>
        current?.bookingId === activeBooking.id
          ? { ...current, messages: [...current.messages, saved], error: undefined }
          : current,
      );
      setDraft("");
    } catch (cause: unknown) {
      setSendError(cause instanceof Error ? cause.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setIsSending(false);
    }
  }

  const isClosed = activeBooking?.status === "completed";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 min-h-0 p-3 sm:p-5">
        <div className="mx-auto flex h-[calc(100vh-6.5rem)] min-h-[550px] max-w-7xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Sidebar: Conversation List */}
          <aside
            className={`flex w-full shrink-0 flex-col border-r border-zinc-200 sm:w-[320px] lg:w-[380px] ${
              isMobileConversationOpen ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="border-b border-zinc-100 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-zinc-950">แชทกับผู้ว่าจ้าง</h1>
                    <p className="text-[11px] text-zinc-500">
                      {bookings.length} บทสนทนาจากลูกค้า
                    </p>
                  </div>
                </div>
                <Link
                  href="/provider/jobs"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Briefcase className="w-3.5 h-3.5" /> รายการงาน
                </Link>
              </div>

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อลูกค้า หรือบริการ..."
                  className="w-full rounded-xl border border-zinc-200 py-2 pl-8.5 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
              {isLoadingBookings ? (
                <div className="p-6 text-center text-xs text-zinc-400">กำลังโหลดบทสนทนา...</div>
              ) : bookingError ? (
                <div className="p-4 text-xs text-red-600 bg-red-50">{bookingError}</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-700">ยังไม่มีข้อความจากลูกค้า</p>
                  <p className="text-[11px] text-zinc-400">
                    เมื่อลูกค้ากดส่งข้อความสอบถามหรือสั่งจองบริการ จะปรากฏบทสนทนาที่นี่
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const isSelected = booking.id === activeBookingId;
                  const isPendingInquiry = booking.status === "pending_payment";

                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => {
                        setSelectedBookingId(booking.id);
                        setIsMobileConversationOpen(true);
                      }}
                      className={`w-full p-4 text-left transition-colors cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-orange-50/80 border-l-4 border-orange-500"
                          : "hover:bg-zinc-50/80 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                          {booking.contactName || "ผู้ว่าจ้าง"}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {formatBookingDate(booking.date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-600 truncate font-medium">
                          {booking.serviceTitle}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            isPendingInquiry
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : booking.status === "paid"
                                ? "bg-orange-100 text-orange-800"
                                : booking.status === "completed"
                                  ? "bg-zinc-100 text-zinc-600"
                                  : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isPendingInquiry ? "สอบถามก่อนจอง" : bookingStatusLabels[booking.status]}
                        </span>
                      </div>

                      <span className="text-[11px] text-zinc-400 truncate">
                        {booking.packageTitle} • ฿{booking.price.toLocaleString("th-TH")}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Main: Active Chat Window */}
          <section
            className={`flex flex-1 flex-col ${
              isMobileConversationOpen ? "flex" : "hidden sm:flex"
            }`}
          >
            {activeBooking ? (
              <>
                {/* Chat Header */}
                <header className="border-b border-zinc-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileConversationOpen(false)}
                      className="sm:hidden -ml-1 p-1 text-zinc-500 hover:text-zinc-900"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-orange-100">
                      {(activeBooking.contactName || "C").slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-zinc-950 truncate">
                          {activeBooking.contactName}
                        </h2>
                        {activeBooking.phone && (
                          <span className="text-[11px] text-zinc-400 hidden md:inline">
                            (โทร: {activeBooking.phone})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {activeBooking.serviceTitle} • นัดหมาย {formatBookingDate(activeBooking.date)}{" "}
                        {activeBooking.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/provider/jobs/${encodeURIComponent(activeBooking.id)}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-orange-300 bg-zinc-50 hover:bg-orange-50 text-xs font-semibold text-zinc-700 hover:text-orange-600 transition"
                    >
                      ดูงานนี้
                    </Link>
                  </div>
                </header>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/50">
                  {isLoadingMessages ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      กำลังโหลดข้อความ...
                    </div>
                  ) : messageLoadError ? (
                    <div className="p-4 text-xs text-red-600 bg-red-50 rounded-xl">
                      {messageLoadError}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 space-y-1">
                      <p className="text-xs font-semibold text-zinc-600">ยังไม่มีข้อความ</p>
                      <p className="text-[11px]">
                        พิมพ์ข้อความทักทายหรือตอบคำถามผู้ว่าจ้างได้เลย
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.senderRole === "provider";
                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-1 px-1">
                            <span>{message.senderName || (isMe ? "คุณ (ผู้รับจ้าง)" : "ผู้ว่าจ้าง")}</span>
                            <span>•</span>
                            <span>{formatMessageTime(message.createdAt)}</span>
                          </div>
                          <div
                            className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed shadow-xs ${
                              isMe
                                ? "bg-orange-500 text-white rounded-tr-none"
                                : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-none"
                            }`}
                          >
                            {message.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Footer */}
                <footer className="border-t border-zinc-200 p-3 sm:p-4 bg-white">
                  {sendError && (
                    <p className="text-xs text-red-600 mb-2 px-1">{sendError}</p>
                  )}
                  {isClosed ? (
                    <div className="text-center py-2 text-xs text-zinc-500 bg-zinc-50 rounded-xl border border-zinc-200">
                      งานนี้เสร็จสมบูรณ์แล้ว การสนทนาถูกปิดเรียบร้อยแล้ว
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="พิมพ์ข้อความตอบกลับผู้ว่าจ้าง..."
                        disabled={isSending}
                        className="flex-1 rounded-xl border border-zinc-200 py-2.5 px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !draft.trim()}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">ส่ง</span>
                      </button>
                    </form>
                  )}
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                <MessageSquare className="w-12 h-12 text-zinc-300 mb-3" />
                <p className="text-sm font-semibold text-zinc-700">เลือกบทสนทนาเพื่อเริ่มคุย</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  คลิกที่รายการลูกค้าทางด้านซ้ายเพื่อดูข้อความและตอบกลับ
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProviderMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">กำลังโหลดกล่องข้อความ...</p>
        </div>
      }
    >
      <ProviderMessagesContent />
    </Suspense>
  );
}
