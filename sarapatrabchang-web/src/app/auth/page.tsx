"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthHero from "@/components/auth/AuthHero";
import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import type { AuthUser } from "@/lib/auth";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  const handleRegistrationSuccess = () => {
    router.push("/");
  };

  const handleLoginSuccess = (user: AuthUser) => {
    router.push(user.role === "Admin" ? "/admin/dashboard" : "/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Benefits & Trust */}
          <div className="lg:col-span-5">
            <AuthHero />
          </div>

          {/* Right Column: Tabbed Auth Forms */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-10 shadow-sm">
            {/* Tab switch buttons */}
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "register"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                สมัครสมาชิกใหม่
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "login"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                เข้าสู่ระบบ
              </button>
            </div>

            {/* Dynamic Form View */}
            {activeTab === "register" ? (
              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onSwitchToLogin={() => setActiveTab("login")}
              />
            ) : (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setActiveTab("register")}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
