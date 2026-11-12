"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import JobHeaderBar from "@/components/provider/JobHeaderBar";
import JobChatTimeline from "@/components/provider/JobChatTimeline";
import QuotationForm from "@/components/provider/QuotationForm";
import WorkDeliveryForm from "@/components/provider/WorkDeliveryForm";
import ProviderFinancePanel from "@/components/provider/ProviderFinancePanel";
import SuccessConfirmationCard from "@/components/provider/SuccessConfirmationCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProviderJobDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  const initialTab =
    searchParams.get("tab") === "finance"
      ? "finance"
      : searchParams.get("tab") === "delivery"
      ? "delivery"
      : "chat";

  const [activeTab, setActiveTab] = useState<"chat" | "delivery" | "finance">(initialTab);
  const [successModal, setSuccessModal] = useState<"quotation" | "delivery" | "withdrawal" | null>(null);

  const orderId = resolvedParams.id || "ORD-0269-041";
  const clientName = "อรทัย สุขใจ";
  const serviceTitle = "ทำความสะอาดคอนโดและบ้าน";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <JobHeaderBar
          orderId={orderId}
          clientName={clientName}
          serviceTitle={serviceTitle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab 1: ข้อความและใบเสนอราคา */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <JobChatTimeline />
            </div>
            <div className="lg:col-span-1">
              <QuotationForm onSuccess={() => setSuccessModal("quotation")} />
            </div>
          </div>
        )}

        {/* Tab 2: ส่งมอบงาน */}
        {activeTab === "delivery" && (
          <WorkDeliveryForm
            onSuccess={() => setSuccessModal("delivery")}
            onBackToChat={() => setActiveTab("chat")}
          />
        )}

        {/* Tab 3: การเงินและรายได้ */}
        {activeTab === "finance" && (
          <ProviderFinancePanel
            onWithdrawSuccess={() => setSuccessModal("withdrawal")}
          />
        )}
      </main>

      {/* Confirmation Modals */}
      {successModal && (
        <SuccessConfirmationCard
          type={successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}

      <Footer />
    </div>
  );
}

