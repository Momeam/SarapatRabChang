"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  Search,
  Sparkles,
  Wrench,
  Truck,
  Tv,
  Users,
  Trees,
  Shirt,
  LayoutGrid,
  CheckCircle2,
  Star,
  ArrowRight,
} from "lucide-react";
import { mockProviders, mockCategories } from "@/data/mockData";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState("ห้วยขวาง, กรุงเทพมหานคร");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      case "Wrench":
        return <Wrench className="w-6 h-6" />;
      case "Truck":
        return <Truck className="w-6 h-6" />;
      case "Tv":
        return <Tv className="w-6 h-6" />;
      case "Users":
        return <Users className="w-6 h-6" />;
      case "Trees":
        return <Trees className="w-6 h-6" />;
      case "Shirt":
        return <Shirt className="w-6 h-6" />;
      default:
        return <LayoutGrid className="w-6 h-6" />;
    }
  };

  const filteredProviders = mockProviders.filter((p) => {
    if (selectedCategory !== "all" && p.categoryKey !== selectedCategory) {
      return false;
    }
    if (
      searchQuery &&
      !p.name.includes(searchQuery) &&
      !p.serviceTitle.includes(searchQuery) &&
      !p.category.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero & Search Section */}
        <div className="space-y-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-orange-600 mb-1">
              สวัสดี คุณพิมพ์ชนก วันนี้ให้เราช่วยอะไรดี?
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
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
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
                  <option value="maid">แม่บ้าน</option>
                  <option value="electrician">ช่างไฟ/ประปา</option>
                  <option value="moving">ขนย้าย</option>
                  <option value="gardening">จัดสวน</option>
                  <option value="appliance">ซ่อมเครื่องใช้ไฟฟ้า</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2 pt-0 md:pt-5">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหา</span>
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

        {/* Categories Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">
            เลือกบริการที่คุณต้องการ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {mockCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm scale-102"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-orange-300 hover:bg-orange-50/50"
                  }`}
                >
                  <div
                    className={`${
                      isSelected ? "text-white" : "text-zinc-600 group-hover:text-orange-500"
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended Providers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                ผู้ให้บริการแนะนำใกล้คุณ
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                ผู้ให้บริการที่ได้รับรีวิวดี พร้อมดูแลงานของคุณ
              </p>
            </div>
            <Link
              href="/services/cleaning"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col"
              >
                {/* Image / Header area */}
                <div className="relative h-44 bg-zinc-100 overflow-hidden">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-zinc-800 shadow-sm backdrop-blur-xs">
                      {provider.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-zinc-900 text-base leading-snug">
                        {provider.name}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-600 font-medium line-clamp-1">
                      {provider.serviceTitle}
                    </p>

                    {/* Rating & Verified */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-zinc-900">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{provider.rating.toFixed(1)}</span>
                        <span className="text-zinc-400 font-normal">
                          ({provider.reviewCount} รีวิว)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ยืนยันตัวตนแล้ว</span>
                    </div>

                    {/* Location Zones */}
                    <p className="text-[11px] text-zinc-400 line-clamp-1 pt-1">
                      {provider.serviceAreas.join(" • ")}
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        เริ่มต้น
                      </span>
                      <span className="text-lg font-extrabold text-zinc-900">
                        ฿{provider.startingPrice.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/services/${provider.id}`}
                      className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
                    >
                      จ้างงาน
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
