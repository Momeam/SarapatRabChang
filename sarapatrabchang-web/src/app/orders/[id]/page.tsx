"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusStepper from "@/components/orders/OrderStatusStepper";
import DeliveryProofGallery from "@/components/orders/DeliveryProofGallery";
import WorkApprovalCard from "@/components/orders/WorkApprovalCard";
import OrderSidebarSummary from "@/components/orders/OrderSidebarSummary";

const PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400",
    alt: "ห้องนั่งเล่น",
    label: "พื้นและห้องนั่งเล่น",
    filename: "ห้องนั่งเล่น.jpg",
  },
  {
    src: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    alt: "ห้องครัว",
    label: "ห้องครัว",
    filename: "ห้องครัว.jpg",
  },
  {
    src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    alt: "ห้องน้ำ",
    label: "ห้องน้ำ 1 ห้อง",
    filename: "ห้องน้ำ.jpg",
  },
];

const CHECKLIST = [
  "กวาด ดูดฝุ่น และถูพื้นทุกห้อง",
  "เช็ดฝุ่นเฟอร์นิเจอร์และพื้นผิวทั่วไป",
  "ทำความสะอาดห้องน้ำ 1 ห้อง และครัว",
  "อุปกรณ์และน้ำยาทำความสะอาดพื้นฐาน",
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = (params?.id as string) || "SRP-691105-024";

  const handleApprove = () => {
    router.push(`/orders/${jobId}/review`);
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
          <span className="text-zinc-900 font-medium">ติดตามงานและตรวจรับงานส่วนบุคคล</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ติดตามงานและตรวจรับงานส่วนบุคคล
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            หมายเลขงาน{" "}
            <span className="font-mono font-semibold text-zinc-800">{jobId}</span>{" "}
            • นัดหมาย 5 พ.ย. 2569 เวลา 09:00–12:00 น.
          </p>
        </div>

        <OrderStatusStepper />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: proof + approval */}
          <div className="lg:col-span-7 space-y-6">
            <DeliveryProofGallery
              providerName="สุภาวดี ใจดี"
              providerMessage="ทำความสะอาดครบตามแพ็กเกจแล้วค่ะ ทั้งพื้น เฟอร์นิเจอร์ ครัว และห้องน้ำ 1 ห้อง แนบภาพหลังทำงานให้ตรวจสอบ ขอบคุณที่ใช้บริการค่ะ"
              deliveredAt="5 พ.ย. 2569 เวลา 12:00 น."
              photos={PHOTOS}
              checklist={CHECKLIST}
            />
            <WorkApprovalCard
              providerName="สุภาวดี ใจดี"
              amount={650}
              onApprove={handleApprove}
            />
          </div>

          {/* Right: sidebar */}
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
              escrowState="pending"
              status="รอตรวจรับงาน"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
