"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import ProfileHeader from "@/components/profile/ProfileHeader";
import InterestsCard from "@/components/profile/InterestsCard";
import ContactAddressCard from "@/components/profile/ContactAddressCard";
import TaxInfoCard from "@/components/profile/TaxInfoCard";
import PublicReviewsFeed from "@/components/profile/PublicReviewsFeed";

export default function ProfilePage() {
  const { user } = useAuth();

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user?.email ?? "ผู้ใช้";

  const email = user?.email ?? "ยังไม่ได้เข้าสู่ระบบ";

  const phone =
    typeof user?.user_metadata.phone === "string" && user.user_metadata.phone
      ? user.user_metadata.phone
      : "ยังไม่ได้ระบุ";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      })
    : "ยังไม่มีข้อมูล";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">บัญชีของฉัน</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">โปรไฟล์และข้อมูลส่วนตัว</span>
        </div>

        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              โปรไฟล์และข้อมูลส่วนตัว
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              จัดการโปรไฟล์ ข้อมูลสำหรับใช้บริการ และความคิดเห็นจากผู้ร่วมงาน
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white shadow-xs w-fit">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span>มุมมองเจ้าของบัญชี</span>
          </span>
        </div>

        {/* Profile header card */}
        <ProfileHeader
          displayName={displayName}
          memberSince={memberSince}
          rating={4.7}
          reviewCount={3}
        />

        {/* 3-column info cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InterestsCard initial={["แม่บ้าน", "ช่างไฟ", "จัดสวน"]} />
          <ContactAddressCard email={email} phone={phone} />
          <TaxInfoCard displayName={displayName} email={email} />
        </div>

        {/* Public reviews feed */}
        <PublicReviewsFeed />
      </main>

      <Footer />
    </div>
  );
}
