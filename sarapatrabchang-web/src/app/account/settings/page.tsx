"use client";

import { useState } from "react";

export default function AccountSettingsPage() {
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // State สำหรับ Toggle การแจ้งเตือน
  const [notifyNewPayout, setNotifyNewPayout] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(false);

  // ฟังก์ชันจำลองการบันทึก
  const handleSaveSettings = () => {
    setAlertMsg({ message: "อัปเดตการตั้งค่าบัญชีของคุณเรียบร้อยแล้ว!", type: "success" });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ตั้งค่าบัญชี (Account Settings)</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการข้อมูลส่วนตัว การแจ้งเตือน และความปลอดภัย</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[#f97316]/20 flex items-center"
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i> บันทึกการเปลี่ยนแปลง
        </button>
      </div>

      {/* แจ้งเตือน */}
      {alertMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว & แจ้งเตือน */}
        <div className="space-y-6">
          
          {/* Card 1: Profile Info */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-user-tie text-[#f97316] mr-2"></i> ข้อมูลส่วนตัว (Profile)
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 text-2xl">
                  <i className="fa-solid fa-user"></i>
                </div>
                <button className="bg-black border border-gray-700 hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded transition text-xs">
                  เปลี่ยนรูปโปรไฟล์
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">ชื่อพนักงาน</label>
                  <input type="text" defaultValue="สมรักษ์ รักตัวเลข" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">แผนก</label>
                  <input type="text" defaultValue="ฝ่ายบัญชีและการเงิน" disabled className="w-full bg-gray-900 border border-gray-800 text-gray-500 rounded-lg px-4 py-2.5 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5">อีเมลติดต่อ</label>
                <input type="email" defaultValue="account01@sarapatrabchang.com" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
              </div>
            </div>
          </div>

          {/* Card 2: Notifications */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-bell text-[#f97316] mr-2"></i> การแจ้งเตือน (Notifications)
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">แจ้งเตือนคำขอถอนเงินใหม่</p>
                  <p className="text-xs text-gray-400 mt-0.5">รับอีเมลเมื่อฟรีแลนซ์กดส่งคำขอถอนเงิน</p>
                </div>
                <button 
                  onClick={() => setNotifyNewPayout(!notifyNewPayout)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${notifyNewPayout ? 'bg-[#f97316]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifyNewPayout ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">สรุปยอดโอนประจำวัน</p>
                  <p className="text-xs text-gray-400 mt-0.5">รับรายงานสรุปยอดที่ต้องโอนทุกเช้าเวลา 08:00 น.</p>
                </div>
                <button 
                  onClick={() => setNotifyDailySummary(!notifyDailySummary)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${notifyDailySummary ? 'bg-[#f97316]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifyDailySummary ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* คอลัมน์ขวา: ความปลอดภัย & ส่งออกข้อมูล */}
        <div className="space-y-6">
          
          {/* Card 3: Security */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-lock text-[#f97316] mr-2"></i> ความปลอดภัย (Security)
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">รหัสผ่านปัจจุบัน</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">รหัสผ่านใหม่</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 text-xs">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
              </div>
              <button className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition border border-gray-700">
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </div>

          {/* Card 4: Export Preferences */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-file-export text-[#f97316] mr-2"></i> รูปแบบไฟล์ส่งออก (Export Format)
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1.5">รูปแบบไฟล์เริ่มต้นเมื่อกด Export Payouts</label>
                <select className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]">
                  <option value="csv">CSV (รองรับระบบธนาคารทั่วไป)</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">
                * การตั้งค่านี้จะถูกใช้เป็นค่าเริ่มต้นในหน้ารายการขอถอนเงิน (Payouts)
              </p>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}