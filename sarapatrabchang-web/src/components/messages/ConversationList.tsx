import { Search, ShieldCheck } from "lucide-react";

export default function ConversationList() {
  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <h3 className="font-bold text-base text-zinc-900">ข้อความของฉัน</h3>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาบทสนทนา"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Conversation list */}
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 cursor-pointer transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900">
                สุภาวดี ใจดี
              </span>
              <span className="text-[10px] text-zinc-400">วันนี้ 10:12 น.</span>
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
  );
}

