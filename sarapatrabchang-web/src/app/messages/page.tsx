"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockChatMessages } from "@/data/mockData";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Search,
  ShieldCheck,
  Paperclip,
  Send,
  CheckCheck,
  ChevronRight,
  User,
  Clock,
  CheckCircle2,
  Check,
  Sparkles,
} from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(mockChatMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { markMessagesAsRead, simulateIncomingNotification } =
    useNotificationStore();

  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      senderName: "พิมพ์ชนก ใจดี",
      text: userText,
      time: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate provider typing and auto-reply after 2 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        id: `msg-reply-${Date.now()}`,
        sender: "provider" as const,
        senderName: "สุภาวดี ใจดี",
        text: "รับทราบเรียบร้อยค่ะคุณพิมพ์ชนก สุภาวดีจะจัดเตรียมอุปกรณ์ตามที่แจ้งไว้นะคะ ขอบคุณค่ะ",
        time: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: true,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">
            บัญชีของฉัน
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">แชทพูดคุยส่วนตัว</span>
        </div>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              แชทพูดคุยส่วนตัว
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              พูดคุยรายละเอียดและตกลงบริการกับผู้ให้บริการก่อนชำระเงิน
            </p>
          </div>

          <button
            type="button"
            onClick={() => simulateIncomingNotification()}
            className="px-3.5 py-2 bg-orange-100/70 hover:bg-orange-200/80 text-orange-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 w-fit cursor-pointer border border-orange-200"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>จำลองแจ้งเตือน/ข้อความเข้า (โชว์จุดส้ม)</span>
          </button>
        </div>

        {/* Chat Window Container */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Left Sidebar: Conversations & Safety Box */}
          <div className="lg:col-span-4 border-r border-zinc-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-zinc-900">
                ข้อความของฉัน
              </h3>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ค้นหาบทสนทนา"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Conversation items */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">
                      สุภาวดี ใจดี
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      วันนี้ 10:12 น.
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    แม่บ้าน • ยืนยันตัวตนแล้ว
                  </p>
                  <p className="text-xs text-zinc-600 line-clamp-1 mt-1 font-medium">
                    ยืนยันตามรายละเอียดนี้ค่ะ
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Guarantee Box */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-orange-900">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>จ้างงานอย่างอุ่นใจ</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                พูดคุยและชำระเงินผ่าน <strong className="text-zinc-900">sarapatrabchang</strong> เท่านั้น เพื่อให้คำสั่งซื้อของคุณได้รับการคุ้มครองด้วยระบบประกันกลาง (Escrow)
              </p>
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-50/40">
            {/* Header */}
            <div className="p-4 sm:px-6 bg-white border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    ส
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">
                    สุภาวดี ใจดี
                  </h4>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>ทำความสะอาดคอนโดและบ้าน • ตอบกลับภายใน 1 ชั่วโมง</span>
                  </p>
                </div>
              </div>

              <Link
                href="/services/cleaning"
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                ดูโปรไฟล์
              </Link>
            </div>

            {/* Chat Messages Body */}
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
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
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
                        <span className="flex items-center text-orange-500">
                          • อ่านแล้ว
                        </span>
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
                          <p className="font-bold text-zinc-900">
                            {msg.orderCard.title}
                          </p>
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

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-white border-t border-zinc-200 space-y-2"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="แนบรูปภาพ"
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="พิมพ์ข้อความถึงสุภาวดี..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งข้อความ</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 pl-1">
                แนบรูปภาพเพื่อแจ้งจุดที่ต้องการดูแล • JPG, PNG ขนาดไม่เกิน 5 MB
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
