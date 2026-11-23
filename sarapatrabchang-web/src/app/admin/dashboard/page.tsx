"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldAlert, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { requestApi } from "@/lib/api";

interface AdminDashboardData {
  totalUsers: number;
  pendingKyc: number;
  approvedKyc: number;
  totalBookings: number;
  totalVolume: number;
  completedBookings: number;
  pendingPayouts: number;
  paidAmount: number;
  trends: {
    weekly: DashboardTrendPoint[];
    monthly: DashboardTrendPoint[];
  };
  bookingStatuses: Array<{ status: string; count: number }>;
  recentKyc: Array<{
    id: string;
    userId: string;
    fullName: string;
    nationalId: string;
    categoryKey: string;
    categoryName: string | null;
    bankName: string;
    bankAccountNumber: string;
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    email: string;
    phone: string;
  }>;
}

interface DashboardTrendPoint {
  label: string;
  revenue: number;
  previousRevenue: number;
  bookings: number;
  previousBookings: number;
}

type TrendMetric = "revenue" | "bookings";

const bookingStatusLabels: Record<string, string> = {
  pending_payment: "รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
  in_progress: "กำลังดำเนินงาน",
  delivered: "ส่งมอบงานแล้ว",
  completed: "เสร็จสิ้น",
  disputed: "อยู่ระหว่างข้อพิพาท",
};

const bookingStatusColors: Record<string, string> = {
  pending_payment: "#f59e0b",
  paid: "#3b82f6",
  in_progress: "#8b5cf6",
  delivered: "#06b6d4",
  completed: "#10b981",
  disputed: "#f43f5e",
};

function getTrendValues(point: DashboardTrendPoint, metric: TrendMetric) {
  return metric === "revenue"
    ? [point.revenue, point.previousRevenue]
    : [point.bookings, point.previousBookings];
}

function formatTrendLabel(label: string, period: "weekly" | "monthly") {
  const date = new Date(`${label}${period === "monthly" ? "-02" : ""}T12:00:00`);
  return new Intl.DateTimeFormat("th-TH", {
    ...(period === "weekly" ? { day: "numeric", month: "short" } : { month: "short" }),
  }).format(date);
}

function formatAxisValue(value: number, metric: TrendMetric) {
  if (metric === "bookings") return Math.round(value).toLocaleString("th-TH");
  if (value >= 1000) return `฿${(value / 1000).toLocaleString("th-TH", { maximumFractionDigits: 1 })}k`;
  return `฿${Math.round(value).toLocaleString("th-TH")}`;
}

