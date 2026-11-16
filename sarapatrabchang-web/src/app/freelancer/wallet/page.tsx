"use client";

import ProviderFinancePanel from "@/components/provider/ProviderFinancePanel";

export default function FreelancerWalletPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0a0a] custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">การเงินและรายได้</h1>
          <p className="text-sm text-gray-400 mt-1">ยอดและคำขอถอนเงินจากฐานข้อมูล</p>
        </div>
        <ProviderFinancePanel kycHref="/freelancer/profile" />
      </div>
    </div>
  );
}
