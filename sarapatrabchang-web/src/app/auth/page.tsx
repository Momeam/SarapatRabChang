"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  ShieldCheck,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [idCardFile, setIdCardFile] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful registration / login then redirect to Home
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Hero Benefits */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-4">
                สำหรับผู้ใช้บริการบุคคลทั่วไป
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                ยินดีต้อนรับสู่ <span className="text-orange-500">sarapatrabchang</span>
              </h1>
              <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                เรื่องในบ้าน ให้คนใกล้บ้านช่วยดูแล สมัครสมาชิกเพื่อค้นหา พูดคุย และจองบริการ จากผู้ให้บริการที่ผ่านการยืนยันตัวตน
              </p>
            </div>

            {/* Value Propositions */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    ค้นหาคนที่ใช่ ใกล้บ้านคุณ
                  </h3>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    เลือกบริการและเปรียบเทียบราคาได้ในที่เดียว
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    มั่นใจในทุกการจ้างงาน
                  </h3>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    ยืนยันตัวตนทั้งผู้ใช้และผู้ให้บริการ
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    จองง่าย ติดตามงานได้
                  </h3>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    เลือกวันเวลาและดูประวัติการจองของคุณ
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Box */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                <Lock className="w-3.5 h-3.5 text-orange-500" />
                <span>ข้อมูลของคุณได้รับการดูแลอย่างปลอดภัย</span>
              </div>
              <p className="text-zinc-500 leading-relaxed">
                เอกสารยืนยันตัวตนใช้เพื่อตรวจสอบความปลอดภัยเท่านั้น และจะไม่แสดงบนโปรไฟล์สาธารณะ
              </p>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-10 shadow-sm">
            {/* Tabs */}
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

            {activeTab === "register" ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    สร้างบัญชีบุคคลทั่วไป
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    กรอกข้อมูลของคุณเพื่อเริ่มต้นใช้งาน • จำเป็นต้องกรอกทุกช่อง
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="สร้างรหัสผ่าน"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      อย่างน้อย 8 ตัวอักษร มีตัวอักษรและตัวเลข
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ชื่อและนามสกุลตามบัตรประชาชน"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08X-XXX-XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* ID Card Upload Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    อัปโหลดรูปภาพบัตรประชาชน (ด้านหน้า)
                  </label>
                  <p className="text-[11px] text-zinc-500 mb-2">
                    ใช้ภาพด้านหน้าที่เห็นข้อมูลชัดเจน และปิดเลขหลังบัตรก่อนอัปโหลด
                  </p>
                  <label className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setIdCardFile(e.target.files[0].name);
                        }
                      }}
                    />
                    {idCardFile ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>อัปโหลดแล้ว: {idCardFile}</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 transition-colors mb-2" />
                        <span className="text-xs text-zinc-600 font-medium">
                          คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                        </span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">
                          รองรับ JPG, PNG ขนาดไม่เกิน 5 MB
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="terms" className="text-xs text-zinc-600 leading-normal">
                    ฉันยอมรับ{" "}
                    <Link href="#terms" className="text-orange-600 underline">
                      ข้อกำหนดการใช้งาน
                    </Link>{" "}
                    และ{" "}
                    <Link href="#privacy" className="text-orange-600 underline">
                      นโยบายความเป็นส่วนตัว
                    </Link>{" "}
                    และยินยอมให้ตรวจสอบข้อมูลเพื่อยืนยันตัวตน
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  สมัครสมาชิกบุคคลทั่วไป
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-zinc-500">
                    มีบัญชีอยู่แล้ว? กลับเข้าใช้งานได้เลย{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            ) : (
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
                    อีเมล หรือ เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="example@email.com หรือ 08X-XXX-XXXX"
                    defaultValue="pimchanok@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
                      รหัสผ่าน
                    </label>
                    <a href="#forgot" className="text-xs text-orange-600 hover:underline">
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="กรอกรหัสผ่านของคุณ"
                    defaultValue="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-zinc-500">
                    ยังไม่มีบัญชีใช่หรือไม่?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                  >
                    สมัครสมาชิกใหม่
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

