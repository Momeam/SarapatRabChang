"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Users,
  Briefcase,
  Scale,
  Wallet,
  Settings,
  LogOut,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";

interface AdminQuickStats {
  pendingKyc: number;
  pendingPayouts: number;
  openDisputes: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickStats, setQuickStats] = useState<AdminQuickStats>({
    pendingKyc: 0,
    pendingPayouts: 0,
    openDisputes: 0,
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin-login");
    } else if (user.role?.toLowerCase() !== "admin") {
      router.replace("/");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (loading || !user || user.role?.toLowerCase() !== "admin") return;
    let active = true;

    Promise.all([
      requestApi<{ pendingKyc?: number; pendingPayouts?: number }>("/api/admin/dashboard").catch(
        () => null,
      ),
      requestApi<{ status: string; bookingStatus: string }[]>("/api/admin/disputes").catch(
        () => [],
      ),
    ]).then(([dash, disputes]) => {
      if (!active) return;
      const openDisputes = Array.isArray(disputes)
        ? disputes.filter(
            (d) => !d.status.startsWith("resolved") || d.bookingStatus === "disputed",
          ).length
        : 0;
      setQuickStats({
        pendingKyc: dash?.pendingKyc ?? 0,
        pendingPayouts: dash?.pendingPayouts ?? 0,
        openDisputes,
      });
    });

    return () => {
      active = false;
    };
  }, [loading, pathname, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !user || user.role?.toLowerCase() !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...
      </main>
    );
  }

  const handleSignOut = async () => {
    setShowAdminMenu(false);
    try {
      await signOut();
    } finally {
      router.replace("/admin-login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (q.includes("ข้อพิพาท") || q.toLowerCase().includes("dsp")) {
      router.push("/admin/disputes");
    } else if (q.includes("ถอน") || q.includes("เงิน")) {
      router.push("/account/payouts");
    } else if (q.includes("งาน") || q.includes("ประกาศ")) {
      router.push("/admin/jobs");
    } else {
      router.push("/admin/users");
    }
  };

  const isActive = (path: string) => pathname.startsWith(path);

  const activeClass =
    "flex items-center px-4 py-3 bg-[#171717] text-[#f97316] border-l-4 border-[#f97316] rounded-r-lg font-medium transition";
  const inactiveClass =
    "flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#171717] rounded-lg transition border-l-4 border-transparent";

  const totalAlerts =
    quickStats.pendingKyc + quickStats.openDisputes + quickStats.pendingPayouts;
  const adminDisplayName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    "Admin";

  const pageLabelMap: Record<string, string> = {
    dashboard: "Dashboard",
    users: "จัดการผู้ใช้ & KYC",
    jobs: "จัดการประกาศงาน",
    disputes: "ข้อพิพาท",
    payouts: "อนุมัติการถอนเงิน (Payouts)",
    settings: "ตั้งค่าระบบ",
  };
  const currentSegment = pathname.split("/").pop() || "dashboard";
  const currentPageTitle = pageLabelMap[currentSegment] || currentSegment;

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-[#f97316] font-bold text-xl border-2 border-[#f97316] px-2 py-1 rounded">
              SRC
            </span>
            <span className="ml-3 font-semibold tracking-wide">ADMIN PANEL</span>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2 mt-4">
            <p className="text-xs text-gray-500 font-semibold mb-2 px-2 uppercase">เมนูหลัก</p>

            <Link
              href="/admin/dashboard"
              className={isActive("/admin/dashboard") ? activeClass : inactiveClass}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="ml-3">Dashboard</span>
            </Link>

            <Link
              href="/admin/users"
              className={isActive("/admin/users") ? activeClass : inactiveClass}
            >
              <Users className="w-5 h-5" />
              <span className="ml-3 flex-1">จัดการผู้ใช้ & KYC</span>
              {quickStats.pendingKyc > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#f97316] text-white">
                  {quickStats.pendingKyc}
                </span>
              )}
            </Link>

            <Link
              href="/admin/jobs"
              className={isActive("/admin/jobs") ? activeClass : inactiveClass}
            >
              <Briefcase className="w-5 h-5" />
              <span className="ml-3">จัดการประกาศงาน</span>
            </Link>

            <Link
              href="/admin/disputes"
              className={isActive("/admin/disputes") ? activeClass : inactiveClass}
            >
              <Scale className="w-5 h-5" />
              <span className="ml-3 flex-1">ข้อพิพาท</span>
              {quickStats.openDisputes > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                  {quickStats.openDisputes}
                </span>
              )}
            </Link>

            <Link
              href="/account/payouts"
              className={isActive("/account/payouts") ? activeClass : inactiveClass}
            >
              <Wallet className="w-5 h-5" />
              <span className="ml-3 flex-1">อนุมัติการถอนเงิน</span>
              {quickStats.pendingPayouts > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-black">
                  {quickStats.pendingPayouts}
                </span>
              )}
            </Link>

            <Link
              href="/admin/settings"
              className={
                isActive("/admin/settings") || isActive("/account/settings")
                  ? activeClass
                  : inactiveClass
              }
            >
              <Settings className="w-5 h-5" />
              <span className="ml-3">ตั้งค่า</span>
            </Link>
          </nav>
        </div>

        {/* Admin Profile Bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center p-2 rounded-lg mb-2">
            <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center text-[#f97316] font-bold">
              {adminDisplayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminDisplayName}</p>
              <p className="text-xs text-gray-400 truncate">ผู้ดูแลระบบสูงสุด</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-[#f97316] transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-3">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-400 flex items-center">
            <span>Admin Panel</span>
            <span className="mx-2">{">"}</span>
            <span className="text-white font-medium">{currentPageTitle}</span>
          </div>

          <div className="flex items-center space-x-5">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาผู้ใช้ / งาน / ข้อพิพาท..."
                className="bg-[#171717] border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#f97316] w-60"
              />
            </form>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu((prev) => !prev);
                  setShowAdminMenu(false);
                }}
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#171717] transition cursor-pointer"
                title="การแจ้งเตือนแอดมิน"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-[#171717] border border-gray-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
                    <span className="font-bold text-white text-sm">รายการรอดำเนินการ (Admin)</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] font-semibold">
                      {totalAlerts} รายการ
                    </span>
                  </div>

                  <div className="divide-y divide-gray-800/80 max-h-72 overflow-y-auto">
                    <Link
                      href="/admin/users"
                      onClick={() => setShowNotifMenu(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-black/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#f97316] flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">คำขอยืนยันตัวตน (KYC)</p>
                          <p className="text-gray-400 text-[11px]">
                            รอแอดมินตรวจสอบและอนุมัติ
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#f97316]">
                        {quickStats.pendingKyc} รายการ
                      </span>
                    </Link>

                    <Link
                      href="/admin/disputes"
                      onClick={() => setShowNotifMenu(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-black/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">ข้อพิพาทที่รอตัดสิน</p>
                          <p className="text-gray-400 text-[11px]">
                            ตรวจสอบหลักฐานและตัดสินข้อพิพาท
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-rose-400">
                        {quickStats.openDisputes} รายการ
                      </span>
                    </Link>

                    <Link
                      href="/account/payouts"
                      onClick={() => setShowNotifMenu(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-black/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">คำขอถอนเงินฟรีแลนซ์</p>
                          <p className="text-gray-400 text-[11px]">
                            รอตรวจสอบและบันทึกผลโอนเงิน
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-400">
                        {quickStats.pendingPayouts} รายการ
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={adminMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowAdminMenu((prev) => !prev);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#171717] border border-transparent hover:border-gray-800 transition cursor-pointer"
              >
                <span className="text-sm font-medium text-white">Admin</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showAdminMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-[#171717] border border-gray-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-4 py-2.5 border-b border-gray-800">
                    <p className="font-bold text-white text-sm truncate">{adminDisplayName}</p>
                    <p className="text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  <Link
                    href="/admin/dashboard"
                    onClick={() => setShowAdminMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-black/50 hover:text-[#f97316] transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>หน้าแดชบอร์ดแอดมิน</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    onClick={() => setShowAdminMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-black/50 hover:text-[#f97316] transition"
                  >
                    <Users className="w-4 h-4" />
                    <span>จัดการผู้ใช้ & ตรวจ KYC</span>
                  </Link>

                  <Link
                    href="/account/payouts"
                    onClick={() => setShowAdminMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-black/50 hover:text-[#f97316] transition"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>อนุมัติการถอนเงิน (Payouts)</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setShowAdminMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-black/50 hover:text-[#f97316] transition"
                  >
                    <Settings className="w-4 h-4" />
                    <span>ตั้งค่าระบบ</span>
                  </Link>

                  <div className="border-t border-gray-800 my-1" />

                  <Link
                    href="/?preview=user"
                    onClick={() => setShowAdminMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-black/50 hover:text-white transition"
                  >
                    <ExternalLink className="w-4 h-4 text-[#f97316]" />
                    <span>ดูหน้าเว็บไซต์หลัก (มุมมองผู้ใช้)</span>
                  </Link>

                  <div className="border-t border-gray-800 my-1" />

                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
