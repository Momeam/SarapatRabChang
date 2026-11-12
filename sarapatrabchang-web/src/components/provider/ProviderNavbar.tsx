"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ArrowLeftRight, User, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export default function ProviderNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "คุณพิมพ์ชนก ใจดี";

  const navLinks = [
    { label: "แดชบอร์ด", href: "/provider/dashboard" },
    { label: "จัดการประกาศบริการ", href: "/provider/services/new" },
    { label: "รายการงาน", href: "/provider/dashboard#orders" },
    { label: "การเงิน/ถอนเงิน", href: "/provider/jobs/ORD-0269-041?tab=finance" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Provider Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/provider/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
                  sarapat<span className="text-orange-500">rabchang</span>
                </span>
                <span className="text-[10px] text-orange-600 font-semibold -mt-1 hidden sm:block">
                  โหมดผู้รับจ้าง (Provider)
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href.includes("?") && pathname === link.href.split("?")[0]);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`transition-colors hover:text-orange-600 ${
                      isActive ? "text-orange-600 font-bold" : "text-zinc-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: Switch to Client mode + Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">สลับกลับเป็นโหมดผู้จ้าง</span>
              <span className="sm:hidden">โหมดผู้จ้าง</span>
            </Link>

            {/* Profile pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-orange-100">
                {displayName.slice(0, 1)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-900 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">ยืนยัน KYC แล้ว</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

