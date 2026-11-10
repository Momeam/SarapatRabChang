"use client";

import { useState, useMemo } from "react";

// กำหนด Type ของข้อมูลการขอถอนเงิน
interface Payout {
  id: string;
  date: string;
  name: string;
  amount: number;
  bank: string;
  accountNo: string;
  selected: boolean;
}

export default function AccountPayoutsPage() {
  
  // ข้อมูลจำลองรายการขอถอนเงิน
  const [payouts, setPayouts] = useState<Payout[]>([
    { id: "PO-001", date: "15/10/2026", name: "สมหญิง รักงาน", amount: 14250, bank: "KBank", accountNo: "012-3-45678-9", selected: false },
    { id: "PO-002", date: "15/10/2026", name: "สมหมาย ขยันดี", amount: 5700, bank: "SCB", accountNo: "987-6-54321-0", selected: false },
    { id: "PO-003", date: "14/10/2026", name: "เอกชัย สบาย", amount: 25250, bank: "KTB", accountNo: "111-2-33344-5", selected: false }
  ]);

  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // คำนวณยอดรวมของรายการที่ถูกติ๊กเลือก (Checkbox)
  const totalSelectedAmount = useMemo(() => {
    return payouts.filter(p => p.selected).reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  // จัดการการเลือก Checkbox รายตัว
  const toggleSelect = (id: string) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  // จัดการการเลือก Checkbox ทั้งหมด (Select All)
  const toggleSelectAll = () => {
    const allSelected = payouts.every(p => p.selected);
    setPayouts(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // อนุมัติรายบุคคล
  const handleApproveSingle = (id: string, name: string) => {
    if (window.confirm(`ยืนยันการอนุมัติโอนเงินให้กับ ${name}?`)) {
      setPayouts(prev => prev.filter(p => p.id !== id));
      showAlert(`อนุมัติการโอนเงินให้ ${name} เรียบร้อยแล้ว!`, "success");
    }
  };

  // ปฏิเสธรายบุคคล
  const handleRejectSingle = (id: string, name: string) => {
    if (window.confirm(`ปฏิเสธรายการขอถอนเงินของ ${name}?`)) {
      setPayouts(prev => prev.filter(p => p.id !== id));
      showAlert(`ปฏิเสธรายการขอถอนเงินของ ${name} แล้ว`, "error");
    }
  };

  // อนุมัติทีละหลายรายการ (Bulk Approve)
  const handleBulkApprove = () => {
    const selectedCount = payouts.filter(p => p.selected).length;
    if (selectedCount === 0) {
      window.alert("กรุณาเลือกรายการที่ต้องการอนุมัติอย่างน้อย 1 รายการ");
      return;
    }

    if (window.confirm(`ยืนยันอนุมัติการโอนเงินทั้งหมด ${selectedCount} รายการ รวมยอด ฿${totalSelectedAmount.toLocaleString()}?`)) {
      setPayouts(prev => prev.filter(p => !p.selected));
      showAlert(`อนุมัติการโอนเงินจำนวน ${selectedCount} รายการสำเร็จ! (ยอดรวม ฿${totalSelectedAmount.toLocaleString()})`, "success");
    }
  };

  // จำลอง Export CSV
  const handleExportCSV = () => {
    if (payouts.length === 0) {
      window.alert("ไม่มีข้อมูลสำหรับ Export");
      return;
    }
    showAlert("ดาวน์โหลดไฟล์ Payouts_Report.csv เรียบร้อยแล้ว", "success");
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">รายการขอถอนเงินของฟรีแลนซ์ (Payouts)</h1>
        <p className="text-gray-400 text-sm mt-1">ตรวจสอบรายการขอถอนเงินและอนุมัติการโอนเงินให้ฟรีแลนซ์</p>
      </div>

      {/* แจ้งเตือน Alert */}
      {alertMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      {/* Table Container Card */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden mb-6">
        
        {/* Summary & Export Bar */}
        <div className="flex justify-between items-center border-b border-gray-800 px-6 py-5 bg-black/40">
          <div className="flex items-center space-x-3">
            <span className="text-gray-400 text-sm">ยอดรวมที่ต้องจ่ายวันนี้ (ที่เลือก):</span>
            <span className="text-2xl font-bold text-white">฿ {totalSelectedAmount.toLocaleString()}</span>
          </div>
          <button onClick={handleExportCSV} className="flex items-center px-4 py-2 border border-gray-700 bg-black/50 text-gray-300 rounded-lg text-sm hover:border-gray-500 hover:text-white transition">
            <i className="fa-solid fa-download mr-2 text-xs"></i> Export CSV
          </button>
        </div>

        {/* Payout Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30 border-b border-gray-800">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={payouts.length > 0 && payouts.every(p => p.selected)}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-black border-gray-700 text-[#f97316] focus:ring-[#f97316] accent-[#f97316] cursor-pointer" 
                  />
                </th>
                <th className="p-4 font-medium">วันที่ขอถอน</th>
                <th className="p-4 font-medium">ชื่อฟรีแลนซ์</th>
                <th className="p-4 font-medium">ยอดที่ต้องโอน</th>
                <th className="p-4 font-medium">ธนาคาร</th>
                <th className="p-4 font-medium">เลขที่บัญชี</th>
                <th className="p-4 font-medium text-right pr-6">การจัดการ (Action)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">ไม่มีรายการขอถอนเงินค้างชำระ</td>
                </tr>
              ) : (
                payouts.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded bg-black border-gray-700 text-[#f97316] focus:ring-[#f97316] accent-[#f97316] cursor-pointer" 
                      />
                    </td>
                    <td className="p-4 text-gray-300">{item.date}</td>
                    <td className="p-4 font-medium text-white">{item.name}</td>
                    <td className="p-4 font-semibold text-white">฿ {item.amount.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded text-xs border border-gray-700 bg-black/40">{item.bank}</span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono">{item.accountNo}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleApproveSingle(item.id, item.name)} className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-green-500 hover:text-green-500 transition mr-1">
                        <i className="fa-solid fa-check mr-1"></i> อนุมัติ
                      </button>
                      <button onClick={() => handleRejectSingle(item.id, item.name)} className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-red-500 hover:text-red-500 transition">
                        <i className="fa-solid fa-xmark mr-1"></i> ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Bulk Action */}
        {payouts.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-black/40">
            <button onClick={handleBulkApprove} className="flex items-center px-4 py-2 border border-[#f97316]/50 bg-[#f97316]/10 text-[#f97316] rounded-lg text-sm hover:bg-[#f97316] hover:text-white transition font-medium">
              <i className="fa-solid fa-check mr-2"></i> อนุมัติรายการที่เลือกทั้งหมด (Bulk Approve)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}