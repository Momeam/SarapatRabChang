"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecommendedProviders from "@/components/home/RecommendedProviders";
import { mockProviders } from "@/data/mockData";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState("ห้วยขวาง, กรุงเทพมหานคร");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProviders = mockProviders.filter((p) => {
    if (selectedCategory !== "all" && p.categoryKey !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Section 1: Hero Search */}
        <HeroSearch
          location={selectedLocation}
          setLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Section 2: Service Categories Grid */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Section 3: Recommended Providers Grid */}
        <RecommendedProviders providers={filteredProviders} />
      </main>

      <Footer />
    </div>
  );
}
