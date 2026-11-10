import { Provider } from "@/types";

interface ServicePortfolioGalleryProps {
  portfolio: Provider["portfolio"];
  isCompact?: boolean;
}

export default function ServicePortfolioGallery({
  portfolio,
  isCompact = false,
}: ServicePortfolioGalleryProps) {
  if (isCompact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">ผลงานที่ผ่านมา</h3>
          <span className="text-xs text-zinc-400">ภาพตัวอย่างจากงานจริง</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {portfolio.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs group"
            >
              <div className="h-28 bg-zinc-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-2 text-center">
                <p className="text-[11px] font-medium text-zinc-700 line-clamp-1">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {portfolio.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
        >
          <div className="h-48 bg-zinc-100">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h4 className="font-bold text-sm text-zinc-900">{item.title}</h4>
            <p className="text-xs text-zinc-400 mt-1">
              ไฟล์แนบ: {item.filename}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

