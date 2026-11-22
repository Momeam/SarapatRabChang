"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
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

function formatMessageDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

export default function MessagesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messageLoad, setMessageLoad] = useState<{
    bookingId: string;
    messages: BookingChatMessage[];
    error?: string;
  } | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [messageReloadKey, setMessageReloadKey] = useState(0);
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
        if (active) {
          setBookings(result.filter((booking) => booking.viewerRole === "customer"));
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setBookingError(cause instanceof Error ? cause.message : "โหลดบทสนทนาไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (active) setIsLoadingBookings(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function retryBookings() {
    setIsLoadingBookings(true);
    setBookingError("");
    try {
      const result = await requestApi<Booking[]>("/api/bookings");
      setBookings(result.filter((booking) => booking.viewerRole === "customer"));
    } catch (cause: unknown) {
      setBookingError(cause instanceof Error ? cause.message : "โหลดบทสนทนาไม่สำเร็จ");
    } finally {
      setIsLoadingBookings(false);
    }
  }

  useEffect(() => {
    if (!activeBookingId) return;

    let active = true;
    requestApi<BookingChatMessage[]>(
      `/api/bookings/${encodeURIComponent(activeBookingId)}/messages`,
    )
      .then((result) => {
        if (active) setMessageLoad({ bookingId: activeBookingId, messages: result });
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
  }, [activeBookingId, messageReloadKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeBooking) return;

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
      setMessageLoad((current) => current?.bookingId === activeBooking.id
        ? { ...current, messages: [...current.messages, saved], error: undefined }
        : current);
      setDraft("");
    } catch (cause: unknown) {
      setSendError(cause instanceof Error ? cause.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto flex h-[calc(100vh-7rem)] min-h-[520px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <aside className={`w-full shrink-0 flex-col border-r border-zinc-200 sm:w-[320px] lg:w-[380px] ${
            isMobileConversationOpen ? "hidden lg:flex" : "flex"
          }`}>
            <div className="border-b border-zinc-100 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h1 className="text-base font-bold text-zinc-950">แชทกับผู้ให้บริการ</h1>
                <Link
                  href="/tracking"
                  className="text-xs font-semibold text-zinc-500 hover:text-orange-600"
                >
                  รายการจอง
                </Link>
              </div>
              <label className="relative mt-4 block">
                <span className="sr-only">ค้นหาบทสนทนา</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาบทสนทนา"
                  className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </label>
            </div>

            {bookingError && (
              <div className="border-b border-red-100 bg-red-50 p-4 text-xs text-red-700">
                <p role="alert">{bookingError}</p>
                {bookingError.includes("เข้าสู่ระบบ") && (
                  <Link href="/auth" className="mt-2 inline-block font-semibold underline">
                    เข้าสู่ระบบ
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void retryBookings()}
                  className="mt-2 block font-semibold underline"
                >
                  ลองโหลดอีกครั้ง
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {isLoadingBookings ? (
                <p role="status" className="p-5 text-xs text-zinc-500">
                  กำลังโหลดบทสนทนา...
                </p>
              ) : filteredBookings.length === 0 ? (
                <div className="p-5 text-xs text-zinc-500">
                  <p>
                    {bookingError
                      ? "ไม่สามารถแสดงรายการบทสนทนาได้"
                      : bookings.length
                        ? "ไม่พบบทสนทนาที่ค้นหา"
                        : "ยังไม่มีรายการที่คุณว่าจ้าง"}
                  </p>
                    {!bookingError && bookings.length === 0 && (
                    <Link href="/tracking" className="mt-3 inline-block font-semibold text-orange-600">
                      ดูรายการจอง
                    </Link>
                  )}
                </div>
              ) : filteredBookings.map((booking) => {
                const isSelected = booking.id === activeBookingId;
                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => {
                      setSelectedBookingId(booking.id);
                      setIsMobileConversationOpen(true);
                    }}
                    className={`w-full border-b border-zinc-100 p-4 text-left transition-colors hover:bg-orange-50/50 ${
                      isSelected ? "bg-orange-50/70" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="truncate text-sm font-bold text-zinc-900">
                        {booking.providerName}
                      </span>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {formatBookingDate(booking.date)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-zinc-700">
                      {booking.serviceTitle}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-zinc-500">
                      {booking.packageTitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] text-zinc-500">
                        {bookingStatusLabels[booking.status]}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className={`min-w-0 flex-1 flex-col ${
            isMobileConversationOpen ? "flex" : "hidden lg:flex"
          }`}>
            {activeBooking ? (
              <>
                <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-3 py-3.5 sm:px-6">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileConversationOpen(false)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
                      aria-label="กลับไปรายชื่อบทสนทนา"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                      {activeBooking.providerName.slice(0, 1) || "?"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-zinc-950">
                        {activeBooking.providerName}
                      </h2>
                      <p className="truncate text-[11px] text-zinc-500">
                        {activeBooking.serviceTitle} • {bookingStatusLabels[activeBooking.status]}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/orders/${encodeURIComponent(activeBooking.id)}`}
                    className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 sm:px-3 sm:text-xs"
                  >
                    ดูรายละเอียดงาน
                  </Link>
                </header>

                <div className="flex-1 overflow-y-auto bg-zinc-50/40 px-3 py-4 sm:px-6 sm:py-5">
                  {isLoadingMessages ? (
                    <p role="status" className="py-8 text-center text-xs text-zinc-500">
                      กำลังโหลดข้อความ...
                    </p>
                  ) : messageLoadError ? (
                    <div className="py-8 text-center">
                      <p role="alert" className="text-xs text-red-700">{messageLoadError}</p>
                      <button
                        type="button"
                        onClick={() => setMessageReloadKey((current) => current + 1)}
                        className="mt-3 text-xs font-semibold text-orange-600 underline"
                      >
                        โหลดข้อความอีกครั้ง
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-zinc-500">
                      ยังไม่มีข้อความ เริ่มพูดคุยเกี่ยวกับงานนี้ได้เลย
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const messageDate = new Date(message.createdAt).toDateString();
                        const previousDate = index > 0
                          ? new Date(messages[index - 1].createdAt).toDateString()
                          : "";
                        const isOwnMessage = message.senderRole === "customer";
                        return (
                          <div key={message.id}>
                            {messageDate !== previousDate && (
                              <div className="my-5 flex justify-center">
                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-500">
                                  {formatMessageDate(message.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                              <div className="max-w-[88%] sm:max-w-[75%]">
                                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  isOwnMessage
                                    ? "rounded-br-sm bg-zinc-950 text-white"
                                    : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-900 shadow-sm"
                                }`}>
                                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                                </div>
                                <p className={`mt-1 text-[10px] text-zinc-400 ${
                                  isOwnMessage ? "text-right" : ""
                                }`}>
                                  {formatMessageTime(message.createdAt)}
                                  {isOwnMessage ? " · คุณ" : ` · ${message.senderName}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {sendError && (
                  <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
                    {sendError}
                  </p>
                )}
                {activeBooking.status === "completed" ? (
                  <div className="border-t border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-zinc-500">
                    งานนี้เสร็จสมบูรณ์แล้ว การสนทนาถูกปิดเรียบร้อยแล้ว ไม่สามารถส่งข้อความเพิ่มเติมได้
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-zinc-200 bg-white p-3 sm:p-4">
                    <label className="sr-only" htmlFor="customer-message-input">
                      พิมพ์ข้อความถึงผู้ให้บริการ
                    </label>
                    <textarea
                      id="customer-message-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={2000}
                      rows={1}
                      placeholder="พิมพ์ข้อความถึงผู้ให้บริการ..."
                      className="min-h-11 max-h-32 min-w-0 flex-1 resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isLoadingMessages || isSending}
                    />
                    <button
                      type="submit"
                      disabled={isLoadingMessages || isSending || !draft.trim()}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">{isSending ? "กำลังส่ง..." : "ส่ง"}</span>
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="m-auto p-6 text-center">
                <p className="text-sm font-semibold text-zinc-800">
                  {bookingError
                    ? "โหลดบทสนทนาไม่สำเร็จ"
                    : isLoadingBookings
                      ? "กำลังโหลดบทสนทนา..."
                      : "เลือกรายการจองเพื่อเริ่มแชท"}
                </p>
                {!isLoadingBookings && !bookingError && bookings.length === 0 && (
                  <Link href="/tracking" className="mt-3 inline-block text-xs font-semibold text-orange-600">
                    ไปที่รายการจอง
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
