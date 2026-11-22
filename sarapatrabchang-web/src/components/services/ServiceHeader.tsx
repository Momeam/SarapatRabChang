"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Clock, CheckCircle2, BookmarkCheck } from "lucide-react";
import StarRating from "@/components/StarRating";
import { Provider } from "@/types";
import { isServiceSaved, toggleSavedService } from "@/lib/savedServices";

interface ServiceHeaderProps {
  provider: Provider;
}

export default function ServiceHeader({ provider }: ServiceHeaderProps) {
  const [isSaved, setIsSaved] = useState(() => isServiceSaved(provider.id));

  useEffect(() => {
    const handleSync = () => setIsSaved(isServiceSaved(provider.id));
    window.addEventListener("saved-services-updated", handleSync);
    return () => window.removeEventListener("saved-services-updated", handleSync);
  }, [provider.id]);

  const handleToggleSave = () => {
    const nextState = toggleSavedService(provider);
    setIsSaved(nextState);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {provider.avatar ? (
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-zinc-100"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl font-bold ring-2 ring-zinc-100">
                {provider.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {provider.category}
              </span>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ยืนยันตัวตนแล้ว
                </span>
              )}
              {!provider.verified && (
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                  รอยืนยันตัวตน
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              {provider.serviceTitle}
            </h1>
            <p className="text-sm font-semibold text-zinc-700">
              {provider.name}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1 font-semibold text-zinc-900">
                {provider.reviewCount > 0 ? (
                  <>
                    <StarRating value={provider.rating} size="sm" />
                    <span>{provider.rating.toFixed(1)}</span>
                    <span className="text-zinc-400 font-normal">
                      ({provider.reviewCount} รีวิว)
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-400 font-normal">ยังไม่มีรีวิว</span>
                )}
              </div>
              <span>•</span>
              <span>ให้บริการแล้ว {provider.completedJobs} งาน</span>
              <span>•</span>
              <span>{provider.serviceAreas.join(" · ")}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex items-center sm:flex-col items-end gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? "fill-rose-500 text-rose-500" : "text-zinc-500"
                }`}
              />
              <span>{isSaved ? "บันทึกแล้ว" : "บันทึกบริการ"}</span>
            </button>
            <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
              <Clock className="w-3.5 h-3.5" />
              <span>{provider.responseTime}</span>
            </div>
          </div>
          {isSaved && (
            <Link
              href="/profile#saved-services"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>ดูบริการที่บันทึกไว้ในหน้าโปรไฟล์ →</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
