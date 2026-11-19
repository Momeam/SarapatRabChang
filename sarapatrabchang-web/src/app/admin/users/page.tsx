"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  RefreshCw,
  UserCheck,
  Building,
  CreditCard,
  Phone,
  Mail,
  User as UserIcon
} from "lucide-react";
import { requestApi } from "@/lib/api";

interface KycSubmissionItem {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string;
  categoryKey: string;
  categoryName: string | null;
  bankName: string;
  bankAccountNumber: string;
  idDocumentName: string;
  idDocumentType: string;
  bankDocumentName: string;
  bankDocumentType: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  updatedAt: string;
  email: string;
  phone: string;
}

export default function AdminUsersPage() {
  const [submissions, setSubmissions] = useState<KycSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "pending" | "approved" | "rejected">("pending");

  // Selected item for inspection modal
  const [selectedKyc, setSelectedKyc] = useState<KycSubmissionItem | null>(null);
  const [idDocUrl, setIdDocUrl] = useState<string | null>(null);
  const [bankDocUrl, setBankDocUrl] = useState<string | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  
  // Action states inside modal
  const [actionNote, setActionNote] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await requestApi<KycSubmissionItem[]>("/api/admin/kyc");
      setSubmissions(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลคำขอ KYC ได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestApi<KycSubmissionItem[]>("/api/admin/kyc")
      .then((data) => {
        if (!active) return;
        setSubmissions(data);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลคำขอ KYC ได้");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Open modal & fetch document blobs
  const openInspectModal = async (item: KycSubmissionItem) => {
    setSelectedKyc(item);
    setActionNote("");
    setActionError(null);
    setActionSuccess(null);
    setIsLoadingDocs(true);
    setIdDocUrl(null);
    setBankDocUrl(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    try {
      const [idRes, bankRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/kyc/${item.id}/document/id`, { credentials: "include" }),
        fetch(`${apiUrl}/api/admin/kyc/${item.id}/document/bank`, { credentials: "include" }),
      ]);

      if (idRes.ok) {
        const blob = await idRes.blob();
        setIdDocUrl(URL.createObjectURL(blob));
      }
      if (bankRes.ok) {
        const blob = await bankRes.blob();
        setBankDocUrl(URL.createObjectURL(blob));
      }
    } catch {
      // Ignore preview fetch errors
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const closeInspectModal = () => {
    if (idDocUrl) URL.revokeObjectURL(idDocUrl);
    if (bankDocUrl) URL.revokeObjectURL(bankDocUrl);
    setIdDocUrl(null);
    setBankDocUrl(null);
    setSelectedKyc(null);
  };

  // Admin handles Approve or Reject
  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!selectedKyc) return;
    setIsSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await requestApi(`/api/admin/kyc/${selectedKyc.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note: actionNote.trim() || undefined,
        }),
      });

      const successMsg = status === "approved" 
        ? `อนุมัติ ${selectedKyc.fullName} เป็นฟรีแลนซ์เรียบร้อยแล้ว` 
        : `ปฏิเสธคำขอของ ${selectedKyc.fullName} เรียบร้อยแล้ว`;
      
      setActionSuccess(successMsg);
      
      // Update local state
      startTransition(() => {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedKyc.id ? { ...s, status } : s))
        );
        setSelectedKyc((prev) => (prev ? { ...prev, status } : null));
      });

      // Auto close after brief delay on success
      setTimeout(() => {
        closeInspectModal();
      }, 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกสถานะ");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  const filteredSubmissions = submissions.filter((item) => {
    if (activeTab !== "ALL" && item.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.nationalId?.includes(q) ||
      item.bankAccountNumber?.includes(q) ||
      item.categoryName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">ตรวจสอบคำขอเป็นฟรีแลนซ์ & KYC</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Super Admin
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            ตรวจสอบข้อมูลและเอกสารหลักฐานของผู้ใช้ที่ส่งคำขอเป็นผู้ให้บริการ (Freelancer) ก่อนกดยืนยันอนุมัติ
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl text-zinc-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {loadError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-[#171717] border border-gray-800 rounded-2xl overflow-hidden shadow-xl mb-8">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center border-b border-gray-800 px-6 py-4 bg-black/40 gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 pb-2 px-1 transition border-b-2 ${
                activeTab === "pending"
                  ? "text-[#f97316] border-[#f97316]"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <Clock className="w-4 h-4" />
              รอตรวจสอบ (Pending)
              <span className={`text-xs px-2 py-0.5 rounded-full ${pendingCount > 0 ? "bg-orange-500 text-white font-bold" : "bg-gray-800 text-gray-400"}`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 pb-2 px-1 transition border-b-2 ${
                activeTab === "approved"
                  ? "text-emerald-400 border-emerald-400"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              อนุมัติแล้ว
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex items-center gap-2 pb-2 px-1 transition border-b-2 ${
                activeTab === "rejected"
                  ? "text-rose-400 border-rose-400"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <XCircle className="w-4 h-4" />
              ปฏิเสธ
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ALL")}
              className={`pb-2 px-1 transition border-b-2 ${
                activeTab === "ALL"
                  ? "text-white border-[#f97316]"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              ทั้งหมด ({submissions.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล, บัตร ปชช...."
              className="w-full bg-black/60 border border-gray-700 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#f97316] transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs bg-black/50 border-b border-gray-800 uppercase tracking-wider">
                <th className="p-4 font-semibold">ผู้สมัคร (Applicant)</th>
                <th className="p-4 font-semibold">เลขบัตร ปชช.</th>
                <th className="p-4 font-semibold">หมวดหมู่งาน</th>
                <th className="p-4 font-semibold">บัญชีธนาคาร</th>
                <th className="p-4 font-semibold">วันที่ยื่น</th>
                <th className="p-4 font-semibold text-center">สถานะ</th>
                <th className="p-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f97316]" />
                    กำลังโหลดข้อมูลคำขอ...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    ไม่พบข้อมูลคำขอในหมวดหมู่นี้
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  return (
                    <tr key={sub.id} className="hover:bg-zinc-900/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-semibold shrink-0">
                            {sub.fullName?.slice(0, 1) || <UserIcon className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{sub.fullName}</p>
                            <p className="text-gray-400 text-[11px]">{sub.email}</p>
                            {sub.phone && <p className="text-gray-500 text-[10px]">{sub.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-300">
                        {sub.nationalId ? `${sub.nationalId.slice(0, 3)}-xxxxxxx-${sub.nationalId.slice(-2)}` : "-"}
                      </td>
                      <td className="p-4 text-zinc-300">
                        <span className="px-2.5 py-1 bg-zinc-800/80 rounded-lg border border-zinc-700 text-xs">
                          {sub.categoryName || sub.categoryKey || "ทั่วไป"}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-300">
                        <p className="font-medium">{sub.bankName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{sub.bankAccountNumber}</p>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(sub.submittedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-center">
                        {sub.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            <Clock className="w-3 h-3" /> รอตรวจสอบ
                          </span>
                        )}
                        {sub.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว
                          </span>
                        )}
                        {sub.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openInspectModal(sub)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            sub.status === "pending"
                              ? "bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md shadow-orange-900/30"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {sub.status === "pending" ? "ตรวจสอบ & อนุมัติ" : "ดูข้อมูล KYC"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspection Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#f97316]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">ตรวจสอบข้อมูลคำขอเป็นฟรีแลนซ์</h3>
                  <p className="text-xs text-gray-400">
                    ยื่นคำขอเมื่อ {new Date(selectedKyc.submittedAt).toLocaleString("th-TH")}
                  </p>
                </div>
              </div>
              <button
                onClick={closeInspectModal}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-sm">
              {actionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-gray-800">
                <span className="text-xs text-gray-400">สถานะคำขอปัจจุบัน:</span>
                <div>
                  {selectedKyc.status === "pending" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      รอแอดมินตรวจสอบและยืนยัน
                    </span>
                  )}
                  {selectedKyc.status === "approved" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      อนุมัติการเป็นฟรีแลนซ์แล้ว
                    </span>
                  )}
                  {selectedKyc.status === "rejected" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      คำขอถูกปฏิเสธ
                    </span>
                  )}
                </div>
              </div>

              {/* Applicant Info Grid */}
              <div className="bg-black/30 border border-gray-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                  ข้อมูลส่วนตัวและผู้รับเงิน
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5">ชื่อ-นามสกุล (ผู้สมัคร):</span>
                    <span className="font-semibold text-white text-sm">{selectedKyc.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">เลขประจำตัวประชาชน (13 หลัก):</span>
                    <span className="font-mono font-semibold text-zinc-200 tracking-wide">
                      {selectedKyc.nationalId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-500" /> อีเมล:
                    </span>
                    <span className="text-zinc-200">{selectedKyc.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-500" /> เบอร์โทรศัพท์:
                    </span>
                    <span className="text-zinc-200">{selectedKyc.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-gray-500" /> หมวดหมู่งานบริการที่ขอรับ:
                    </span>
                    <span className="text-orange-400 font-medium">
                      {selectedKyc.categoryName || selectedKyc.categoryKey || "ทั่วไป"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-500" /> ธนาคาร & เลขบัญชี:
                    </span>
                    <span className="text-white font-medium">
                      {selectedKyc.bankName} - {selectedKyc.bankAccountNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Document Previews */}
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                  เอกสารหลักฐานยืนยันตัวตน
                </h4>

                {isLoadingDocs ? (
                  <div className="p-8 text-center text-gray-400 bg-black/40 rounded-xl border border-gray-800">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f97316]" />
                    กำลังดาวน์โหลดและเรนเดอร์เอกสาร...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Document Card */}
                    <div className="bg-black/40 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-orange-400" />
                            สำเนาบัตรประจำตัวประชาชน
                          </span>
                          {idDocUrl && (
                            <a
                              href={idDocUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 font-medium"
                            >
                              เปิดไฟล์เต็ม <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3 truncate">
                          {selectedKyc.idDocumentName || "บัตรประชาชน"}
                        </p>
                      </div>

                      <div className="h-44 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {idDocUrl ? (
                          selectedKyc.idDocumentType?.includes("pdf") ? (
                            <div className="text-center p-4">
                              <FileText className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-300 font-medium">เอกสารรูปแบบ PDF</p>
                              <a
                                href={idDocUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-white"
                              >
                                เปิดอ่านไฟล์ PDF
                              </a>
                            </div>
                          ) : (
                            <img
                              src={idDocUrl}
                              alt="บัตรประชาชน"
                              className="w-full h-full object-contain"
                            />
                          )
                        ) : (
                          <span className="text-xs text-gray-500">ไม่มีไฟล์ตัวอย่าง</span>
                        )}
                      </div>
                    </div>

                    {/* Bank Document Card */}
                    <div className="bg-black/40 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-orange-400" />
                            สำเนาหน้าสมุดบัญชีธนาคาร
                          </span>
                          {bankDocUrl && (
                            <a
                              href={bankDocUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 font-medium"
                            >
                              เปิดไฟล์เต็ม <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3 truncate">
                          {selectedKyc.bankDocumentName || "สมุดบัญชีธนาคาร"}
                        </p>
                      </div>

                      <div className="h-44 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {bankDocUrl ? (
                          selectedKyc.bankDocumentType?.includes("pdf") ? (
                            <div className="text-center p-4">
                              <FileText className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                              <p className="text-xs text-gray-300 font-medium">เอกสารรูปแบบ PDF</p>
                              <a
                                href={bankDocUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-white"
                              >
                                เปิดอ่านไฟล์ PDF
                              </a>
                            </div>
                          ) : (
                            <img
                              src={bankDocUrl}
                              alt="สมุดบัญชีธนาคาร"
                              className="w-full h-full object-contain"
                            />
                          )
                        ) : (
                          <span className="text-xs text-gray-500">ไม่มีไฟล์ตัวอย่าง</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Note / Reason Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  หมายเหตุหรือเหตุผลประกอบ (ส่งแจ้งเตือนไปยังผู้ใช้เมื่ออนุมัติหรือปฏิเสธ)
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="ระบุข้อความหรือเหตุผล (เช่น เอกสารไม่ชัดเจน, บัตรประชาชนหมดอายุ ฯลฯ)"
                  rows={2}
                  className="w-full bg-black/70 border border-gray-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#f97316] transition"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-black/60 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                แอดมินต้องตรวจสอบความถูกต้องของเอกสารก่อนกดยืนยัน
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("rejected")}
                  disabled={isSubmittingAction}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-800 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  ปฏิเสธคำขอ
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus("approved")}
                  disabled={isSubmittingAction}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ยืนยันอนุมัติเป็นฟรีแลนซ์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
