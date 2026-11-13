"use client";

interface ServiceFormImagesProps {
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  portfolioUrls: string[];
  setPortfolioUrls: (urls: string[]) => void;
}

export default function ServiceFormImages({
  coverImageUrl,
  setCoverImageUrl,
  portfolioUrls,
  setPortfolioUrls,
}: ServiceFormImagesProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-zinc-950">3. รูปภาพบริการ</h3>
        <p className="text-xs text-zinc-500 mt-1">
          ใส่ลิงก์รูปภาพ HTTPS รูปจะถูกบันทึกไปพร้อมประกาศบริการ
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-zinc-800">ภาพปก</span>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(event) => setCoverImageUrl(event.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </label>

      {portfolioUrls.map((url, index) => (
        <label key={index} className="block">
          <span className="text-xs font-semibold text-zinc-800">
            ผลงาน {index + 1}
          </span>
          <input
            type="url"
            value={url}
            onChange={(event) => {
              const nextUrls = [...portfolioUrls];
              nextUrls[index] = event.target.value;
              setPortfolioUrls(nextUrls);
            }}
            placeholder="https://example.com/work.jpg"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>
      ))}

      <p className="text-[11px] text-zinc-400">
        บันทึกลิงก์ได้สูงสุด 1 ภาพปกและ 3 ภาพผลงาน
      </p>
    </div>
  );
}
