"use client";

import { useState } from "react";

export default function AdminDisputesPage() {
  
  // จำลองข้อความ (State ควบคุม Input บันทึกแอดมิน)
  const [adminNote, setAdminNote] = useState("");
  const [isResolved, setIsResolved] = useState(false);

  // ข้อมูลจำลอง Case Details
  const caseDetails = {
    id: "DSP-005",
    client: "คุณมานะ",
    freelancer: "คุณสมหญิง",
    escrowAmount: "5,000",
    claim: "Client ขอคืนเงิน 100%",
  };

  // จำลองการกดตัดสินโอนเงิน
  const handleDecision = (winner: "CLIENT" | "FREELANCER") => {
    if (!adminNote) {
      alert("กรุณาพิมพ์บันทึกคำตัดสิน (เหตุผล) ของ Admin ก่อนทำการตัดสิน");
      return;
    }

    const winnerName = winner === "CLIENT" ? "Client (คุณมานะ)" : "Freelancer (คุณสมหญิง)";
    if (window.confirm(`ยืนยันการตัดสิน: โอนเงิน ฿${caseDetails.escrowAmount} ให้ ${winnerName} ใช่หรือไม่?`)) {
      setIsResolved(true);
      alert(`การตัดสินสำเร็จ! ระบบจะโอนเงินให้ ${winnerName} และปิดข้อพิพาทนี้`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">ระบบพิจารณาข้อพิพาท</h1>
        <p className="text-gray-400 text-sm mt-1">ตรวจสอบประวัติการจ้างงานและหลักฐานก่อนตัดสินข้อพิพาท</p>
      </div>

      {/* Dispute Card Container */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl p-6 mb-6">
        
        {/* Dispute Header Bar */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg flex items-center">
            <i className="fa-solid fa-gavel text-[#f97316] mr-2"></i>
            ข้อพิพาท Dispute #{caseDetails.id}
          </h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">สถานะ:</span>
            {isResolved ? (
              <span className="bg-green-500/10 text-green-500 border border-green-500/30 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <i className="fa-solid fa-check mr-1.5"></i> ตัดสินแล้ว
              </span>
            ) : (
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span> รอการตัดสิน
              </span>
            )}
          </div>
        </div>

        {/* Grid Split: Chat Evidence & Case Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left: Chat Evidence (2 Columns) */}
          <div className="lg:col-span-2 border border-gray-800 bg-black/40 rounded-xl p-5 flex flex-col h-[400px]">
            <div className="flex items-center mb-4 text-gray-300 font-medium pb-3 border-b border-gray-800">
              <i className="fa-regular fa-comments text-[#f97316] mr-2"></i> ประวัติการสนทนา (Chat Evidence)
            </div>
            
            {/* Chat Box (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 text-sm pr-2 custom-scrollbar">
              
              {/* Client Message */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Client - คุณมานะ</p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded-lg rounded-tl-none max-w-lg border border-gray-700">
                  ไม่ตรงบรีฟเลยครับ แก้รอบที่ 3 แล้ว
                </div>
              </div>
              
              {/* Freelancer Message */}
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-500 mb-1">Freelancer - คุณสมหญิง</p>
                <div className="bg-[#f97316]/20 border border-[#f97316]/40 text-gray-200 p-3 rounded-lg rounded-tr-none max-w-lg">
                  ทำตามที่แจ้งหมดแล้วค่ะ ที่เหลือคือขอเพิ่มนอกเหนือจากบรีฟนะคะ
                </div>
              </div>

              {/* Client Message 2 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Client - คุณมานะ</p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded-lg rounded-tl-none max-w-lg border border-gray-700">
                  ขอยกเลิกงานครับ ส่งเรื่องหาแอดมิน
                </div>
              </div>

            </div>
          </div>

          {/* Right: Case Details (1 Column) */}
          <div className="border border-gray-800 bg-black/40 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-4 text-gray-300 font-medium pb-3 border-b border-gray-800">
                <i className="fa-regular fa-file-lines text-[#f97316] mr-2"></i> รายละเอียด & หลักฐาน
              </div>
              
              <div className="text-sm space-y-5">
                <div>
                  <p className="text-xs text-gray-500">คู่กรณี</p>
                  <p className="text-gray-200 mt-0.5">
                    <span className="text-blue-400">Client:</span> {caseDetails.client} <br/>
                    <span className="text-[#f97316] mt-1 inline-block">Freelancer:</span> {caseDetails.freelancer}
                  </p>
                </div>

                <div className="bg-black/60 p-4 rounded-lg border border-gray-800 text-center">
                  <p className="text-xs text-gray-400">มูลค่างาน (Escrow)</p>
                  <p className="text-2xl font-bold text-white mt-1">฿ {caseDetails.escrowAmount}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">ข้อเรียกร้อง</p>
                  <p className="text-red-400 mt-0.5 font-medium">{caseDetails.claim}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">ไฟล์แนบ (พิจารณาหลักฐาน)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-xs text-gray-300 hover:border-gray-700 cursor-pointer">
                      <span className="truncate"><i className="fa-regular fa-file-pdf text-red-400 mr-1.5"></i> สรุปบรีฟ.pdf</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-xs text-gray-300 hover:border-gray-700 cursor-pointer">
                      <span className="truncate"><i className="fa-regular fa-file-zipper text-yellow-400 mr-1.5"></i> ไฟล์ส่งมอบ.zip</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Admin Notes & Action Buttons */}
        <div className={`border rounded-xl p-5 transition ${isResolved ? "border-green-500/50 bg-green-900/10" : "border-[#f97316]/50 bg-[#f97316]/5"}`}>
          <div className="flex items-center mb-3 text-gray-200 font-medium">
            <i className="fa-regular fa-pen-to-square text-[#f97316] mr-2"></i> บันทึกคำตัดสินของ Admin:
          </div>
          
          <textarea 
            rows={3} 
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            disabled={isResolved}
            className="w-full bg-black border border-gray-700 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#f97316] resize-none mb-4 disabled:opacity-50" 
            placeholder="พิมพ์เหตุผลหรือคำตัดสินข้อพิพาทที่นี่ (เช่น ตรวจสอบแล้วฟรีแลนซ์ทำตามบรีฟครบถ้วน...)"
          ></textarea>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => handleDecision("CLIENT")}
              disabled={isResolved}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-800 hover:text-white transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-arrow-rotate-left mr-2"></i> คืนเงินให้ Client
            </button>
            <button 
              onClick={() => handleDecision("FREELANCER")}
              disabled={isResolved}
              className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm hover:bg-opacity-90 transition font-medium flex items-center shadow-lg shadow-[#f97316]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-wallet mr-2"></i> โอนเงินให้ Freelancer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}