"use client";

import Link from "next/link";
import { ChevronRight, ShieldCheck, MessageSquare, UploadCloud, Wallet } from "lucide-react";

interface JobHeaderBarProps {
  orderId: string;
  clientName: string;
  serviceTitle: string;
  activeTab: "chat" | "delivery" | "finance";
  setActiveTab: (tab: "chat" | "delivery" | "finance") => void;
}

export default function JobHeaderBar({
  orderId,
  clientName,
  serviceTitle,
  activeTab,
  setActiveTab,
}: JobHeaderBarProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/provider/dashboard" className="hover:text-orange-600">แดชบอร์ด</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/provider/dashboard#orders" className="hover:text-orange-600">รายการงาน</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-mono font-medium">{orderId}</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950">
              {serviceTitle}
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
              {orderId}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            ผู้ว่าจ้าง: <span className="font-semibold text-zinc-800">{clientName}</span>
          </p>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>กำลังดำเนินการ • ได้รับเงินเข้า Escrow แล้ว</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-2 sm:gap-6 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "chat"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>ข้อความและใบเสนอราคา</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "delivery"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>ส่งมอบงาน</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "finance"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>การเงินและรายได้</span>
        </button>
      </div>
    </div>
  );
}

