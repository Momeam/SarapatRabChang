"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, ChevronRight } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import ProviderStatsRow from "@/components/provider/ProviderStatsRow";
import ProviderServiceCard from "@/components/provider/ProviderServiceCard";
import ProviderOrdersTable from "@/components/provider/ProviderOrdersTable";
import KycForm from "@/components/provider/KycForm";
import KycSidebar from "@/components/provider/KycSidebar";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import { ProviderDashboard } from "@/types";

export default function ProviderDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    requestApi<ProviderDashboard>("/api/provider/dashboard")
      .then((result) => {
        if (active) setDashboard(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
        }
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
      : "ผู้รับจ้าง";
  const kycStatus = dashboard?.stats.kycStatus.toLowerCase() ?? "unverified";
  const isKycVerified = ["approved", "verified"].includes(kycStatus);
  const kycLabel = isKycVerified
    ? "ยืนยัน KYC แล้ว"
    : kycStatus === "pending"
      ? "รอตรวจ KYC"
      : "ยังไม่ยืนยัน KYC";
  const publishedServiceCount =
    dashboard?.services.filter((service) => service.status.toLowerCase() === "active").length ?? 0;
  const handleServiceStatusChange = (id: string, status: string) => {
    setDashboard((current) =>
      current
        ? {
            ...current,
            services: current.services.map((service) =>
              service.id === id ? { ...service, status } : service,
            ),
          }
        : current,
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">บัญชีของฉัน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">แดชบอร์ดผู้รับจ้าง</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              แดชบอร์ดผู้รับจ้าง
            </h1>
            <p className="text-sm text-zinc-500">
              สวัสดี {displayName} • จัดการประกาศและติดตามงานของคุณได้ในที่เดียว
            </p>
            {!isLoading && dashboard && (
              <div className="pt-0.5">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                  isKycVerified
                    ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                    : "text-amber-800 bg-amber-50 border-amber-200"
                }`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isKycVerified ? "text-emerald-600" : "text-amber-600"}`} />
                  {kycLabel}
                </span>
              </div>
            )}
          </div>

          {isKycVerified && (
            <Link
              href="/provider/services/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างประกาศบริการใหม่</span>
            </Link>
          )}
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            {error.includes("เข้าสู่ระบบ") && (
              <Link href="/auth" className="ml-2 font-semibold underline">เข้าสู่ระบบ</Link>
            )}
          </div>
        )}

        {isLoading ? (
          <p role="status" className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดข้อมูลแดชบอร์ด...
          </p>
        ) : dashboard && !isKycVerified ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-bold">ต้องทำการยืนยันตัวตนเป็นฟรีแลนซ์ (KYC) ก่อนเข้าใช้งานระบบผู้รับจ้าง</p>
              <p className="text-xs text-amber-800 mt-1">
                กรุณากรอกข้อมูลส่วนตัว บัญชีธนาคาร และแนบเอกสารผ่านแบบฟอร์มด้านล่างเพื่อส่งคำขอให้แอดมินตรวจสอบและกดยืนยันอนุมัติ
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <KycForm initialName={displayName} isAuthLoading={authLoading} />
              </div>
              <div className="lg:col-span-1">
                <KycSidebar displayName={displayName} email={user?.email ?? ""} />
              </div>
            </div>
          </div>
        ) : dashboard ? (
          <>
            <ProviderStatsRow stats={dashboard.stats} />

            <div id="services" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-950">ประกาศบริการของฉัน</h2>
                  <p className="text-xs text-zinc-500">
                    ประกาศที่เผยแพร่แล้ว {publishedServiceCount} รายการ
                  </p>
                </div>
                <Link
                  href="/provider/services/new"
                  className="text-xs font-semibold text-zinc-600 hover:text-orange-600 border border-zinc-200 bg-white px-3 py-1.5 rounded-xl transition-colors"
                >
                  สร้างประกาศใหม่
                </Link>
              </div>

              {dashboard.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {dashboard.services.map((service) => (
                    <ProviderServiceCard
                      key={service.id}
                      service={service}
                      onStatusChange={handleServiceStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-zinc-800">ยังไม่มีประกาศบริการ</p>
                  <p className="mt-1 text-xs text-zinc-500">สร้างประกาศแรกเพื่อให้ลูกค้าค้นพบบริการของคุณ</p>
                </div>
              )}
            </div>

            <div id="orders">
              <ProviderOrdersTable />
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
