"use client";

import { Paperclip, Send } from "lucide-react";

interface ChatInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
}

export default function ChatInputArea({
  inputText,
  setInputText,
  onSend,
}: ChatInputAreaProps) {
  return (
    <form
      onSubmit={onSend}
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
  );
}

