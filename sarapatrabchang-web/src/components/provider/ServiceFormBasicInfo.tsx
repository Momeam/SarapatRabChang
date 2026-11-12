"use client";

interface ServiceFormBasicInfoProps {
  title: string;
  setTitle: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export default function ServiceFormBasicInfo({
  title,
  setTitle,
  category,
  setCategory,
  location,
  setLocation,
  description,
  setDescription,
}: ServiceFormBasicInfoProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-zinc-950">1. ข้อมูลบริการ</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            ชื่อหัวข้อบริการ
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ทำความสะอาดคอนโดและบ้าน"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <p className="text-[11px] text-zinc-400 mt-1">ใช้ชื่อที่บอกบริการชัดเจน เพื่อช่วยให้ลูกค้าค้นหาเจอ</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            เลือกหมวดหมู่บริการ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="แม่บ้าน">แม่บ้าน</option>
            <option value="ช่างไฟ/ประปา">ช่างไฟ/ประปา</option>
            <option value="แอร์บ้าน">แอร์บ้าน</option>
            <option value="จัดสวน">จัดสวน</option>
            <option value="ซ่อมบำรุงทั่วไป">ซ่อมบำรุงทั่วไป</option>
          </select>
          <p className="text-[11px] text-zinc-400 mt-1">แม่บ้าน • ช่างไฟ/ประปา • แอร์บ้าน • จัดสวน</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            พื้นที่ให้บริการ
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น บางนา, ห้วยขวาง, กรุงเทพมหานคร"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-[11px] text-zinc-400 mt-1">เลือกได้มากกว่า 1 พื้นที่</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            รายละเอียดบริการและสิ่งที่ควรทราบก่อนจอง
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="บริการทำความสะอาดคอนโดและบ้าน ดูแลห้องนอน ห้องน้ำ ห้องครัว..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
          />
          <p className="text-[11px] text-zinc-400 mt-1">
            ระบุขอบเขตงาน อุปกรณ์ที่เตรียมให้ และเงื่อนไขก่อนจองอย่างชัดเจน
          </p>
        </div>
      </div>
    </div>
  );
}

