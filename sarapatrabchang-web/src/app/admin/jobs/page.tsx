"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  PauseCircle,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { requestApi } from "@/lib/api";
import { ServiceCategory } from "@/types";

interface AdminJobItem {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  serviceAreas: string[];
  coverImageUrl: string | null;
  portfolio: { title: string; image: string; filename?: string }[];
  categoryKey: string;
  categoryName: string;
  packageName: string;
  duration: string;
  price: number;
  features: string[];
  freelancerName: string;
  freelancerEmail: string;
  freelancerUserId: string;
  kycStatus: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "paused" | "rejected">("ALL");
  const [selectedJob, setSelectedJob] = useState<AdminJobItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  const showAlert = (message: string, type: "success" | "danger") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jobList, categoryList] = await Promise.all([
        requestApi<AdminJobItem[]>("/api/admin/jobs"),
        requestApi<ServiceCategory[]>("/api/categories"),
      ]);
      setJobs(jobList);
      setCategories(categoryList.filter((c) => c.id !== "all"));
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "โหลดข้อมูลประกาศบริการไม่สำเร็จ", "danger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestApi<AdminJobItem[]>("/api/admin/jobs"),
      requestApi<ServiceCategory[]>("/api/categories"),
    ])
      .then(([jobList, categoryList]) => {
        if (!active) return;
        setJobs(jobList);
        setCategories(categoryList.filter((c) => c.id !== "all"));
      })
      .catch((err) => {
        if (active) {
          showAlert(err instanceof Error ? err.message : "โหลดข้อมูลประกาศบริการไม่สำเร็จ", "danger");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (job: AdminJobItem, nextStatus: "active" | "paused" | "rejected") => {
    let reason = "";
    if (nextStatus === "rejected") {
      const input = window.prompt(`ระบุเหตุผลในการปฏิเสธ/ระงับประกาศ "${job.title}":`);
      if (input === null) return;
      if (!input.trim()) {
        window.alert("กรุณาระบุเหตุผลในการปฏิเสธประกาศ");
        return;
      }
      reason = input.trim();
    } else if (nextStatus === "active") {
      if (!window.confirm(`ยืนยันการอนุมัติและเปิดแสดงประกาศ "${job.title}" บนหน้าแพลตฟอร์ม?`)) return;
    }

    setIsSubmitting(true);
    try {
      await requestApi(`/api/admin/jobs/${encodeURIComponent(job.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      setJobs((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, status: nextStatus } : item))
      );
      if (selectedJob?.id === job.id) {
        setSelectedJob((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      showAlert(
        nextStatus === "active"
          ? `อนุมัติและเปิดเผยแพร่ประกาศ "${job.title}" สำเร็จ!`
          : nextStatus === "rejected"
            ? `ปฏิเสธประกาศ "${job.title}" เรียบร้อยแล้ว`
            : `พักการแสดงผลประกาศ "${job.title}" เรียบร้อยแล้ว`,
        nextStatus === "active" ? "success" : "danger"
      );
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "อัปเดตสถานะประกาศไม่สำเร็จ", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (job: AdminJobItem) => {
    if (!window.confirm(`ยืนยันการลบประกาศ "${job.title}" ออกจากระบบอย่างถาวร?`)) return;
    setIsSubmitting(true);
    try {
      await requestApi(`/api/admin/jobs/${encodeURIComponent(job.id)}`, {
        method: "DELETE",
      });
      setJobs((prev) => prev.filter((item) => item.id !== job.id));
      if (selectedJob?.id === job.id) setSelectedJob(null);
      showAlert(`ลบประกาศ "${job.title}" เรียบร้อยแล้ว`, "success");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "ลบประกาศไม่สำเร็จ", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterCategory !== "all" && job.categoryKey !== filterCategory) return false;
    if (filterStatus !== "ALL" && job.status.toLowerCase() !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">จัดการประกาศบริการทั้งหมด</h1>
          <p className="text-gray-400 text-sm mt-1">
            ตรวจสอบรายละเอียดประกาศบริการจากฐานข้อมูล อนุมัติ ระงับ หรือลบประกาศที่ไม่เหมาะสม
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl text-zinc-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {alertMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            alertMsg.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{alertMsg.message}</span>
        </div>
      )}

      <div className="bg-[#171717] border border-gray-800 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 px-6 py-4 bg-black/50 gap-4">
          <h2 className="text-white font-semibold text-sm">
            รายการประกาศบริการ ({filteredJobs.length} รายการ)
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">หมวดหมู่:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black border border-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f97316]"
              >
                <option value="all">ทั้งหมด</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">สถานะ:</span>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "ALL" | "active" | "paused" | "rejected")
                }
                className="bg-black border border-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f97316]"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="active">กำลังเผยแพร่ (Active)</option>
                <option value="paused">หยุดพัก (Paused)</option>
                <option value="rejected">ถูกระงับ/ปฏิเสธ (Rejected)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs bg-black/40 border-b border-gray-800 uppercase">
                <th className="p-4 font-semibold w-24">ภาพปก</th>
                <th className="p-4 font-semibold">ชื่อประกาศบริการ</th>
                <th className="p-4 font-semibold">ผู้ให้บริการ (Freelancer)</th>
                <th className="p-4 font-semibold">ราคาเริ่มต้น</th>
                <th className="p-4 font-semibold text-center">สถานะ</th>
                <th className="p-4 font-semibold text-right pr-6">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-800/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    กำลังโหลดรายการประกาศบริการ...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">
                    ไม่พบประกาศบริการตามตัวกรองที่เลือก
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const status = job.status.toLowerCase();
                  return (
                    <tr key={job.id} className="hover:bg-zinc-900/60 transition">
                      <td className="p-4">
                        {job.coverImageUrl ? (
                          <img
                            src={job.coverImageUrl}
                            alt={job.title}
                            className="w-14 h-11 object-cover rounded-lg border border-gray-700 bg-zinc-800"
                          />
                        ) : (
                          <div className="w-14 h-11 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center justify-center text-gray-500">
                            <span className="text-[9px] font-bold">{job.code}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{job.title}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          {job.categoryName} • {job.packageName} ({job.duration})
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-zinc-200">{job.freelancerName}</p>
                        <p className="text-gray-500 text-[11px]">{job.freelancerEmail}</p>
                      </td>
                      <td className="p-4 font-bold text-orange-400 text-sm">
                        ฿{job.price.toLocaleString("th-TH")}
                      </td>
                      <td className="p-4 text-center">
                        {status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> เผยแพร่
                          </span>
                        ) : status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> ถูกปฏิเสธ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <PauseCircle className="w-3 h-3" /> พักประกาศ
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedJob(job)}
                            className="px-3 py-1.5 text-xs border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> ดูตัวอย่าง
                          </button>

                          {status !== "active" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleUpdateStatus(job, "active")}
                              className="px-3 py-1.5 text-xs border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition disabled:opacity-50"
                            >
                              อนุมัติ
                            </button>
                          )}

                          {status !== "rejected" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleUpdateStatus(job, "rejected")}
                              className="px-3 py-1.5 text-xs border border-red-600 text-red-400 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                            >
                              ปฏิเสธ/ระงับ
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDelete(job)}
                            className="p-1.5 text-xs border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-600 rounded-lg transition disabled:opacity-50"
                            title="ลบประกาศ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/50">
              <div>
                <span className="text-xs font-mono text-orange-400">{selectedJob.code}</span>
                <h3 className="font-bold text-base text-white">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
              {selectedJob.coverImageUrl && (
                <div className="h-52 rounded-xl overflow-hidden border border-gray-800 bg-black">
                  <img
                    src={selectedJob.coverImageUrl}
                    alt={selectedJob.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-gray-800">
                <div>
                  <span className="text-gray-400 flex items-center gap-1 mb-1">
                    <UserIcon className="w-3.5 h-3.5" /> ผู้ให้บริการ:
                  </span>
                  <p className="font-semibold text-white text-sm">{selectedJob.freelancerName}</p>
                  <p className="text-gray-400">{selectedJob.freelancerEmail}</p>
                </div>
                <div>
                  <span className="text-gray-400 flex items-center gap-1 mb-1">
                    <Tag className="w-3.5 h-3.5" /> หมวดหมู่ & ราคา:
                  </span>
                  <p className="font-semibold text-orange-400 text-sm">
                    {selectedJob.categoryName} • ฿{selectedJob.price.toLocaleString("th-TH")}
                  </p>
                  <p className="text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {selectedJob.packageName} ({selectedJob.duration})
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> พื้นที่ให้บริการ:
                  </span>
                  <p className="text-zinc-200">{selectedJob.serviceAreas.join(", ") || "-"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-300 mb-1.5">รายละเอียดบริการ</h4>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-black/30 p-3.5 rounded-xl border border-gray-800">
                  {selectedJob.description || "-"}
                </p>
              </div>

              {selectedJob.features && selectedJob.features.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-300 mb-1.5">สิ่งที่รวมในแพ็กเกจ</h4>
                  <ul className="space-y-1 bg-black/30 p-3.5 rounded-xl border border-gray-800">
                    {selectedJob.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.portfolio && selectedJob.portfolio.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-300 mb-2">
                    รูปภาพผลงาน ({selectedJob.portfolio.length} รูป)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedJob.portfolio.map((item, idx) => (
                      <div
                        key={idx}
                        className="h-28 rounded-xl overflow-hidden border border-gray-800 bg-black"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/60 border-t border-gray-800 flex items-center justify-end gap-3">
              {selectedJob.status.toLowerCase() !== "rejected" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus(selectedJob, "rejected")}
                  className="px-4 py-2 rounded-xl border border-red-700 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition"
                >
                  ปฏิเสธ/ระงับประกาศ
                </button>
              )}
              {selectedJob.status.toLowerCase() !== "active" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus(selectedJob, "active")}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  อนุมัติให้เผยแพร่
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
