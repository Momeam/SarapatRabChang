"use client";

import { useState } from "react";
import { Wallet, ShieldCheck, Building2, ArrowRight, Info, CheckCircle2 } from "lucide-react";

interface ProviderFinancePanelProps {
  onWithdrawSuccess: () => void;
}

export default function ProviderFinancePanel({ onWithdrawSuccess }: ProviderFinancePanelProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("5000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numAmount = parseFloat(withdrawAmount) || 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onWithdrawSuccess();
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* 2 Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">ยอดเงินที่ถอนได้ (Available Balance)</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
            ฿8,450.00
          </div>
          <p className="text-xs text-emerald-600 font-medium pt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>พร้อมถอนเข้าบัญชีธนาคารได้ทันที</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">ยอดเงินรอการอนุมัติ (Escrow Pending)</span>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
            ฿1,850.00
          </div>
          <p className="text-xs text-zinc-500 pt-1">
            อยู่ในระบบ Escrow ปลอดภัย 100% รอผู้จ้างตรวจรับงาน
          </p>
        </div>
      </div>

      {/* ส่งคำขอถอนเงิน (Withdrawal Request) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-zinc-950">ส่งคำขอถอนเงิน</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            โอนเงินเข้าบัญชีธนาคารที่ยืนยันตัวตนไว้กับ sarapatrabchang
          </p>
        </div>

        {/* Bank info display box */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">ธนาคารกสิกรไทย • ออมทรัพย์</h4>
              <p className="text-xs text-zinc-500 font-mono">XXX-X-XX789-0 • ชื่อ: พิมพ์ชนก ใจดี</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            บัญชีหลัก
          </span>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              จำนวนเงินที่ต้องการถอน (บาท)
            </label>
            <input
              type="number"
              max={8450}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">ถอนได้สูงสุด ฿8,450.00</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>จำนวนเงินที่ถอน</span>
              <span className="font-mono">฿{numAmount.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>ค่าธรรมเนียมการถอน</span>
              <span className="font-mono text-emerald-600">ฟรี (฿0.00)</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-950">
              <span>ยอดเงินเข้าบัญชี</span>
              <span className="font-mono text-emerald-600 text-sm">
                ฿{numAmount.toLocaleString()}.00
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอถอนเงิน (Withdrawal Request)"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>เงินจะโอนเข้าบัญชีภายใน 1-2 วันทำการ (ไม่รวมวันหยุดนักขัตฤกษ์)</span>
          </p>
        </form>
      </div>

      {/* ประวัติรายการเงิน (Table) */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="text-base font-bold text-zinc-950">ประวัติรายการเงิน</h3>
          <p className="text-xs text-zinc-500 mt-0.5">รายการรายรับและการถอนเงินย้อนหลัง</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
              <tr>
                <th className="py-3 px-6">วันที่</th>
                <th className="py-3 px-6">ชื่องาน / รายการ</th>
                <th className="py-3 px-6">จำนวนเงิน</th>
                <th className="py-3 px-6">สถานะอีสกรอว์</th>
                <th className="py-3 px-6 text-right">สถานะการถอน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6 text-zinc-500">15 พ.ย. 2569</td>
                <td className="py-4 px-6 font-semibold text-zinc-900">
                  ทำความสะอาดคอนโด (ORD-0269-041)
                </td>
                <td className="py-4 px-6 font-mono font-bold text-emerald-600">+฿650.00</td>
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    อนุมัติแล้ว
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-zinc-600 font-medium">พร้อมถอน</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6 text-zinc-500">14 พ.ย. 2569</td>
                <td className="py-4 px-6 font-semibold text-zinc-900">
                  ล้างแอร์ติดผนัง 2 เครื่อง
                </td>
                <td className="py-4 px-6 font-mono font-bold text-emerald-600">+฿1,200.00</td>
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    อนุมัติแล้ว
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-zinc-600 font-medium">พร้อมถอน</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6 text-zinc-500">12 พ.ย. 2569</td>
                <td className="py-4 px-6 font-semibold text-zinc-900">
                  ถอนเงินเข้าบัญชีธนาคาร กสิกรไทย
                </td>
                <td className="py-4 px-6 font-mono font-bold text-zinc-900">-฿5,000.00</td>
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700">
                    สำเร็จ
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-emerald-600 font-medium">โอนเรียบร้อย</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-6 text-zinc-500">10 พ.ย. 2569</td>
                <td className="py-4 px-6 font-semibold text-zinc-900">
                  ทำความสะอาดห้องสตูดิโอ
                </td>
                <td className="py-4 px-6 font-mono font-bold text-emerald-600">+฿500.00</td>
                <td className="py-4 px-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    อนุมัติแล้ว
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-emerald-600 font-medium">โอนเรียบร้อย</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

