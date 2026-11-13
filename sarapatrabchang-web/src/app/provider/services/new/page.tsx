"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import ServiceFormBasicInfo from "@/components/provider/ServiceFormBasicInfo";
import ServiceFormPricing from "@/components/provider/ServiceFormPricing";
import ServiceFormImages from "@/components/provider/ServiceFormImages";
import ServiceFormSidebar from "@/components/provider/ServiceFormSidebar";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import { Provider, ServiceCategory } from "@/types";

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "พิมพ์ชนก ใจดี";

  const [title, setTitle] = useState("ทำความสะอาดคอนโดและบ้าน");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("บางนา, ห้วยขวาง, กรุงเทพมหานคร");
  const [description, setDescription] = useState(
    "บริการทำความสะอาดคอนโดและบ้าน ดูแลห้องนอน ห้องน้ำ ห้องครัว และพื้นที่ส่วนกลาง พร้อมอุปกรณ์ทำความสะอาด\n\nกรุณาแจ้งขนาดพื้นที่และจุดที่ต้องการดูแลเป็นพิเศษก่อนจอง\nไม่รวมการทำความสะอาดหลังงานก่อสร้างหรือพื้นที่สูง"
  );

  const [packageName, setPackageName] = useState("คอนโดขนาดเล็ก");
  const [price, setPrice] = useState("650");
  const [duration, setDuration] = useState("3 ชั่วโมง");
  const [features, setFeatures] = useState([
    "กวาด ดูดฝุ่น และถูพื้น",
    "เช็ดฝุ่นเฟอร์นิเจอร์และพื้นผิวทั่วไป",
    "ทำความสะอาดห้องน้ำ 1 ห้อง",
    "ทำความสะอาดครัวและทิ้งขยะ",
  ]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState(["", "", ""]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdProviderId, setCreatedProviderId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    requestApi<ServiceCategory[]>("/api/categories")
      .then((result) => {
        if (!active) return;
        const availableCategories = result.filter((item) => item.id !== "all");
        setCategories(availableCategories);
        setCategory(availableCategories[0]?.id ?? "");
      })
      .catch((error: unknown) => {
        if (active) {
          setCategoryError(
            error instanceof Error ? error.message : "โหลดหมวดหมู่ไม่สำเร็จ",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    if (!user) {
      setPublishError("กรุณาเข้าสู่ระบบก่อนเผยแพร่ประกาศบริการ");
      return;
    }
    setIsPublishing(true);
    try {
      const provider = await requestApi<Provider>("/api/providers", {
        method: "POST",
        body: JSON.stringify({
          title,
          categoryKey: category,
          location,
          description,
          packageName,
          price,
          duration,
          features,
          coverImageUrl,
          portfolioUrls,
        }),
      });
      setCreatedProviderId(provider.id);
      setShowSuccessModal(true);
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "บันทึกประกาศไม่สำเร็จ",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedCategoryName =
    categories.find((item) => item.id === category)?.name ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/provider/dashboard" className="hover:text-orange-600">แดชบอร์ด</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">จัดการประกาศบริการ</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">สร้างประกาศใหม่</span>
        </div>

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            สร้างประกาศขายบริการใหม่ (โพสต์ขึ้นหน้าหลัก)
          </h1>
          <p className="text-sm text-zinc-500">
            บอกสิ่งที่คุณทำได้ กำหนดแพ็กเกจ และเพิ่มผลงาน เพื่อให้ลูกค้าค้นพบบนหน้าหลัก
          </p>
        </div>

        {/* Form Grid */}
        <form onSubmit={handlePublish}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Form Sections */}
            <div className="lg:col-span-2 space-y-6">
              <ServiceFormBasicInfo
                title={title}
                setTitle={setTitle}
                category={category}
                setCategory={setCategory}
                categories={categories}
                location={location}
                setLocation={setLocation}
                description={description}
                setDescription={setDescription}
              />

              <ServiceFormPricing
                packageName={packageName}
                setPackageName={setPackageName}
                price={price}
                setPrice={setPrice}
                duration={duration}
                setDuration={setDuration}
                features={features}
                setFeatures={setFeatures}
              />

              <ServiceFormImages
                coverImageUrl={coverImageUrl}
                setCoverImageUrl={setCoverImageUrl}
                portfolioUrls={portfolioUrls}
                setPortfolioUrls={setPortfolioUrls}
              />

              {(categoryError || publishError) && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {categoryError ?? publishError}
                  {publishError?.includes("เข้าสู่ระบบ") && (
                    <Link href="/auth" className="ml-2 font-semibold underline">
                      เข้าสู่ระบบ
                    </Link>
                  )}
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-500">
                  เมื่อเผยแพร่ ประกาศจะขึ้นแสดงบนหน้าหลักและในหมวดหมู่ที่เลือก
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={createdProviderId ? `/services/${createdProviderId}` : "/"}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูตัวอย่างบนหน้าหลัก</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={isPublishing || categories.length === 0 || Boolean(categoryError)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white text-xs font-semibold transition-all shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{isPublishing ? "กำลังเผยแพร่..." : "เผยแพร่ประกาศบริการ"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Sidebar & Preview */}
            <div className="lg:col-span-1">
              <ServiceFormSidebar
                title={title}
                category={selectedCategoryName}
                location={location}
                packageName={packageName}
                price={price}
                duration={duration}
                displayName={displayName}
              />
            </div>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-950 text-white rounded-2xl border border-zinc-800 p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">เผยแพร่ประกาศบริการสำเร็จ!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ประกาศของคุณ &quot;{title}&quot; บันทึกลง Neon แล้ว และแสดงบนหน้าหลักตามข้อมูลจริง
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/services/${createdProviderId}`)}
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                ดูประกาศของฉัน
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

