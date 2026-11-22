"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecommendedProviders from "@/components/home/RecommendedProviders";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import { Provider, ServiceCategory } from "@/types";

function HomePageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const isUserPreview = searchParams.get("preview") === "user";

  const [selectedLocation, setSelectedLocation] = useState("ห้วยขวาง, กรุงเทพมหานคร");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeKeyword = urlQuery;

  // Redirect Admin users directly to Admin Panel unless preview=user is explicitly requested
  useEffect(() => {
    if (authLoading) return;
    if (user?.role?.toLowerCase() === "admin" && !isUserPreview && !urlQuery) {
      router.replace("/admin/dashboard");
    }
  }, [authLoading, isUserPreview, router, urlQuery, user]);

  const loadPageData = useCallback(
    async (
      category: string,
      location: string,
      options: { filterByLocation?: boolean; keyword?: string } = {},
    ) => {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (options.filterByLocation && location.trim()) {
        params.set("location", location.trim());
      }
      if (options.keyword?.trim()) {
        params.set("q", options.keyword.trim());
      }
      const queryString = params.toString();
      const query = queryString ? `?${queryString}` : "";

      try {
        const providerData = await requestApi<Provider[]>(`/api/providers${query}`);
        setProviders(providerData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "ไม่สามารถโหลดข้อมูลผู้ให้บริการได้",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Initial load of categories
  useEffect(() => {
    let active = true;
    requestApi<ServiceCategory[]>("/api/categories")
      .then((categoryData) => {
        if (active) setCategories(categoryData);
      })
      .catch(() => {
        // Ignore category load failure here; handled by providers load
      });
    return () => {
      active = false;
    };
  }, []);

  // Load providers whenever URL search query `q` changes
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (urlQuery) {
      params.set("q", urlQuery);
    } else if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : "";

    requestApi<Provider[]>(`/api/providers${query}`)
      .then((providerData) => {
        if (!active) return;
        setProviders(providerData);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const handleSearch = () => {
    void loadPageData(selectedCategory, selectedLocation, {
      filterByLocation: true,
      keyword: activeKeyword,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (urlQuery) {
      router.replace("/", { scroll: false });
    }
    void loadPageData(category, selectedLocation, { filterByLocation: false });
  };

  const handleClearKeyword = () => {
    setSelectedCategory("all");
    router.replace("/", { scroll: false });
    void loadPageData("all", "", { filterByLocation: false });
  };

  const handleRetry = () => {
    void loadPageData(selectedCategory, selectedLocation, {
      filterByLocation: false,
      keyword: activeKeyword,
    });
  };

  const userName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user?.email ?? "คุณ";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <HeroSearch
          location={selectedLocation}
          setLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onQuickCategorySelect={handleCategorySelect}
          categories={categories}
          onSearch={handleSearch}
          isSearching={isLoading}
          userName={userName}
        />

        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          categories={categories}
        />

        {activeKeyword && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 px-5 py-3.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-orange-950">
              <Search className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                ผลการค้นหาสำหรับ: <strong className="font-bold">&ldquo;{activeKeyword}&rdquo;</strong>{" "}
                ({providers.length} บริการ)
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearKeyword}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ล้างคำค้นหา (ดูทั้งหมด)</span>
            </button>
          </div>
        )}

        <RecommendedProviders
          providers={providers}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-sm text-zinc-500">
          กำลังโหลดหน้าแรก...
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
