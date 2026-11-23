"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import JobDetailsForm from "@/components/booking/JobDetailsForm";
import InteractiveMapPicker from "@/components/booking/InteractiveMapPicker";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { readBookingDraft, saveBookingDraft } from "@/lib/booking";
import { requestApi } from "@/lib/api";
import type { AccountProfile } from "@/lib/profile";

export default function BookingDetailsPage() {
  const router = useRouter();

  const [jobNote, setJobNote] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pinAddress, setPinAddress] = useState("บริเวณซอยสุขุมวิท 39 เขตวัฒนา กรุงเทพฯ");
  const [pinCoords, setPinCoords] = useState("13.7326, 100.5703");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => readBookingDraft())
      .then((draft) => {
        if (!active) return;
        if (draft) {
          setJobNote(draft.note);
          setContactName(draft.contactName);
          setPhone(draft.phone);
          setAddressDetail(draft.address);
          setUploadedImages(draft.uploadedImages ?? []);
          setPinAddress(
            draft.pinAddress || draft.address || "บริเวณซอยสุขุมวิท 39 เขตวัฒนา กรุงเทพฯ",
          );
          setPinCoords(draft.pinCoords || "13.7326, 100.5703");
        }
        setIsDraftLoaded(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setBookingError(
          error instanceof Error ? error.message : "อ่านรายละเอียดการจองไม่สำเร็จ",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  // Auto-fill empty contact fields from user's saved profile
  useEffect(() => {
    if (!isDraftLoaded) return;
    let active = true;
    Promise.resolve()
      .then(() => readBookingDraft())
      .then((draft) => {
        if (draft?.contactName && draft.phone && draft.address) return null;
        return requestApi<AccountProfile>("/api/profile").catch(() => null);
      })
      .then((profile) => {
        if (!active || !profile) return;
        setContactName((prev) => prev || profile.fullName || "");
        setPhone((prev) => prev || profile.phone || "");
        setAddressDetail((prev) => prev || profile.address || "");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setBookingError(
          error instanceof Error ? error.message : "อ่านรายละเอียดการจองไม่สำเร็จ",
        );
      });
    return () => {
      active = false;
    };
  }, [isDraftLoaded]);

  // Persist draft fields automatically so going back/forward never loses images, map pin, or text
  useEffect(() => {
    if (!isDraftLoaded) return;
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!active) return;
        const draft = readBookingDraft();
        if (!draft) return;
        saveBookingDraft({
          ...draft,
          contactName,
          phone,
          address: addressDetail || pinAddress,
          note: jobNote,
          pinAddress,
          pinCoords,
          uploadedImages,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setBookingError(
          error instanceof Error ? error.message : "บันทึกรายละเอียดการจองไม่สำเร็จ",
        );
      });
    return () => {
      active = false;
    };
  }, [
    isDraftLoaded,
    jobNote,
    contactName,
    phone,
    addressDetail,
    pinAddress,
    pinCoords,
    uploadedImages,
  ]);

  const handleLocationSelect = useCallback((selectedAddr: string, lat: number, lng: number) => {
    const nextCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setPinAddress(selectedAddr);
    setPinCoords(nextCoords);
    setAddressDetail((prev) => (!prev || prev === pinAddress ? selectedAddr : prev));
  }, [pinAddress]);

  const handleNext = () => {
    try {
      const draft = readBookingDraft();
      if (!draft) throw new Error("ไม่พบรายการบริการ กรุณาเลือกบริการก่อน");
      if (phone && !/^0\d{9}$/.test(phone)) {
        throw new Error("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0 (เช่น 0812345678)");
      }
      saveBookingDraft({
        ...draft,
        contactName,
        phone,
        address: addressDetail || pinAddress,
        note: jobNote,
        pinAddress,
        pinCoords,
        uploadedImages,
      });
      setBookingError(null);
      router.push("/booking/checkout");
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "บันทึกรายละเอียดการจองไม่สำเร็จ",
      );
    }
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
          <Link href="/" className="hover:text-orange-600">
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
              formAddress={addressDetail}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้ารายละเอียดบริการ</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="text-center sm:text-right text-xs">
              <span className="font-semibold text-zinc-900 block">
                ขั้นตอนถัดไป: ตรวจสอบรายการจอง
              </span>
              <span className="text-[11px] text-zinc-400">
                ขั้นตอนนี้ยังไม่มีการชำระเงินจริง
              </span>
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isDraftLoaded}
              className="w-full sm:w-auto py-2.5 px-6 bg-zinc-950 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>
                {isDraftLoaded
                  ? "ดำเนินการต่อเพื่อตรวจสอบรายการ"
                  : "กำลังโหลดรายละเอียด..."}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {bookingError && (
            <p role="alert" className="mt-3 text-xs text-red-600">
              {bookingError}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
