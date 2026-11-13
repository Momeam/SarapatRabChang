"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecommendedProviders from "@/components/home/RecommendedProviders";
import { requestApi } from "@/lib/api";
import { Provider, ServiceCategory } from "@/types";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState("ห้วยขวาง, กรุงเทพมหานคร");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = useCallback(
    async (category: string, location: string, applyFilters: boolean) => {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (applyFilters && category !== "all") params.set("category", category);
      if (applyFilters && location.trim()) params.set("location", location.trim());
      const queryString = params.toString();
      const query = queryString ? `?${queryString}` : "";

      try {
        const [categoryData, providerData] = await Promise.all([
          requestApi<ServiceCategory[]>("/api/categories"),
          requestApi<Provider[]>(`/api/providers${query}`),
        ]);
        setCategories(categoryData);
        setProviders(providerData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<ServiceCategory[]>("/api/categories"),
      requestApi<Provider[]>("/api/providers"),
    ])
      .then(([categoryData, providerData]) => {
        if (!active) return;
        setCategories(categoryData);
        setProviders(providerData);
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
  }, []);

  const handleSearch = () => {
    void loadPageData(selectedCategory, selectedLocation, true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    void loadPageData(category, selectedLocation, true);
  };

  const handleRetry = () => {
    void loadPageData(selectedCategory, selectedLocation, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <HeroSearch
          location={selectedLocation}
          setLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onSearch={handleSearch}
          isSearching={isLoading}
        />

        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          categories={categories}
        />

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
