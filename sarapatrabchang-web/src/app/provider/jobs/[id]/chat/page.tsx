"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Send } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
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

export default function ProviderBookingChatPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = typeof params?.id === "string" ? params.id : "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messageLoad, setMessageLoad] = useState<{
    bookingId: string;
    messages: BookingChatMessage[];
    error?: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [messageActionError, setMessageActionError] = useState<{
    bookingId: string;
    error: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeBooking = bookings.find((booking) => booking.id === bookingId) ?? null;
  const activeBookingId = activeBooking?.id ?? "";
  const isLoadingMessages = Boolean(activeBookingId && messageLoad?.bookingId !== activeBookingId);
  const messages = messageLoad?.bookingId === activeBookingId ? messageLoad.messages : EMPTY_MESSAGES;
  const messageError =
    (messageLoad?.bookingId === activeBookingId ? messageLoad.error : "") ||
    (messageActionError?.bookingId === activeBookingId ? messageActionError.error : "");
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
          setBookings(result.filter((booking) => booking.viewerRole === "provider"));
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "โหลดบทสนทนาไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoadingBookings(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
  }, [activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeBooking) return;

    setIsSending(true);
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
      setMessageActionError(null);
      setDraft("");
    } catch (cause: unknown) {
      setMessageActionError({
        bookingId: activeBooking.id,
        error: cause instanceof Error ? cause.message : "ส่งข้อความไม่สำเร็จ",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ProviderNavbar />
      <main className="flex-1 min-h-0 p-3 sm:p-5">
        <div className="mx-auto flex h-[calc(100vh-6rem)] min-h-[520px] max-w-7xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <aside className="flex w-full shrink-0 flex-col border-r border-zinc-200 sm:w-[320px] lg:w-[390px]">
            <div className="border-b border-zinc-100 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h1 className="text-base font-bold text-zinc-950">แชทกับผู้ว่าจ้าง</h1>
                <Link
                  href="/provider/jobs"
                  className="text-xs font-semibold text-zinc-500 hover:text-orange-600"
                >
                  รายการงาน
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

            <div className="flex-1 overflow-y-auto">
              {isLoadingBookings ? (
                <p role="status" className="p-5 text-xs text-zinc-500">กำลังโหลดบทสนทนา...</p>
              ) : filteredBookings.length === 0 ? (
                <p className="p-5 text-xs text-zinc-500">
                  {bookings.length ? "ไม่พบบทสนทนาที่ค้นหา" : "ยังไม่มีงานที่รับจากผู้ว่าจ้าง"}
                </p>
              ) : filteredBookings.map((booking) => {
                const isSelected = booking.id === bookingId;
                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => router.push(`/provider/jobs/${encodeURIComponent(booking.id)}/chat`)}
                    className={`w-full border-b border-zinc-100 p-4 text-left transition-colors hover:bg-orange-50/50 ${
                      isSelected ? "bg-orange-50/70" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="truncate text-sm font-bold text-zinc-900">{booking.contactName}</span>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {formatMessageDate(booking.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-zinc-700">{booking.serviceTitle}</p>
                    <p className="mt-1 truncate text-[11px] text-zinc-500">{booking.packageTitle}</p>
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

          <section className={`min-w-0 flex-1 flex-col ${activeBooking ? "flex" : "hidden sm:flex"}`}>
            {error ? (
              <div className="m-auto p-6 text-center">
                <p role="alert" className="text-sm text-red-700">{error}</p>
                {error.includes("เข้าสู่ระบบ") && (
                  <Link href="/auth" className="mt-3 inline-block text-sm font-semibold text-orange-600">
                    เข้าสู่ระบบ
                  </Link>
                )}
              </div>
            ) : activeBooking ? (
              <>
                <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3.5 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                      {activeBooking.contactName.slice(0, 1)}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-zinc-950">{activeBooking.contactName}</h2>
                      <p className="truncate text-[11px] text-zinc-500">
                        {activeBooking.serviceTitle} • {bookingStatusLabels[activeBooking.status]}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/provider/jobs/${encodeURIComponent(activeBooking.id)}`}
                    className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    ดูรายละเอียดงาน
                  </Link>
                </header>

                <div className="flex-1 overflow-y-auto bg-zinc-50/40 px-4 py-5 sm:px-6">
                  {isLoadingMessages ? (
                    <p role="status" className="py-8 text-center text-xs text-zinc-500">กำลังโหลดข้อความ...</p>
                  ) : messages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-zinc-500">ยังไม่มีข้อความ เริ่มพูดคุยกับผู้ว่าจ้างได้เลย</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const messageDate = new Date(message.createdAt).toDateString();
                        const previousDate = index > 0
                          ? new Date(messages[index - 1].createdAt).toDateString()
                          : "";
                        const isOwnMessage = message.senderRole === "provider";
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
                                <p className={`mt-1 text-[10px] text-zinc-400 ${isOwnMessage ? "text-right" : ""}`}>
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
                  {messageError && (
                    <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                      {messageError}
                    </p>
                  )}
                </div>

                {activeBooking.status === "completed" ? (
                  <div className="border-t border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-zinc-500">
                    งานนี้เสร็จสมบูรณ์แล้ว การสนทนาถูกปิดเรียบร้อยแล้ว ไม่สามารถส่งข้อความเพิ่มเติมได้
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-zinc-200 bg-white p-3 sm:p-4">
                    <label className="sr-only" htmlFor="provider-message-input">พิมพ์ข้อความถึงผู้ว่าจ้าง</label>
                    <textarea
                      id="provider-message-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={2000}
                      rows={1}
                      placeholder="พิมพ์ข้อความถึงผู้ว่าจ้าง..."
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
                  {isLoadingBookings ? "กำลังโหลดบทสนทนา..." : "เลือกบทสนทนาจากรายการด้านซ้าย"}
                </p>
                {!isLoadingBookings && bookings.length === 0 && (
                  <Link href="/provider/jobs" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    ไปที่รายการงาน
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
