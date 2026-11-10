import { Search, ShieldCheck, Calendar, Lock } from "lucide-react";

export default function AuthHero() {
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-4">
          สำหรับผู้ใช้บริการบุคคลทั่วไป
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
          ยินดีต้อนรับสู่ <span className="text-orange-500">sarapatrabchang</span>
        </h1>
        <p className="mt-4 text-base text-zinc-600 leading-relaxed">
          เรื่องในบ้าน ให้คนใกล้บ้านช่วยดูแล สมัครสมาชิกเพื่อค้นหา พูดคุย และจองบริการ จากผู้ให้บริการที่ผ่านการยืนยันตัวตน
        </p>
      </div>

      {/* Value Propositions */}
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              ค้นหาคนที่ใช่ ใกล้บ้านคุณ
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              เลือกบริการและเปรียบเทียบราคาได้ในที่เดียว
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              มั่นใจในทุกการจ้างงาน
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              ยืนยันตัวตนทั้งผู้ใช้และผู้ให้บริการ
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              จองง่าย ติดตามงานได้
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              เลือกวันเวลาและดูประวัติการจองของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice Box */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 space-y-1 shadow-sm">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
          <Lock className="w-3.5 h-3.5 text-orange-500" />
          <span>ข้อมูลของคุณได้รับการดูแลอย่างปลอดภัย</span>
        </div>
        <p className="text-zinc-500 leading-relaxed">
          เอกสารยืนยันตัวตนใช้เพื่อตรวจสอบความปลอดภัยเท่านั้น และจะไม่แสดงบนโปรไฟล์สาธารณะ
        </p>
      </div>
    </div>
  );
}

