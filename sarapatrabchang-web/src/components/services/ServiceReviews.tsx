import StarRating from "@/components/StarRating";
import { Provider } from "@/types";

interface ServiceReviewsProps {
  provider: Provider;
}

export default function ServiceReviews({ provider }: ServiceReviewsProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h3 className="text-base font-bold text-zinc-900">
          รีวิวจากผู้ใช้บริการ
        </h3>
        <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
          <StarRating value={provider.rating} size="sm" />
          <span>
            {provider.rating.toFixed(1)} จาก {provider.reviewCount} รีวิว
          </span>
        </div>
      </div>

      {/* Sample Review */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-zinc-900">
            พิมพ์ชนก ส.
          </span>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <StarRating value={5} size="sm" />
            <span>• 24 ต.ค. 2569</span>
          </div>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          มาตรงเวลา อุปกรณ์ครบ ทำความสะอาดละเอียดมาก โดยเฉพาะครัวและห้องน้ำ
          ห้องสะอาดน่าอยู่ขึ้นเยอะค่ะ จะกลับมาใช้บริการอีกแน่นอน
        </p>
      </div>
    </div>
  );
}

