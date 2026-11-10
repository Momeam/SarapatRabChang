"use client";

import { useState, useRef, useEffect } from "react";

// กำหนด Type ของข้อมูล
interface Order {
  id: string;
  clientName: string;
  serviceName: string;
  status: string;
  price: string;
  deadline: string;
}

interface ChatMessage {
  id: number;
  type: "system" | "system-action" | "client" | "freelancer";
  text: string;
  time: string;
  icon?: string;
  color?: string;
  attachment?: string;
}

export default function FreelancerOrdersPage() {
  
  // ข้อมูลจำลองออเดอร์
  const [orders] = useState<Order[]>([
    { id: "ORD-9901", clientName: "คุณมานะ อดทน", serviceName: "รับเขียนเว็บ E-commerce ด้วย React", status: "รอส่งมอบ", price: "15,000", deadline: "12 พ.ย. 2026" },
    { id: "ORD-9882", clientName: "คุณเอกชัย สบาย", serviceName: "ออกแบบโลโก้แบรนด์เสื้อผ้า", status: "แก้ไขงาน", price: "3,500", deadline: "10 พ.ย. 2026" }
  ]);

  // ข้อมูลจำลองแชทของแต่ละออเดอร์
  const mockChatHistory: Record<string, ChatMessage[]> = {
    "ORD-9901": [
      { id: 1, type: "system", text: "คุณได้รับออเดอร์ใหม่ #ORD-9901 จาก คุณมานะ อดทน", time: "10 พ.ย. 10:00 น." },
      { id: 2, type: "client", text: "สวัสดีครับผม อยากได้เว็บแนวขายเสื้อผ้าโทนสว่างๆ ครับ มีตัวอย่างแนบมาให้ดูครับ", time: "10 พ.ย. 10:05 น.", attachment: "brief_ref.pdf" },
      { id: 3, type: "freelancer", text: "สวัสดีค่ะคุณมานะ รับทราบค่ะ เดี๋ยวทางเราตรวจสอบบรีฟแล้วจะรีบแจ้งกลับนะคะ", time: "10 พ.ย. 10:15 น." },
      { id: 4, type: "system-action", text: "คุณได้ส่งใบเสนอราคา (Quotation) ยอด ฿ 15,000", time: "10 พ.ย. 11:30 น.", icon: "fa-file-invoice", color: "text-blue-400" },
      { id: 5, type: "system", text: "ลูกค้าชำระเงินและระบบได้เก็บเงินเข้า Escrow (คนกลาง) แล้ว เริ่มงานได้เลย!", time: "10 พ.ย. 12:00 น." },
      { id: 6, type: "freelancer", text: "อัปเดตความคืบหน้าค่ะ อันนี้เป็นงานร่าง UI (Draft 1) ลองตรวจสอบดูก่อนนะคะ", time: "11 พ.ย. 14:00 น.", attachment: "ui_draft_v1.png" }
    ],
    "ORD-9882": [
      { id: 1, type: "system", text: "คุณได้รับออเดอร์ใหม่ #ORD-9882 จาก คุณเอกชัย สบาย", time: "09 พ.ย. 14:00 น." },
      { id: 2, type: "client", text: "โลโก้ที่ส่งมาสวยครับ แต่อยากให้ปรับตัวอักษรให้ดูโมเดิร์นขึ้นอีกนิดครับ", time: "09 พ.ย. 16:30 น." }
    ]
  };

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  
  // ใช้สำหรับเลื่อนแชทลงมาล่างสุดอัตโนมัติ
  const chatEndRef = useRef<HTMLDivElement>(null);

  // เมื่อเลือกออเดอร์ใหม่ ให้ดึงแชทของออเดอร์นั้นมาแสดง
  useEffect(() => {
    if (selectedOrderId) {
      setChatMessages(mockChatHistory[selectedOrderId] || []);
    }
  }, [selectedOrderId]);

  // เลื่อนหน้าจอแชทลงด้านล่างเมื่อมีข้อความใหม่
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // ฟังก์ชันจำลองการส่งข้อความ
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedOrderId) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      type: "freelancer",
      text: inputText,
      time: "ตอนนี้"
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputText("");
  };

  // ฟังก์ชันจำลอง Action Buttons
  const issueQuotation = () => alert("เปิดหน้าต่างสำหรับ: ออกใบเสนอราคา (Quotation) ตามบรีฟลูกค้า");
  const updateStatus = () => alert("เปิดหน้าต่างสำหรับ: อัปเดตสถานะงาน / ส่งไฟล์งานร่าง");
  const deliverFinalWork = () => {
    if(window.confirm("คุณต้องการ 'ส่งมอบงานฉบับสมบูรณ์' ใช่หรือไม่? (เมื่อส่งแล้วรอให้ลูกค้ากดยอมรับงาน)")) {
      alert("ส่งมอบงานสำเร็จ! ระบบจะแจ้งเตือนให้ลูกค้าตรวจสอบและยอมรับงาน");
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* Left Panel: Order List (1/3 ความกว้าง) */}
      <div className="w-1/3 border-r border-gray-800 bg-[#171717] flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800 bg-black/40">
          <h2 className="text-lg font-bold text-white mb-2">ออเดอร์ล่าสุด</h2>
          <div className="flex space-x-2">
            <button className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium border border-gray-700">กำลังทำ ({orders.length})</button>
            <button className="bg-transparent text-gray-400 hover:text-white px-3 py-1 rounded-full text-xs font-medium border border-transparent">เสร็จสิ้น (5)</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {orders.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`p-4 border-b border-gray-800 transition cursor-pointer ${selectedOrderId === order.id ? 'bg-gray-800 border-l-4 border-[#f97316]' : 'bg-transparent border-l-4 border-transparent hover:bg-gray-800/50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-white text-sm">{order.clientName}</h3>
                <span className="text-[10px] text-gray-500">14:00</span>
              </div>
              <p className="text-xs text-gray-400 truncate mb-2">{order.serviceName}</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{order.id}</span>
                <span className="text-[10px] text-yellow-500"><i className="fa-solid fa-circle text-[8px] mr-1"></i>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Workspace & Chat (2/3 ความกว้าง) */}
      {selectedOrderId && selectedOrder ? (
        <div className="w-2/3 bg-[#0a0a0a] flex flex-col relative">
          
          {/* Workspace Header */}
          <div className="p-4 border-b border-gray-800 bg-[#171717] flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-white text-lg flex items-center">
                {selectedOrder.clientName}
                <span className="ml-3 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded text-xs font-normal">
                  {selectedOrder.status}
                </span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">{selectedOrder.serviceName} • ออเดอร์ {selectedOrder.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">฿ {selectedOrder.price}</p>
              <p className="text-xs text-gray-500 mt-1">กำหนดส่ง: {selectedOrder.deadline}</p>
            </div>
          </div>

          {/* Chat Timeline Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {chatMessages.map(msg => (
              <div key={msg.id}>
                {/* System Message */}
                {msg.type === "system" && (
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-700">
                      {msg.text} • {msg.time}
                    </span>
                  </div>
                )}
                
                {/* System Action (เช่น ส่งใบเสนอราคา) */}
                {msg.type === "system-action" && (
                  <div className="flex justify-center my-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center w-full max-w-sm">
                      <i className={`fa-solid ${msg.icon} text-2xl ${msg.color} mb-2`}></i>
                      <p className="text-sm text-gray-300">{msg.text}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  </div>
                )}

                {/* Client Message */}
                {msg.type === "client" && (
                  <div className="flex justify-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 mb-1 ml-1">ลูกค้า • {msg.time}</span>
                      <div className="bg-gray-800 text-gray-200 p-3 rounded-xl rounded-tl-sm max-w-md text-sm border border-gray-700 shadow-sm">
                        {msg.text}
                        {msg.attachment && (
                          <div className="mt-2 text-xs text-blue-400 border border-gray-700 bg-black p-2 rounded cursor-pointer hover:bg-gray-800">
                            <i className="fa-solid fa-paperclip mr-1"></i> {msg.attachment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Freelancer Message */}
                {msg.type === "freelancer" && (
                  <div className="flex justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-500 mb-1 mr-1">คุณ (Freelancer) • {msg.time}</span>
                      <div className="bg-[#f97316]/20 border border-[#f97316]/40 text-gray-200 p-3 rounded-xl rounded-tr-sm max-w-md text-sm shadow-sm">
                        {msg.text}
                        {msg.attachment && (
                          <div className="mt-2 text-xs text-[#f97316] border border-[#f97316]/30 bg-black p-2 rounded cursor-pointer hover:bg-gray-900">
                            <i className="fa-regular fa-image mr-1"></i> {msg.attachment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* จุดอ้างอิงสำหรับเลื่อนจอแชทลงล่างสุด */}
            <div ref={chatEndRef} />
          </div>

          {/* Action Bar & Chat Input */}
          <div className="p-4 border-t border-gray-800 bg-[#171717] shrink-0">
            
            {/* Quick Actions */}
            <div className="flex space-x-3 mb-3 pb-3 border-b border-gray-800 overflow-x-auto">
              <button onClick={issueQuotation} className="text-xs whitespace-nowrap bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition flex items-center border border-gray-700">
                <i className="fa-solid fa-file-invoice mr-1.5"></i> ออกใบเสนอราคา
              </button>
              <button onClick={updateStatus} className="text-xs whitespace-nowrap bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition flex items-center border border-gray-700">
                <i className="fa-solid fa-spinner mr-1.5"></i> อัปเดตสถานะงาน
              </button>
              <button onClick={deliverFinalWork} className="text-xs whitespace-nowrap bg-[#f97316] hover:bg-opacity-90 text-white px-3 py-1.5 rounded transition flex items-center ml-auto font-medium shadow-lg shadow-[#f97316]/20">
                <i className="fa-solid fa-box-open mr-1.5"></i> ส่งมอบงานฉบับสมบูรณ์
              </button>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center">
              <button type="button" className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition mr-2" title="แนบไฟล์">
                <i className="fa-solid fa-paperclip text-lg"></i>
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="พิมพ์ข้อความตอบกลับ หรืออัปเดตงาน..." 
                className="flex-1 bg-black border border-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:border-[#f97316] text-sm"
              />
              <button type="submit" className="bg-[#f97316] text-white w-10 h-10 rounded-full flex items-center justify-center ml-3 hover:bg-opacity-90 transition">
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Empty State (When no order selected) */
        <div className="w-2/3 bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-12">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
            <i className="fa-regular fa-comments text-4xl text-gray-600"></i>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">เลือกออเดอร์เพื่อเปิดห้องทำงาน</h3>
          <p className="text-sm text-gray-500 max-w-md">
            คลิกเลือกออเดอร์จากเมนูด้านซ้ายเพื่อเริ่มต้นพูดคุย ส่งงานร่าง ออกใบเสนอราคา และส่งมอบงานฉบับสมบูรณ์
          </p>
        </div>
      )}

    </div>
  );
}
