"use client";

import ProviderNavbar from "@/components/provider/ProviderNavbar";
import ProviderFinancePanel from "@/components/provider/ProviderFinancePanel";
import Footer from "@/components/Footer";

export default function ProviderFinancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">การเงินและถอนเงิน</h1>
          <p className="text-sm text-zinc-500 mt-1">ตรวจสอบรายรับจากงานและติดตามคำขอถอนเงิน</p>
        </div>
        <ProviderFinancePanel />
      </main>
      <Footer />
    </div>
  );
}
