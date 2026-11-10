"use client";

import {
  Sparkles,
  Wrench,
  Truck,
  Tv,
  Users,
  Trees,
  Shirt,
  LayoutGrid,
} from "lucide-react";
import { mockCategories } from "@/data/mockData";

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      case "Wrench":
        return <Wrench className="w-6 h-6" />;
      case "Truck":
        return <Truck className="w-6 h-6" />;
      case "Tv":
        return <Tv className="w-6 h-6" />;
      case "Users":
        return <Users className="w-6 h-6" />;
      case "Trees":
        return <Trees className="w-6 h-6" />;
      case "Shirt":
        return <Shirt className="w-6 h-6" />;
      default:
        return <LayoutGrid className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-900">
        เลือกบริการที่คุณต้องการ
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {mockCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm scale-102"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
            >
              <div
                className={`${
                  isSelected
                    ? "text-white"
                    : "text-zinc-600 group-hover:text-orange-500"
                }`}
              >
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="text-xs font-semibold leading-tight line-clamp-1">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

