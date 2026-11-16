"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Info, ShieldCheck, Wallet } from "lucide-react";
import { requestApi } from "@/lib/api";

interface ProviderFinanceData {
  balance: {
    totalEarnings: number;
    pendingWork: number;
    availableBalance: number;
    pendingPayouts: number;
    kycStatus: string;
    bankName: string | null;
    maskedAccountNumber: string | null;
  };
  transactions: {
    id: string;
    type: "earning" | "withdrawal";
    createdAt: string;
    description: string;
    amount: number;
    status: string;
  }[];
}

interface ProviderFinancePanelProps {
  kycHref?: string;
}

const money = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function transactionStatus(type: "earning" | "withdrawal", status: string) {
  if (type === "earning") return "งานเสร็จแล้ว";
  if (status === "pending") return "รอแอดมินดำเนินการ";
  if (status === "paid") return "แอดมินบันทึกผลโอนแล้ว";
  return "คำขอถูกปฏิเสธ";
}

export default function ProviderFinancePanel({ kycHref = "/provider/kyc" }: ProviderFinancePanelProps) {
  const [finance, setFinance] = useState<ProviderFinanceData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    requestApi<ProviderFinanceData>("/api/provider/finance")
      .then((result) => {
        if (active) setFinance(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "โหลดข้อมูลการเงินไม่สำเร็จ");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleWithdraw(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);
    try {
      await requestApi("/api/provider/payouts", {
        method: "POST",
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });
      setNotice("บันทึกคำขอถอนเงินแล้ว ระบบยังไม่มีการโอนเงินจริงอัตโนมัติ แอดมินจะตรวจสอบและบันทึกผลหลังโอนผ่านธนาคาร");
      setWithdrawAmount("");
      try {
        const updated = await requestApi<ProviderFinanceData>("/api/provider/finance");
        setFinance(updated);
      } catch (cause: unknown) {
        setError(cause instanceof Error ? `ส่งคำขอสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ: ${cause.message}` : "ส่งคำขอสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ");
      }
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "ส่งคำขอถอนเงินไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  const balance = finance?.balance;
  const kycApproved = balance?.kycStatus.toLowerCase() === "approved";

  return (
    <div className="space-y-8">
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          {error.includes("เข้าสู่ระบบ") && <Link href="/auth" className="ml-2 font-semibold underline">เข้าสู่ระบบ</Link>}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">ยอดจากงานที่เสร็จแล้วและยังถอนได้</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
            {isLoading ? "กำลังโหลด..." : `฿${money.format(balance?.availableBalance ?? 0)}`}
          </div>
          <p className="text-xs text-zinc-500 pt-1">
            คำนวณจากงานที่เสร็จแล้ว หักคำขอถอนที่รอดำเนินการและที่บันทึกว่าโอนแล้ว
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">มูลค่างานที่ยังไม่เสร็จ</span>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
            {isLoading ? "กำลังโหลด..." : `฿${money.format(balance?.pendingWork ?? 0)}`}
          </div>
          <p className="text-xs text-zinc-500 pt-1">
            ยอดนี้ยังไม่รวมเป็นเงินที่ถอนได้ และระบบยังไม่มี Escrow หรือ payment gateway
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-zinc-950">ส่งคำขอถอนเงิน</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            ส่งคำขอไปยังแอดมิน ระบบจะกันยอดไว้จนกว่าคำขอจะถูกปฏิเสธหรือบันทึกผลการโอน
          </p>
        </div>

        {balance?.bankName && balance.maskedAccountNumber ? (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">{balance.bankName}</h4>
              <p className="text-xs text-zinc-500 font-mono">บัญชีลงท้าย {balance.maskedAccountNumber.slice(-4)}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            ยื่นข้อมูล KYC และรอการยืนยันบัญชีธนาคารก่อน จึงจะส่งคำขอถอนได้
            <Link href={kycHref} className="ml-2 font-semibold underline">ไปหน้ายืนยันตัวตน</Link>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label htmlFor="withdraw-amount" className="block text-xs font-semibold text-zinc-800 mb-1.5">
              จำนวนเงินที่ต้องการถอน (บาท)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="500"
              max={balance?.availableBalance ?? 0}
              step="0.01"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              ขั้นต่ำ ฿500 • ถอนได้สูงสุด ฿{money.format(balance?.availableBalance ?? 0)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex justify-between text-xs">
            <span className="text-zinc-600">จำนวนเงินตามคำขอ</span>
            <span className="font-mono font-bold text-zinc-950">
              ฿{money.format(Number(withdrawAmount) || 0)}
            </span>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoading ||
              !kycApproved ||
              (balance?.availableBalance ?? 0) < 500 ||
              Number(withdrawAmount) < 500 ||
              Number(withdrawAmount) > (balance?.availableBalance ?? 0)
            }
            className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอถอนเงิน"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>การส่งคำขอไม่ได้ทำให้เกิดการโอนเงิน ระบบไม่มี payment gateway; แอดมินต้องโอนผ่านธนาคารและบันทึกผลเอง</span>
          </p>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="text-base font-bold text-zinc-950">ประวัติรายการเงิน</h3>
          <p className="text-xs text-zinc-500 mt-0.5">รายรับจากงานที่เสร็จแล้วและคำขอถอนเงินที่บันทึกในฐานข้อมูล</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
              <tr>
                <th className="py-3 px-6">วันที่</th>
                <th className="py-3 px-6">ชื่องาน / รายการ</th>
                <th className="py-3 px-6">จำนวนเงิน</th>
                <th className="py-3 px-6 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 px-6 text-center text-zinc-500">กำลังโหลดประวัติ...</td></tr>
              ) : !finance?.transactions.length ? (
                <tr><td colSpan={4} className="py-8 px-6 text-center text-zinc-500">ยังไม่มีประวัติรายการเงิน</td></tr>
              ) : finance.transactions.map((transaction) => (
                <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4 px-6 text-zinc-500">{formatDate(transaction.createdAt)}</td>
                  <td className="py-4 px-6 font-semibold text-zinc-900">{transaction.description}</td>
                  <td className={`py-4 px-6 font-mono font-bold ${transaction.type === "earning" ? "text-emerald-600" : "text-zinc-900"}`}>
                    {transaction.type === "earning" ? "+" : "-"}฿{money.format(transaction.amount)}
                  </td>
                  <td className="py-4 px-6 text-right text-zinc-600">{transactionStatus(transaction.type, transaction.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
