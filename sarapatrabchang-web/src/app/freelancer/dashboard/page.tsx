"use client";

import Link from "next/link";

export default function FreelancerDashboardPage() {
  
  // ข้อมูลจำลองออเดอร์ของฟรีแลนซ์ (Mock Data)
  const recentOrders = [
    {
      id: "#ORD-9901",
      serviceName: "รับเขียนเว็บ E-commerce ด้วย React",
      clientName: "คุณมานะ อดทน",
      deadline: "12 พ.ย. 2026 (อีก 3 วัน)",
      price: "฿ 15,000",
      status: "กำลังทำ",
      statusClass: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
    },
    {
      id: "#ORD-9882",
      serviceName: "ออกแบบโลโก้แบรนด์เสื้อผ้า",
      clientName: "คุณเอกชัย สบาย",
      deadline: "10 พ.ย. 2026 (พรุ่งนี้)",
      price: "฿ 3,500",
      status: "ส่งงานร่างแล้ว",
      statusClass: "bg-blue-500/10 text-blue-400 border border-blue-500/30"
    },
    {
      id: "#ORD-9750",
      serviceName: "รับเขียนเว็บ E-commerce ด้วย React",
      clientName: "คุณสมชาย ใจดี",
      deadline: "05 พ.ย. 2026",
      price: "฿ 15,000",
      status: "สำเร็จแล้ว",
      statusClass: "bg-green-500/10 text-green-500 border border-green-500/30"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#171717] to-black border border-gray-800 rounded-xl p-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">ยินดีต้อนรับกลับมา, คุณสมหญิง! 👋</h1>
          <p className="text-gray-400 text-sm">นี่คือสรุปภาพรวมงานและการเงินของคุณในวันนี้</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link 
            href="/freelancer/services" 
            className="bg-[#f97316] hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-lg shadow-[#f97316]/20"
          >
            <i className="fa-solid fa-plus mr-2"></i> สร้างประกาศบริการใหม่
          </Link>
        </div>
      </div>

      {/* KYC Status Alert Banner */}
      <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-8 flex items-center justify-between text-sm">
        <div className="flex items-center">
          <i className="fa-solid fa-shield-check text-xl mr-3"></i>
          <span>บัญชีของคุณได้รับการยืนยันตัวตน (KYC) เรียบร้อยแล้ว สามารถรับงานและถอนเงินได้ตามปกติ</span>
        </div>
        <Link href="/freelancer/profile" className="text-xs border border-green-500/40 px-3 py-1 rounded hover:bg-green-500/20 transition">
          ดูเอกสาร
        </Link>
      </div>

      {/* Summary Cards (4 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: รายได้ถอนได้ */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">รายได้พร้อมถอน</p>
            <i className="fa-solid fa-wallet text-[#f97316]"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">฿ 14,250</h3>
          <p className="text-xs text-gray-500 mb-4">รายได้สะสมเดือนนี้ ฿ 28,500</p>
          <Link href="/freelancer/wallet" className="text-[#f97316] text-xs flex justify-between items-center hover:underline">
            ถอนเงินเข้าบัญชี <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {/* Card 2: งานที่กำลังทำ */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">งานที่กำลังทำอยู่</p>
            <i className="fa-solid fa-spinner text-yellow-500"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">3</h3>
          <p className="text-xs text-gray-500 mb-4">รอส่งมอบตามกำหนด</p>
          <Link href="/freelancer/orders" className="text-[#f97316] text-xs flex justify-between items-center hover:underline">
            ไปที่ห้องทำงาน (Workspace) <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {/* Card 3: ประกาศบริการที่เปิดขาย */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">บริการที่เปิดขายอยู่</p>
            <i className="fa-solid fa-store text-blue-400"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">2</h3>
          <p className="text-xs text-green-500 mb-4"><i className="fa-solid fa-check"></i> อนุมัติแล้วทั้งหมด</p>
          <Link href="/freelancer/services" className="text-[#f97316] text-xs flex justify-between items-center hover:underline">
            จัดการบริการ <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {/* Card 4: คะแนนรีวิว */}
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-5 hover:border-[#f97316] transition">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 text-sm">คะแนนรีวิวเฉลี่ย</p>
            <i className="fa-solid fa-star text-yellow-400"></i>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1 flex items-baseline">
            4.9 <span className="text-xs text-gray-400 font-normal ml-1">/ 5.0</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">จากทั้งหมด 18 รีวิว</p>
          <Link href="/freelancer/profile" className="text-[#f97316] text-xs flex justify-between items-center hover:underline">
            อ่านรีวิวจากลูกค้า <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      {/* Recent Active Orders */}
      <div className="bg-[#171717] border border-gray-800 rounded-xl mb-8 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/40">
          <h2 className="text-lg font-semibold text-white border-l-4 border-[#f97316] pl-2">งานที่ต้องดำเนินการล่าสุด (Recent Orders)</h2>
          <Link href="/freelancer/orders" className="text-gray-400 hover:text-[#f97316] text-sm">
            ดูงานทั้งหมด <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm bg-black/30">
                <th className="p-4 font-medium border-b border-gray-800">ออเดอร์ ID</th>
                <th className="p-4 font-medium border-b border-gray-800">ชื่องาน / บริการ</th>
                <th className="p-4 font-medium border-b border-gray-800">ลูกค้า</th>
                <th className="p-4 font-medium border-b border-gray-800">กำหนดส่ง</th>
                <th className="p-4 font-medium border-b border-gray-800">ราคางาน</th>
                <th className="p-4 font-medium border-b border-gray-800">สถานะ</th>
                <th className="p-4 font-medium border-b border-gray-800 text-right pr-6">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-[#1f1f1f] transition">
                  <td className="p-4 text-gray-400 font-mono">{order.id}</td>
                  <td className="p-4 font-medium text-white">{order.serviceName}</td>
                  <td className="p-4 text-gray-300">{order.clientName}</td>
                  <td className="p-4 text-gray-400">{order.deadline}</td>
                  <td className="p-4 font-semibold text-white">{order.price}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href="/freelancer/orders" 
                      className="px-3 py-1.5 text-xs bg-[#f97316]/10 border border-[#f97316] text-[#f97316] rounded-lg hover:bg-[#f97316] hover:text-white transition inline-flex items-center"
                    >
                      <i className="fa-regular fa-comments mr-1.5"></i> ห้องทำงาน
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}