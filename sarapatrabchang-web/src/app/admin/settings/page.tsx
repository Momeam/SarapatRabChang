"use client";

import { useEffect, useState } from "react";
import { requestApi } from "@/lib/api";

interface PlatformSettings {
  siteName: string;
  adminEmail: string;
  supportPhone: string;
  announcement: string;
  platformFeePercent: number;
  minPayoutAmount: number;
  isMaintenance: boolean;
  allowRegister: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "SarapatRabChang (สารพัดรับจ้าง)",
    adminEmail: "admin@sarapatrabchang.com",
    supportPhone: "02-123-4567",
    announcement: "ยินดีต้อนรับสู่แพลตฟอร์มสารพัดรับจ้าง ศูนย์รวมฟรีแลนซ์คุณภาพ",
    platformFeePercent: 5,
    minPayoutAmount: 500,
    isMaintenance: false,
    allowRegister: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  useEffect(() => {
    let active = true;
    requestApi<PlatformSettings>("/api/admin/settings")
      .then((data) => {
        if (active && data) setSettings(data);
      })
      .catch(() => {
        // Keep defaults if not yet initialized
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setAlertMsg(null);
    try {
      const saved = await requestApi<PlatformSettings>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(saved);
      showAlert("บันทึกการตั้งค่าระบบลงฐานข้อมูลเรียบร้อยแล้ว!", "success");
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
    setAlertMsg(null);
    try {
      await requestApi("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert("เปลี่ยนรหัสผ่านแอดมินเรียบร้อยแล้ว!", "success");
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
          <h1 className="text-2xl font-bold text-white">ตั้งค่าระบบ (Admin Settings)</h1>
          <p className="text-gray-400 text-sm mt-1">
            จัดการค่าคอนฟิกและพารามิเตอร์หลักของแพลตฟอร์มสารพัดรับจ้าง (บันทึกลงฐานข้อมูลจริง)
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isLoading || isSaving}
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
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
          }`}
        >
          {alertMsg.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: General Settings */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-globe text-[#f97316] mr-2"></i> ตั้งค่าทั่วไปแพลตฟอร์ม
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1.5">ชื่อเว็บไซต์ / แพลตฟอร์ม</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">อีเมลผู้ดูแลระบบ (Admin Email)</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">เบอร์โทรศัพท์ซัพพอร์ต</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={settings.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        supportPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5">
                  ข้อความประกาศหน้าเว็บไซต์ (Banner Announcement)
                </label>
                <input
                  type="text"
                  value={settings.announcement}
                  onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Fee & Payout Settings */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-percent text-[#f97316] mr-2"></i> ค่าธรรมเนียมและเงื่อนไขการเงิน
            </h2>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">ค่าธรรมเนียมหักแพลตฟอร์ม (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.platformFeePercent}
                    onChange={(e) =>
                      setSettings({ ...settings, platformFeePercent: Number(e.target.value) })
                    }
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  />
                  <p className="text-xs text-gray-500 mt-1">หักจากยอดจ้างงานสำเร็จของฟรีแลนซ์</p>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">ยอดถอนเงินขั้นต่ำ (บาท)</label>
                  <input
                    type="number"
                    min={100}
                    value={settings.minPayoutAmount}
                    onChange={(e) =>
                      setSettings({ ...settings, minPayoutAmount: Number(e.target.value) })
                    }
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    จำนวนเงินขั้นต่ำที่ฟรีแลนซ์สามารถทำเรื่องถอนได้
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Password */}
        <div className="space-y-6">
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-shield-halved text-[#f97316] mr-2"></i> สถานะและความปลอดภัย
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">โหมดปิดปรับปรุงระบบ</p>
                  <p className="text-xs text-gray-400 mt-0.5">ปิดการใช้งานเว็บไซต์ชั่วคราว</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, isMaintenance: !s.isMaintenance }))
                  }
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${
                    settings.isMaintenance ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.isMaintenance ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">อนุญาตลงทะเบียน</p>
                  <p className="text-xs text-gray-400 mt-0.5">เปิด/ปิดการสมัครสมาชิกใหม่</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, allowRegister: !s.allowRegister }))
                  }
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${
                    settings.allowRegister ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.allowRegister ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="bg-[#171717] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-lock text-[#f97316] mr-2"></i> เปลี่ยนรหัสผ่านแอดมิน
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 text-xs">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-xs">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร (ตัวอักษร+ตัวเลข)"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-xs">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-medium transition border border-gray-700"
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
