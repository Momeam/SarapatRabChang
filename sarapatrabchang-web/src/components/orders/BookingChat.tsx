"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { requestApi } from "@/lib/api";

interface BookingChatMessage {
  id: string;
  body: string;
  senderRole: "customer" | "provider";
  senderName: string;
  createdAt: string;
}

interface BookingChatProps {
  bookingId: string;
  viewerRole: "customer" | "provider";
}

export default function BookingChat({ bookingId, viewerRole }: BookingChatProps) {
  const [messages, setMessages] = useState<BookingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    requestApi<BookingChatMessage[]>(
      `/api/bookings/${encodeURIComponent(bookingId)}/messages`,
    )
      .then((result) => {
        if (active) setMessages(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "โหลดข้อความไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setError("");
    setIsSending(true);
    try {
      const saved = await requestApi<BookingChatMessage>(
        `/api/bookings/${encodeURIComponent(bookingId)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: body }),
        },
      );
      setMessages((current) => [...current, saved]);
      setDraft("");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section id="chat" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-zinc-950">
          แชทกับ{viewerRole === "provider" ? "ผู้ว่าจ้าง" : "ผู้ให้บริการ"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          ข้อความของงานนี้จะถูกบันทึกไว้เพื่อให้คู่สัญญากลับมาตรวจสอบได้
        </p>
      </div>

      <div className="max-h-80 min-h-28 overflow-y-auto rounded-xl bg-zinc-50 p-3 space-y-3">
        {isLoading ? (
          <p role="status" className="py-6 text-center text-xs text-zinc-500">
            กำลังโหลดข้อความ...
          </p>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-500">
            ยังไม่มีข้อความ เริ่มพูดคุยเกี่ยวกับงานนี้ได้เลย
          </p>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderRole === viewerRole;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  isOwnMessage
                    ? "bg-zinc-950 text-white"
                    : "border border-zinc-200 bg-white text-zinc-900"
                }`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${
                    isOwnMessage ? "text-zinc-300" : "text-zinc-500"
                  }`}>
                    {message.senderName} · {new Date(message.createdAt).toLocaleString("th-TH")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-700">{error}</p>
      )}

      <form onSubmit={sendMessage} className="flex items-end gap-2">
        <label className="sr-only" htmlFor={`message-${bookingId}`}>ข้อความ</label>
        <textarea
          id={`message-${bookingId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={2000}
          rows={2}
          placeholder="พิมพ์ข้อความถึงอีกฝ่าย..."
          className="min-w-0 flex-1 resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={isLoading || isSending}
        />
        <button
          type="submit"
          disabled={isLoading || isSending || !draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isSending ? "กำลังส่ง..." : "ส่ง"}
        </button>
      </form>
    </section>
  );
}
