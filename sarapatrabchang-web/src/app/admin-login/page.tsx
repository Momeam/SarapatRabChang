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

        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/70 p-3.5 text-xs text-zinc-700 space-y-1">
          <p className="font-bold text-orange-800 flex items-center gap-1.5">
            🔑 บัญชีทดสอบสำหรับผู้ดูแล (Super Admin)
          </p>
          <div className="font-mono text-[11px] pt-1 space-y-0.5 text-zinc-800">
            <p><strong>Email:</strong> admin@sarapatrabchang.com</p>
            <p><strong>Password:</strong> Admin1234!</p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-orange-600"
        >
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  );
}
