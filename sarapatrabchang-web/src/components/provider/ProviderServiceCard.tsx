"use client";

import Link from "next/link";
import { Sparkles, MapPin, Clock, Edit3 } from "lucide-react";

interface ServiceItem {
  id: string;
  code: string;
  category: string;
  title: string;
  packageDesc: string;
  duration: string;
  location: string;
  price: string;
}

export default function ProviderServiceCard({ service }: { service: ServiceItem }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            กำลังเผยแพร่บนหน้าหลัก
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
          <span className="text-lg font-bold text-zinc-950">฿{service.price}</span>
        </div>

        <Link
          href={`/provider/services/new?edit=${service.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>แก้ไขประกาศ</span>
        </Link>
      </div>
    </div>
  );
}

