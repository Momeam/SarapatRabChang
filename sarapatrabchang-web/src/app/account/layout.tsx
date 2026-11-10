"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);
  const activeClass = "flex items-center px-4 py-3 bg-[#171717] text-[#f97316] border-l-4 border-[#f97316] rounded-r-lg font-medium transition";
  const inactiveClass = "flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#171717] rounded-lg transition border-l-4 border-transparent";

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased flex h-screen overflow-hidden">
      
      {/* Sidebar ฝ่ายบัญชี */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-[#f97316] font-bold text-xl border-2 border-[#f97316] px-2 py-1 rounded">
              SRC
            </span>
            <span className="ml-3 font-semibold tracking-wide">ACCOUNT PANEL</span>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2 mt-4">
            <p className="text-xs text-gray-500 font-semibold mb-2 px-2 uppercase">เมนูหลัก</p>
            
            <Link 
              href="/account/payouts" 
              className={isActive("/account/payouts") ? activeClass : inactiveClass}
            >
              <i className="fa-solid fa-wallet w-6"></i> <span className="ml-3">การเงิน (Payouts)</span>
            </Link>
            
            {/* เมนูตั้งค่า (จำลองไว้เฉยๆ เผื่ออนาคต) */}
            <Link 
              href="/account/settings" 
              className={inactiveClass}
            >
              <i className="fa-solid fa-gear w-6"></i> <span className="ml-3">ตั้งค่า</span>
            </Link>
          </nav>
        </div>

        {/* Profile Bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center p-2 hover:bg-[#171717] rounded-lg cursor-pointer mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">บัญชี 01</p>
              <p className="text-xs text-gray-400">ฝ่ายบัญชีและการเงิน</p>
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
            <span>Account Panel</span> 
            <span className="mx-2">{'>'}</span> 
            <span className="text-white">การเงิน</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center cursor-pointer">
              <span className="text-sm font-medium mr-2">ACCOUNT</span>
              <i className="fa-solid fa-chevron-down text-xs text-gray-400"></i>
            </div>
          </div>
        </header>

        {children}

      </main>
    </div>
  );
}