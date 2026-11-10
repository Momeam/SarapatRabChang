"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  // สร้าง State จำลองสำหรับเก็บค่าการตั้งค่าต่างๆ
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [allowRegister, setAllowRegister] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ฟังก์ชันจำลองการบันทึกข้อมูล
  const handleSaveSettings = () => {
    // ในอนาคตตรงนี้จะใช้ Fetch/Axios ส่งข้อมูลไปหา Node.js API
    setAlertMsg({ message: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!", type: "success" });
    
    // ปิด Alert อัตโนมัติใน 3 วินาที
    setTimeout(() => {
      setAlertMsg(null);
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ตั้งค่าระบบ (Admin Settings)</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการค่าคอนฟิกและพารามิเตอร์หลักของแพลตฟอร์มสารพัดรับจ้าง</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[#f97316]/20 flex items-center"
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i> บันทึกการเปลี่ยนแปลง
        </button>
      </div>

      {/* แจ้งเตือนการบันทึก */}
      {alertMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      {/* Settings Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (2 Spans): General & Commission */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: General Settings */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-globe text-[#f97316] mr-2"></i> ตั้งค่าทั่วไปแพลตฟอร์ม
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1.5">ชื่อเว็บไซต์ / แพลตฟอร์ม</label>
                <input type="text" defaultValue="SarapatRabChang (สารพัดรับจ้าง)" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">อีเมลผู้ดูแลระบบ (Admin Email)</label>
                  <input type="email" defaultValue="admin@sarapatrabchang.com" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">เบอร์โทรศัพท์ซัพพอร์ต</label>
                  <input type="text" defaultValue="02-123-4567" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5">ข้อความประกาศหน้าเว็บไซต์ (Banner Announcement)</label>
                <input type="text" defaultValue="ยินดีต้อนรับสู่แพลตฟอร์มสารพัดรับจ้าง ศูนย์รวมฟรีแลนซ์คุณภาพ" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
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
                  <input type="number" defaultValue="5" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
                  <p className="text-xs text-gray-500 mt-1">หักจากยอดจ้างงานสำเร็จของฟรีแลนซ์</p>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">ยอดถอนเงินขั้นต่ำ (บาท)</label>
                  <input type="number" defaultValue="500" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f97316]" />
                  <p className="text-xs text-gray-500 mt-1">จำนวนเงินขั้นต่ำที่ฟรีแลนซ์สามารถทำเรื่องถอนได้</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Span): Security & Maintenance */}
        <div className="space-y-6">
          
          {/* Card 3: System Status / Maintenance Mode */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-shield-halved text-[#f97316] mr-2"></i> สถานะและความปลอดภัย
            </h2>
            
            <div className="space-y-4 text-sm">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">โหมดปิดปรับปรุงระบบ</p>
                  <p className="text-xs text-gray-400 mt-0.5">ปิดการใช้งานเว็บไซต์ชั่วคราว</p>
                </div>
                <button 
                  onClick={() => setIsMaintenance(!isMaintenance)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${isMaintenance ? 'bg-[#f97316]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="font-medium text-white">อนุญาตลงทะเบียน</p>
                  <p className="text-xs text-gray-400 mt-0.5">เปิด/ปิดการสมัครสมาชิกใหม่</p>
                </div>
                <button 
                  onClick={() => setAllowRegister(!allowRegister)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 ${allowRegister ? 'bg-[#f97316]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowRegister ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Admin Password Change */}
          <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center border-l-4 border-[#f97316] pl-2">
              <i className="fa-solid fa-lock text-[#f97316] mr-2"></i> เปลี่ยนรหัสผ่านแอดมิน
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1 text-xs">รหัสผ่านปัจจุบัน</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-xs">รหัสผ่านใหม่</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-xs">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" placeholder="••••••••" className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316]" />
              </div>
              <button className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-xs font-medium transition border border-gray-700">
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}