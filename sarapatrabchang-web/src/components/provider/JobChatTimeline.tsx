"use client";

import { useState } from "react";
import { Paperclip, Send, Image as ImageIcon, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender: "client" | "provider" | "system";
  text?: string;
  image?: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: "m1",
    sender: "client",
    text: "สวัสดีค่ะ พอดีอยากให้เน้นทำความสะอาดบริเวณระเบียงเพิ่มเติมด้วยค่ะ มีคราบฝุ่นเกาะเยอะมาก อยากให้ช่วยคิดราคาเพิ่มให้หน่อยค่ะ",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
    time: "10:24 น.",
  },
  {
    id: "m2",
    sender: "system",
    text: "ลูกค้าส่งคำขอใบเสนอราคาเพิ่มเติมสำหรับขอบเขตงานระเบียง",
    time: "10:25 น.",
  },
  {
    id: "m3",
    sender: "provider",
    text: "รับทราบค่ะ เดี๋ยวจะออกใบเสนอราคาในส่วนของระเบียงเพิ่มเติมให้นะคะ รอสักครู่นะคะ",
    time: "10:28 น.",
  },
];

export default function JobChatTimeline() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "provider",
      text: inputText.trim(),
      time: "เมื่อสักครู่",
    };

    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
            อ
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900">อรทัย สุขใจ (ผู้ว่าจ้าง)</h4>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ออนไลน์
            </span>
          </div>
        </div>
        <span className="text-[11px] text-zinc-400">บทสนทนาในคำสั่งซื้อ ORD-0269-041</span>
      </div>

      {/* Messages stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] border border-zinc-200">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isProvider = msg.sender === "provider";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isProvider ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-2 shadow-xs ${
                  isProvider
                    ? "bg-zinc-950 text-white rounded-br-xs"
                    : "bg-zinc-100 text-zinc-900 rounded-bl-xs"
                }`}
              >
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200/50 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.image}
                      alt="Attached photo"
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-1.5 bg-black/40 text-white text-[10px] flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>รูปถ่ายบริเวณระเบียงที่ลูกค้าแนบมา</span>
                    </div>
                  </div>
                )}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1 px-1">
                <span>{msg.time}</span>
                {isProvider && <CheckCheck className="w-3 h-3 text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
        <button
          type="button"
          title="แนบรูปภาพหรือไฟล์"
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความถึงลูกค้า..."
          className="flex-1 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="submit"
          className="p-2.5 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

