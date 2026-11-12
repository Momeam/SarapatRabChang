"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { AuthUser } from "@/lib/auth";

interface LoginFormProps {
  onSuccess: (user: AuthUser) => void;
  onSwitchToRegister: () => void;
  requiredRole?: string;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  requiredRole,
}: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const signedInUser = await signIn({ email, password });
      if (requiredRole && signedInUser.role !== requiredRole) {
        throw new Error("บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ");
      }
      onSuccess(signedInUser);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "เข้าสู่ระบบไม่สำเร็จ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">
          เข้าสู่ระบบ sarapatrabchang
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          ยินดีต้อนรับกลับมา กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          อีเมล
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="example@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            รหัสผ่าน
          </label>
        </div>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="กรอกรหัสผ่านของคุณ"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <div className="text-center pt-2">
        <span className="text-xs text-zinc-500">
          ยังไม่มีบัญชีใช่หรือไม่?{" "}
        </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
        >
          สมัครสมาชิกใหม่
        </button>
      </div>
    </form>
  );
}

