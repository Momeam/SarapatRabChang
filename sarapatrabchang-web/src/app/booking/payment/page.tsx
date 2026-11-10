"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EscrowBadge from "@/components/EscrowBadge";
import PaymentTypeSelector from "@/components/booking/PaymentTypeSelector";
import CreditCardForm from "@/components/booking/CreditCardForm";
import BookingOrderSummary from "@/components/booking/BookingOrderSummary";

export default function PersonalPaymentPage() {
  const router = useRouter();

  const [paymentType, setPaymentType] = useState<"card" | "promptpay" | "mobile">("card");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("PHIMCHANOK S.");
  const [expiry, setExpiry] = useState("08 / 29");
  const [cvv, setCvv] = useState("123");

  const handlePay = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push("/orders/SRP-691105-024");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าแรก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">บัญชีของฉัน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">ชำระเงินส่วนบุคคล</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ชำระเงินส่วนบุคคล
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบรายละเอียดการจองและเลือกวิธีชำระเงินอย่างปลอดภัย
          </p>
        </div>

        <EscrowBadge amount={650} providerName="สุภาวดี ใจดี" className="border-orange-200 bg-white" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Payment method + card form */}
          <div className="lg:col-span-7 space-y-6">
            <PaymentTypeSelector
              selected={paymentType}
              onChange={setPaymentType}
              amount={650}
            />
            {paymentType === "card" && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <CreditCardForm
                  cardNumber={cardNumber}
                  cardHolder={cardHolder}
                  expiry={expiry}
                  cvv={cvv}
                  onCardNumberChange={setCardNumber}
                  onCardHolderChange={setCardHolder}
                  onExpiryChange={setExpiry}
                  onCvvChange={setCvv}
                  onSubmit={handlePay}
                />
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-5">
            <BookingOrderSummary
              jobId="SRP-691105-024"
              providerName="สุภาวดี ใจดี"
              providerRole="แม่บ้าน"
              serviceName="ทำความสะอาดคอนโดและบ้าน"
              serviceDesc="คอนโดสะอาดสบาย"
              serviceSpec="พื้นที่ไม่เกิน 40 ตร.ม. • แม่บ้าน 1 คน • ระยะเวลา 3 ชั่วโมง"
              appointmentDate="5 พ.ย. 2569"
              appointmentTime="09:00–12:00 น."
              location="คอนโดของคุณพิมพ์ชนก • ห้วยขวาง กรุงเทพฯ"
              price={650}
              paymentMethod="บัตรเครดิต"
              status="รอชำระเงิน"
              onPay={handlePay}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
