"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import type { AccountProfile } from "@/lib/profile";

export default function AccountSettingsPage() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notifyNewPayout, setNotifyNewPayout] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (message: string, type: "success" | "error") => {
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
        setEmail(profile.email || "");
        setAvatarUrl(profile.avatarUrl || "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setAvatarUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    if (!fullName.trim()) {
      showAlert("กรุณาระบุชื่อผู้ใช้งาน", "error");
      return;
    }
    setIsSaving(true);
    try {
      const saved = await requestApi<AccountProfile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: fullName.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });
      updateProfile({ full_name: saved.fullName });
      showAlert("อัปเดตการตั้งค่าบัญชีลงฐานข้อมูลเรียบร้อยแล้ว!", "success");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "บันทึกการตั้งค่าไม่สำเร็จ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showAlert("กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน", "error");
      return;
    }
    setIsChangingPassword(true);
    try {
      await requestApi("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert("เปลี่ยนรหัสผ่านสำเร็จแล้ว!", "success");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar text-white">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ตั้งค่าบัญชี (Account Settings)</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการข้อมูลส่วนตัว การแจ้งเตือน และความปลอดภัย</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-[#f97316] hover:bg-opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[#f97316]/20 flex items-center"
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i>
          {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>

      {alertMsg && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${
            alertMsg.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-500"
              : "bg-red-500/10 border-red-500 text-red-500"
          }`}
        >
          {alertMsg.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-user-tie text-[#f97316] mr-2"></i> ข้อมูลส่วนตัว (Profile)
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 text-2xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-user"></i>
                  )}
                </div>
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
                  className="bg-black border border-gray-700 hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded transition text-xs"
                >
                  เลือกไฟล์รูปโปรไฟล์
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">แผนก</label>
                  <input
                    type="text"
                    defaultValue="ฝ่ายบัญชีและการเงิน"
                    disabled
                    className="w-full bg-gray-900 border border-gray-800 text-gray-500 rounded-lg px-4 py-2.5 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5">อีเมลติดต่อ</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-gray-900 border border-gray-800 text-gray-400 rounded-lg px-4 py-2.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-bell text-[#f97316] mr-2"></i> การแจ้งเตือน (Notifications)
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">แจ้งเตือนคำขอถอนเงินใหม่</p>
                  <p className="text-xs text-gray-400 mt-0.5">รับการแจ้งเตือนเมื่อฟรีแลนซ์กดส่งคำขอถอนเงิน</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyNewPayout(!notifyNewPayout)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${
                    notifyNewPayout ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifyNewPayout ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">สรุปยอดโอนประจำวัน</p>
                  <p className="text-xs text-gray-400 mt-0.5">รับรายงานสรุปยอดที่ต้องโอนทุกเช้าเวลา 08:00 น.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyDailySummary(!notifyDailySummary)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${
                    notifyDailySummary ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifyDailySummary ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleChangePassword}
            className="bg-[#171717] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-lock text-[#f97316] mr-2"></i> ความปลอดภัย (Security)
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร (ตัวอักษร+ตัวเลข)"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition border border-gray-700"
              >
                {isChangingPassword ? "กำลังอัปเดต..." : "อัปเดตรหัสผ่าน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
