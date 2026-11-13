import Link from "next/link";
import { Star, CheckCircle2, UserRound } from "lucide-react";
import { Provider } from "@/types";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col">
      {/* Image / Header area */}
      <div className="relative h-44 bg-zinc-100 overflow-hidden">
        {provider.avatar ? (
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-500">
            <UserRound className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-zinc-800 shadow-sm backdrop-blur-xs">
            {provider.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-zinc-900 text-base leading-snug">
              {provider.name}
            </h3>
          </div>

          <p className="text-xs text-zinc-600 font-medium line-clamp-1">
            {provider.serviceTitle}
          </p>

          {/* Rating & Verified */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 font-semibold text-zinc-900">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{provider.rating.toFixed(1)}</span>
              <span className="text-zinc-400 font-normal">
                ({provider.reviewCount} รีวิว)
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-[11px] font-medium ${provider.verified ? "text-emerald-600" : "text-zinc-500"}`}>
            {provider.verified && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{provider.verified ? "ยืนยันตัวตนแล้ว" : "รอยืนยันตัวตน"}</span>
          </div>

          {/* Location Zones */}
          <p className="text-[11px] text-zinc-400 line-clamp-1 pt-1">
            {provider.serviceAreas.join(" • ")}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              เริ่มต้น
            </span>
            <span className="text-lg font-extrabold text-zinc-900">
              ฿{provider.startingPrice.toLocaleString()}
            </span>
          </div>

          <Link
            href={`/services/${provider.id}`}
            className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            จ้างงาน
          </Link>
        </div>
      </div>
    </div>
  );
}