function TrendChart({
  points,
  metric,
  period,
}: {
  points: DashboardTrendPoint[];
  metric: TrendMetric;
  period: "weekly" | "monthly";
}) {
  const width = 640;
  const height = 220;
  const left = 58;
  const right = 624;
  const top = 14;
  const bottom = 174;
  const values = points.flatMap((point) => getTrendValues(point, metric));
  const maxValue = Math.max(1, ...values);
  const currentPoints: string[] = [];
  const previousPoints: string[] = [];
  const x = (index: number) =>
    points.length < 2 ? (left + right) / 2 : left + (index * (right - left)) / (points.length - 1);
  const y = (value: number) => bottom - (value / maxValue) * (bottom - top);

  points.forEach((point, index) => {
    const [current, previous] = getTrendValues(point, metric);
    currentPoints.push(`${x(index)},${y(current)}`);
    previousPoints.push(`${x(index)},${y(previous)}`);
  });

  const currentPath = currentPoints.length ? `M ${currentPoints.join(" L ")}` : "";
  const previousPath = previousPoints.length ? `M ${previousPoints.join(" L ")}` : "";
  const areaPath = currentPoints.length
    ? `${currentPath} L ${x(points.length - 1)},${bottom} L ${x(0)},${bottom} Z`
    : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-4 h-auto w-full min-w-[520px]"
      role="img"
      aria-label={metric === "revenue" ? "กราฟเปรียบเทียบมูลค่างาน" : "กราฟเปรียบเทียบจำนวนงานจอง"}
    >
      {[0, 1, 2, 3].map((step) => {
        const tickValue = (maxValue * step) / 3;
        const tickY = bottom - (tickValue / maxValue) * (bottom - top);
        return (
          <g key={step}>
            <line x1={left} x2={right} y1={tickY} y2={tickY} stroke="#303030" strokeDasharray="3 4" />
            <text x={left - 8} y={tickY + 4} textAnchor="end" fill="#858585" fontSize="10">
              {formatAxisValue(tickValue, metric)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="#3b82f6" fillOpacity="0.13" />
      <path d={previousPath} fill="none" stroke="#737373" strokeWidth="2" />
      <path d={currentPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      {points.map((point, index) => (
        <text
          key={point.label}
          x={x(index)}
          y={bottom + 22}
          textAnchor="middle"
          fill="#a3a3a3"
          fontSize="10"
        >
          {formatTrendLabel(point.label, period)}
        </text>
      ))}
    </svg>
  );
}

function TrendCard({
  title,
  metric,
  points,
  period,
}: {
  title: string;
  metric: TrendMetric;
  points: DashboardTrendPoint[];
  period: "weekly" | "monthly";
}) {
  const [currentTotal, previousTotal] = points.reduce(
    ([current, previous], point) => {
      const [currentValue, previousValue] = getTrendValues(point, metric);
      return [current + currentValue, previous + previousValue];
    },
    [0, 0],
  );
  const change = previousTotal === 0
    ? currentTotal === 0 ? "0.0%" : "ใหม่"
    : `${currentTotal >= previousTotal ? "+" : ""}${(((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)}%`;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-800 bg-[#171717] p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-gray-400">{title}</h2>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {metric === "revenue" ? "฿" : ""}{currentTotal.toLocaleString("th-TH")}
            </span>
            <span className={`text-xs font-semibold ${currentTotal >= previousTotal ? "text-emerald-400" : "text-rose-400"}`}>
              {change}
            </span>
            <span className="text-xs text-gray-500">เทียบกับ{period === "weekly" ? "สัปดาห์ก่อน" : "ช่วงเดียวกันปีก่อน"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-3 bg-blue-500" />{period === "weekly" ? "สัปดาห์นี้" : "12 เดือนล่าสุด"}</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-3 bg-neutral-500" />{period === "weekly" ? "สัปดาห์ก่อน" : "12 เดือนก่อนหน้า"}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TrendChart points={points} metric={metric} period={period} />
      </div>
    </section>
  );
}

function BookingStatusChart({ statuses }: { statuses: Array<{ status: string; count: number }> }) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  const segments = statuses
    .filter((item) => item.count > 0)
    .map((item, index, items) => ({
        ...item,
        color: bookingStatusColors[item.status] ?? "#a3a3a3",
        offset: (items.slice(0, index).reduce((sum, previous) => sum + previous.count, 0) / total) * 100,
      }));

  return (
    <section className="rounded-2xl border border-gray-800 bg-[#171717] p-5 shadow-lg">
      <div className="mb-5">
        <h2 className="text-base font-bold text-white">สัดส่วนสถานะงานจอง</h2>
        <p className="mt-1 text-xs text-gray-500">ข้อมูลทั้งหมดจากฐานข้อมูล</p>
      </div>
      {total === 0 ? (
        <div className="flex min-h-44 items-center justify-center text-sm text-gray-500">ยังไม่มีข้อมูลงานจอง</div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="กราฟวงกลมสัดส่วนสถานะงานจอง">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#303030" strokeWidth="16" />
              {segments.map((item) => {
                const circumference = 2 * Math.PI * 48;
                const length = (item.count / total) * circumference;
                return (
                  <circle
                    key={item.status}
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="16"
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-(item.offset / 100) * circumference}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{total.toLocaleString("th-TH")}</span>
              <span className="text-[11px] text-gray-500">งานทั้งหมด</span>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {segments.map((item) => (
              <div key={item.status} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 px-3 py-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-gray-300">
                  <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{bookingStatusLabels[item.status] ?? item.status}</span>
                </span>
                <span className="shrink-0 font-semibold text-white">
                  {item.count.toLocaleString("th-TH")} <span className="font-normal text-gray-500">({((item.count / total) * 100).toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<"weekly" | "monthly">("weekly");

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestApi<AdminDashboardData>("/api/admin/dashboard");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestApi<AdminDashboardData>("/api/admin/dashboard")
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pendingKycCount = data?.pendingKyc ?? 0;
  const totalUsers = data?.totalUsers ?? 0;
  const totalBookings = data?.totalBookings ?? 0;
  const totalVolume = data?.totalVolume ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      {/* Title & Super Admin Badge */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">ภาพรวมระบบ (Admin Dashboard)</h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-[#f97316] border border-orange-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              SUPER ADMIN • ระดับสูงสุด
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            ศูนย์กลางควบคุมและตรวจสอบระบบแพลตฟอร์มสารพัดรับจ้าง (SarapatRabChang)
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl text-zinc-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prominent Pending KYC Alert Banner */}
      {pendingKycCount > 0 && (
        <div className="mb-8 p-5 bg-gradient-to-r from-orange-950/60 to-zinc-900 border-2 border-orange-500/60 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                มีคำขอยืนยันตัวตนฟรีแลนซ์รอการตรวจสอบ {pendingKycCount} รายการ!
              </h3>
              <p className="text-xs text-orange-200/80 mt-0.5">
                ผู้ใช้กำลังรอให้แอดมินตรวจสอบเอกสารและกดยืนยันอนุมัติ เพื่อเปิดใช้งานบัญชีผู้ให้บริการ
              </p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-900/40 flex items-center gap-1.5 shrink-0"
          >
            ไปหน้าตรวจสอบ KYC ทันที
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Users */}
        <div className="bg-[#171717] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                ผู้ใช้งานทั้งหมด
              </p>
              <h3 className="text-3xl font-extrabold text-white">
                {isLoading ? "..." : totalUsers.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 mt-2">รวมผู้จ้างและผู้ให้บริการ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Freelancer KYC */}
        <Link
          href="/admin/users"
          className="bg-[#171717] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/60 transition shadow-lg group block"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1 group-hover:text-orange-400 transition-colors">
                รอตรวจสอบ KYC
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <h3 className="text-3xl font-extrabold text-orange-400">
                {isLoading ? "..." : pendingKycCount.toLocaleString()}
              </h3>
              <p className="text-[11px] text-orange-400/80 mt-2 font-medium">
                อนุมัติแล้ว {data?.approvedKyc ?? 0} คน
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-[#f97316] flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-500/20 transition">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Total Bookings */}
        <Link
          href="/admin/jobs"
          className="bg-[#171717] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition shadow-lg group block"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                งานจองในระบบ
              </p>
              <h3 className="text-3xl font-extrabold text-white">
                {isLoading ? "..." : totalBookings.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                เสร็จสิ้นแล้ว {data?.completedBookings ?? 0} งาน
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Platform Volume */}
        <div className="bg-[#171717] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                มูลค่าบริการรวม (GMV)
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400">
                ฿{isLoading ? "..." : totalVolume.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 mt-2">ยอดการจ้างงานทั้งหมด</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">แนวโน้มการจ้างงาน</h2>
            <p className="mt-1 text-xs text-gray-500">มูลค่าบริการและจำนวนงาน เปรียบเทียบกับช่วงก่อนหน้า</p>
          </div>
          <div className="inline-flex rounded-xl border border-gray-800 bg-[#171717] p-1" role="group" aria-label="เลือกระยะเวลากราฟ">
            <button
              type="button"
              onClick={() => setTrendPeriod("weekly")}
              aria-pressed={trendPeriod === "weekly"}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${trendPeriod === "weekly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              รายสัปดาห์
            </button>
            <button
              type="button"
              onClick={() => setTrendPeriod("monthly")}
              aria-pressed={trendPeriod === "monthly"}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${trendPeriod === "monthly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              รายเดือน
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TrendCard title="มูลค่างานจอง (GMV)" metric="revenue" points={data?.trends?.[trendPeriod] ?? []} period={trendPeriod} />
          <TrendCard title="จำนวนงานจอง" metric="bookings" points={data?.trends?.[trendPeriod] ?? []} period={trendPeriod} />
        </div>
      </section>

      <div className="mb-8">
        <BookingStatusChart statuses={data?.bookingStatuses ?? []} />
      </div>

      {/* Main Content Split: Recent Submissions & Management Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent KYC Submissions Table */}
        <div className="lg:col-span-2 bg-[#171717] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-800 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div>
              <h2 className="text-base font-bold text-white">
                คำขอยืนยันตัวตนฟรีแลนซ์ล่าสุด
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-xs bg-black/50 border-b border-gray-800">
                  <th className="p-4 font-semibold">ผู้สมัคร</th>
                  <th className="p-4 font-semibold">หมวดหมู่บริการ</th>
                  <th className="p-4 font-semibold">ธนาคาร</th>
                  <th className="p-4 font-semibold">วันที่ยื่น</th>
                  <th className="p-4 font-semibold text-center">สถานะ</th>
                  <th className="p-4 font-semibold text-right">ตรวจข้อมูล</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : !data?.recentKyc || data.recentKyc.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      ยังไม่มีคำขอยืนยันตัวตนในขณะนี้
                    </td>
                  </tr>
                ) : (
                  data.recentKyc.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                      <td className="p-4">
                        <p className="font-semibold text-white">{item.fullName}</p>
                        <p className="text-gray-400 text-[11px]">{item.email}</p>
                      </td>
                      <td className="p-4 text-zinc-300">
                        {item.categoryName || item.categoryKey || "ทั่วไป"}
                      </td>
                      <td className="p-4 text-zinc-300">
                        <p className="font-medium">{item.bankName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{item.bankAccountNumber}</p>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(item.submittedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="p-4 text-center">
                        {item.status === "pending" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            รอตรวจสอบ
                          </span>
                        )}
                        {item.status === "approved" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            อนุมัติแล้ว
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href="/admin/users"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-[#f97316] text-zinc-200 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          ตรวจ KYC
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Admin Authority & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Hub */}
          <div className="bg-[#171717] border border-gray-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 border-l-4 border-[#f97316] pl-2">
              ทางลัดจัดการระบบสารพัดรับจ้าง
            </h2>

            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 bg-black/50 border border-gray-800 hover:border-orange-500/60 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-[#f97316] flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      ตรวจสอบและอนุมัติ KYC
                    </h4>
                    <p className="text-[11px] text-gray-400">อนุมัติคำขอเป็นผู้ให้บริการ</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/admin/jobs"
                className="flex items-center justify-between p-3.5 bg-black/50 border border-gray-800 hover:border-orange-500/60 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      จัดการประกาศงาน & บริการ
                    </h4>
                    <p className="text-[11px] text-gray-400">ควบคุมงานและบริการในระบบ</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/admin/disputes"
                className="flex items-center justify-between p-3.5 bg-black/50 border border-gray-800 hover:border-orange-500/60 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                      ไกล่เกลี่ยข้อพิพาทงาน
                    </h4>
                    <p className="text-[11px] text-gray-400">ตัดสินข้อพิพาทลูกค้า-ฟรีแลนซ์</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3.5 bg-black/50 border border-gray-800 hover:border-orange-500/60 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                      การตั้งค่าระบบแพลตฟอร์ม
                    </h4>
                    <p className="text-[11px] text-gray-400">ความปลอดภัยและค่าธรรมเนียม</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
              </Link>
            </div>
          </div>

          {/* Super Admin Privileges Card */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111111] border border-gray-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#f97316]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                สิทธิ์ระดับ Super Admin
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              บัญชี Admin มีระดับสิทธิ์สูงสุดของระบบสารพัดรับจ้าง สามารถตรวจสอบเอกสาร KYC, กดยืนยันหรือปฏิเสธฟรีแลนซ์, ตรวจสอบและระงับประกาศงาน, และไกล่เกลี่ยข้อพิพาทงานบริการทั้งหมด
            </p>
            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
              <span>สถานะความปลอดภัย:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> เข้ารหัส & ได้รับอนุญาต
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
