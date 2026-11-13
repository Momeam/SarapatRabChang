"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { requestApi } from "@/lib/api";
import { Booking, bookingStatusLabels } from "@/lib/booking";

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TrackingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(() => requestApi<Booking[]>("/api/bookings"), []);

  useEffect(() => {
    let active = true;
    fetchBookings()
      .then((result) => {
        if (active) setBookings(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "โหลดรายการจองไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchBookings]);

  const retry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBookings(await fetchBookings());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "โหลดรายการจองไม่สำเร็จ",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
          รายการติดตามงาน
        </h1>
        <p className="mt-2 mb-8 text-sm text-zinc-500">
          รายการจองที่คุณสร้างหรือรับเป็นผู้ให้บริการ
        </p>

        {isLoading ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดรายการจอง...
          </p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => void retry()} className="mt-3 font-semibold underline">
              ลองอีกครั้ง
            </button>
            {error.includes("เข้าสู่ระบบ") && (
              <Link href="/auth" className="ml-4 font-semibold underline">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            <p>ยังไม่มีรายการจอง</p>
            <Link href="/services" className="mt-3 inline-block font-semibold text-orange-600">
              เลือกบริการ
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/orders/${booking.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">
                      {booking.viewerRole === "customer" ? "ผู้ให้บริการ" : "ลูกค้า"}: {booking.viewerRole === "customer" ? booking.providerName : booking.contactName}
                    </p>
                    <h2 className="mt-1 font-bold text-zinc-900">{booking.serviceTitle}</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(booking.date)} • {booking.timeSlot.replace("-", "–")} น. • ฿{booking.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs font-semibold text-orange-700">{bookingStatusLabels[booking.status]}</span>
                    <p className="mt-1 font-mono text-[11px] text-zinc-400">{booking.id}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
