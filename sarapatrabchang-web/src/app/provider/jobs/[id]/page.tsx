"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, MessageSquare } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import OrderStatusStepper from "@/components/orders/OrderStatusStepper";
import DeliveryProofGallery from "@/components/orders/DeliveryProofGallery";
import WorkApprovalCard from "@/components/orders/WorkApprovalCard";
import BookingChat from "@/components/orders/BookingChat";
import OrderSidebarSummary from "@/components/orders/OrderSidebarSummary";
import { requestApi } from "@/lib/api";
import { Booking, BookingAction, formatJobCode } from "@/lib/booking";

const bookingIdPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

export default function ProviderJobDetailPage() {
  const params = useParams();
  const jobId = typeof params?.id === "string" ? params.id : "";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchBooking = useCallback(() => {
    if (!bookingIdPattern.test(jobId)) {
      return Promise.reject(new Error("ไม่พบรายการงานนี้"));
    }
    return requestApi<Booking>(`/api/bookings/${encodeURIComponent(jobId)}`);
  }, [jobId]);

  useEffect(() => {
    let active = true;
    fetchBooking()
      .then((result) => {
        if (result.viewerRole !== "provider") {
          throw new Error("รายการนี้ไม่ใช่งานที่คุณรับเป็นผู้ให้บริการ");
        }
        if (active) setBooking(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "โหลดรายละเอียดงานไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchBooking]);

  useEffect(() => {
    if (booking && window.location.hash === "#chat") {
      document.getElementById("chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [booking]);

  async function retry() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchBooking();
      if (result.viewerRole !== "provider") {
        throw new Error("รายการนี้ไม่ใช่งานที่คุณรับเป็นผู้ให้บริการ");
      }
      setBooking(result);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "โหลดรายละเอียดงานไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAction(action: BookingAction, note = "", photoUrls: string[] = []) {
    if (!booking) return;
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await requestApi<Booking>(
        `/api/bookings/${encodeURIComponent(booking.id)}/actions`,
        {
          method: "POST",
          body: JSON.stringify({ action, note, photoUrls }),
        },
      );
      setBooking(updated);
      setNotice(
        action === "start_work"
          ? "บันทึกการเริ่มงานแล้ว"
          : action === "deliver"
            ? "บันทึกการส่งมอบงานแล้ว และแจ้งให้ผู้ว่าจ้างตรวจรับ"
            : `บันทึกสถานะ “${updated.status}” แล้ว`,
      );
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "บันทึกสถานะงานไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (value: string) =>
    new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/provider/dashboard" className="hover:text-orange-600">แดชบอร์ดผู้รับจ้าง</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/provider/jobs" className="hover:text-orange-600">รายการงาน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-mono font-medium">#{formatJobCode(jobId)}</span>
        </div>

        {isLoading ? (
          <p role="status" className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดรายละเอียดงาน...
          </p>
        ) : !booking ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p role="alert" className="text-sm text-red-700">{error ?? "ไม่พบรายการงานนี้"}</p>
            {error?.includes("เข้าสู่ระบบ") && (
              <Link href="/auth" className="mt-3 inline-block font-semibold text-orange-600">เข้าสู่ระบบ</Link>
            )}
            <div className="mt-4 flex gap-4 text-sm font-semibold">
              <button type="button" onClick={() => void retry()} className="text-orange-600">ลองอีกครั้ง</button>
              <Link href="/provider/jobs" className="text-zinc-600">กลับไปหน้ารายการงาน</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">รายละเอียดงานที่ได้รับ</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  {booking.serviceTitle} • นัดหมาย {formatDate(booking.date)} เวลา {booking.timeSlot.replace("-", "–")} น.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/provider/messages?bookingId=${encodeURIComponent(booking.id)}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs sm:text-sm border border-orange-200 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>แชทกับลูกค้า ({booking.contactName || "ผู้ว่าจ้าง"})</span>
                </Link>
              </div>
            </div>

            <OrderStatusStepper
              status={booking.status}
              createdAt={booking.createdAt}
              deliveredAt={booking.deliveredAt}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <WorkApprovalCard
                  providerName="คุณ"
                  amount={booking.price}
                  adminPromptPayPhone={booking.adminPromptPayPhone}
                  status={booking.status}
                  viewerRole="provider"
                  isSubmitting={isSubmitting}
                  error={error}
                  notice={notice}
                  onAction={handleAction}
                />
                <DeliveryProofGallery
                  providerName="คุณ"
                  providerMessage={booking.deliveryNote}
                  deliveredAt={booking.deliveredAt}
                  photos={booking.deliveryPhotoUrls}
                />
                <BookingChat
                  bookingId={booking.id}
                  viewerRole="provider"
                  isCompleted={booking.status === "completed"}
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
