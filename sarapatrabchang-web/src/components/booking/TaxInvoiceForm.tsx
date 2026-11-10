"use client";

import { FileText } from "lucide-react";

interface TaxInvoiceFormProps {
  needTaxInvoice: boolean;
  setNeedTaxInvoice: (v: boolean) => void;
  taxType: "individual" | "corporate";
  setTaxType: (t: "individual" | "corporate") => void;
  taxId: string;
  setTaxId: (id: string) => void;
  taxName: string;
  setTaxName: (name: string) => void;
  taxAddress: string;
  setTaxAddress: (addr: string) => void;
  taxEmail: string;
  setTaxEmail: (email: string) => void;
}

export default function TaxInvoiceForm({
  needTaxInvoice,
  setNeedTaxInvoice,
  taxType,
  setTaxType,
  taxId,
  setTaxId,
  taxName,
  setTaxName,
  taxAddress,
  setTaxAddress,
  taxEmail,
  setTaxEmail,
}: TaxInvoiceFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="etax"
          checked={needTaxInvoice}
          onChange={(e) => setNeedTaxInvoice(e.target.checked)}
          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-zinc-300"
        />
        <label
          htmlFor="etax"
          className="text-sm font-bold text-zinc-900 cursor-pointer flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-orange-500" />
          <span>ต้องการรับใบกำกับภาษีแบบอิเล็กทรอนิกส์ (e-Tax Invoice)</span>
        </label>
      </div>

      {needTaxInvoice && (
        <div className="space-y-4 pt-3 border-t border-zinc-100">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              ประเภทผู้ขอใบกำกับภาษี
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="taxtype"
                  checked={taxType === "individual"}
                  onChange={() => setTaxType("individual")}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span>บุคคลธรรมดา</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="taxtype"
                  checked={taxType === "corporate"}
                  onChange={() => setTaxType("corporate")}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span>นิติบุคคล/บริษัท</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                เลขประจำตัวผู้เสียภาษี (Tax ID)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="กรอกเลขประจำตัวผู้เสียภาษี 13 หลัก"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                ชื่อ-นามสกุล / ชื่อบริษัท
              </label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              ที่อยู่ตามบัตรประชาชน / ที่อยู่จดทะเบียน
            </label>
            <textarea
              rows={2}
              value={taxAddress}
              onChange={(e) => setTaxAddress(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              อีเมลรับเอกสาร
            </label>
            <input
              type="email"
              value={taxEmail}
              onChange={(e) => setTaxEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <p className="text-[11px] text-zinc-400">
            ⓘ ระบบจะจัดส่งใบกำกับภาษีเข้าอีเมลนี้โดยอัตโนมัติเมื่อชำระเงินสำเร็จ
          </p>
        </div>
      )}
    </div>
  );
}

