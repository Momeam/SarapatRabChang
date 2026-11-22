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
import KycForm from "@/components/provider/KycForm";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import { Provider, ProviderDashboard, ServiceCategory } from "@/types";

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "ผู้รับจ้าง";

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
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>("unverified");

  useEffect(() => {
    let active = true;
    const serviceId = new URLSearchParams(window.location.search).get("edit");

    Promise.all([
      requestApi<ServiceCategory[]>("/api/categories"),
      requestApi<ProviderDashboard>("/api/provider/dashboard").catch(() => null),
    ])
      .then(([result, dashboard]) => {
        if (!active) return;
        setEditServiceId(serviceId);
        setKycStatus(dashboard?.stats.kycStatus?.toLowerCase() ?? "unverified");
        const availableCategories = result.filter((item) => item.id !== "all");
        setCategories(availableCategories);
        const service = dashboard?.services.find((item) => item.id === serviceId);
        if (serviceId && !service) {
          throw new Error("ไม่พบประกาศนี้หรือคุณไม่มีสิทธิ์แก้ไข");
        }
        if (service) {
          setTitle(service.title);
          setCategory(service.categoryKey);
          setLocation(service.location);
          setDescription(service.description);
          setPackageName(service.packageDesc);
          setPrice(String(service.price));
          setDuration(service.duration);
          setFeatures(service.features);
          setCoverImageUrl(service.coverImageUrl ?? "");
          setPortfolioUrls([...service.portfolioUrls, "", "", ""].slice(0, 3));
        } else {
          setCategory(availableCategories[0]?.id ?? "");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCategoryError(
            error instanceof Error ? error.message : "โหลดหมวดหมู่ไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingEdit(false);
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
      const provider = await requestApi<Provider>(
        editServiceId
          ? `/api/providers/${encodeURIComponent(editServiceId)}`
          : "/api/providers",
        {
          method: editServiceId ? "PATCH" : "POST",
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
        },
      );
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
          <span className="text-zinc-900 font-medium">
            {editServiceId ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
          </span>
        </div>

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            {editServiceId ? "แก้ไขประกาศบริการ" : "สร้างประกาศขายบริการใหม่ (โพสต์ขึ้นหน้าหลัก)"}
          </h1>
          <p className="text-sm text-zinc-500">
            {editServiceId
              ? "แก้ไขข้อมูลบริการและแพ็กเกจที่บันทึกไว้"
              : "บอกสิ่งที่คุณทำได้ กำหนดแพ็กเกจ และเพิ่มผลงาน เพื่อให้ลูกค้าค้นพบบนหน้าหลัก"}
          </p>
        </div>

        {/* Form Grid */}
        {!isLoadingEdit && !["approved", "verified"].includes(kycStatus) ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-bold">ต้องยืนยันตัวตนเป็นฟรีแลนซ์ (KYC) และได้รับการอนุมัติจากแอดมินก่อนสร้างประกาศบริการ</p>
              <p className="text-xs text-amber-800 mt-1">
                กรุณากรอกข้อมูลและส่งคำขอผ่านแบบฟอร์มด้านล่างเพื่อรอให้แอดมินกดยืนยันอนุมัติ
              </p>
            </div>
            <KycForm initialName={displayName} isAuthLoading={false} />
          </div>
        ) : (
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
                    disabled={isPublishing || isLoadingEdit || categories.length === 0 || Boolean(categoryError)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white text-xs font-semibold transition-all shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>
                      {isPublishing
                        ? "กำลังบันทึก..."
                        : editServiceId
                          ? "บันทึกการแก้ไข"
                          : "เผยแพร่ประกาศบริการ"}
                    </span>
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
        )}
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
              ประกาศของคุณ &quot;{title}&quot; บันทึกลง Neon แล้ว
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/services/${createdProviderId ?? editServiceId}`)}
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

