"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Check,
  MapPin,
  Search,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Info,
  Lock,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

export default function BookingDetailsPage() {
  const router = useRouter();

  // Form states
  const [jobNote, setJobNote] = useState("");
  const [contactName, setContactName] = useState("พิมพ์ชนก ใจดี");
  const [phone, setPhone] = useState("081 234 5678");
  const [addressDetail, setAddressDetail] = useState(
    "88/12 ซอยสุขุมวิท 39 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110"
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pinAddress, setPinAddress] = useState(
    "บริเวณซอยสุขุมวิท 39 เขตวัฒนา กรุงเทพฯ"
  );
  const [pinCoords, setPinCoords] = useState("13.7326, 100.5703");

  const handleNext = () => {
    router.push("/booking/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าหลัก
          </Link>
          <span>/</span>
          <Link href="/services/cleaning" className="hover:text-orange-600">
            บริการช่างและแม่บ้าน
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">รายละเอียดการจอง</span>
        </div>

        {/* Stepper Progress */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-center max-w-xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">เลือกบริการ</span>
            </div>

            <div className="flex-1 h-0.5 bg-orange-500 mx-3"></div>

            {/* Step 2 (Active) */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-950">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shadow-xs">
                2
              </div>
              <span>รายละเอียดงานและสถานที่</span>
            </div>

            <div className="flex-1 h-0.5 bg-zinc-200 mx-3"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center text-xs border border-zinc-200">
                3
              </div>
              <span className="hidden sm:inline">ชำระเงิน</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ระบุรายละเอียดงานและสถานที่ให้บริการ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            แจ้งรายละเอียดให้ช่างเตรียมตัว พร้อมระบุที่อยู่และปักหมุดให้ตรงกัน
          </p>
        </div>

        {/* Two-Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Job Details Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900">
                  รายละเอียดงานเพิ่มเติม / หมายเหตุถึงช่าง
                </label>
                <span className="text-xs text-zinc-400">
                  {jobNote.length} / 500
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={jobNote}
                onChange={(e) => setJobNote(e.target.value)}
                placeholder="เช่น แอร์อยู่ชั้น 2 มีน้ำหยด หรือมีข้อควรทราบก่อนเข้าบริการ เช่น มีสัตว์เลี้ยง หรือจุดจอดรถ"
                className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-zinc-400"
              />

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  อัปโหลดรูปภาพบริเวณที่ต้องการให้ทำงาน (ถ้ามี)
                </label>
                <label className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all text-center group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const names = Array.from(e.target.files).map((f) => f.name);
                        setUploadedImages((prev) => [...prev, ...names].slice(0, 5));
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 transition-colors mb-2" />
                  <span className="text-xs font-semibold text-zinc-700">
                    คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1">
                    JPG, PNG สูงสุด 5 รูป • ไม่เกิน 10 MB ต่อรูป
                  </span>
                </label>

                {uploadedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedImages.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information & Address */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900">
                ข้อมูลติดต่อและที่อยู่
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    ชื่อผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  ที่อยู่โดยละเอียด (บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล)
                </label>
                <textarea
                  rows={3}
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  ข้อมูลนี้ใช้สำหรับติดต่อและเข้ารับบริการตามการจองเท่านั้น
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Map & Pinpoint */}
          <div className="lg:col-span-5 space-y-4">
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
                {/* SVG Map Grid Background Pattern */}
                <svg
                  className="absolute inset-0 w-full h-full text-zinc-200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="map-grid"
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
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                  {/* Road Lines */}
                  <path
                    d="M 0 100 Q 150 120 400 90"
                    stroke="#e4e4e7"
                    strokeWidth="14"
                  />
                  <path
                    d="M 180 0 L 180 300"
                    stroke="#e4e4e7"
                    strokeWidth="12"
                  />
                  <path
                    d="M 80 200 L 350 200"
                    stroke="#fdba74"
                    strokeWidth="8"
                  />
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
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/services/cleaning"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้ารายละเอียดบริการ</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="text-center sm:text-right text-xs">
              <span className="font-semibold text-zinc-900 block">
                ขั้นตอนถัดไป: ตรวจสอบและชำระเงิน
              </span>
              <span className="text-[11px] text-zinc-400">
                ยังไม่มีการเรียกเก็บเงินในขั้นตอนนี้
              </span>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto py-2.5 px-6 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>ดำเนินการต่อเพื่อชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

