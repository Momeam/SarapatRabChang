"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestApi } from "@/lib/api";
import { ProviderDashboard, ProviderDashboardService } from "@/types";
import KycForm from "@/components/provider/KycForm";
import { useAuth } from "@/components/AuthProvider";

export default function FreelancerServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<ProviderDashboardService[]>([]);
  const [kycStatus, setKycStatus] = useState<string>("unverified");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "active" | "paused">("ALL");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    requestApi<ProviderDashboard>("/api/provider/dashboard")
      .then((res) => {
        if (!active) return;
        setServices(res.services);
        setKycStatus(res.stats.kycStatus.toLowerCase());
      })
      .catch((err) => {
        if (active) setAlertMsg(err instanceof Error ? err.message : "โหลดประกาศบริการไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isApproved = kycStatus === "approved" || kycStatus === "verified";
  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "";

  const filteredServices = services.filter((service) => {
    if (activeTab === "ALL") return true;
    return service.status.toLowerCase() === activeTab;
  });

  const countByStatus = (status: string) =>
    services.filter((s) => s.status.toLowerCase() === status).length;

  const handleToggleStatus = async (service: ProviderDashboardService) => {
    const nextStatus = service.status.toLowerCase() === "active" ? "paused" : "active";
    try {
      const updated = await requestApi<{ id: string; status: string }>(
        `/api/providers/${encodeURIComponent(service.id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      setServices((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, status: updated.status } : s))
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "เปลี่ยนสถานะประกาศไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบประกาศบริการ "${title}"?\nการกระทำนี้ไม่สามารถย้อนกลับได้`
      )
    ) {
      return;
    }
    try {
      await requestApi(`/api/providers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "ลบประกาศบริการไม่สำเร็จ");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">บริการของฉัน (My Services)</h1>
          <p className="text-gray-400 text-sm mt-1">
            จัดการประกาศขายบริการ สร้างบริการใหม่ หรือแก้ไขแพ็กเกจราคาจากฐานข้อมูลจริง
          </p>
        </div>
        {isApproved && (
          <Link
            href="/provider/services/new"
            className="mt-4 md:mt-0 bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center shadow-lg shadow-[#f97316]/20"
          >
            <i className="fa-solid fa-plus mr-2"></i> สร้างบริการใหม่
          </Link>
        )}
      </div>

      {alertMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-400 text-sm">
          {alertMsg}
        </div>
      )}

      {!isLoading && !isApproved ? (
        <div className="space-y-6 text-zinc-900">
          <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm">
            <p className="font-bold">ต้องยืนยันตัวตนเป็นฟรีแลนซ์ (KYC) ก่อนสร้างและจัดการประกาศบริการ</p>
            <p className="text-xs text-amber-200/80 mt-1">
              กรุณากรอกข้อมูลและส่งคำขอผ่านแบบฟอร์มด้านล่างเพื่อรอให้แอดมินกดยืนยันอนุมัติ
            </p>
          </div>
          <KycForm initialName={displayName} isAuthLoading={authLoading} />
        </div>
      ) : (
        <>
          <div className="flex space-x-6 border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar text-sm">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`font-medium pb-2 whitespace-nowrap transition ${
                activeTab === "ALL"
                  ? "text-white border-b-2 border-[#f97316]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ทั้งหมด ({services.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`font-medium pb-2 whitespace-nowrap transition ${
                activeTab === "active"
                  ? "text-white border-b-2 border-[#f97316]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ออนไลน์อยู่ ({countByStatus("active")})
            </button>
            <button
              onClick={() => setActiveTab("paused")}
              className={`font-medium pb-2 whitespace-nowrap transition ${
                activeTab === "paused"
                  ? "text-white border-b-2 border-[#f97316]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              พักการขาย ({countByStatus("paused")})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                กำลังโหลดประกาศบริการ...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-xl">
                <i className="fa-solid fa-box-open text-4xl text-gray-600 mb-3"></i>
                <p className="text-gray-400">คุณยังไม่มีประกาศบริการในหมวดหมู่นี้</p>
              </div>
            ) : (
              filteredServices.map((service) => {
                const isOnline = service.status.toLowerCase() === "active";
                return (
                  <div
                    key={service.id}
                    className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition flex flex-col"
                  >
                    <div className="h-36 bg-gray-900 flex items-center justify-center border-b border-gray-800 relative overflow-hidden">
                      {service.coverImageUrl ? (
                        <img
                          src={service.coverImageUrl}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fa-solid fa-briefcase text-4xl text-gray-700"></i>
                      )}
                      <div className="absolute top-2 right-2">
                        {isOnline ? (
                          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-medium">
                            ออนไลน์
                          </span>
                        ) : (
                          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-medium">
                            พักประกาศ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-xs text-[#f97316] font-medium mb-1">
                        {service.category} • {service.code}
                      </div>
                      <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                        {service.packageDesc} ({service.duration}) • {service.location}
                      </p>

                      <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          เริ่มต้น{" "}
                          <span className="text-base font-bold text-white block">
                            ฿ {service.price.toLocaleString("th-TH")}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            className="px-2.5 h-8 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition text-xs"
                          >
                            {isOnline ? "พัก" : "เปิด"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/provider/services/new?edit=${encodeURIComponent(service.id)}`)
                            }
                            className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition flex items-center justify-center"
                            title="แก้ไข"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(service.id, service.title)}
                            className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition flex items-center justify-center"
                            title="ลบ"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
