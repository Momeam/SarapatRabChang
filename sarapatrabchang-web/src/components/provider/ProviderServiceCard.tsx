"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Clock, Edit3, Pause, Play } from "lucide-react";
import { requestApi } from "@/lib/api";
import { ProviderDashboardService } from "@/types";

export default function ProviderServiceCard({
  service,
  onStatusChange,
}: {
  service: ProviderDashboardService;
  onStatusChange: (id: string, status: string) => void;
}) {
  const isPublished = service.status.toLowerCase() === "active";
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  async function toggleStatus() {
    setIsUpdating(true);
    setError("");
    try {
      const updated = await requestApi<{ id: string; status: string }>(
        `/api/providers/${encodeURIComponent(service.id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: isPublished ? "paused" : "active" }),
        },
      );
      onStatusChange(updated.id, updated.status);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "เปลี่ยนสถานะประกาศไม่สำเร็จ");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
            isPublished
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-zinc-600 bg-zinc-100 border-zinc-200"
          }`}>
            <Sparkles className={`w-3 h-3 ${isPublished ? "text-emerald-600" : "text-zinc-500"}`} />
            {isPublished
              ? "กำลังเผยแพร่บนหน้าหลัก"
              : service.status.toLowerCase() === "paused"
                ? "หยุดเผยแพร่"
                : `สถานะ ${service.status}`}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {service.category} • {service.code}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-zinc-950 hover:text-orange-600 transition-colors">
            {service.title}
          </h4>
          <p className="text-xs text-zinc-600 mt-1 flex items-center gap-2">
            <span>{service.packageDesc}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Clock className="w-3 h-3" />
              {service.duration}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{service.location}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-400 block">เริ่มต้น</span>
          <span className="text-lg font-bold text-zinc-950">฿{service.price.toLocaleString("th-TH")}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={toggleStatus}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200 disabled:opacity-50"
          >
            {isPublished ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isUpdating ? "กำลังบันทึก..." : isPublished ? "หยุดเผยแพร่" : "เผยแพร่"}</span>
          </button>
          <Link
            href={`/provider/services/new?edit=${service.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>แก้ไข</span>
          </Link>
        </div>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

