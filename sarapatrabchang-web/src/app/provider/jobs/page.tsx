"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import ProviderOrdersTable from "@/components/provider/ProviderOrdersTable";
import Footer from "@/components/Footer";

export default function ProviderJobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/provider/dashboard" className="hover:text-orange-600">แดชบอร์ด</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">รายการงาน</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">รายการงานที่ได้รับ</h1>
          <p className="text-sm text-zinc-500 mt-1">ตรวจสอบรายละเอียดและจัดการสถานะงานของคุณ</p>
        </div>
        <ProviderOrdersTable />
      </main>
      <Footer />
    </div>
  );
}
