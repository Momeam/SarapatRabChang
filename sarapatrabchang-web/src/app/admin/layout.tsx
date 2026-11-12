"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin-login");
    } else if (user.role !== "Admin") {
      router.replace("/");
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== "Admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...
      </main>
    );
  }

  // ฟังก์ชันเช็ค URL เพื่อเปลี่ยนสีเมนู (แถบสีส้ม) ให้ตรงกับหน้าปัจจุบัน
  const isActive = (path: string) => pathname.startsWith(path);

  const activeClass = "flex items-center px-4 py-3 bg-[#171717] text-[#f97316] border-l-4 border-[#f97316] rounded-r-lg font-medium transition";
  const inactiveClass = "flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#171717] rounded-lg transition border-l-4 border-transparent";

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
              <i className="fa-solid fa-border-all w-6"></i> <span className="ml-3">Dashboard</span>
            </Link>
            
            <Link 
              href="/admin/users" 
              className={isActive("/admin/users") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-users w-6"></i> <span className="ml-3">จัดการผู้ใช้ & KYC</span>
            </Link>
            
            <Link 
              href="/admin/jobs" 
              className={isActive("/admin/jobs") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-briefcase w-6"></i> <span className="ml-3">จัดการประกาศงาน</span>
            </Link>
            
            <Link 
              href="/admin/disputes" 
              className={isActive("/admin/disputes") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-scale-balanced w-6"></i> <span className="ml-3">ข้อพิพาท</span>
            </Link>
            
            <Link 
              href="/admin/settings" 
              className={isActive("/admin/settings") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-gear w-6"></i> <span className="ml-3">ตั้งค่า</span>
            </Link>
          </nav>
        </div>

        {/* Admin Profile Bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center p-2 hover:bg-[#171717] rounded-lg cursor-pointer mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin_01</p>
              <p className="text-xs text-gray-400">ผู้ดูแลระบบ</p>
            </div>
          </div>
          <Link href="/" className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-[#f97316] transition">
            <i className="fa-solid fa-arrow-right-from-bracket w-6"></i> <span className="ml-3">ออกจากระบบ</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-400 flex items-center">
            <span>Admin Panel</span> 
            <span className="mx-2">{'>'}</span> 
            {/* แสดงชื่อหน้าปัจจุบันอัตโนมัติบน Header */}
            <span className="text-white capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-2.5 text-gray-500"></i>
              <input 
                type="text" 
                placeholder="ค้นหาผู้ใช้/งาน/ข้อพิพาท" 
                className="bg-[#171717] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#f97316] w-64"
              />
            </div>
            <button className="relative text-gray-400 hover:text-white">
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
            </button>
            <div className="flex items-center cursor-pointer">
              <span className="text-sm font-medium mr-2">Admin</span>
              <i className="fa-solid fa-chevron-down text-xs text-gray-400"></i>
            </div>
          </div>
        </header>

        {/* เนื้อหาของแต่ละหน้า (Page Content) จะมาแสดงตรงนี้ */}
        {children}

      </main>
    </div>
  );
}