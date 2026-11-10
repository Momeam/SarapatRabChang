import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Provider } from "@/types";
import ProviderCard from "./ProviderCard";

interface RecommendedProvidersProps {
  providers: Provider[];
}

export default function RecommendedProviders({
  providers,
}: RecommendedProvidersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            ผู้ให้บริการแนะนำใกล้คุณ
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            ผู้ให้บริการที่ได้รับรีวิวดี พร้อมดูแลงานของคุณ
          </p>
        </div>
        <Link
          href="/services/cleaning"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}

