"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import JobDetailsForm from "@/components/booking/JobDetailsForm";
import InteractiveMapPicker from "@/components/booking/InteractiveMapPicker";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function BookingDetailsPage() {
  const router = useRouter();

  const [jobNote, setJobNote] = useState("");
  const [contactName, setContactName] = useState("พิมพ์ชนก ใจดี");
  const [phone, setPhone] = useState("081 234 5678");
  const [addressDetail, setAddressDetail] = useState(
    "88/12 ซอยสุขุมวิท 39 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110"
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const pinAddress = "บริเวณซอยสุขุมวิท 39 เขตวัฒนา กรุงเทพฯ";
  const pinCoords = "13.7326, 100.5703";

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

        {/* Component: Stepper Progress */}
        <BookingStepper currentStep={2} />

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
          <div className="lg:col-span-7">
            <JobDetailsForm
              jobNote={jobNote}
              setJobNote={setJobNote}
              contactName={contactName}
              setContactName={setContactName}
              phone={phone}
              setPhone={setPhone}
              addressDetail={addressDetail}
              setAddressDetail={setAddressDetail}
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
            />
          </div>

          {/* Right Column: Map & Pinpoint */}
          <div className="lg:col-span-5">
            <InteractiveMapPicker
              pinAddress={pinAddress}
              pinCoords={pinCoords}
            />
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
