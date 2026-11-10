"use client";

import { MapPin, Search, Navigation, Info, Plus, Minus } from "lucide-react";

interface InteractiveMapPickerProps {
  pinAddress: string;
  pinCoords: string;
}

export default function InteractiveMapPicker({
  pinAddress,
  pinCoords,
}: InteractiveMapPickerProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-zinc-900">
          ปักหมุดจุดนัดหมายบนแผนที่
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          ระบุจุดนัดหมายให้ใกล้ทางเข้าที่พักมากที่สุด
        </p>
      </div>

      {/* Location Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="ค้นหาสถานที่ หรือชื่ออาคาร"
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {/* Mock Map Canvas */}
      <div className="relative h-64 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 flex items-center justify-center select-none">
        <svg
          className="absolute inset-0 w-full h-full text-zinc-200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="map-grid-picker"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#map-grid-picker)" />
          {/* Road Lines */}
          <path
            d="M 0 100 Q 150 120 400 90"
            stroke="#e4e4e7"
            strokeWidth="14"
          />
          <path d="M 180 0 L 180 300" stroke="#e4e4e7" strokeWidth="12" />
          <path d="M 80 200 L 350 200" stroke="#fdba74" strokeWidth="8" />
        </svg>

        {/* Street Labels */}
        <span className="absolute top-12 left-10 text-[10px] font-bold text-zinc-400 bg-white/80 px-1 rounded">
          ซอยสุขุมวิท 39
        </span>
        <span className="absolute bottom-10 left-6 text-[10px] font-bold text-zinc-400 bg-white/80 px-1 rounded">
          ถนนสุขุมวิท
        </span>
        <span className="absolute bottom-6 right-6 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
          BTS พร้อมพงษ์
        </span>

        {/* Map Center Pin */}
        <div className="relative z-10 flex flex-col items-center animate-bounce">
          <div className="px-2.5 py-1 bg-zinc-950 text-white text-[10px] font-semibold rounded-md shadow-md mb-1 whitespace-nowrap">
            จุดนัดหมายของคุณ
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg ring-4 ring-orange-500/30">
            <MapPin className="w-5 h-5 fill-white text-orange-500" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden">
          <button
            type="button"
            className="p-1.5 hover:bg-zinc-100 text-zinc-600 border-b border-zinc-100"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-zinc-100 text-zinc-600"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scale */}
        <span className="absolute bottom-2 left-2 text-[9px] text-zinc-400 font-mono">
          100 ม.
        </span>
      </div>

      {/* Use My Location Button */}
      <button
        type="button"
        className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl border border-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Navigation className="w-3.5 h-3.5 text-orange-500" />
        <span>ใช้ตำแหน่งปัจจุบันของฉัน</span>
      </button>

      {/* Pin Coordinates Card */}
      <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-800">
          <MapPin className="w-3.5 h-3.5 text-orange-500" />
          <span>สถานที่ปักหมุดปัจจุบัน</span>
        </div>
        <p className="text-xs text-zinc-600">{pinAddress}</p>
        <p className="text-[11px] text-zinc-400 font-mono">
          {pinCoords} • ชื่อสถานที่และพิกัดเป็นข้อมูลตัวอย่างประกอบ
        </p>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-zinc-500 leading-normal">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <span>
          โปรดตรวจสอบให้หมุดตรงกับที่อยู่ เพื่อให้ช่างเดินทางไปยังจุดนัดหมายได้ถูกต้อง
        </span>
      </div>
    </div>
  );
}

