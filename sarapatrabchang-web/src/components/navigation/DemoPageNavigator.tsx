"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  X,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

export default function DemoPageNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const pages = [
    {
      pageNumber: "หน้า 1",
      title: "เข้าสู่ระบบ / สมัครสมาชิก",
      path: "/auth",
      description: "ฟอร์มสมัครสมาชิก, อัปโหลดบัตรประชาชน, เข้าสู่ระบบ",
    },
    {
      pageNumber: "หน้า 2",
      title: "หน้าแรก (ค้นหาช่างและผู้ช่วย)",
      path: "/",
      description: "ค้นหาบริการ, หมวดหมู่งาน, รายชื่อช่างแนะนำ",
    },
    {
      pageNumber: "หน้า 3",
      title: "รายละเอียดบริการ & ผู้ให้บริการ",
      path: "/",
      description: "เลือกประกาศจากรายการผู้ให้บริการบนหน้าแรก",
    },
    {
      pageNumber: "หน้า 4",
      title: "ขั้นตอนที่ 2: ระบุรายละเอียด & ปักหมุดแผนที่",
      path: "/booking/details",
      description: "หมายเหตุถึงช่าง, อัปโหลดรูป, แผนที่ปักหมุดจุดนัดหมาย",
    },
    {
      pageNumber: "หน้า 5",
      title: "ขั้นตอนที่ 3: ยืนยันรายการจอง",
      path: "/booking/checkout",
      description: "ตรวจสอบรายละเอียดและบันทึกรายการลงฐานข้อมูล",
    },
    {
      pageNumber: "หน้า 6",
      title: "ยืนยันรายการจอง",
      path: "/booking/payment",
      description: "เส้นทางเดิมจะนำไปยังหน้าตรวจสอบและบันทึกรายการจอง",
    },
    {
      pageNumber: "หน้า 7",
      title: "แชทพูดคุยส่วนตัว & ข้อเสนอในแชท",
      path: "/messages",
      description: "แชทสนทนากับช่าง, การ์ดสรุปข้อตกลงบริการ, ปุ่มชำระเงิน",
    },
    {
      pageNumber: "หน้า 8",
      title: "ติดตามงานและตรวจรับงาน",
      path: "/tracking",
      description: "ติดตามรายการจองจากฐานข้อมูลและเปลี่ยนสถานะงาน",
    },
    {
      pageNumber: "หน้า 9",
      title: "รายการงานที่ติดตาม",
      path: "/tracking",
      description: "เลือกรายการจองเพื่อดูสถานะและหลักฐานส่งมอบ",
    },
    {
      pageNumber: "หน้า 10",
      title: "โปรไฟล์และข้อมูลส่วนตัว",
      path: "/profile",
      description: "ข้อมูลที่อยู่, ข้อมูลภาษี, ความสนใจ, ฟีดรีวิวสาธารณะ",
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-orange-500 text-white rounded-full shadow-xl border border-zinc-700/50 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-orange-400" />
          <span>สารบัญหน้าจอ (10 หน้า)</span>
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
        </button>
      )}

      {/* Navigator Drawer Modal */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-zinc-300 w-80 sm:w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-zinc-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-bold">สารบัญหน้าจอทั้งหมด</h3>
                <p className="text-[10px] text-zinc-400">
                  คลิกเพื่อเปลี่ยนหน้าไปดูผลงานทันที (10 หน้า)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Page Links List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 p-2">
            {pages.map((p, idx) => {
              const isActive = pathname === p.path;
              return (
                <Link
                  key={idx}
                  href={p.path}
                  onClick={() => setIsOpen(false)}
                  className={`p-2.5 rounded-xl flex items-start justify-between gap-2 transition-all block ${
                    isActive
                      ? "bg-orange-50 text-orange-950 border border-orange-200"
                      : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {p.pageNumber}
                      </span>
                      <span className="text-xs font-bold leading-snug">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {p.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-1 ${
                      isActive ? "text-orange-500" : "text-zinc-300"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-400 text-center">
            sarapatrabchang • Next.js Frontend Modular Architecture
          </div>
        </div>
      )}
    </div>
  );
}

