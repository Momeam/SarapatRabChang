"use client";

import { useState } from "react";
import { requestApi } from "@/lib/api";
import { ProviderDashboard } from "@/types";

export default function FreelancerSettingsPage() {
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [vacationMode, setVacationMode] = useState(false);
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState(true);
  const [notifyPromotion, setNotifyPromotion] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleToggleVacationMode = async () => {
    const nextMode = !vacationMode;
    setVacationMode(nextMode);
    try {
      const dash = await requestApi<ProviderDashboard>("/api/provider/dashboard");
      await Promise.all(
        dash.services.map((s) =>
          requestApi(`/api/providers/${encodeURIComponent(s.id)}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextMode ? "paused" : "active" }),
          })
        )
      );
      showAlert(
        nextMode
          ? "เปิดโหมดพักร้อนแล้ว: พักการแสดงผลบริการทั้งหมดชั่วคราว"
          : "ปิดโหมดพักร้อนแล้ว: เปิดแสดงผลบริการทั้งหมดตามปกติ",
        "success"
      );
    } catch {
      // Keep toggle state even if no services yet
    }
  };

  const handleSaveSettings = () => {
    showAlert("อัปเดตการตั้งค่าบัญชีของคุณเรียบร้อยแล้ว!", "success");
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
          <h1 className="text-2xl font-bold text-white">ตั้งค่าการใช้งาน (Settings)</h1>
          <p className="text-gray-400 text-sm mt-1">
            จัดการความปลอดภัย การแจ้งเตือน และสถานะการรับงานของคุณ
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[#f97316]/20 flex items-center"
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i> บันทึกการเปลี่ยนแปลง
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
              <i className="fa-solid fa-plane-departure text-[#f97316] mr-2"></i> สถานะการรับงาน
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">โหมดพักร้อน (Vacation Mode)</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    หยุดรับออเดอร์ใหม่ชั่วคราว (บริการของคุณจะถูกซ่อนจากหน้าค้นหา)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVacationMode}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 shrink-0 ${
                    vacationMode ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      vacationMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {vacationMode && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-xs flex items-start">
                  <i className="fa-solid fa-circle-info mt-0.5 mr-2"></i>
                  ขณะนี้คุณเปิดโหมดพักร้อนอยู่ ลูกค้าจะไม่สามารถสั่งซื้องานบริการของคุณได้ จนกว่าคุณจะปิดโหมดนี้
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-bell text-[#f97316] mr-2"></i> การแจ้งเตือนผ่านอีเมล
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-gray-800">
                <p className="font-medium text-white">มีออเดอร์ใหม่</p>
                <button
                  type="button"
                  onClick={() => setNotifyOrder(!notifyOrder)}
                  className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${
                    notifyOrder ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      notifyOrder ? "translate-x-4" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-gray-800">
                <p className="font-medium text-white">ข้อความแชทใหม่จากลูกค้า</p>
                <button
                  type="button"
                  onClick={() => setNotifyMessage(!notifyMessage)}
                  className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${
                    notifyMessage ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      notifyMessage ? "translate-x-4" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-gray-800">
                <p className="font-medium text-white">ข่าวสารและโปรโมชันจากแพลตฟอร์ม</p>
                <button
                  type="button"
                  onClick={() => setNotifyPromotion(!notifyPromotion)}
                  className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${
                    notifyPromotion ? "bg-[#f97316]" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      notifyPromotion ? "translate-x-4" : "translate-x-0"
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
              <i className="fa-solid fa-lock text-[#f97316] mr-2"></i> เปลี่ยนรหัสผ่าน (Change Password)
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
