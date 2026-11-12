"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProviderNavbar from "@/components/provider/ProviderNavbar";
import Footer from "@/components/Footer";
import KycStepper from "@/components/provider/KycStepper";
import KycForm from "@/components/provider/KycForm";
import KycSidebar from "@/components/provider/KycSidebar";
import { useAuth } from "@/components/AuthProvider";

export default function KycPage() {
  const { user } = useAuth();

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "พิมพ์ชนก ใจดี";

  const email = user?.email ?? "pimchanok@example.com";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ProviderNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/profile" className="hover:text-orange-600">บัญชีของฉัน</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">สมัครเป็นผู้รับจ้าง</span>
        </div>

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            ลงทะเบียนเป็นผู้รับจ้างและยืนยันตัวตน (KYC)
          </h1>
          <p className="text-sm text-zinc-500">
            กรอกข้อมูลและอัปโหลดเอกสาร เพื่อเตรียมเปิดให้บริการด้วยบัญชีเดิมของคุณ
          </p>
        </div>

        {/* 3-Step Stepper */}
        <KycStepper currentStep={2} />

        {/* Main Content Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <KycForm initialName={displayName} />
          </div>
          <div className="lg:col-span-1">
            <KycSidebar displayName={displayName} email={email} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

