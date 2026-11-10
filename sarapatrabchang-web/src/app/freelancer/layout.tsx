"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ฟังก์ชันเช็ค URL เพื่อเปลี่ยนสีเมนู (แถบสีส้ม)
  const isActive = (path: string) => pathname.startsWith(path);

  const activeClass = "flex items-center px-4 py-3 bg-[#171717] text-[#f97316] border-l-4 border-[#f97316] rounded-r-lg font-medium transition";
  const inactiveClass = "flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#171717] rounded-lg transition border-l-4 border-transparent";

  // ดึงชื่อ Path สุดท้ายมาทำเป็นชื่อหน้าบน Header
  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    switch(path) {
      case 'dashboard': return 'Dashboard';
      case 'services': return 'บริการของฉัน';
      case 'orders': return 'ออเดอร์ & งาน';
      case 'wallet': return 'การเงิน & รายได้';
      case 'profile': return 'โปรไฟล์ & KYC';
      default: return 'Freelancer Workspace';
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased flex h-screen overflow-hidden">
      
      {/* Sidebar ฟรีแลนซ์ */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <span className="text-[#f97316] font-bold text-xl border-2 border-[#f97316] px-2 py-1 rounded">
              SRC
            </span>
            <span className="ml-3 font-semibold tracking-wide">FREELANCER</span>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2 mt-4">
            <p className="text-xs text-gray-500 font-semibold mb-2 px-2 uppercase">เมนูหลัก</p>
            
            <Link href="/freelancer/dashboard" className={isActive("/freelancer/dashboard") ? activeClass : inactiveClass}>
              <i className="fa-solid fa-border-all w-6"></i> <span className="ml-3">Dashboard</span>
            </Link>
            
            <Link href="/freelancer/services" className={isActive("/freelancer/services") ? activeClass : inactiveClass}>
              <i className="fa-solid fa-store w-6"></i> <span className="ml-3">บริการของฉัน</span>
            </Link>
            
            <Link href="/freelancer/orders" className={isActive("/freelancer/orders") ? activeClass : inactiveClass}>
              <i className="fa-solid fa-list-check w-6"></i> <span className="ml-3">ออเดอร์ & งาน</span>
            </Link>
            
            <Link href="/freelancer/wallet" className={isActive("/freelancer/wallet") ? activeClass : inactiveClass}>
              <i className="fa-solid fa-wallet w-6"></i> <span className="ml-3">การเงิน & รายได้</span>
            </Link>
            
            <Link href="/freelancer/profile" className={isActive("/freelancer/profile") ? activeClass : inactiveClass}>
              <i className="fa-solid fa-id-card w-6"></i> <span className="ml-3">โปรไฟล์ & KYC</span>
            </Link>
            <Link href="/freelancer/settings" className={isActive("/freelancer/settings") ? activeClass : inactiveClass}>
                <i className="fa-solid fa-gear w-6"></i> <span className="ml-3">ตั้งค่าการใช้งาน</span>
            </Link>
          </nav>
        </div>

        {/* Profile Bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center p-2 hover:bg-[#171717] rounded-lg cursor-pointer mb-2">
            <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center text-[#f97316] font-bold">
              สม
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">สมหญิง รักงาน</p>
              <p className="text-xs text-green-400 flex items-center">
                <i className="fa-solid fa-circle-check text-[10px] mr-1"></i> ยืนยัน KYC แล้ว
              </p>
            </div>
          </div>
          <Link href="/" className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-[#f97316] transition">
            <i className="fa-solid fa-arrow-right-from-bracket w-6"></i> <span className="ml-3">ออกจากระบบ</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header ฟรีแลนซ์ */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-400 flex items-center">
            <span>หน้าแรก</span> 
            <span className="mx-2">{'>'}</span> 
            <span className="text-white">{getPageTitle()}</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <i className="fa-solid fa-search absolute left-3 top-2.5 text-gray-500"></i>
              <input 
                type="text" 
                placeholder="ค้นหาออเดอร์/งาน..." 
                className="bg-[#171717] border border-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#f97316] w-64"
              />
            </div>
            <button className="relative text-gray-400 hover:text-white">
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <div className="flex items-center cursor-pointer">
              <span className="text-sm font-medium mr-2">สมหญิง (Freelancer)</span>
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