"use client";

import { MapPin, Search } from "lucide-react";
import { ServiceCategory } from "@/types";

interface HeroSearchProps {
  location: string;
  setLocation: (loc: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: ServiceCategory[];
  onSearch: () => void;
  isSearching: boolean;
  userName?: string;
}

export default function HeroSearch({
  location,
  setLocation,
  selectedCategory,
  setSelectedCategory,
  categories,
  onSearch,
  isSearching,
  userName = "คุณพิมพ์ชนก",
}: HeroSearchProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs sm:text-sm font-medium text-orange-600 mb-1">
          สวัสดี {userName} วันนี้ให้เราช่วยอะไรดี?
        </p>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
          ค้นหาช่างและผู้ช่วยมืออาชีพใกล้บ้านคุณ
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 mt-2">
          เลือกบริการที่ต้องการ เปรียบเทียบผู้ให้บริการ และจองเวลาที่สะดวก
        </p>
      </div>

      {/* Search Box Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Location Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              พื้นที่ให้บริการ
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-orange-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ระบุเขต, ถนน หรือจังหวัด"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              หมวดหมู่บริการ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="all">เลือกหมวดหมู่บริการ (ทั้งหมด)</option>
              {categories
                .filter((category) => category.id !== "all")
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 pt-0 md:pt-5">
            <button
              type="button"
              onClick={onSearch}
              disabled={isSearching}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? "กำลังค้นหา..." : "ค้นหา"}</span>
            </button>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">ค้นหายอดนิยม:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("maid")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            ทำความสะอาดคอนโด
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("electrician")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            ซ่อมแอร์
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("moving")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            ย้ายหอพัก
          </button>
        </div>
      </div>
    </div>
  );
}

