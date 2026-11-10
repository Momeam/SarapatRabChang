"use client";

import { useState } from "react";

// กำหนดโครงสร้างข้อมูลบริการ
interface Service {
  id: string;
  title: string;
  category: string;
  price: string;
  orders: number;
  rating: string;
  status: "ONLINE" | "PENDING" | "REJECTED";
  icon: string;
}

export default function FreelancerServicesPage() {
  
  // ข้อมูลประกาศบริการจำลอง (Mock Data)
  const [services, setServices] = useState<Service[]>([
    {
      id: "SRV-001",
      title: "รับเขียนเว็บ E-commerce ด้วย React แบบ Full-stack",
      category: "โปรแกรมมิ่ง",
      price: "15,000",
      orders: 12,
      rating: "4.9",
      status: "ONLINE",
      icon: "fa-code"
    },
    {
      id: "SRV-002",
      title: "รับทำเว็บไซต์บริษัท (Corporate Website) ด้วย WordPress",
      category: "โปรแกรมมิ่ง",
      price: "8,500",
      orders: 5,
      rating: "5.0",
      status: "ONLINE",
      icon: "fa-wordpress"
    },
    {
      id: "SRV-003",
      title: "รับออกแบบ UI/UX แอปพลิเคชันมือถือ ด้วย Figma",
      category: "กราฟิกดีไซน์",
      price: "5,000",
      orders: 0,
      rating: "-",
      status: "PENDING",
      icon: "fa-pen-nib"
    }
  ]);

  // State ควบคุมแท็บที่กำลังเลือก
  const [activeTab, setActiveTab] = useState<"ALL" | "ONLINE" | "PENDING" | "REJECTED">("ALL");

  // กรองข้อมูลตามแท็บ
  const filteredServices = services.filter(service => {
    if (activeTab === "ALL") return true;
    return service.status === activeTab;
  });

  // นับจำนวนเพื่อแสดงในแท็บ
  const countByStatus = (status: string) => services.filter(s => s.status === status).length;

  // จำลองการลบประกาศบริการ
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประกาศบริการ "${title}"?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      setServices(prev => prev.filter(service => service.id !== id));
      alert("ลบประกาศบริการเรียบร้อยแล้ว");
    }
  };

  // จำลองการแก้ไข
  const handleEdit = (id: string) => {
    alert(`ระบบจะพาไปยังหน้าแก้ไขประกาศบริการ ID: ${id}`);
  };

  // ฟังก์ชันแสดงป้ายกำกับสถานะ (Badge)
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ONLINE":
        return <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-medium"><i className="fa-solid fa-circle text-[8px] mr-1"></i> ออนไลน์</span>;
      case "PENDING":
        return <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-medium"><i className="fa-solid fa-clock text-[10px] mr-1"></i> รอตรวจสอบ</span>;
      case "REJECTED":
        return <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-medium"><i className="fa-solid fa-triangle-exclamation text-[10px] mr-1"></i> ถูกปฏิเสธ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] custom-scrollbar">
      
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">บริการของฉัน (My Services)</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการประกาศขายบริการ สร้างบริการใหม่ หรือแก้ไขแพ็กเกจราคา</p>
        </div>
        <button 
          onClick={() => alert("ระบบจะพาไปยังหน้าต่างสำหรับสร้างบริการใหม่")}
          className="mt-4 md:mt-0 bg-[#f97316] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center shadow-lg shadow-[#f97316]/20"
        >
          <i className="fa-solid fa-plus mr-2"></i> สร้างบริการใหม่
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex space-x-6 border-b border-gray-800 mb-6 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`font-medium pb-2 whitespace-nowrap transition ${activeTab === "ALL" ? "text-white border-b-2 border-[#f97316]" : "text-gray-500 hover:text-gray-300"}`}
        >
          ทั้งหมด ({services.length})
        </button>
        <button 
          onClick={() => setActiveTab("ONLINE")}
          className={`font-medium pb-2 whitespace-nowrap transition ${activeTab === "ONLINE" ? "text-white border-b-2 border-[#f97316]" : "text-gray-500 hover:text-gray-300"}`}
        >
          ออนไลน์อยู่ ({countByStatus("ONLINE")})
        </button>
        <button 
          onClick={() => setActiveTab("PENDING")}
          className={`font-medium pb-2 whitespace-nowrap transition ${activeTab === "PENDING" ? "text-white border-b-2 border-[#f97316]" : "text-gray-500 hover:text-gray-300"}`}
        >
          รอตรวจสอบ ({countByStatus("PENDING")})
        </button>
        <button 
          onClick={() => setActiveTab("REJECTED")}
          className={`font-medium pb-2 whitespace-nowrap transition ${activeTab === "REJECTED" ? "text-white border-b-2 border-[#f97316]" : "text-gray-500 hover:text-gray-300"}`}
        >
          ถูกปฏิเสธ ({countByStatus("REJECTED")})
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-xl">
            <i className="fa-solid fa-box-open text-4xl text-gray-600 mb-3"></i>
            <p className="text-gray-400">คุณยังไม่มีประกาศบริการในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service.id} className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition flex flex-col">
              
              {/* Cover Image Placeholder */}
              <div className="h-32 bg-gray-900 flex items-center justify-center border-b border-gray-800 relative">
                <i className={`fa-brands ${service.icon} text-4xl text-gray-700`}></i>
                {service.icon.includes('pen') && <i className={`fa-solid ${service.icon} text-4xl text-gray-700`}></i>}
                <div className="absolute top-2 right-2">
                  {renderStatusBadge(service.status)}
                </div>
              </div>
              
              {/* Service Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-[#f97316] font-medium mb-1">{service.category}</div>
                <h3 className="text-white font-medium text-sm mb-3 line-clamp-2 hover:text-[#f97316] cursor-pointer">
                  {service.title}
                </h3>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-3 pb-3 border-b border-gray-800">
                    <span className="flex items-center">
                      <i className="fa-solid fa-star text-yellow-500 mr-1"></i> {service.rating}
                    </span>
                    <span>{service.orders} ออเดอร์</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      เริ่มต้น <span className="text-base font-bold text-white block">฿ {service.price}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(service.id)}
                        className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition flex items-center justify-center" 
                        title="แก้ไข"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id, service.title)}
                        className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition flex items-center justify-center" 
                        title="ลบ"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}