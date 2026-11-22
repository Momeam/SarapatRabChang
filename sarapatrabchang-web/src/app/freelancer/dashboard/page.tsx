"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import { ProviderDashboard } from "@/types";
import { Booking, bookingStatusLabels } from "@/lib/booking";

interface FinanceResponse {
  balance: {
    availableBalance: number;
    totalEarnings: number;
    kycStatus: string;
  };
}

export default function FreelancerDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [orders, setOrders] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<ProviderDashboard>("/api/provider/dashboard").catch(() => null),
      requestApi<FinanceResponse>("/api/provider/finance").catch(() => null),
      requestApi<Booking[]>("/api/bookings").catch(() => []),
    ])
      .then(([dashData, finData, bookingsData]) => {
        if (!active) return;
        setDashboard(dashData);
        setFinance(finData);
        setOrders(bookingsData.filter((b) => b.viewerRole === "provider"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user?.email ?? "ฟรีแลนซ์";

  const kycStatus =
    finance?.balance.kycStatus?.toLowerCase() ??
    dashboard?.stats.kycStatus?.toLowerCase() ??
    "unverified";
  const isApproved = kycStatus === "approved" || kycStatus === "verified";
  const activeServicesCount =
    dashboard?.services.filter((s) => s.status.toLowerCase() === "active").length ?? 0;
  const activeOrdersCount = orders.filter((o) =>
    ["paid", "in_progress", "delivered"].includes(o.status)
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#171717] to-black border border-gray-800 rounded-xl p-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            ยินดีต้อนรับกลับมา, {displayName}!
          </h1>
          <p className="text-gray-400 text-sm">นี่คือสรุปภาพรวมงานและการเงินจากฐานข้อมูลของคุณ</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            href={isApproved ? "/provider/services/new" : "/freelancer/profile"}
            className="bg-[#f97316] hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-lg shadow-[#f97316]/20"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            {isApproved ? "สร้างประกาศบริการใหม่" : "ยืนยันตัวตนเพื่อเริ่มสร้างบริการ"}
          </Link>
        </div>
      </div>

      {/* KYC Status Alert Banner */}
      {isApproved ? (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-8 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <i className="fa-solid fa-shield-check text-xl mr-3"></i>
            <span>
              บัญชีของคุณได้รับการยืนยันตัวตน (KYC) เรียบร้อยแล้ว สามารถรับงานและถอนเงินได้ตามปกติ
            </span>
          </div>
          <Link
            href="/freelancer/profile"
            className="text-xs border border-green-500/40 px-3 py-1 rounded hover:bg-green-500/20 transition"
          >
            ดูสถานะ KYC
          </Link>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center">
            <i className="fa-solid fa-triangle-exclamation text-xl mr-3 text-amber-400"></i>
            <span>
              {kycStatus === "pending"
                ? "คำขอยืนยันตัวตนเป็นฟรีแลนซ์ของคุณอยู่ระหว่างรอแอดมินตรวจสอบและกดยืนยันอนุมัติ"
                : "คุณยังไม่ได้ยืนยันตัวตนเป็นฟรีแลนซ์ กรุณากรอกแบบฟอร์มและส่งคำขอ KYC ก่อนเริ่มสร้างประกาศและรับงาน"}
            </span>
          </div>
          <Link
            href="/freelancer/profile"
            className="text-xs bg-[#f97316] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#ea580c] transition shrink-0"
          >
            {kycStatus === "pending" ? "ดูสถานะคำขอ KYC" : "ไปหน้าแบบฟอร์มยืนยันตัวตน"}
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">รายได้พร้อมถอน</p>
            <i className="fa-solid fa-wallet text-[#f97316]"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            ฿ {(finance?.balance.availableBalance ?? 0).toLocaleString("th-TH")}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            รายได้สะสมทั้งหมด ฿ {(finance?.balance.totalEarnings ?? 0).toLocaleString("th-TH")}
          </p>
          <Link
            href="/freelancer/wallet"
            className="text-[#f97316] text-xs flex justify-between items-center hover:underline"
          >
            ถอนเงินเข้าบัญชี <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">งานที่กำลังดำเนินการ</p>
            <i className="fa-solid fa-spinner text-yellow-500"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{activeOrdersCount}</h3>
          <p className="text-xs text-gray-500 mb-4">จากงานทั้งหมด {orders.length} รายการ</p>
          <Link
            href="/freelancer/orders"
            className="text-[#f97316] text-xs flex justify-between items-center hover:underline"
          >
            ไปที่ห้องทำงาน (Workspace) <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">บริการที่เปิดขายอยู่</p>
            <i className="fa-solid fa-store text-blue-400"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{activeServicesCount}</h3>
          <p className="text-xs text-green-500 mb-4">
            จากประกาศทั้งหมด {dashboard?.services.length ?? 0} รายการ
          </p>
          <Link
            href="/freelancer/services"
            className="text-[#f97316] text-xs flex justify-between items-center hover:underline"
          >
            จัดการบริการ <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">คะแนนรีวิวเฉลี่ย</p>
            <i className="fa-solid fa-star text-yellow-400"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1 flex items-baseline">
            {(dashboard?.stats.averageRating ?? 0).toFixed(1)}{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">/ 5.0</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            จากทั้งหมด {dashboard?.stats.reviewCount ?? 0} รีวิว
          </p>
          <Link
            href="/profile"
            className="text-[#f97316] text-xs flex justify-between items-center hover:underline"
          >
            อ่านรีวิวจากลูกค้า <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      {/* Recent Active Orders */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl mb-8 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/40">
          <h2 className="text-lg font-semibold text-white border-l-4 border-[#f97316] pl-2">
            งานที่ได้รับล่าสุด (Recent Orders)
          </h2>
          <Link href="/freelancer/orders" className="text-gray-400 hover:text-[#f97316] text-sm">
            ดูงานทั้งหมด <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30">
                <th className="p-4 font-medium border-b border-gray-800">ออเดอร์ ID</th>
                <th className="p-4 font-medium border-b border-gray-800">ชื่องาน / บริการ</th>
                <th className="p-4 font-medium border-b border-gray-800">ลูกค้า</th>
                <th className="p-4 font-medium border-b border-gray-800">วันนัดหมาย</th>
                <th className="p-4 font-medium border-b border-gray-800">ราคางาน</th>
                <th className="p-4 font-medium border-b border-gray-800">สถานะ</th>
                <th className="p-4 font-medium border-b border-gray-800 text-right pr-6">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    กำลังโหลดรายการงาน...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    ยังไม่มีรายการงานที่ได้รับ
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                    <td className="p-4 text-gray-400 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 font-medium text-white">{order.serviceTitle}</td>
                    <td className="p-4 text-gray-300">{order.contactName}</td>
                    <td className="p-4 text-gray-400">
                      {order.date.slice(0, 10)} ({order.timeSlot})
                    </td>
                    <td className="p-4 font-semibold text-white">
                      ฿ {order.price.toLocaleString("th-TH")}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-zinc-800 text-orange-400 border border-zinc-700">
                        {bookingStatusLabels[order.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href="/freelancer/orders"
                        className="px-3 py-1.5 text-xs bg-[#f97316]/10 border border-[#f97316] text-[#f97316] rounded-lg hover:bg-[#f97316] hover:text-white transition inline-flex items-center"
                      >
                        <i className="fa-regular fa-comments mr-1.5"></i> ห้องทำงาน
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
