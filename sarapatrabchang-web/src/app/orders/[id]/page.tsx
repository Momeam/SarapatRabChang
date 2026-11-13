"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusStepper from "@/components/orders/OrderStatusStepper";
import DeliveryProofGallery from "@/components/orders/DeliveryProofGallery";
import WorkApprovalCard from "@/components/orders/WorkApprovalCard";
import OrderSidebarSummary from "@/components/orders/OrderSidebarSummary";
import { requestApi } from "@/lib/api";
import { Booking, BookingAction } from "@/lib/booking";

const bookingIdPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

export default function OrderTrackingPage() {
  const params = useParams();
  const jobId = typeof params?.id === "string" ? params.id : "";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchBooking = useCallback(() => {
    if (!bookingIdPattern.test(jobId)) {
      return Promise.reject(new Error("ไม่พบรายการจองนี้ กรุณาเลือกจากรายการติดตามงาน"));
    }
    return requestApi<Booking>(`/api/bookings/${encodeURIComponent(jobId)}`);
  }, [jobId]);

  useEffect(() => {
    let active = true;
    fetchBooking()
      .then((result) => {
        if (active) setBooking(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "โหลดข้อมูลการจองไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchBooking]);

  const handleAction = async (
    action: BookingAction,
    note = "",
    photoUrls: string[] = [],
  ) => {
    if (!booking) return;
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await requestApi<Booking>(
        `/api/bookings/${encodeURIComponent(booking.id)}/actions`,
        {
          method: "POST",
          body: JSON.stringify({ action, note, photoUrls }),
        },
      );
      setBooking(result);
      setNotice(
        action === "dispute"
          ? "บันทึกข้อพิพาทแล้ว ระบบนี้ยังไม่มีการตรวจสอบหรือคืนเงินจริง"
          : action === "approve"
            ? "บันทึกการตรวจรับงานแล้ว ไม่มีการโอนเงินจริง"
            : action === "request_revision"
              ? "บันทึกคำขอแก้ไขและส่งสถานะกลับไปยังผู้ให้บริการแล้ว"
              : `บันทึกสถานะ “${result.status}” แล้ว`,
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "บันทึกการดำเนินการไม่สำเร็จ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าแรก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/tracking" className="hover:text-orange-600">ติดตามงาน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">รายละเอียดรายการจอง</span>
        </div>

        {isLoading ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดข้อมูลการจอง...
          </p>
        ) : !booking ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p role="alert" className="text-sm text-red-700">
              {error ?? "ไม่พบรายการจองนี้"}
            </p>
            {error?.includes("เข้าสู่ระบบ") && (
              <Link href="/auth" className="mt-3 inline-block font-semibold text-orange-600">
                เข้าสู่ระบบ
              </Link>
            )}
            <Link href="/tracking" className="mt-4 inline-block text-sm font-semibold text-orange-600">
              กลับไปหน้าติดตามงาน
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
                ติดตามงานและตรวจรับงาน
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                หมายเลขงาน <span className="font-mono font-semibold text-zinc-800">{booking.id}</span>
                {" • "}นัดหมาย {formatDate(booking.date)} เวลา {booking.timeSlot.replace("-", "–")} น.
              </p>
            </div>

            <OrderStatusStepper
              status={booking.status}
              createdAt={booking.createdAt}
              deliveredAt={booking.deliveredAt}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <DeliveryProofGallery
                  providerName={booking.providerName}
                  providerMessage={booking.deliveryNote}
                  deliveredAt={booking.deliveredAt}
                  photos={booking.deliveryPhotoUrls}
                />
                <WorkApprovalCard
                  providerName={booking.providerName}
                  amount={booking.price}
                  status={booking.status}
                  viewerRole={booking.viewerRole}
                  isSubmitting={isSubmitting}
                  error={error}
                  notice={notice}
                  onAction={handleAction}
                />
                {booking.statusNote && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    รายละเอียดสถานะ: {booking.statusNote}
                  </p>
                )}
              </div>
              <div className="lg:col-span-5">
                <OrderSidebarSummary booking={booking} />
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
