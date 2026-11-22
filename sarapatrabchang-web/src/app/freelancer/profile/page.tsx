"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import type { AccountProfile } from "@/lib/profile";
import KycForm from "@/components/provider/KycForm";

export default function FreelancerProfilePage() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;
    requestApi<AccountProfile>("/api/profile")
      .then((profile) => {
        if (!active) return;
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatarUrl || "");
      })
      .catch((err) => {
        if (active) {
          showAlert(err instanceof Error ? err.message : "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ", "error");
        }
      })
      .finally(() => {
        if (active) setIsLoadingProfile(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showAlert("กรุณาระบุชื่อ-นามสกุล", "error");
      return;
    }
    setIsSavingProfile(true);
    try {
      const saved = await requestApi<AccountProfile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });
      updateProfile({
        full_name: saved.fullName,
        phone: saved.phone,
      });
      showAlert("บันทึกข้อมูลโปรไฟล์ลงฐานข้อมูลสำเร็จ!", "success");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "บันทึกข้อมูลโปรไฟล์ไม่สำเร็จ", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">จัดการโปรไฟล์ & ยืนยันตัวตนเป็นฟรีแลนซ์ (KYC)</h1>
        <p className="text-gray-400 text-sm mt-1">
          ตั้งค่าข้อมูลส่วนตัวและกรอกแบบฟอร์มส่งคำขอยืนยันตัวตนเพื่อให้แอดมินตรวจสอบอนุมัติบัญชีฟรีแลนซ์
        </p>
      </div>

      {alertMsg && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${
            alertMsg.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : alertMsg.type === "error"
                ? "bg-red-500/10 border-red-500 text-red-400"
                : "bg-blue-500/10 border-blue-500 text-blue-400"
          }`}
        >
          {alertMsg.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
        {/* ส่วนที่ 1: ข้อมูลโปรไฟล์ (Profile Information) */}
        <div className="lg:col-span-5 bg-[#171717] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 border-l-4 border-[#f97316] pl-2">
            ข้อมูลโปรไฟล์ผู้ใช้งาน
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-sm">
            {/* รูปโปรไฟล์ (File Upload) */}
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user text-2xl"></i>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1.5 rounded-lg transition border border-gray-700 text-xs font-medium"
                >
                  เลือกไฟล์รูปภาพโปรไฟล์
                </button>
                <p className="text-[10px] text-gray-500 mt-1">รองรับไฟล์รูปภาพ JPG, PNG</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">ชื่อ - นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoadingProfile}
                placeholder="ชื่อและนามสกุลของคุณ"
                className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoadingProfile}
                placeholder="08X-XXX-XXXX"
                className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">แนะนำตัวและความเชี่ยวชาญ (Bio)</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isLoadingProfile}
                placeholder="แนะนำประสบการณ์และบริการของคุณ..."
                className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoadingProfile || isSavingProfile}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg shadow-[#f97316]/20"
              >
                {isSavingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูลโปรไฟล์"}
              </button>
            </div>
          </form>
        </div>

        {/* ส่วนที่ 2: แบบฟอร์มยืนยันตัวตนเป็นฟรีแลนซ์ที่มีอยู่ (Existing KycForm) */}
        <div className="lg:col-span-7 text-zinc-900">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white border-l-4 border-[#f97316] pl-2">
              แบบฟอร์มส่งคำขอยืนยันตัวตนเป็นฟรีแลนซ์ (KYC)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              กรอกข้อมูลและแนบไฟล์เอกสารจริงเพื่อส่งคำขอให้แอดมินตรวจสอบและกดยืนยันอนุมัติ
            </p>
          </div>
          <KycForm initialName={fullName} isAuthLoading={authLoading || isLoadingProfile} />
        </div>
      </div>
    </div>
  );
}
