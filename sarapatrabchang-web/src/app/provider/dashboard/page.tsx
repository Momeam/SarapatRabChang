"use client";

import Link from "next/link";
import { Plus, ShieldCheck, ChevronRight } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import ProviderStatsRow from "@/components/provider/ProviderStatsRow";
import ProviderServiceCard from "@/components/provider/ProviderServiceCard";
import ProviderOrdersTable from "@/components/provider/ProviderOrdersTable";
import { useAuth } from "@/components/AuthProvider";

const providerServices = [
  {
    id: "sv-1",
    code: "SV-001",
    category: "แม่บ้าน",
    title: "ทำความสะอาดคอนโดและบ้าน",
    packageDesc: "คอนโดขนาดเล็ก",
    duration: "3 ชั่วโมง",
    location: "บางนา, ห้วยขวาง, กรุงเทพมหานคร",
    price: "650",
  },
  {
    id: "sv-2",
    code: "SV-002",
    category: "แม่บ้าน",
    title: "ทำความสะอาดก่อนย้ายเข้า",
    packageDesc: "ห้องพร้อมเข้าอยู่",
    duration: "5 ชั่วโมง",
    location: "บางนา, ห้วยขวาง, กรุงเทพมหานคร",
    price: "1,200",
  },
];

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "คุณพิมพ์ชนก ใจดี";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">บัญชีของฉัน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">แดชบอร์ดผู้รับจ้าง</span>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              แดชบอร์ดผู้รับจ้าง
            </h1>
            <p className="text-sm text-zinc-500">
              สวัสดี {displayName} • จัดการประกาศและติดตามงานของคุณได้ในที่เดียว
            </p>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                โหมดผู้รับจ้าง • ยืนยัน KYC แล้ว
              </span>
            </div>
          </div>

          <div>
            <Link
              href="/provider/services/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างประกาศบริการใหม่</span>
            </Link>
          </div>
        </div>

        {/* 3 Stat Cards */}
        <ProviderStatsRow />

        {/* ประกาศบริการของฉัน */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">ประกาศบริการของฉัน</h2>
              <p className="text-xs text-zinc-500">ประกาศที่เผยแพร่แล้ว 2 รายการ</p>
            </div>
            <Link
              href="/provider/services/new"
              className="text-xs font-semibold text-zinc-600 hover:text-orange-600 border border-zinc-200 bg-white px-3 py-1.5 rounded-xl transition-colors"
            >
              จัดการประกาศทั้งหมด
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {providerServices.map((service) => (
              <ProviderServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* รายการงานที่ได้รับ (Table) */}
        <div id="orders">
          <ProviderOrdersTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}

