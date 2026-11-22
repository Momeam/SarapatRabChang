"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Clock, Download, History } from "lucide-react";
import { requestApi } from "@/lib/api";

interface Payout {
  id: string;
  createdAt: string;
  processedAt?: string | null;
  updatedAt?: string | null;
  status?: "pending" | "paid" | "rejected";
  statusNote?: string;
  providerName: string;
  providerEmail: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  selected: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("th-TH", {
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

  const pendingPayouts = useMemo(
    () => payouts.filter((p) => !p.status || p.status === "pending"),
    [payouts],
  );
  const historyPayouts = useMemo(
    () => payouts.filter((p) => p.status === "paid" || p.status === "rejected"),
    [payouts],
  );

  const totalSelectedAmount = useMemo(
    () =>
      pendingPayouts
        .filter((payout) => payout.selected)
        .reduce((sum, payout) => sum + payout.amount, 0),
    [pendingPayouts],
  );
  const selectedCount = pendingPayouts.filter((payout) => payout.selected).length;

  useEffect(() => {
    let active = true;
    requestApi<Omit<Payout, "selected">[]>("/api/admin/payouts")
      .then((result) => {
        if (active) {
          setPayouts(
            result.map((payout) => ({
              ...payout,
              status: payout.status ?? "pending",
              selected: false,
            })),
          );
        }
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
      current.map((payout) =>
        payout.id === id ? { ...payout, selected: !payout.selected } : payout,
      ),
    );
  };

  const toggleSelectAll = () => {
    const allSelected =
      pendingPayouts.length > 0 && pendingPayouts.every((payout) => payout.selected);
    setPayouts((current) =>
      current.map((payout) =>
        !payout.status || payout.status === "pending"
          ? { ...payout, selected: !allSelected }
          : payout,
      ),
    );
  };

  async function processSingle(payout: Payout, status: "paid" | "rejected") {
    if (
      status === "paid" &&
      !window.confirm(`ยืนยันว่าได้โอนเงินจริงให้ ${payout.providerName} ผ่านธนาคารแล้ว?`)
    ) {
      return;
    }
    const note =
      status === "rejected"
        ? window.prompt(`ระบุเหตุผลที่ปฏิเสธคำขอของ ${payout.providerName}`)
        : "";
    if (status === "rejected" && !note?.trim()) return;

    setIsProcessing(true);
    setAlertMsg(null);
    try {
      const updated = await requestApi<{
        id: string;
        status: "paid" | "rejected";
        statusNote?: string;
        updatedAt?: string;
      }>(`/api/admin/payouts/${encodeURIComponent(payout.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(status === "rejected" ? { note } : {}) }),
      });
      const nowIso = updated?.updatedAt || new Date().toISOString();
      setPayouts((current) =>
        current.map((item) =>
          item.id === payout.id
            ? {
                ...item,
                status,
                statusNote: status === "rejected" ? note?.trim() : "",
                processedAt: nowIso,
                updatedAt: nowIso,
                selected: false,
              }
            : item,
        ),
      );
      setAlertMsg({
        message:
          status === "paid"
            ? "บันทึกผลโอนเงินแล้ว รายการได้ย้ายไปยังตารางประวัติการเงินด้านล่าง"
            : "บันทึกการปฏิเสธคำขอแล้ว รายการได้ย้ายไปยังตารางประวัติการเงินด้านล่าง",
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
    const selected = pendingPayouts.filter((payout) => payout.selected);
    if (selected.length === 0) {
      setAlertMsg({ message: "กรุณาเลือกรายการอย่างน้อย 1 รายการ", type: "error" });
      return;
    }
    if (
      !window.confirm(
        `ยืนยันว่าคุณโอนเงินจริงแล้ว ${selected.length} รายการ รวม ฿${totalSelectedAmount.toLocaleString()}?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setAlertMsg(null);
    const results = await Promise.allSettled(
      selected.map((payout) =>
        requestApi(`/api/admin/payouts/${encodeURIComponent(payout.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "paid" }),
        }),
      ),
    );
    const succeededIds = new Set(
      selected
        .filter((_, index) => results[index].status === "fulfilled")
        .map((payout) => payout.id),
    );
    const nowIso = new Date().toISOString();
    setPayouts((current) =>
      current.map((payout) =>
        succeededIds.has(payout.id)
          ? {
              ...payout,
              status: "paid",
              processedAt: nowIso,
              updatedAt: nowIso,
              selected: false,
            }
          : { ...payout, selected: false },
      ),
    );
    const failures = results.length - succeededIds.size;
    setAlertMsg({
      message: failures
        ? `บันทึกผลโอนสำเร็จ ${succeededIds.size} รายการ แต่ไม่สำเร็จ ${failures} รายการ กรุณาลองใหม่`
        : `บันทึกผลโอนแล้ว ${succeededIds.size} รายการ รายการย้ายไปยังประวัติการเงินด้านล่างแล้ว`,
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
      ["วันที่ขอถอน", "วันที่ดำเนินการ", "ชื่อผู้รับจ้าง", "อีเมล", "จำนวนเงิน", "ธนาคาร", "เลขที่บัญชี", "สถานะ", "หมายเหตุ"],
      ...payouts.map((payout) => [
        formatDate(payout.createdAt),
        formatDate(payout.processedAt || payout.updatedAt),
        payout.providerName,
        payout.providerEmail,
        payout.amount,
        payout.bankName,
        payout.bankAccountNumber,
        payout.status === "paid"
          ? "โอนเงินแล้ว"
          : payout.status === "rejected"
            ? "ปฏิเสธคำขอ"
            : "รออนุมัติ",
        payout.statusNote || "",
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
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          รายการขอถอนเงินของฟรีแลนซ์ (Payouts & History)
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          ตรวจสอบคำขอถอนเงิน บันทึกผลการโอนเงินผ่านธนาคาร และดูประวัติการเงินย้อนหลังทั้งหมด
        </p>
      </div>

      {alertMsg && (
        <div
          role={alertMsg.type === "error" ? "alert" : "status"}
          className={`px-4 py-3 rounded-lg border text-sm font-medium ${
            alertMsg.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-500"
              : "bg-red-500/10 border-red-500 text-red-500"
          }`}
        >
          {alertMsg.message}
        </div>
      )}

      {/* Pending Payouts Card */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-800 px-6 py-5 bg-black/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f97316]" />
              <h2 className="text-base font-bold text-white">
                รายการขอถอนเงินที่รออนุมัติ ({pendingPayouts.length} รายการ)
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs">ยอดรวมที่เลือก:</span>
              <span className="text-xl font-bold text-[#f97316]">
                ฿ {totalSelectedAmount.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 bg-black/50 text-gray-300 rounded-lg text-sm hover:border-gray-500 hover:text-white transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ทั้งหมด</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30 border-b border-gray-800">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      pendingPayouts.length > 0 &&
                      pendingPayouts.every((payout) => payout.selected)
                    }
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
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    กำลังโหลดรายการ...
                  </td>
                </tr>
              ) : pendingPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    ไม่มีรายการขอถอนเงินค้างชำระ
                  </td>
                </tr>
              ) : (
                pendingPayouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-gray-800 hover:bg-[#1f1f1f] transition"
                  >
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
                    <td className="p-4 font-semibold text-white">
                      ฿ {payout.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-300">{payout.bankName}</td>
                    <td className="p-4 text-gray-400 font-mono">{payout.bankAccountNumber}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void processSingle(payout, "paid")}
                        className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-green-500 hover:text-green-500 transition mr-1 disabled:opacity-50 cursor-pointer"
                      >
                        บันทึกว่าโอนแล้ว
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void processSingle(payout, "rejected")}
                        className="px-3 py-1.5 text-xs border border-gray-700 text-gray-300 rounded hover:border-red-500 hover:text-red-500 transition disabled:opacity-50 cursor-pointer"
                      >
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pendingPayouts.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-black/40">
            <button
              type="button"
              disabled={isProcessing || selectedCount === 0}
              onClick={() => void processSelected()}
              className="flex items-center px-4 py-2 border border-[#f97316]/50 bg-[#f97316]/10 text-[#f97316] rounded-lg text-sm hover:bg-[#f97316] hover:text-white transition font-medium disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? "กำลังบันทึก..." : `บันทึกว่าโอนแล้ว (${selectedCount})`}
            </button>
          </div>
        )}
      </div>

      {/* Payout History Card */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5 bg-black/40">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                ประวัติการเงินที่ดำเนินการแล้ว ({historyPayouts.length} รายการ)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                รายการถอนเงินที่แอดมินได้อนุมัติโอนเงินหรือปฏิเสธคำขอไปแล้ว
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30 border-b border-gray-800">
                <th className="p-4 font-medium">วันที่ขอถอน</th>
                <th className="p-4 font-medium">วันที่ดำเนินการ</th>
                <th className="p-4 font-medium">ชื่อฟรีแลนซ์</th>
                <th className="p-4 font-medium">จำนวนเงิน</th>
                <th className="p-4 font-medium">บัญชีรับเงิน</th>
                <th className="p-4 font-medium">สถานะ / หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    กำลังโหลดประวัติการเงิน...
                  </td>
                </tr>
              ) : historyPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    ยังไม่มีประวัติรายการที่ดำเนินการแล้ว
                  </td>
                </tr>
              ) : (
                historyPayouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-gray-800 hover:bg-[#1f1f1f] transition"
                  >
                    <td className="p-4 text-gray-300">{formatDate(payout.createdAt)}</td>
                    <td className="p-4 text-gray-400">
                      {formatDate(payout.processedAt || payout.updatedAt || payout.createdAt)}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {payout.providerName}
                      <span className="block text-xs text-gray-500">{payout.providerEmail}</span>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      ฿ {payout.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-300">
                      <span>{payout.bankName}</span>
                      <span className="block text-xs text-gray-500 font-mono">
                        {payout.bankAccountNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      {payout.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>โอนเงินแล้ว</span>
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ปฏิเสธคำขอ</span>
                          </span>
                          {payout.statusNote && (
                            <p className="text-xs text-gray-400">เหตุผล: {payout.statusNote}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        ระบบบันทึกสถานะคำขอเท่านั้น ไม่ได้เชื่อมต่อธนาคารและไม่สามารถโอนเงินแทนแอดมินได้
      </p>
    </div>
  );
}
