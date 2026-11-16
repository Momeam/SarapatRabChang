"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import ProviderServiceCard from "@/components/provider/ProviderServiceCard";
import Footer from "@/components/Footer";
import { requestApi } from "@/lib/api";
import { ProviderDashboard, ProviderDashboardService } from "@/types";

export default function ProviderServicesPage() {
  const [services, setServices] = useState<ProviderDashboardService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    requestApi<ProviderDashboard>("/api/provider/dashboard")
      .then((result) => {
        if (active) setServices(result.services);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "โหลดประกาศบริการไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleStatusChange(id: string, status: string) {
    setServices((current) =>
      current.map((service) => service.id === id ? { ...service, status } : service),
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">จัดการประกาศบริการ</h1>
            <p className="text-sm text-zinc-500 mt-1">แก้ไขประกาศและเปิดหรือหยุดเผยแพร่บริการของคุณ</p>
          </div>
          <Link
            href="/provider/services/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            สร้างประกาศใหม่
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            {error.includes("เข้าสู่ระบบ") && <Link href="/auth" className="ml-2 font-semibold underline">เข้าสู่ระบบ</Link>}
          </p>
        )}

        {isLoading ? (
          <p role="status" className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดประกาศบริการ...
          </p>
        ) : services.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((service) => (
              <ProviderServiceCard
                key={service.id}
                service={service}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-zinc-800">ยังไม่มีประกาศบริการ</p>
            <p className="mt-1 text-xs text-zinc-500">สร้างประกาศแรกเพื่อให้ลูกค้าค้นพบบริการของคุณ</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
