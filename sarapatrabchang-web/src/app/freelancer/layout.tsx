"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [kycStatus, setKycStatus] = useState<string>("unverified");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    let active = true;
    Promise.all([
      requestApi<{ status: string } | null>("/api/kyc").catch(() => null),
      requestApi<{ read: boolean }[]>("/api/notifications").catch(() => []),
    ]).then(([kyc, notifs]) => {
      if (!active) return;
      setKycStatus(kyc?.status?.toLowerCase() ?? "unverified");
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => {
      active = false;
    };
  }, [loading, router, user]);

  const isActive = (path: string) => pathname.startsWith(path);

  const activeClass =
    "flex items-center px-4 py-3 bg-[#171717] text-[#f97316] border-l-4 border-[#f97316] rounded-r-lg font-medium transition";
  const inactiveClass =
    "flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#171717] rounded-lg transition border-l-4 border-transparent";

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    switch (path) {
      case "dashboard":
        return "Dashboard";
      case "services":
        return "บริการของฉัน";
      case "orders":
        return "ออเดอร์ & งาน";
      case "wallet":
        return "การเงิน & รายได้";
      case "profile":
        return "โปรไฟล์ & KYC";
      case "settings":
        return "ตั้งค่าการใช้งาน";
      default:
        return "Freelancer Workspace";
    }
  };

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user?.email ?? "ผู้ใช้งาน";

  const isApproved = kycStatus === "approved" || kycStatus === "verified";

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth");
    } catch {
      router.push("/");
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased flex h-screen overflow-hidden">
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-[#f97316] font-bold text-xl border-2 border-[#f97316] px-2 py-1 rounded">
              SRC
            </span>
            <span className="ml-3 font-semibold tracking-wide">FREELANCER</span>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            <p className="text-xs text-gray-500 font-semibold mb-2 px-2 uppercase">เมนูหลัก</p>

            <Link
              href="/freelancer/dashboard"
              className={isActive("/freelancer/dashboard") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-border-all w-6"></i> <span className="ml-3">Dashboard</span>
            </Link>

            <Link
              href="/freelancer/services"
              className={isActive("/freelancer/services") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-store w-6"></i> <span className="ml-3">บริการของฉัน</span>
            </Link>

            <Link
              href="/freelancer/orders"
              className={isActive("/freelancer/orders") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-list-check w-6"></i> <span className="ml-3">ออเดอร์ & งาน</span>
            </Link>

            <Link
              href="/freelancer/wallet"
              className={isActive("/freelancer/wallet") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-wallet w-6"></i> <span className="ml-3">การเงิน & รายได้</span>
            </Link>

            <Link
              href="/freelancer/profile"
              className={isActive("/freelancer/profile") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-id-card w-6"></i> <span className="ml-3">โปรไฟล์ & KYC</span>
            </Link>

            <Link
              href="/freelancer/settings"
              className={isActive("/freelancer/settings") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-gear w-6"></i> <span className="ml-3">ตั้งค่าการใช้งาน</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/freelancer/profile"
            className="flex items-center p-2 hover:bg-[#171717] rounded-lg cursor-pointer mb-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center text-[#f97316] font-bold shrink-0">
              {displayName.slice(0, 1)}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p
                className={`text-xs flex items-center ${
                  isApproved
                    ? "text-green-400"
                    : kycStatus === "pending"
                      ? "text-amber-400"
                      : "text-gray-400"
                }`}
              >
                <i className="fa-solid fa-circle-check text-[10px] mr-1"></i>
                {isApproved
                  ? "ยืนยัน KYC แล้ว"
                  : kycStatus === "pending"
                    ? "รอแอดมินตรวจ KYC"
                    : "ยังไม่ยืนยัน KYC"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-[#f97316] transition text-left"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-6"></i>{" "}
            <span className="ml-3">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-400 flex items-center">
            <Link href="/" className="hover:text-white">
              หน้าแรก
            </Link>
            <span className="mx-2">{">"}</span>
            <span className="text-white">{getPageTitle()}</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/freelancer/orders" className="relative text-gray-400 hover:text-white">
              <i className="fa-regular fa-bell text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
              <span className="text-sm font-medium mr-2">{displayName}</span>
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
