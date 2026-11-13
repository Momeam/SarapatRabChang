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
          <span>
            {provider.reviewCount > 0
              ? `${provider.rating.toFixed(1)} จาก ${provider.reviewCount} รีวิว`
              : "ยังไม่มีรีวิว"}
          </span>
          {provider.reviewCount > 0 && (
            <StarRating value={provider.rating} size="sm" />
          )}
        </div>
      </div>

      {provider.reviews && provider.reviews.length > 0 ? (
        provider.reviews.map((review) => (
          <div key={review.id} className="space-y-2 border-b border-zinc-100 pb-4 last:border-b-0">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-sm text-zinc-900">
                {review.reviewerName}
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <StarRating value={review.rating} size="sm" />
                <span>
                  {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(
                    new Date(review.createdAt),
                  )}
                </span>
              </div>
            </div>
            {review.comment && (
              <p className="text-xs text-zinc-600 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-xs text-zinc-500">เมื่อมีผู้ใช้บริการและเขียนรีวิว รีวิวจะแสดงที่นี่</p>
      )}
    </div>
  );
}

