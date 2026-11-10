"use client";

import { useState } from "react";

type KycStatus = "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";

export default function FreelancerProfilePage() {
  
  // State จำลองสถานะ KYC (ลองเปลี่ยนค่าเป็น 'PENDING' หรือ 'APPROVED' เพื่อดู UI ที่ต่างกัน)
  const [kycStatus, setKycStatus] = useState<KycStatus>("UNVERIFIED");
  
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // State จำลองไฟล์อัปโหลด
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [bankFileName, setBankFileName] = useState<string | null>(null);

  // ข้อมูลฟอร์ม KYC
  const [kycForm, setKycForm] = useState({
    idNumber: "",
    bankName: "กสิกรไทย (KBank)",
    bankAccount: ""
  });

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showAlert("บันทึกข้อมูลโปรไฟล์สำเร็จ! (ข้อมูลจะถูกอัปเดตไปแสดงให้ลูกค้าเห็น)", "success");
  };

  const handleSubmitKYC = () => {
    if (!kycForm.idNumber || !kycForm.bankAccount || !idFileName || !bankFileName) {
      showAlert("กรุณากรอกข้อมูลและแนบไฟล์ให้ครบถ้วนก่อนส่งตรวจสอบ", "error");
      return;
    }

    if (window.confirm("ยืนยันการส่งเอกสารตรวจสอบตัวตน?")) {
      setKycStatus("PENDING");
      showAlert("ส่งเอกสารสำเร็จ ระบบจะแจ้งเตือนไปยังแอดมินเพื่อตรวจสอบภายใน 1-3 วันทำการ", "info");
    }
  };

  // ฟังก์ชันจำลองการอัปโหลดไฟล์
  const handleSimulateUpload = (type: "ID" | "BANK") => {
    if (kycStatus === "PENDING" || kycStatus === "APPROVED") return;
    
    if (type === "ID") setIdFileName("id_card_scan.jpg");
    if (type === "BANK") setBankFileName("bookbank_passbook.jpg");
  };

  // ฟังก์ชัน Render แถบแจ้งเตือนสถานะ KYC
  const renderKycAlert = () => {
    switch (kycStatus) {
      case "UNVERIFIED":
        return (
          <div className="mb-6 px-5 py-4 rounded-xl border flex items-start text-sm bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
            <i className="fa-solid fa-triangle-exclamation text-xl mr-3 mt-0.5"></i>
            <div>
              <h4 className="font-bold mb-1">คุณยังไม่ได้ยืนยันตัวตน</h4>
              <p className="text-yellow-500/80 text-xs">กรุณากรอกข้อมูลและอัปโหลดเอกสารด้านล่าง เพื่อให้แอดมินตรวจสอบก่อนเริ่มรับงานและถอนเงินได้</p>
            </div>
          </div>
        );
      case "PENDING":
        return (
          <div className="mb-6 px-5 py-4 rounded-xl border flex items-start text-sm bg-blue-500/10 border-blue-500/50 text-blue-400">
            <i className="fa-solid fa-clock-rotate-left text-xl mr-3 mt-0.5"></i>
            <div>
              <h4 className="font-bold mb-1">เอกสารกำลังรอการตรวจสอบ</h4>
              <p className="text-blue-400/80 text-xs">คุณได้ส่งเอกสารเรียบร้อยแล้ว กรุณารอแอดมินตรวจสอบภายใน 1-3 วันทำการ</p>
            </div>
          </div>
        );
      case "APPROVED":
        return (
          <div className="mb-6 px-5 py-4 rounded-xl border flex items-start text-sm bg-green-500/10 border-green-500/50 text-green-500">
            <i className="fa-solid fa-shield-check text-xl mr-3 mt-0.5"></i>
            <div>
              <h4 className="font-bold mb-1">ยืนยันตัวตนสำเร็จแล้ว!</h4>
              <p className="text-green-500/80 text-xs">บัญชีของคุณได้รับการรับรอง คุณสามารถรับงานและทำรายการถอนเงินได้ตามปกติ</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">จัดการโปรไฟล์ & ยืนยันตัวตน (KYC)</h1>
        <p className="text-gray-400 text-sm mt-1">ตั้งค่าข้อมูลส่วนตัวและอัปโหลดเอกสารเพื่อรับรองบัญชีฟรีแลนซ์ของคุณ</p>
      </div>

      {/* แจ้งเตือน Alert ทั่วไป (เช่น เซฟสำเร็จ) */}
      {alertMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${
          alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : 
          alertMsg.type === "error" ? "bg-red-500/10 border-red-500 text-red-500" : 
          "bg-blue-500/10 border-blue-500 text-blue-400"
        }`}>
          {alertMsg.message}
        </div>
      )}

      {/* แถบแจ้งเตือนสถานะ KYC ด้านบน */}
      {renderKycAlert()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* ส่วนที่ 1: ข้อมูลโปรไฟล์ (Profile Information) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 border-l-4 border-[#f97316] pl-2">ข้อมูลโปรไฟล์</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-5 text-sm">
            {/* รูปโปรไฟล์ */}
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400">
                <i className="fa-solid fa-user text-2xl"></i>
              </div>
              <div>
                <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded transition border border-gray-700 text-xs">
                  อัปโหลดรูปภาพ
                </button>
                <p className="text-[10px] text-gray-500 mt-1">ไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1.5">ชื่อจริง</label>
                <input type="text" defaultValue="สมหญิง" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#f97316]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5">นามสกุล</label>
                <input type="text" defaultValue="รักงาน" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#f97316]" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">หัวข้อความเชี่ยวชาญ (Headline)</label>
              <input type="text" defaultValue="Full-stack Developer (React, Node.js)" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#f97316]" />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">แนะนำตัว (Bio)</label>
              <textarea rows={4} defaultValue="รับทำเว็บไซต์และระบบหลังบ้าน ประสบการณ์กว่า 5 ปี" className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#f97316] resize-none"></textarea>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition border border-gray-700">
                บันทึกข้อมูลโปรไฟล์
              </button>
            </div>
          </form>
        </div>

        {/* ส่วนที่ 2: ยืนยันตัวตน KYC (Identity & Bank Verification) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 border-l-4 border-[#f97316] pl-2">ยืนยันตัวตน และบัญชีธนาคาร (KYC)</h2>
          
          <div className="space-y-5 text-sm">
            {/* ส่วนบัตรประชาชน */}
            <div className="p-4 border border-gray-800 bg-black/40 rounded-lg">
              <div className="flex items-center mb-3">
                <i className="fa-regular fa-id-card text-[#f97316] text-lg mr-2"></i>
                <span className="font-medium text-gray-200">1. ข้อมูลบัตรประจำตัวประชาชน</span>
              </div>
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">เลขบัตรประชาชน 13 หลัก</label>
                  <input 
                    type="text" 
                    placeholder="1-2345-67890-12-3"
                    disabled={kycStatus === "PENDING" || kycStatus === "APPROVED"}
                    value={kycForm.idNumber}
                    onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">ภาพถ่ายบัตรประชาชน (พร้อมเซ็นรับรองสำเนาถูกต้อง)</label>
                  <div 
                    onClick={() => handleSimulateUpload("ID")}
                    className={`w-full border-2 border-dashed border-gray-700 rounded-lg p-4 text-center transition bg-black ${kycStatus === "UNVERIFIED" ? "hover:border-[#f97316] cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-gray-500 text-xl mb-1"></i>
                    {idFileName ? (
                      <p className="text-green-500 text-xs mt-1">อัปโหลดสำเร็จ: {idFileName}</p>
                    ) : (
                      <p className="text-gray-400 text-xs">คลิกเพื่ออัปโหลดไฟล์</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนบัญชีธนาคาร */}
            <div className="p-4 border border-gray-800 bg-black/40 rounded-lg">
              <div className="flex items-center mb-3">
                <i className="fa-solid fa-building-columns text-[#f97316] text-lg mr-2"></i>
                <span className="font-medium text-gray-200">2. ข้อมูลบัญชีธนาคาร (สำหรับรับเงิน)</span>
              </div>
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">ธนาคาร</label>
                    <select 
                      disabled={kycStatus === "PENDING" || kycStatus === "APPROVED"}
                      value={kycForm.bankName}
                      onChange={(e) => setKycForm({...kycForm, bankName: e.target.value})}
                      className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316] disabled:opacity-50"
                    >
                      <option>กสิกรไทย (KBank)</option>
                      <option>ไทยพาณิชย์ (SCB)</option>
                      <option>กรุงไทย (KTB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">เลขที่บัญชี</label>
                    <input 
                      type="text" 
                      placeholder="012-3-45678-9" 
                      disabled={kycStatus === "PENDING" || kycStatus === "APPROVED"}
                      value={kycForm.bankAccount}
                      onChange={(e) => setKycForm({...kycForm, bankAccount: e.target.value})}
                      className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#f97316] disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">ภาพถ่ายหน้าสมุดบัญชี (Book Bank)</label>
                  <div 
                    onClick={() => handleSimulateUpload("BANK")}
                    className={`w-full border-2 border-dashed border-gray-700 rounded-lg p-4 text-center transition bg-black ${kycStatus === "UNVERIFIED" ? "hover:border-[#f97316] cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-gray-500 text-xl mb-1"></i>
                    {bankFileName ? (
                      <p className="text-green-500 text-xs mt-1">อัปโหลดสำเร็จ: {bankFileName}</p>
                    ) : (
                      <p className="text-gray-400 text-xs">คลิกเพื่ออัปโหลดไฟล์</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* ปุ่ม Submit ควบคุมตามสถานะ */}
            <div className="pt-2">
              {kycStatus === "UNVERIFIED" && (
                <button onClick={handleSubmitKYC} className="w-full bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-[#f97316]/20">
                  ส่งเอกสารยืนยันตัวตน
                </button>
              )}
              {kycStatus === "PENDING" && (
                <button disabled className="w-full bg-gray-800 text-gray-500 px-5 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-700">
                  เอกสารอยู่ระหว่างตรวจสอบ...
                </button>
              )}
              {kycStatus === "APPROVED" && (
                <button disabled className="w-full bg-green-500/10 text-green-500 border border-green-500/30 px-5 py-2.5 rounded-lg text-sm font-medium cursor-default">
                  ยืนยันตัวตนเรียบร้อยแล้ว
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}