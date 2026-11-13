"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProviderCard from "@/components/home/ProviderCard";
import { requestApi } from "@/lib/api";
import { Provider } from "@/types";

export default function ServicesPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(() => {
    return requestApi<Provider[]>("/api/providers");
  }, []);

  const retryLoadingProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProviders(await fetchProviders());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "ไม่สามารถโหลดข้อมูลบริการได้",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchProviders()
      .then((providerData) => {
        if (active) setProviders(providerData);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "ไม่สามารถโหลดข้อมูลบริการได้",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchProviders]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-orange-600">บริการยอดนิยม</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-zinc-950">
            เลือกผู้ให้บริการที่เหมาะกับคุณ
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            ดูรายละเอียด ราคา และพื้นที่ให้บริการก่อนเลือกจ้าง
          </p>
        </div>

        {isLoading ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            กำลังโหลดข้อมูลผู้ให้บริการ...
          </p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void retryLoadingProviders()}
              className="mt-3 font-semibold underline"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : providers.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            ยังไม่มีบริการที่เปิดให้จ้างในขณะนี้
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
