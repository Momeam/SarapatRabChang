"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceHeader from "@/components/services/ServiceHeader";
import ServiceOverview from "@/components/services/ServiceOverview";
import ServicePortfolioGallery from "@/components/services/ServicePortfolioGallery";
import ServiceReviews from "@/components/services/ServiceReviews";
import ServiceBookingCard from "@/components/services/ServiceBookingCard";
import { ChevronRight } from "lucide-react";
import { requestApi } from "@/lib/api";
import { Provider } from "@/types";

function getDefaultServiceDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ServiceDetailPage() {
  const params = useParams();
  const providerId = typeof params?.id === "string" ? params.id : "";
  const hasValidProviderId = /^\d+$/.test(providerId);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedProviderId, setLoadedProviderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "portfolio">("details");
  const [selectedDate, setSelectedDate] = useState(getDefaultServiceDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00-12:00");
  const isLoading = hasValidProviderId && loadedProviderId !== providerId;

  useEffect(() => {
    if (!hasValidProviderId) return;
    let active = true;
    requestApi<Provider>(`/api/providers/${encodeURIComponent(providerId)}`)
      .then((result) => {
        if (active) {
          setProvider(result);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "โหลดข้อมูลบริการไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setLoadedProviderId(providerId);
      });
    return () => {
      active = false;
    };
  }, [hasValidProviderId, providerId]);

  if (isLoading || !provider || loadError) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={loadError && hasValidProviderId ? "text-red-700" : "text-zinc-500"}>
            {!hasValidProviderId
              ? "ไม่พบประกาศนี้ อาจเป็นลิงก์เก่าหรือรหัสประกาศไม่ถูกต้อง"
              : loadError ?? "กำลังโหลดข้อมูลบริการ..."}
          </div>
          {(loadError || !hasValidProviderId) && (
            <Link href="/" className="mt-4 inline-block text-sm font-semibold text-orange-600">
              กลับไปหน้าค้นหาบริการ
            </Link>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/" className="hover:text-orange-600 transition-colors">
            {provider.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">
            {provider.serviceTitle}
          </span>
        </nav>

        {/* Component 1: Provider Profile Header */}
        <ServiceHeader provider={provider} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-7 space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "details"
                    ? "text-orange-600 border-b-2 border-orange-500 -mb-[2px]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                ดูรายละเอียดบริการ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("portfolio")}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "portfolio"
                    ? "text-orange-600 border-b-2 border-orange-500 -mb-[2px]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                ผลงานที่ผ่านมา ({provider.portfolio.length})
              </button>
            </div>

            {/* Tab: Details */}
            {activeTab === "details" && (
              <div className="space-y-8">
                {/* Component 2: Service Description & Overview */}
                <ServiceOverview provider={provider} />

                {/* Component 3: Portfolio Compact Preview */}
                <ServicePortfolioGallery portfolio={provider.portfolio} isCompact={true} />

                {/* Component 4: Service Reviews */}
                <ServiceReviews provider={provider} />
              </div>
            )}

            {/* Tab: Portfolio Full Grid */}
            {activeTab === "portfolio" && (
              <ServicePortfolioGallery portfolio={provider.portfolio} isCompact={false} />
            )}
          </div>

          {/* Right Column: Component 5: Sticky Booking Card */}
          <div className="lg:col-span-5 sticky top-24">
            <ServiceBookingCard
              provider={provider}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
