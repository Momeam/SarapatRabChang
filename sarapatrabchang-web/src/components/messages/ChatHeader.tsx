import Link from "next/link";
import { Clock } from "lucide-react";

interface ChatHeaderProps {
  providerName?: string;
  serviceCategory?: string;
}

export default function ChatHeader({
  providerName = "สุภาวดี ใจดี",
  serviceCategory = "ทำความสะอาดคอนโดและบ้าน",
}: ChatHeaderProps) {
  return (
    <div className="p-4 sm:px-6 bg-white border-b border-zinc-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            {providerName.charAt(0)}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </div>
        <div>
          <h4 className="font-bold text-sm text-zinc-900">{providerName}</h4>
          <p className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{serviceCategory} • ตอบกลับภายใน 1 ชั่วโมง</span>
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
  );
}

