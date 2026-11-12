"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, ExternalLink, Check, Info } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  clientName: string;
  serviceTitle: string;
  packageDetails: string;
  date: string;
  time: string;
  status: "pending" | "in_progress";
}

const mockOrders: OrderItem[] = [
  {
    id: "ORD-0269-041",
    orderNumber: "ORD-0269-041",
    clientName: "อรทัย สุขใจ",
    serviceTitle: "ทำความสะอาดคอนโดและบ้าน",
    packageDetails: "คอนโดขนาดเล็ก • ฿650",
    date: "15 พ.ย. 2569",
    time: "09:00-12:00",
    status: "pending",
  },
  {
    id: "ORD-0269-040",
    orderNumber: "ORD-0269-040",
    clientName: "ธนพล มีสุข",
    serviceTitle: "ทำความสะอาดคอนโดและบ้าน",
    packageDetails: "คอนโดขนาดเล็ก • ฿650",
    date: "14 พ.ย. 2569",
    time: "09:00-12:00",
    status: "in_progress",
  },
  {
    id: "ORD-0269-039",
    orderNumber: "ORD-0269-039",
    clientName: "สุภาวดี โอเย็น",
    serviceTitle: "ทำความสะอาดก่อนย้ายเข้า",
    packageDetails: "ห้องพร้อมเข้าอยู่ • ฿1,200",
    date: "13 พ.ย. 2569",
    time: "09:00-14:00",
    status: "in_progress",
  },
  {
    id: "ORD-0269-038",
    orderNumber: "ORD-0269-038",
    clientName: "กิตติพงษ์ รุ่งเรือง",
    serviceTitle: "ทำความสะอาดคอนโดและบ้าน",
    packageDetails: "คอนโดขนาดเล็ก • ฿650",
    date: "12 พ.ย. 2569",
    time: "13:00-16:00",
    status: "in_progress",
  },
];

export default function ProviderOrdersTable() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress">("all");
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") return order.status === "pending";
    if (activeTab === "in_progress") return order.status === "in_progress";
    return true;
  });

  const handleAcceptJob = (id: string) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: "in_progress" as const } : o))
    );
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const inProgressCount = orders.filter((o) => o.status === "in_progress").length;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-950">รายการงานที่ได้รับ</h3>
            <span className="text-xs text-zinc-500">({orders.length} งานที่ต้องดูแล)</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            ตรวจสอบรายละเอียดก่อนยืนยันการรับงาน
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            ทั้งหมด ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            รอยืนยัน ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "in_progress"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            กำลังดำเนินการ ({inProgressCount})
          </button>
        </div>
      </div>

      {/* Table */}
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
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-zinc-900 text-sm">{order.clientName}</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{order.orderNumber}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-zinc-800">{order.serviceTitle}</div>
                  <div className="text-zinc-500 mt-0.5">{order.packageDetails}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium text-zinc-900">{order.date}</div>
                  <div className="text-zinc-500 mt-0.5">{order.time}</div>
                </td>
                <td className="py-4 px-6">
                  {order.status === "pending" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-900 text-white">
                      รอยืนยัน
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      กำลังดำเนินการ
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/provider/jobs/${order.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200"
                    >
                      ดูรายละเอียด
                    </Link>

                    {order.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => handleAcceptJob(order.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-950 hover:bg-orange-600 transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>รับงาน</span>
                      </button>
                    ) : (
                      <Link
                        href={`/provider/jobs/${order.id}?tab=chat`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200 inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                        <span>แชทลูกค้า</span>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notice footer */}
      <div className="p-4 bg-zinc-50/70 border-t border-zinc-200/80 flex items-center gap-2 text-xs text-zinc-500">
        <Info className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          ตรวจสอบขอบเขตงานและเวลานัดหมายก่อนรับงาน หากมีข้อสงสัยสามารถพูดคุยกับลูกค้าได้จากรายละเอียดงาน
        </span>
      </div>
    </div>
  );
}

