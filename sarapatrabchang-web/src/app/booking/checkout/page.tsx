"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import PaymentMethodSelector from "@/components/booking/PaymentMethodSelector";
import TaxInvoiceForm from "@/components/booking/TaxInvoiceForm";
import CheckoutSummary from "@/components/booking/CheckoutSummary";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"promptpay" | "card" | "mobile">("promptpay");

  // e-Tax states
  const [needTaxInvoice, setNeedTaxInvoice] = useState(true);
  const [taxType, setTaxType] = useState<"individual" | "corporate">("individual");
  const [taxId, setTaxId] = useState("1-1002-00345-67-8");
  const [taxName, setTaxName] = useState("พิมพ์ชนก ใจดี");
  const [taxAddress, setTaxAddress] = useState(
    "88/12 ซอยสุขุมวิท 39 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110"
  );
  const [taxEmail, setTaxEmail] = useState("pimchanok@example.com");

  const handleConfirmPayment = () => {
    if (paymentMethod === "card") {
      router.push("/booking/payment");
    } else {
      router.push("/orders/SRP-691105-024");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าหลัก
          </Link>
          <span>/</span>
          <Link href="/services/cleaning" className="hover:text-orange-600">
            บริการช่างและแม่บ้าน
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">ชำระเงิน</span>
        </div>

        {/* Stepper Progress */}
        <BookingStepper currentStep={3} />

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ตรวจสอบและชำระเงิน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบรายละเอียดการจอง เลือกวิธีชำระเงิน และระบุข้อมูลใบกำกับภาษี
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            <TaxInvoiceForm
              needTaxInvoice={needTaxInvoice}
              setNeedTaxInvoice={setNeedTaxInvoice}
              taxType={taxType}
              setTaxType={setTaxType}
              taxId={taxId}
              setTaxId={setTaxId}
              taxName={taxName}
              setTaxName={setTaxName}
              taxAddress={taxAddress}
              setTaxAddress={setTaxAddress}
              taxEmail={taxEmail}
              setTaxEmail={setTaxEmail}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <CheckoutSummary onConfirm={handleConfirmPayment} price={650} />
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 border-t border-zinc-200">
          <Link
            href="/booking/details"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปแก้ไขรายละเอียดงานและสถานที่</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
