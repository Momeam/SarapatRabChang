"use client";

import { useEffect, useMemo, useState } from "react";
import { requestApi } from "@/lib/api";

interface Payout {
  id: string;
  createdAt: string;
  providerName: string;
  providerEmail: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  selected: boolean;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function AccountPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const totalSelectedAmount = useMemo(
    () => payouts.filter((payout) => payout.selected).reduce((sum, payout) => sum + payout.amount, 0),
    [payouts],
  );
  const selectedCount = payouts.filter((payout) => payout.selected).length;

  useEffect(() => {
    let active = true;
    requestApi<Omit<Payout, "selected">[]>("/api/admin/payouts")
      .then((result) => {
        if (active) setPayouts(result.map((payout) => ({ ...payout, selected: false })));
      })
      .catch((cause: unknown) => {
        if (active) {
          setAlertMsg({
            message: cause instanceof Error ? cause.message : "โหลดรายการถอนเงินไม่สำเร็จ",
            type: "error",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleSelect = (id: string) => {
    setPayouts((current) =>
      current.map((payout) => payout.id === id ? { ...payout, selected: !payout.selected } : payout),
    );
  };

  const toggleSelectAll = () => {
    const allSelected = payouts.length > 0 && payouts.every((payout) => payout.selected);
    setPayouts((current) => current.map((payout) => ({ ...payout, selected: !allSelected })));
  };

  async function processSingle(payout: Payout, status: "paid" | "rejected") {
    if (status === "paid" && !window.confirm(`ยืนยันว่าได้โอนเงินจริงให้ ${payout.providerName} ผ่านธนาคารแล้ว?`)) return;
    const note = status === "rejected" ? window.prompt(`ระบุเหตุผลที่ปฏิเสธคำขอของ ${payout.providerName}`) : "";
    if (status === "rejected" && !note?.trim()) return;

    setIsProcessing(true);
    setAlertMsg(null);
    try {
      await requestApi(`/api/admin/payouts/${encodeURIComponent(payout.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(status === "rejected" ? { note } : {}) }),
      });
      setPayouts((current) => current.filter((item) => item.id !== payout.id));
      setAlertMsg({
        message: status === "paid"
          ? "บันทึกผลโอนเงินแล้ว (การโอนต้องดำเนินการผ่านธนาคารแยกต่างหาก)"
          : "บันทึกการปฏิเสธคำขอแล้ว",
        type: "success",
      });
    } catch (cause: unknown) {
      setAlertMsg({
        message: cause instanceof Error ? cause.message : "ดำเนินการคำขอไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function processSelected() {
    const selected = payouts.filter((payout) => payout.selected);
    if (selected.length === 0) {
      setAlertMsg({ message: "กรุณาเลือกรายการอย่างน้อย 1 รายการ", type: "error" });
      return;
    }
    if (!window.confirm(`ยืนยันว่าคุณโอนเงินจริงแล้ว ${selected.length} รายการ รวม ฿${totalSelectedAmount.toLocaleString()}?`)) return;

    setIsProcessing(true);
    setAlertMsg(null);
    const results = await Promise.allSettled(selected.map((payout) =>
      requestApi(`/api/admin/payouts/${encodeURIComponent(payout.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "paid" }),
      }),
    ));
    const succeededIds = new Set(
      selected.filter((_, index) => results[index].status === "fulfilled").map((payout) => payout.id),
    );
    setPayouts((current) =>
      current.filter((payout) => !succeededIds.has(payout.id)).map((payout) => ({ ...payout, selected: false })),
    );
    const failures = results.length - succeededIds.size;
    setAlertMsg({
      message: failures
        ? `บันทึกผลโอนสำเร็จ ${succeededIds.size} รายการ แต่ไม่สำเร็จ ${failures} รายการ กรุณาลองใหม่`
        : `บันทึกผลโอนแล้ว ${succeededIds.size} รายการ (ต้องโอนเงินจริงผ่านธนาคารแยกต่างหาก)`,
      type: failures ? "error" : "success",
    });
    setIsProcessing(false);
  }

  function exportCsv() {
    if (payouts.length === 0) {
      setAlertMsg({ message: "ไม่มีข้อมูลสำหรับ Export", type: "error" });
      return;
    }
    const rows = [
      ["วันที่ขอถอน", "ชื่อผู้รับจ้าง", "อีเมล", "จำนวนเงิน", "ธนาคาร", "เลขที่บัญชี"],
      ...payouts.map((payout) => [
        formatDate(payout.createdAt),
        payout.providerName,
        payout.providerEmail,
        payout.amount,
        payout.bankName,
        payout.bankAccountNumber,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Payouts_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">รายการขอถอนเงินของฟรีแลนซ์ (Payouts)</h1>
        <p className="text-gray-400 text-sm mt-1">ตรวจสอบคำขอและบันทึกผลหลังโอนเงินจริงผ่านธนาคาร</p>
      </div>

      {alertMsg && (
        <div role={alertMsg.type === "error" ? "alert" : "status"} className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${alertMsg.type === "success" ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500"}`}>
          {alertMsg.message}
        </div>
      )}

      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="flex justify-between items-center border-b border-gray-800 px-6 py-5 bg-black/40">
          <div className="flex items-center space-x-3">
            <span className="text-gray-400 text-sm">ยอดรวมที่เลือก:</span>
            <span className="text-2xl font-bold text-white">฿ {totalSelectedAmount.toLocaleString()}</span>
          </div>
          <button type="button" onClick={exportCsv} className="flex items-center px-4 py-2 border border-gray-700 bg-black/50 text-gray-300 rounded-lg text-sm hover:border-gray-500 hover:text-white transition">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30 border-b border-gray-800">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={payouts.length > 0 && payouts.every((payout) => payout.selected)}
                    onChange={toggleSelectAll}
                    aria-label="เลือกรายการทั้งหมด"
                    className="w-4 h-4 rounded bg-black border-gray-700 accent-[#f97316] cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium">วันที่ขอถอน</th>
                <th className="p-4 font-medium">ชื่อฟรีแลนซ์</th>
                <th className="p-4 font-medium">ยอดที่ต้องโอน</th>
                <th className="p-4 font-medium">ธนาคาร</th>
                <th className="p-4 font-medium">เลขที่บัญชี</th>
                <th className="p-4 font-medium text-right pr-6">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">กำลังโหลดรายการ...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">ไม่มีรายการขอถอนเงินค้างชำระ</td></tr>
              ) : payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={payout.selected}
                      onChange={() => toggleSelect(payout.id)}
                      aria-label={`เลือกรายการ ${payout.providerName}`}
                      className="w-4 h-4 rounded bg-black border-gray-700 accent-[#f97316] cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-gray-300">{formatDate(payout.createdAt)}</td>
                  <td className="p-4 font-medium text-white">
                    {payout.providerName}
                    <span className="block text-xs text-gray-500">{payout.providerEmail}</span>
                  </td>
                  <td className="p-4 font-semibold text-white">฿ {payout.amount.toLocaleString()}</td>
                  <td className="p-4 text-gray-300">{payout.bankName}</td>
                  <td className="p-4 text-gray-400 font-mono">{payout.bankAccountNumber}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => processSingle(payout, "paid")}
                      className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-green-500 hover:text-green-500 transition mr-1 disabled:opacity-50"
                    >
                      บันทึกว่าโอนแล้ว
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => processSingle(payout, "rejected")}
                      className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-red-500 hover:text-red-500 transition disabled:opacity-50"
                    >
                      ปฏิเสธ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payouts.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-black/40">
            <button
              type="button"
              disabled={isProcessing || selectedCount === 0}
              onClick={processSelected}
              className="flex items-center px-4 py-2 border border-[#f97316]/50 bg-[#f97316]/10 text-[#f97316] rounded-lg text-sm hover:bg-[#f97316] hover:text-white transition font-medium disabled:opacity-50"
            >
              {isProcessing ? "กำลังบันทึก..." : `บันทึกว่าโอนแล้ว (${selectedCount})`}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        ระบบบันทึกสถานะคำขอเท่านั้น ไม่ได้เชื่อมต่อธนาคารและไม่สามารถโอนเงินแทนแอดมินได้
      </p>
    </div>
  );
}
