"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-orange-600">ADMIN PANEL</p>
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          เข้าสู่ระบบผู้ดูแล
        </h1>
        <LoginForm
          requiredRole="Admin"
          onSuccess={() => router.replace("/admin/dashboard")}
          onSwitchToRegister={() => router.push("/auth")}
        />
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-zinc-500 hover:text-orange-600"
        >
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  );
}
