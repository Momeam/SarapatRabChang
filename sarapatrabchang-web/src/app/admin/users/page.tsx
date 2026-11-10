"use client";

import { useState } from "react";

// กำหนดโครงสร้างข้อมูลของผู้ใช้ (TypeScript Interface)
interface User {
  id: string;
  name: string;
  email: string;
  type: "Freelancer" | "Client";
  status: "ACTIVE" | "SUSPENDED";
  kycStatus: "PENDING" | "APPROVED" | "UNVERIFIED";
}

export default function AdminUsersPage() {
  // ข้อมูลผู้ใช้จำลอง (Mock Data)
  const [users] = useState<User[]>([
    { id: "U-101", name: "สมหญิง รักงาน", email: "somying@email.com", type: "Freelancer", status: "ACTIVE", kycStatus: "PENDING" },
    { id: "U-102", name: "มานะ อดทน", email: "mana@email.com", type: "Client", status: "ACTIVE", kycStatus: "APPROVED" },
    { id: "U-103", name: "เอกชัย สบาย", email: "eka@email.com", type: "Freelancer", status: "SUSPENDED", kycStatus: "APPROVED" },
    { id: "U-104", name: "ใจดี มีตังค์", email: "jaidee@email.com", type: "Client", status: "ACTIVE", kycStatus: "PENDING" },
  ]);

  // State สำหรับจัดการแท็บที่เลือก ('ALL' หรือ 'PENDING_KYC')
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING_KYC">("ALL");

  // กรองข้อมูลตามแท็บที่เลือก
  const filteredUsers = activeTab === "ALL" 
    ? users 
    : users.filter(user => user.kycStatus === "PENDING");

  // นับจำนวนคนที่รอตรวจ KYC
  const pendingKycCount = users.filter(user => user.kycStatus === "PENDING").length;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">จัดการผู้ใช้ & KYC</h1>
        <p className="text-gray-400 text-sm mt-1">ตรวจสอบและจัดการบัญชีผู้ใช้งานทั้งหมดในระบบ</p>
      </div>

      {/* Data Table Section */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden mb-4">
        
        {/* Tabs and Filters */}
        <div className="flex justify-between items-center border-b border-gray-800 px-6 py-4 bg-black/50">
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab("ALL")}
              className={`font-medium pb-1 transition ${activeTab === "ALL" ? "text-white border-b-2 border-[#f97316]" : "text-gray-400 hover:text-white"}`}
            >
              ผู้ใช้งานทั้งหมด
            </button>
            <button 
              onClick={() => setActiveTab("PENDING_KYC")}
              className={`font-medium flex items-center pb-1 transition ${activeTab === "PENDING_KYC" ? "text-white border-b-2 border-[#f97316]" : "text-gray-400 hover:text-white"}`}
            >
              รอตรวจสอบ KYC 
              <span className="ml-2 bg-gray-700 text-xs px-2 py-0.5 rounded-full text-white">{pendingKycCount}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">ตัวกรอง:</span>
            <select className="bg-black border border-gray-700 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-[#f97316]">
              <option>ทั้งหมด</option>
              <option>Freelancer</option>
              <option>Client</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30">
                <th className="p-4 font-medium border-b border-gray-800 w-24">ID</th>
                <th className="p-4 font-medium border-b border-gray-800 w-20">รูป</th>
                <th className="p-4 font-medium border-b border-gray-800">ชื่อ - นามสกุล</th>
                <th className="p-4 font-medium border-b border-gray-800">อีเมล</th>
                <th className="p-4 font-medium border-b border-gray-800 w-32">ประเภท</th>
                <th className="p-4 font-medium border-b border-gray-800">การจัดการ (Action)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                    <td className="p-4 text-gray-400">{user.id}</td>
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                        <i className="fa-regular fa-user"></i>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${user.type === 'Freelancer' ? 'bg-gray-700 text-gray-300' : 'bg-[#222] text-gray-400 border border-gray-700'}`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <button className="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2">
                          <i className="fa-regular fa-eye mr-1"></i> ดูข้อมูล
                        </button>
                        
                        {/* แสดงปุ่ม ระงับ/ปลดล็อก ตาม Status */}
                        {user.status === "ACTIVE" ? (
                          <button className="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2">
                            <i className="fa-solid fa-ban mr-1"></i> ระงับบัญชี
                          </button>
                        ) : (
                          <button className="px-3 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition mr-2">
                            <i className="fa-solid fa-check-circle mr-1"></i> ปลดล็อก
                          </button>
                        )}

                        {/* แสดงปุ่มตรวจ KYC เฉพาะคนที่สถานะเป็น PENDING */}
                        {user.kycStatus === "PENDING" && (
                          <button className="px-3 py-1 text-xs border border-[#f97316] text-[#f97316] rounded hover:bg-[#f97316] hover:bg-opacity-10 transition">
                            <i className="fa-solid fa-circle-check mr-1"></i> ตรวจ KYC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-black/30">
          <span className="text-xs text-gray-500">แสดงรายการผู้ใช้งาน</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 bg-black border border-gray-700 rounded text-gray-400 hover:text-white">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button className="px-3 py-1 bg-[#f97316] border border-[#f97316] rounded text-white font-medium">1</button>
            <button className="px-3 py-1 bg-black border border-gray-700 rounded text-gray-400 hover:text-white transition">2</button>
            <button className="px-3 py-1 bg-black border border-gray-700 rounded text-gray-400 hover:text-white transition">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}