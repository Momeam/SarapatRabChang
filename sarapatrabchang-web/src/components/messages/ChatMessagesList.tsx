"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ChatMessage } from "@/types";

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatMessagesList({
  messages,
  isTyping,
}: ChatMessagesListProps) {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
      <div className="text-center my-2">
        <span className="text-[11px] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
          2 พ.ย. 2569 • เริ่มการสนทนาจากบริการทำความสะอาด
        </span>
      </div>

      {messages.map((msg) => {
        const isUser = msg.sender === "user";
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                isUser
                  ? "bg-zinc-950 text-white rounded-br-xs"
                  : "bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs"
              }`}
            >
              <p>{msg.text}</p>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1 px-1">
              <span>{msg.time}</span>
              {isUser && (
                <span className="flex items-center text-orange-500">• อ่านแล้ว</span>
              )}
            </div>

            {/* In-Chat Service Agreement / Order Card */}
            {msg.orderCard && (
              <div className="w-full max-w-lg mt-4 bg-white rounded-2xl border-2 border-orange-400 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <h5 className="font-bold text-sm text-zinc-900">
                    สรุปข้อตกลงบริการ
                  </h5>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ตกลงรายละเอียดแล้ว
                  </span>
                </div>

                <div className="text-xs text-zinc-500">
                  หมายเลขงาน:{" "}
                  <span className="font-mono font-semibold text-zinc-800">
                    {msg.orderCard.jobId}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-700">
                  <p className="font-bold text-zinc-900">{msg.orderCard.title}</p>
                  <ul className="space-y-1 text-zinc-600 pl-1">
                    {msg.orderCard.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <span className="text-xs text-zinc-500">
                    {msg.orderCard.dateTime}
                  </span>
                  <span className="text-lg font-extrabold text-zinc-950">
                    ฿{msg.orderCard.price.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/booking/payment")}
                  className="w-full py-3 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  ดำเนินการชำระเงิน
                </button>

                <p className="text-[10px] text-zinc-400 text-center">
                  สุภาวดี • ยืนยันตามรายละเอียดนี้ค่ะ • 10:12 น.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></div>
          <span>สุภาวดี กำลังพิมพ์...</span>
        </div>
      )}
    </div>
  );
}

