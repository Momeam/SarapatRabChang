"use client";

import { useState } from "react";

// กำหนด Type ของธุรกรรม
interface Transaction {
  id: string;
  date: string;
  type: "EARNING" | "WITHDRAWAL";
  description: string;
  amount: number;
  status: "COMPLETED" | "PENDING";
}

export default function FreelancerWalletPage() {
  
  // State จำลองยอดเงินและประวัติธุรกรรม
  const [currentBalance, setCurrentBalance] = useState(14250);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "TX-101", date: "10 พ.ย. 2026", type: "EARNING", description: "รายรับจากออเดอร์ #ORD-9750 (หักค่าธรรมเนียมแล้ว)", amount: 14250, status: "COMPLETED" },
    { id: "TX-102", date: "05 พ.ย. 2026", type: "WITHDRAWAL", description: "ถอนเงินเข้าบัญชี KBank (*6789)", amount: 8000, status: "COMPLETED" },
    { id: "TX-103", date: "01 พ.ย. 2026", type: "EARNING", description: "รายรับจากออเดอร์ #ORD-9610 (หักค่าธรรมเนียมแล้ว)", amount: 8000, status: "COMPLETED" }
  ]);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // จำลองการขอถอนเงิน (Withdrawal Request)
  const handleWithdrawal = () => {
    if (currentBalance <= 0) {
      alert("คุณไม่มียอดเงินที่สามารถถอนได้ในขณะนี้");
      return;
    }

    const inputAmount = window.prompt(`คุณมียอดเงินถอนได้ ฿ ${currentBalance.toLocaleString()}\nกรุณาระบุจำนวนเงินที่ต้องการถอน (ขั้นต่ำ 500 บาท):`, currentBalance.toString());

    if (inputAmount !== null) {
      const numAmount = parseInt(inputAmount.replace(/,/g, ''));

      if (isNaN(numAmount) || numAmount < 500) {
        alert("จำนวนเงินไม่ถูกต้อง หรือน้อยกว่าขั้นต่ำ 500 บาท");
      } else if (numAmount > currentBalance) {
        alert("จำนวนเงินเกินยอดที่คุณสามารถถอนได้");
      } else {
        // หักเงินคงเหลือ
        setCurrentBalance(prev => prev - numAmount);
        
        // เพิ่มประวัติการถอนเงิน (สถานะ PENDING) ไปด้านบนสุดของตาราง
        const newTx: Transaction = {
          id: `TX-${Date.now()}`,
          date: "วันนี้",
          type: "WITHDRAWAL",
          description: "แจ้งขอถอนเงิน (รอตรวจสอบ)",
          amount: numAmount,
          status: "PENDING"
        };
        
        setTransactions(prev => [newTx, ...prev]);

        showAlert(`ส่งคำขอถอนเงินจำนวน ฿ ${numAmount.toLocaleString()} เรียบร้อยแล้ว ระบบกำลังตรวจสอบและจะโอนเข้าบัญชีภายใน 1-2 วันทำการ`, "success");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">การเงิน & รายได้ (Wallet)</h1>
        <p className="text-gray-400 text-sm mt-1">ดูสรุปรายได้และส่งคำขอถอนเงินเข้าบัญชีธนาคาร</p>
      </div>

      {/* แจ้งเตือนเมื่อกดถอนเงิน */}
      {alertMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* ยอดที่ถอนได้ (Withdrawable) */}
        <div className="bg-gradient-to-br from-[#1a1c23] to-[#171717] border border-gray-700 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-black/50">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fa-solid fa-coins text-6xl"></i>
          </div>
          <p className="text-gray-400 text-sm mb-2 relative z-10">ยอดเงินที่สามารถถอนได้</p>
          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">฿ {currentBalance.toLocaleString()}</h2>
          
          <button 
            onClick={handleWithdrawal} 
            className="bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition w-full sm:w-auto relative z-10 flex items-center justify-center shadow-lg shadow-[#f97316]/20"
          >
            <i className="fa-solid fa-building-columns mr-2"></i> ขอถอนเงิน
          </button>
          
          <p className="text-[10px] text-gray-500 mt-3 relative z-10">* ระบบจะโอนเงินเข้าบัญชี KBank (ลงท้าย ...6789) ของคุณ</p>
        </div>

        {/* ยอดที่อยู่ระหว่างดำเนินการ (Pending) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
              <i className="fa-solid fa-clock-rotate-left text-yellow-500 text-sm"></i>
            </div>
            <p className="text-gray-400 text-sm">กำลังดำเนินการ (รอแอดมินโอน)</p>
          </div>
          <h3 className="text-2xl font-bold text-white ml-11">฿ 5,000</h3>
          <p className="text-xs text-gray-500 ml-11 mt-1">ออเดอร์ #ORD-9880</p>
        </div>

        {/* รายได้สะสมทั้งหมด (Total Earnings) */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
              <i className="fa-solid fa-chart-line text-blue-400 text-sm"></i>
            </div>
            <p className="text-gray-400 text-sm">รายได้สะสมทั้งหมด (ปีนี้)</p>
          </div>
          <h3 className="text-2xl font-bold text-white ml-11">฿ 45,500</h3>
          <p className="text-xs text-green-500 ml-11 mt-1"><i className="fa-solid fa-arrow-trend-up mr-1"></i> +15% จากเดือนที่แล้ว</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl mb-6 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/40">
          <h2 className="text-lg font-semibold text-white border-l-4 border-[#f97316] pl-2">ประวัติการเงิน (Transaction History)</h2>
          <select className="bg-black border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f97316]">
            <option>ทั้งหมด</option>
            <option>รายรับ (จากงาน)</option>
            <option>ถอนเงิน (เข้าธนาคาร)</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/20">
                <th className="p-4 font-medium border-b border-gray-800">วันที่</th>
                <th className="p-4 font-medium border-b border-gray-800">ประเภทรายการ</th>
                <th className="p-4 font-medium border-b border-gray-800">รายละเอียด</th>
                <th className="p-4 font-medium border-b border-gray-800">จำนวนเงิน</th>
                <th className="p-4 font-medium border-b border-gray-800">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                  <td className="p-4 text-gray-400">{tx.date}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {tx.type === "EARNING" ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mr-3">
                            <i className="fa-solid fa-arrow-down"></i>
                          </div>
                          <span className="text-gray-200">รายรับ</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mr-3">
                            <i className="fa-solid fa-arrow-up"></i>
                          </div>
                          <span className="text-gray-200">ถอนเงิน</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{tx.description}</td>
                  <td className={`p-4 ${tx.type === "EARNING" ? "text-green-500 font-semibold" : "text-white font-medium"}`}>
                    {tx.type === "EARNING" ? "+" : "-"} ฿ {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    {tx.status === "COMPLETED" ? (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-gray-800 text-gray-300 border border-gray-700">สำเร็จ</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">รอแอดมินโอนเงิน</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-black/30">
          <span className="text-xs text-gray-500">แสดง 1-{transactions.length} จากทั้งหมด</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 bg-black border border-gray-700 rounded text-gray-400"><i className="fa-solid fa-chevron-left text-xs"></i></button>
            <button className="px-3 py-1 bg-[#f97316] border border-[#f97316] rounded text-white font-medium">1</button>
            <button className="px-3 py-1 bg-black border border-gray-700 rounded text-gray-400"><i className="fa-solid fa-chevron-right text-xs"></i></button>
          </div>
        </div>
      </div>

    </div>
  );
}