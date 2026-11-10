"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewJobCompletedBanner from "@/components/orders/ReviewJobCompletedBanner";
import ReviewForm from "@/components/orders/ReviewForm";
import OrderSidebarSummary from "@/components/orders/OrderSidebarSummary";

export default function ReviewRatingPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = (params?.id as string) || "SRP-691105-024";

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (_rating: number, _text: string) => {
    setSubmitted(true);
    setTimeout(() => {
      router.push("/profile");
    }, 1500);
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
          <span className="text-zinc-900 font-medium">ประเมินและให้คะแนน</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ประเมินและให้คะแนน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ขอบคุณที่ใช้บริการ แบ่งปันประสบการณ์ของคุณเพื่อช่วยให้คนใกล้บ้านเลือกบริการได้มั่นใจขึ้น
          </p>
        </div>

        <ReviewJobCompletedBanner
          providerName="สุภาวดี ใจดี"
          amount={650}
          approvedAt="5 พ.ย. 2569 เวลา 12:30 น."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Review form */}
          <div className="lg:col-span-7">
            <ReviewForm
              providerName="สุภาวดี ใจดี"
              providerRole="แม่บ้าน"
              initialRating={5}
              initialText="มาตรงเวลา เตรียมอุปกรณ์มาครบ ทำความสะอาดพื้นและเฟอร์นิเจอร์เรียบร้อย โดยเฉพาะครัวกับห้องน้ำสะอาดมากค่ะ งานครบตามที่ตกลง คุ้มค่ากับราคา ฿650 จะกลับมาใช้บริการอีกค่ะ"
              onSubmit={handleSubmit}
              submitted={submitted}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-5">
            <OrderSidebarSummary
              jobId={jobId}
              providerName="สุภาวดี ใจดี"
              providerRole="แม่บ้าน"
              serviceName="ทำความสะอาดคอนโดและบ้าน"
              serviceDesc="คอนโดสะอาดสบาย"
              serviceSpec="พื้นที่ไม่เกิน 40 ตร.ม. • แม่บ้าน 1 คน • ระยะเวลา 3 ชั่วโมง"
              appointmentDate="5 พ.ย. 2569"
              appointmentTime="09:00–12:00 น."
              location="คอนโดของคุณพิมพ์ชนก • ห้วยขวาง กรุงเทพฯ"
              price={650}
              escrowState="completed"
              status="เสร็จสมบูรณ์"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
