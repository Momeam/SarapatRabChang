"use client";

import { CreditCard, Lock } from "lucide-react";

interface CreditCardFormProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  onCardNumberChange: (v: string) => void;
  onCardHolderChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCvvChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreditCardForm({
  cardNumber,
  cardHolder,
  expiry,
  cvv,
  onCardNumberChange,
  onCardHolderChange,
  onExpiryChange,
  onCvvChange,
  onSubmit,
}: CreditCardFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-zinc-100">
      <h4 className="text-sm font-bold text-zinc-900">ข้อมูลบัตรเครดิต</h4>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          หมายเลขบัตร
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => onCardNumberChange(e.target.value)}
            placeholder="4242 4242 4242 4242"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <CreditCard className="w-5 h-5 text-zinc-400 absolute right-3 top-3" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          ชื่อผู้ถือบัตร
        </label>
        <input
          type="text"
          value={cardHolder}
          onChange={(e) => onCardHolderChange(e.target.value)}
          placeholder="เช่น PHIMCHANOK S."
          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            วันหมดอายุ (เดือน/ปี)
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => onExpiryChange(e.target.value)}
            placeholder="MM / YY"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            รหัสความปลอดภัย (CVV)
          </label>
          <input
            type="password"
            maxLength={4}
            value={cvv}
            onChange={(e) => onCvvChange(e.target.value)}
            placeholder="•••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
        <Lock className="w-3.5 h-3.5 text-zinc-400" />
        <span>ข้อมูลบัตรถูกเข้ารหัส และจะไม่แสดงให้ผู้ให้บริการทราบ</span>
      </p>
    </form>
  );
}

