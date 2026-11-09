"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EscrowBadge from "@/components/EscrowBadge";
import StarRating from "@/components/StarRating";
import { mockProviders } from "@/data/mockData";
import {
  Heart,
  Clock,
  CheckCircle2,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  Briefcase,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = (params?.id as string) || "cleaning";

  const provider =
    mockProviders.find((p) => p.id === providerId) || mockProviders[0];

  const [activeTab, setActiveTab] = useState<"details" | "portfolio">("details");
  const [isSaved, setIsSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-11-10");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00-12:00");

  const handleBooking = () => {
    router.push("/booking/details");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/" className="hover:text-orange-600 transition-colors">
            {provider.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">
            {provider.serviceTitle}
          </span>
        </nav>

        {/* Provider Profile Header Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-zinc-100"
                />
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    {provider.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ยืนยันตัวตนแล้ว
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  {provider.serviceTitle}
                </h1>
                <p className="text-sm font-semibold text-zinc-700">
                  {provider.name}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-1 font-semibold text-zinc-900">
                    <StarRating value={provider.rating} size="sm" />
                    <span>{provider.rating.toFixed(1)}</span>
                    <span className="text-zinc-400 font-normal">
                      ({provider.reviewCount} รีวิว)
                    </span>
                  </div>
                  <span>•</span>
                  <span>ให้บริการแล้ว {provider.completedJobs} งาน</span>
                  <span>•</span>
                  <span>{provider.serviceAreas.join(" · ")}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center sm:flex-col items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSaved
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isSaved ? "fill-rose-500 text-rose-500" : "text-zinc-500"
                  }`}
                />
                <span>{isSaved ? "บันทึกแล้ว" : "บันทึกบริการ"}</span>
              </button>
              <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                <Clock className="w-3.5 h-3.5" />
                <span>{provider.responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "details"
                    ? "text-orange-600 border-b-2 border-orange-500 -mb-[2px]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                ดูรายละเอียดบริการ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("portfolio")}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "portfolio"
                    ? "text-orange-600 border-b-2 border-orange-500 -mb-[2px]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                ผลงานที่ผ่านมา ({provider.portfolio.length})
              </button>
            </div>

            {/* Tab: Details */}
            {activeTab === "details" && (
              <div className="space-y-8">
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
                      <span>มีอุปกรณ์ให้พร้อม</span>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center gap-2.5 text-xs font-semibold text-zinc-800">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>บริการ {provider.workingHours}</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Section Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-zinc-900">
                      ผลงานที่ผ่านมา
                    </h3>
                    <span className="text-xs text-zinc-400">
                      ภาพตัวอย่างจากงานจริง
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {provider.portfolio.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs group"
                      >
                        <div className="h-28 bg-zinc-100 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-[11px] font-medium text-zinc-700 line-clamp-1">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    ))}
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

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <h3 className="text-base font-bold text-zinc-900">
                      รีวิวจากผู้ใช้บริการ
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                      <StarRating value={provider.rating} size="sm" />
                      <span>{provider.rating.toFixed(1)} จาก {provider.reviewCount} รีวิว</span>
                    </div>
                  </div>

                  {/* Sample Review */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-zinc-900">
                        พิมพ์ชนก ส.
                      </span>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <StarRating value={5} size="sm" />
                        <span>• 24 ต.ค. 2569</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      มาตรงเวลา อุปกรณ์ครบ ทำความสะอาดละเอียดมาก โดยเฉพาะครัวและห้องน้ำ
                      ห้องสะอาดน่าอยู่ขึ้นเยอะค่ะ จะกลับมาใช้บริการอีกแน่นอน
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Portfolio */}
            {activeTab === "portfolio" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {provider.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
                  >
                    <div className="h-48 bg-zinc-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-zinc-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        ไฟล์แนบ: {item.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Pricing & Booking Card */}
          <div className="lg:col-span-5 sticky top-24">
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
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
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
                    onClick={handleBooking}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

