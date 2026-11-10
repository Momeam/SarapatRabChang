"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConversationList from "@/components/messages/ConversationList";
import ChatHeader from "@/components/messages/ChatHeader";
import ChatMessagesList from "@/components/messages/ChatMessagesList";
import ChatInputArea from "@/components/messages/ChatInputArea";
import { mockChatMessages } from "@/data/mockData";
import { useNotificationStore } from "@/store/useNotificationStore";
import { ChevronRight, Sparkles } from "lucide-react";

export default function MessagesPage() {
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
          {/* Component 1: Left Sidebar Conversations */}
          <div className="lg:col-span-4 border-r border-zinc-200 p-4 sm:p-5">
            <ConversationList />
          </div>

          {/* Right Main Chat Panel */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-50/40">
            {/* Component 2: Chat Header */}
            <ChatHeader />

            {/* Component 3: Chat Messages List */}
            <ChatMessagesList messages={messages} isTyping={isTyping} />

            {/* Component 4: Message Input Bar */}
            <ChatInputArea
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSend}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
