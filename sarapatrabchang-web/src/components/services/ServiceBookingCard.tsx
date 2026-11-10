"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageSquare } from "lucide-react";
import EscrowBadge from "@/components/EscrowBadge";
import { Provider } from "@/types";

interface ServiceBookingCardProps {
  provider: Provider;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (t: string) => void;
}

export default function ServiceBookingCard({
  provider,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
}: ServiceBookingCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
      <div>
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          กำหนดราคาและรายละเอียดแพ็กเกจ
        </span>
        <h3 className="text-lg font-bold text-zinc-900 mt-1">
          คอนโดสะอาดสบาย
        </h3>
        <p className="text-xs text-zinc-500">
          พื้นที่ไม่เกิน 40 ตร.ม. • แม่บ้าน 1 คน
        </p>
      </div>

      {/* Price Banner */}
      <div className="flex items-baseline gap-2 pb-4 border-b border-zinc-100">
        <span className="text-3xl font-extrabold text-zinc-900">
          ฿{provider.startingPrice.toLocaleString()}
        </span>
        <span className="text-xs text-zinc-500">
          / ครั้ง • ระยะเวลา 3 ชั่วโมง
        </span>
      </div>

      {/* Package Features List */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-zinc-700">
          บริการที่รวมในแพ็กเกจ
        </p>
        <ul className="space-y-2 text-xs text-zinc-600">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>กวาด ดูดฝุ่น และถูพื้นทุกห้อง</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>เช็ดฝุ่นเฟอร์นิเจอร์และพื้นผิวทั่วไป</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ทำความสะอาดห้องน้ำ 1 ห้อง และครัว</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>อุปกรณ์และน้ำยาทำความสะอาดพื้นฐาน</span>
          </li>
        </ul>
      </div>

      {/* Date & Time Selectors */}
      <div className="space-y-4 pt-2 border-t border-zinc-100">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            วันที่ต้องการใช้บริการ
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            ช่วงเวลาเริ่มงาน
          </label>
          <select
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="09:00-12:00">ช่วงเช้า: 09:00–12:00 น.</option>
            <option value="13:00-16:00">ช่วงบ่าย: 13:00–16:00 น.</option>
            <option value="15:00-18:00">ช่วงเย็น: 15:00–18:00 น.</option>
          </select>
        </div>
      </div>

      {/* Total & Actions */}
      <div className="pt-4 border-t border-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-600">
            ยอดชำระทั้งหมด
          </span>
          <span className="text-xl font-bold text-zinc-900">
            ฿{provider.startingPrice.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => router.push("/booking/details")}
            className="w-full py-3 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>จองบริการและชำระเงิน</span>
          </button>

          <Link
            href="/messages"
            className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl border border-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <span>ส่งข้อความพูดคุย</span>
          </Link>
        </div>

        {/* Escrow compact badge */}
        <div className="text-center pt-2">
          <EscrowBadge variant="compact" className="justify-center" />
        </div>
      </div>
    </div>
  );
}

