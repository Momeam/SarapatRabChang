"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import CheckoutSummary from "@/components/booking/CheckoutSummary";
import { clearBookingDraft, readBookingDraft, BookingDraft } from "@/lib/booking";
import { requestApi } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => readBookingDraft())
      .then((savedDraft) => {
        if (active) {
          setDraft(savedDraft);
          if (!savedDraft) setError("ไม่พบรายละเอียดการจอง กรุณาเลือกบริการใหม่");
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "อ่านรายละเอียดการจองไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleConfirmBooking = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const booking = await requestApi<{ id: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          providerId: draft.providerId,
          packageTitle: draft.packageTitle,
          date: draft.date,
          timeSlot: draft.timeSlot,
          customer: {
            contactName: draft.contactName,
            phone: draft.phone,
            address: draft.address,
            note: draft.note,
          },
        }),
      });
      clearBookingDraft();
      router.push(`/orders/${booking.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "บันทึกรายการจองไม่สำเร็จ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return `${day}/${month}/${year + 543}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/services" className="hover:text-orange-600">บริการยอดนิยม</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">ยืนยันรายการจอง</span>
        </div>

        <BookingStepper currentStep={3} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ตรวจสอบและยืนยันรายการจอง
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ระบบจะบันทึกรายการและสถานะลงฐานข้อมูล โดยยังไม่มีการชำระเงินจริง
          </p>
        </div>

        {isLoading ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดรายละเอียดการจอง...
          </p>
        ) : draft ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
              <h2 className="text-base font-bold text-zinc-900">ข้อมูลผู้ให้บริการ</h2>
              <p className="text-sm text-zinc-700">{draft.providerName}</p>
              <p className="text-sm font-semibold text-zinc-900">{draft.serviceTitle}</p>
              <p className="text-xs text-zinc-500">แพ็กเกจ {draft.packageTitle}</p>
            </div>
            <div className="lg:col-span-5">
              <CheckoutSummary
                onConfirm={handleConfirmBooking}
                isSubmitting={isSubmitting}
                providerName={draft.providerName}
                serviceTitle={draft.serviceTitle}
                packageTitle={draft.packageTitle}
                date={formatDate(draft.date)}
                timeSlot={draft.timeSlot.replace("-", "–")}
                address={draft.address}
                contactName={draft.contactName}
                phone={draft.phone}
                price={draft.price}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm text-red-700">{error}</p>
            <Link href="/services" className="mt-4 inline-block text-sm font-semibold text-orange-600">
              เลือกบริการ
            </Link>
          </div>
        )}

        {error && draft && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            {error.includes("เข้าสู่ระบบ") && (
              <Link href="/auth" className="mt-2 inline-block font-semibold underline">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-200">
          <Link
            href="/booking/details"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            กลับไปแก้ไขรายละเอียดงานและสถานที่
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
