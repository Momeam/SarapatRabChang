"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  
  // ข้อมูลจำลองสำหรับสรุปสถิติบน Dashboard
  const stats = [
    { title: "ผู้ใช้งานทั้งหมด", value: "1,248", icon: "fa-users", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "รอตรวจสอบ KYC", value: "12", icon: "fa-id-card", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { title: "ประกาศงานรออนุมัติ", value: "5", icon: "fa-briefcase", color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "ข้อพิพาทรอตัดสิน", value: "2", icon: "fa-scale-balanced", color: "text-red-500", bgColor: "bg-red-500/10" },
  ];

  // ข้อมูลจำลองสำหรับตารางกิจกรรมล่าสุด
  const recentActivities = [
    { id: 1, action: "สมหญิง รักงาน สมัครสมาชิกใหม่", time: "10 นาทีที่แล้ว", type: "USER" },
    { id: 2, action: "เอกชัย ส่งคำขอถอนเงิน ฿ 5,000", time: "35 นาทีที่แล้ว", type: "FINANCE" },
    { id: 3, action: "มีข้อพิพาทใหม่ ออเดอร์ #ORD-9901", time: "1 ชั่วโมงที่แล้ว", type: "DISPUTE" },
    { id: 4, action: "ประกาศงาน 'เขียนเว็บ React' รอตรวจสอบ", time: "2 ชั่วโมงที่แล้ว", type: "JOB" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-gray-400 text-sm">สรุปสถิติและสถานะการทำงานของแพลตฟอร์มสารพัดรับจ้าง</p>
      </div>

      {/* Stats Grid (4 กล่องสถิติ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#171717] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
                <i className={`fa-solid ${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* กิจกรรมล่าสุด (Recent Activities) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
            <h2 className="text-white font-medium border-l-4 border-[#f97316] pl-2">กิจกรรมล่าสุด</h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-[#f97316] mt-2 mr-3"></div>
                  <div>
                    <p className="text-gray-200 text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ทางลัดจัดการระบบ (Quick Actions) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800 bg-black/40">
            <h2 className="text-white font-medium border-l-4 border-[#f97316] pl-2">ทางลัดจัดการระบบ</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg text-center hover:border-[#f97316] transition group">
              <i className="fa-solid fa-user-check text-2xl text-gray-500 group-hover:text-[#f97316] mb-2 transition"></i>
              <p className="text-sm text-gray-300">ตรวจ KYC ผู้ใช้</p>
            </Link>
            
            <Link href="/admin/jobs" className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg text-center hover:border-[#f97316] transition group">
              <i className="fa-solid fa-clipboard-check text-2xl text-gray-500 group-hover:text-[#f97316] mb-2 transition"></i>
              <p className="text-sm text-gray-300">อนุมัติประกาศงาน</p>
            </Link>
            
            <Link href="/admin/disputes" className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg text-center hover:border-[#f97316] transition group">
              <i className="fa-solid fa-gavel text-2xl text-gray-500 group-hover:text-[#f97316] mb-2 transition"></i>
              <p className="text-sm text-gray-300">ตัดสินข้อพิพาท</p>
            </Link>
            
            <Link href="/admin/settings" className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg text-center hover:border-[#f97316] transition group">
              <i className="fa-solid fa-sliders text-2xl text-gray-500 group-hover:text-[#f97316] mb-2 transition"></i>
              <p className="text-sm text-gray-300">ตั้งค่าระบบ</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}