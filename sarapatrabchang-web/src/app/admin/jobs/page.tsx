"use client";

import { useState } from "react";

// กำหนดโครงสร้างข้อมูลประกาศงาน
interface Job {
  id: string;
  title: string;
  freelancer: string;
  price: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function AdminJobsPage() {
  // ข้อมูลจำลอง (Mock Data)
  const [jobs, setJobs] = useState<Job[]>([
    { id: "J001", title: "รับเขียนเว็บ E-commerce ด้วย React", freelancer: "สมหญิง รักงาน", price: "฿ 15,000", status: "PENDING" },
    { id: "J002", title: "รับวาดภาพประกอบสไตล์อนิเมะ", freelancer: "สาววาด สตูดิโอ", price: "฿ 500", status: "PENDING" },
    { id: "J003", title: "แอดมินดูแลเพจ ตอบแชทลูกค้า", freelancer: "เกรียน คีย์บอร์ด", price: "฿ 100", status: "PENDING" },
    { id: "J004", title: "ออกแบบโลโก้บริษัท", freelancer: "ดีไซน์ สุดเจ๋ง", price: "฿ 3,000", status: "APPROVED" },
  ]);

  const [filterStatus, setFilterStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  // กรองข้อมูลตามสถานะที่เลือก
  const filteredJobs = jobs.filter(job => job.status === filterStatus);

  // ฟังก์ชันแสดงการแจ้งเตือน
  const showAlert = (message: string, type: "success" | "danger") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 3000); // ซ่อนอัตโนมัติใน 3 วินาที
  };

  // จำลองการกดอนุมัติ
  const handleApprove = (id: string, title: string) => {
    if (window.confirm("ยืนยันการอนุมัติประกาศนี้ใช่หรือไม่?")) {
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status: "APPROVED" } : job));
      showAlert(`อนุมัติประกาศ "${title}" สำเร็จ!`, "success");
    }
  };

  // จำลองการกดปฏิเสธ
  const handleReject = (id: string, title: string) => {
    const reason = window.prompt("ระบุเหตุผลในการปฏิเสธประกาศนี้ (เช่น รูปภาพไม่เหมาะสม):");
    if (reason && reason.trim() !== "") {
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status: "REJECTED" } : job));
      showAlert(`ปฏิเสธประกาศ "${title}" เรียบร้อยแล้ว (เหตุผล: ${reason})`, "danger");
    } else if (reason !== null) {
      window.alert("กรุณาระบุเหตุผลในการปฏิเสธ");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">ตรวจสอบประกาศบริการใหม่</h1>
        <p className="text-gray-400 text-sm mt-1">ตรวจสอบตัวอย่างบริการก่อนอนุมัติหรือปฏิเสธประกาศ</p>
      </div>

      {/* แจ้งเตือน Alert */}
      {alertMsg && (
        <div className={`mb-4 px-4 py-3 rounded border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      {/* Data Table Section */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden mb-6">
        
        {/* Header & Filters */}
        <div className="flex justify-between items-center border-b border-gray-800 px-6 py-4 bg-black/50">
          <h2 className="text-white font-medium">ประกาศบริการ</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">ตัวกรองหมวดหมู่:</span>
              <select className="bg-black border border-gray-700 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-[#f97316]">
                <option>ทั้งหมด</option>
                <option>กราฟิก</option>
                <option>โปรแกรมมิ่ง</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">สถานะ:</span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-black border border-gray-700 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-[#f97316]"
              >
                <option value="PENDING">รอตรวจสอบ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="REJECTED">ถูกปฏิเสธ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30">
                <th className="p-4 font-medium border-b border-gray-800 w-24">ภาพปก</th>
                <th className="p-4 font-medium border-b border-gray-800">ชื่อประกาศบริการ</th>
                <th className="p-4 font-medium border-b border-gray-800">ฟรีแลนซ์</th>
                <th className="p-4 font-medium border-b border-gray-800">ราคาเริ่มต้น</th>
                <th className="p-4 font-medium border-b border-gray-800 text-right pr-6">การจัดการ (Action)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">ไม่มีประกาศบริการในสถานะนี้</td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                    <td className="p-4">
                      <div className="w-12 h-10 bg-gray-800 rounded border border-gray-700 flex flex-col items-center justify-center text-gray-500">
                        <i className="fa-regular fa-image text-sm"></i>
                        <span className="text-[8px] mt-0.5">IMG</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">{job.title}</td>
                    <td className="p-4 text-gray-400">{job.freelancer}</td>
                    <td className="p-4 text-gray-300">{job.price}</td>
                    <td className="p-4 text-right">
                      <button className="px-3 py-1.5 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition">
                        <i className="fa-regular fa-eye mr-1"></i> ดูตัวอย่าง
                      </button>
                      
                      {/* แสดงปุ่ม อนุมัติ/ปฏิเสธ เฉพาะแท็บ รอตรวจสอบ */}
                      {job.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => handleApprove(job.id, job.title)}
                            className="px-3 py-1.5 text-xs border border-green-600 text-green-500 rounded hover:bg-green-500/10 transition ml-2"
                          >
                            <i className="fa-solid fa-check mr-1"></i> อนุมัติ
                          </button>
                          <button 
                            onClick={() => handleReject(job.id, job.title)}
                            className="px-3 py-1.5 text-xs border border-red-600 text-red-500 rounded hover:bg-red-500/10 transition ml-2"
                          >
                            <i className="fa-solid fa-xmark mr-1"></i> ปฏิเสธ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-black/30 text-xs text-gray-500">
          แสดงรายการประกาศบริการตามตัวกรอง
        </div>
      </div>

      {/* Info Box */}
      <div className="border border-gray-800 bg-[#171717] rounded-xl p-5 flex items-start text-sm">
        <i className="fa-solid fa-circle-info text-gray-400 mt-0.5 mr-3 text-lg"></i>
        <div>
          <h4 className="text-white font-medium mb-1">การปฏิเสธประกาศบริการ</h4>
          <p className="text-gray-400">ระบบจะให้ระบุเหตุผลในกล่องข้อความ เช่น "รูปภาพไม่เหมาะสม" หรือ "เนื้อหาผิดกฎแพลตฟอร์ม" เพื่อแจ้งเตือนไปยังฟรีแลนซ์</p>
        </div>
      </div>

    </div>
  );
}