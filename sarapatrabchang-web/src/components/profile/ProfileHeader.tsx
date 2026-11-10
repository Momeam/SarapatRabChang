"use client";

import { Camera, Edit3, Star, Globe, Lock } from "lucide-react";
import { useState } from "react";

interface ProfileHeaderProps {
  displayName: string;
  memberSince: string;
  rating: number;
  reviewCount: number;
}

export default function ProfileHeader({
  displayName,
  memberSince,
  rating,
  reviewCount,
}: ProfileHeaderProps) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(
    "ชอบดูแลบ้านและสวนให้เป็นพื้นที่พักผ่อน มองหาผู้ให้บริการที่ใส่ใจรายละเอียด ตรงต่อเวลา และพูดคุยเรื่องงานได้ชัดเจนค่ะ"
  );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Avatar + name row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-orange-100">
              {displayName.slice(0, 1)}
            </div>
            <button
              type="button"
              title="เปลี่ยนรูปโปรไฟล์"
              className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">{displayName}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Globe className="w-3 h-3" />
                โปรไฟล์สาธารณะ
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-zinc-600">ผู้ใช้งานทั่วไป / ผู้ว่าจ้าง</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
              <span>สมาชิกตั้งแต่ {memberSince}</span>
              <span>•</span>
              <div className="flex items-center gap-1 font-semibold text-zinc-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating} จาก 5</span>
                <span className="text-zinc-400 font-normal">({reviewCount} รีวิวจากผู้ร่วมงาน)</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingBio(!isEditingBio)}
          className="px-4 py-2 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditingBio ? "ปิดการแก้ไข" : "แก้ไขข้อมูลส่วนตัว"}</span>
        </button>
      </div>

      {/* Bio section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            แนะนำตัว / เกี่ยวกับฉัน
          </h3>
          <span className="text-[11px] text-zinc-400">ข้อความนี้จะแสดงบนโปรไฟล์สาธารณะ</span>
        </div>

        {isEditingBio ? (
          <div className="space-y-2">
            <textarea
              rows={3}
              maxLength={300}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">{bioText.length}/300 ตัวอักษร</span>
              <button
                type="button"
                onClick={() => setIsEditingBio(false)}
                className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"
              >
                บันทึกข้อความ
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            {bioText}
          </p>
        )}
        <p className="text-[11px] text-zinc-400">
          กดแก้ไขข้อมูลส่วนตัวเพื่อเปลี่ยนข้อความ • สูงสุด 300 ตัวอักษร
        </p>
      </div>

      {/* Privacy banner */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-600 space-y-1">
        <span className="font-bold text-zinc-900 block">ใครเห็นข้อมูลอะไรบ้าง?</span>
        <p className="text-zinc-500">
          <strong className="text-zinc-700">สาธารณะ:</strong> รูป, ชื่อ, ประเภทผู้ใช้,
          คำแนะนำตัว และความคิดเห็น/รีวิว
        </p>
        <p className="text-zinc-500">
          <strong className="text-zinc-700">เฉพาะคุณ:</strong> ความสนใจ, อีเมล, เบอร์โทร,
          ที่อยู่ และข้อมูลใบกำกับภาษี
        </p>
      </div>
    </div>
  );
}

