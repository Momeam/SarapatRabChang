"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { Booking, BookingStatus } from "@/lib/booking";
import { requestApi } from "@/lib/api";

type OrderTab = "all" | "pending" | "in_progress";

const statusLabels: Record<BookingStatus, string> = {
  pending_payment: "รอชำระเงิน",
  paid: "รอยืนยัน",
  in_progress: "กำลังดำเนินการ",
  delivered: "ส่งมอบแล้ว",
  completed: "เสร็จสมบูรณ์",
  disputed: "อยู่ระหว่างตรวจสอบ",
};

function formatBookingDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProviderOrdersTable() {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [orders, setOrders] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    requestApi<Booking[]>("/api/bookings")
      .then((result) => {
        if (active) setOrders(result.filter((booking) => booking.viewerRole === "provider"));
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "โหลดรายการงานไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") return order.status === "paid";
    if (activeTab === "in_progress") return order.status === "in_progress";
    return true;
  });
  const pendingCount = orders.filter((order) => order.status === "paid").length;
  const inProgressCount = orders.filter((order) => order.status === "in_progress").length;

  async function handleAcceptJob(id: string) {
    setAcceptingId(id);
    setError("");
    try {
      const updated = await requestApi<Booking>(
        `/api/bookings/${encodeURIComponent(id)}/actions`,
        {
          method: "POST",
          body: JSON.stringify({ action: "start_work" }),
        },
      );
      setOrders((current) =>
        current.map((order) => (order.id === id ? updated : order)),
      );
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "รับงานไม่สำเร็จ");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-950">รายการงานที่ได้รับ</h3>
            <span className="text-xs text-zinc-500">({orders.length} งาน)</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            ตรวจสอบรายละเอียดก่อนยืนยันการรับงาน
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
          {([
            ["all", `ทั้งหมด (${orders.length})`],
            ["pending", `รอยืนยัน (${pendingCount})`],
            ["in_progress", `กำลังดำเนินการ (${inProgressCount})`],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-6 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
            <tr>
              <th className="py-3 px-6">ผู้ว่าจ้าง</th>
              <th className="py-3 px-6">บริการ / แพ็กเกจ</th>
              <th className="py-3 px-6">วันและเวลานัดหมาย</th>
              <th className="py-3 px-6">สถานะงาน</th>
              <th className="py-3 px-6 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 px-6 text-center text-zinc-500">
                  กำลังโหลดรายการงาน...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-6 text-center text-zinc-500">
                  {orders.length === 0 ? "ยังไม่มีรายการงาน" : "ไม่มีงานในหมวดนี้"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-zinc-900 text-sm">{order.contactName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      ORD-{order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-zinc-800">{order.serviceTitle}</div>
                    <div className="text-zinc-500 mt-0.5">
                      {order.packageTitle} • ฿{order.price.toLocaleString("th-TH")}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-zinc-900">{formatBookingDate(order.date)}</div>
                    <div className="text-zinc-500 mt-0.5">{order.timeSlot}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                      order.status === "paid"
                        ? "bg-zinc-900 text-white"
                        : order.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                    }`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/provider/jobs/${encodeURIComponent(order.id)}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200"
                      >
                        ดูรายละเอียด
                      </Link>
                      {order.status === "paid" && (
                        <button
                          type="button"
                          disabled={acceptingId === order.id}
                          onClick={() => handleAcceptJob(order.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-950 hover:bg-orange-600 disabled:opacity-50 transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{acceptingId === order.id ? "กำลังรับงาน..." : "รับงาน"}</span>
                        </button>
                      )}
                      {order.status !== "pending_payment" && (
                        <Link
                          href={`/provider/jobs/${encodeURIComponent(order.id)}/chat`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200"
                        >
                          แชทลูกค้า
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-zinc-50/70 border-t border-zinc-200/80 flex items-center gap-2 text-xs text-zinc-500">
        <Info className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          ตรวจสอบขอบเขตงานและเวลานัดหมายก่อนรับงาน การเปลี่ยนสถานะจะบันทึกลงฐานข้อมูล แต่ไม่มีการชำระหรือโอนเงินจริง
        </span>
      </div>
    </div>
  );
}
