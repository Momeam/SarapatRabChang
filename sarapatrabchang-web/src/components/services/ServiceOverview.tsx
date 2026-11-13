import { Briefcase, Wrench, Clock, AlertCircle } from "lucide-react";
import { Provider } from "@/types";

interface ServiceOverviewProps {
  provider: Provider;
}

export default function ServiceOverview({ provider }: ServiceOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Description Box */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900">
          บ้านสะอาด ให้คุณมีเวลาพักมากขึ้น
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {provider.description}
        </p>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center gap-2.5 text-xs font-semibold text-zinc-800">
            <Briefcase className="w-4 h-4 text-orange-500" />
            <span>ประสบการณ์ {provider.experienceYears} ปี</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center gap-2.5 text-xs font-semibold text-zinc-800">
            <Wrench className="w-4 h-4 text-orange-500" />
            <span>{provider.hasTools ? "มีอุปกรณ์ให้พร้อม" : "สอบถามอุปกรณ์กับผู้ให้บริการ"}</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center gap-2.5 text-xs font-semibold text-zinc-800">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>บริการ {provider.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Important Notice Before Booking */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>สิ่งที่ควรทราบก่อนจอง</span>
        </div>
        <p className="text-xs text-amber-900/80 leading-relaxed">
          กรุณาเตรียมน้ำ ไฟฟ้า และแจ้งจุดที่ต้องการดูแลเป็นพิเศษล่วงหน้า
          <br />
          ไม่รวมซักผ้าม่าน ล้างแอร์ ทำความสะอาดหลังงานก่อสร้าง และพื้นที่สูงภายนอกอาคาร
        </p>
      </div>
    </div>
  );
}

