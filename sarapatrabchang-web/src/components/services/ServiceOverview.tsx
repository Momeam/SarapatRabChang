import { Briefcase, Wrench, Clock, AlertCircle } from "lucide-react";
import { Provider } from "@/types";

interface ServiceOverviewProps {
  provider: Provider;
}

function getCategoryContent(provider: Provider): { heading: string; notice: string } {
  const key = (provider.categoryKey || "").toLowerCase();
  const cat = (provider.category || "").toLowerCase();
  const title = (provider.serviceTitle || "").toLowerCase();

  if (
    key === "laundry" ||
    cat.includes("ซัก") ||
    cat.includes("รีด") ||
    title.includes("ซัก") ||
    title.includes("รีด")
  ) {
    return {
      heading: "เสื้อผ้าสะอาด หอมสดชื่น เรียบพร้อมใส่ ให้คุณมีเวลาพักมากขึ้น",
      notice:
        "กรุณาคัดแยกผ้าขาว ผ้าสี หรือผ้าที่ต้องการดูแลเป็นพิเศษล่วงหน้า\nไม่รวมงานซ่อมแซมผ้าหรือขจัดคราบฝังลึกพิเศษที่ไม่ได้แจ้งไว้",
    };
  }

  if (
    key === "moving" ||
    cat.includes("ขนย้าย") ||
    cat.includes("ย้าย") ||
    title.includes("ขนย้าย") ||
    title.includes("ย้าย")
  ) {
    return {
      heading: "ขนย้ายปลอดภัย รวดเร็ว สะดวกสบาย ให้คุณอุ่นใจทุกการย้าย",
      notice:
        "กรุณาแพ็กของมีค่าและสิ่งของแตกหักง่ายล่วงหน้า\nโปรดแจ้งข้อมูลเรื่องลิฟต์ บันได และระยะทางขนย้ายเพื่อให้ทีมงานเตรียมความพร้อม",
    };
  }

  if (
    key === "electrician" ||
    cat.includes("ไฟ") ||
    cat.includes("ประปา") ||
    cat.includes("ช่าง") ||
    title.includes("ไฟ") ||
    title.includes("ประปา")
  ) {
    return {
      heading: "งานช่างคุณภาพ ได้มาตรฐาน ปลอดภัย มั่นใจได้ทุกจุด",
      notice:
        "กรุณาตัดไฟหรือปิดวาล์วน้ำในจุดที่เกี่ยวข้องก่อนเริ่มงาน\nโปรดระบุอาการเสียและตำแหน่งที่ต้องการให้ซ่อมแซมให้ชัดเจน",
    };
  }

  if (
    key === "appliance" ||
    cat.includes("เครื่องใช้ไฟฟ้า") ||
    cat.includes("แอร์") ||
    title.includes("เครื่องใช้ไฟฟ้า") ||
    title.includes("แอร์")
  ) {
    return {
      heading: "ซ่อมเครื่องใช้ไฟฟ้าตรงจุด รวดเร็ว ใช้งานได้ยาวนาน",
      notice:
        "กรุณาแจ้งรุ่น ยี่ห้อ และอาการเสียเบื้องต้น เพื่อให้ช่างเตรียมเครื่องมือและอะไหล่ได้อย่างถูกต้อง",
    };
  }

  if (key === "queue" || cat.includes("คิว") || title.includes("คิว")) {
    return {
      heading: "รับจ้างต่อคิว ประหยัดเวลา ไม่ต้องเสียเวลารอนาน",
      notice:
        "กรุณาระบุสถานที่ วันเวลา จุดนัดรับคิว และเงื่อนไขการรับคิวให้ชัดเจนล่วงหน้า",
    };
  }

  if (key === "gardening" || cat.includes("สวน") || title.includes("สวน")) {
    return {
      heading: "จัดสวนสวย ดูแลต้นไม้ สดชื่น ร่มรื่น สบายตา",
      notice:
        "กรุณาเคลียร์พื้นที่เบื้องต้น และแจ้งจุดที่มีระบบท่อน้ำหรือสายไฟใต้ดินให้ช่างทราบ",
    };
  }

  if (
    key === "maid" ||
    cat.includes("แม่บ้าน") ||
    cat.includes("สะอาด") ||
    title.includes("สะอาด")
  ) {
    return {
      heading: "บ้านสะอาด ให้คุณมีเวลาพักมากขึ้น",
      notice:
        "กรุณาเตรียมน้ำ ไฟฟ้า และแจ้งจุดที่ต้องการดูแลเป็นพิเศษล่วงหน้า\nไม่รวมซักผ้าม่าน ล้างแอร์ ทำความสะอาดหลังงานก่อสร้าง และพื้นที่สูงภายนอกอาคาร",
    };
  }

  return {
    heading: `${provider.serviceTitle || "บริการคุณภาพ"} ดูแลครบจบ ให้คุณมีเวลาพักมากขึ้น`,
    notice:
      "กรุณาแจ้งรายละเอียดงานและจุดที่ต้องการเน้นเป็นพิเศษล่วงหน้า เพื่อให้ผู้ให้บริการเตรียมการได้อย่างมีประสิทธิภาพ",
  };
}

export default function ServiceOverview({ provider }: ServiceOverviewProps) {
  const { heading, notice } = getCategoryContent(provider);

  return (
    <div className="space-y-6">
      {/* Description Box */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900">
          {heading}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
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
        <p className="text-xs text-amber-900/80 leading-relaxed whitespace-pre-line">
          {notice}
        </p>
      </div>
    </div>
  );
}

