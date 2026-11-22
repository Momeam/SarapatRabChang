"use client";

import { useState } from "react";
import { X, HelpCircle, FileText, Shield } from "lucide-react";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<"help" | "terms" | "privacy" | null>(null);

  return (
    <footer className="mt-auto bg-white border-t border-zinc-200 py-6 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>© 2569 </span>
          <span className="font-semibold text-zinc-800">sarapatrabchang</span>
          <span> • บริการใกล้บ้าน อุ่นใจทุกงาน</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveModal("help")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            ศูนย์ช่วยเหลือ
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("terms")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            ข้อกำหนดการใช้งาน
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("privacy")}
            className="hover:text-orange-600 transition-colors cursor-pointer"
          >
            นโยบายความเป็นส่วนตัว
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                {activeModal === "help" && <HelpCircle className="w-5 h-5 text-orange-500" />}
                {activeModal === "terms" && <FileText className="w-5 h-5 text-orange-500" />}
                {activeModal === "privacy" && <Shield className="w-5 h-5 text-orange-500" />}
                <h3 className="font-bold text-base text-zinc-900">
                  {activeModal === "help" && "ศูนย์ช่วยเหลือ sarapatrabchang"}
                  {activeModal === "terms" && "ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม"}
                  {activeModal === "privacy" && "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูล"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed">
              {activeModal === "help" && (
                <>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">1. วิธีการค้นหาและจองบริการ</h4>
                    <p>
                      คุณสามารถเลือกหมวดหมู่บริการ (แม่บ้าน, ช่างไฟ/ประปา, ขนย้าย ฯลฯ) ระบุสถานที่และวันที่ต้องการใช้บริการ
                      จากนั้นตรวจสอบรายละเอียดแพ็กเกจและปักหมุดสถานที่บนแผนที่เพื่อให้ผู้รับจ้างเดินทางไปถึงได้อย่างแม่นยำ
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">2. การตรวจสอบและยืนยันตัวตนผู้รับจ้าง (KYC)</h4>
                    <p>
                      ฟรีแลนซ์ทุกคนบนแพลตฟอร์มต้องผ่านการตรวจสอบบัตรประชาชน บัญชีธนาคาร และได้รับการอนุมัติจากแอดมินก่อนจึงจะสามารถลงประกาศรับงานได้
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">3. การตรวจรับงานและข้อพิพาท</h4>
                    <p>
                      เมื่อผู้รับจ้างทำงานเสร็จ จะแนบภาพหลักฐานการส่งมอบงานในระบบ ผู้ว่าจ้างสามารถตรวจสอบความเรียบร้อยก่อนกดยืนยันตรวจรับงาน
                      หากงานไม่ตรงตามข้อตกลง สามารถกดขอแก้ไขงาน หรือเปิดข้อพิพาทเพื่อให้แอดมินกลางเข้ามาช่วยดูแลได้
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">4. ช่องทางการติดต่อทีมงาน</h4>
                    <p>
                      อีเมล: <span className="font-mono font-medium text-orange-600">support@sarapatrabchang.local</span><br />
                      เวลาทำการ: วันจันทร์ - ศุกร์ เวลา 09:00 - 18:00 น.
                    </p>
                  </section>
                </>
              )}

              {activeModal === "terms" && (
                <>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">1. บทนำและบทบาทของแพลตฟอร์ม</h4>
                    <p>
                      sarapatrabchang เป็นสื่อกลางในการจับคู่และอำนวยความสะดวกในการติดต่อประสานงานระหว่างผู้ว่าจ้างและผู้รับจ้างอิสระ (ฟรีแลนซ์)
                      โดยผู้ใช้บริการทุกท่านต้องยอมรับข้อตกลงและเงื่อนไขการใช้งานเหล่านี้
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">2. ข้อตกลงสำหรับผู้ว่าจ้าง</h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-600">
                      <li>กรอกข้อมูลที่อยู่ นัดหมาย และเบอร์โทรศัพท์ที่ติดต่อได้จริง</li>
                      <li>ให้ความร่วมมือและปฏิบัติต่อผู้รับจ้างด้วยความสุภาพและเคารพซึ่งกันและกัน</li>
                      <li>ตรวจสอบงานตามความเป็นจริงและดำเนินการตรวจรับงานภายในระยะเวลาที่กำหนด</li>
                    </ul>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">3. ข้อตกลงสำหรับผู้รับจ้าง (ฟรีแลนซ์)</h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-600">
                      <li>ต้องยื่นเอกสารแสดงตน (บัตรประชาชนและสมุดบัญชี) ที่ถูกต้องตามกฎหมายผ่านระบบ KYC</li>
                      <li>เข้าปฏิบัติงานตรงตามวัน เวลา และสถานที่ที่ได้ตกลงไว้</li>
                      <li>ส่งมอบหลักฐานภาพถ่ายการปฏิบัติงานจริงในระบบเพื่อประกอบการตรวจรับงาน</li>
                    </ul>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">4. การยกเลิกและข้อพิพาท</h4>
                    <p>
                      ในกรณีที่เกิดข้อพิพาทระหว่างคู่สัญญา แอดมินแพลตฟอร์มมีอำนาจในการตรวจสอบหลักฐานการสนทนา ภาพถ่าย และคำให้การของทั้งสองฝ่ายเพื่อทำการตัดสินชี้ขาดตามความเหมาะสม
                    </p>
                  </section>
                </>
              )}

              {activeModal === "privacy" && (
                <>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">1. ข้อมูลที่เราเก็บรวบรวม</h4>
                    <p>
                      เราจัดเก็บข้อมูลที่จำเป็นต่อการให้บริการ ได้แก่ ข้อมูลบัญชีผู้ใช้ (ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์),
                      ข้อมูลสถานที่นัดหมาย, ประวัติการจองและการสนทนา รวมถึงเอกสารยืนยันตัวตน (KYC) สำหรับผู้สมัครเป็นฟรีแลนซ์
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">2. วัตถุประสงค์ในการใช้ข้อมูล</h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-600">
                      <li>เพื่ออำนวยความสะดวกในการจับคู่งานและการสื่อสารระหว่างผู้ว่าจ้างกับช่าง</li>
                      <li>เพื่อยืนยันความปลอดภัยและความน่าเชื่อถือของผู้รับจ้างในระบบ</li>
                      <li>เพื่อการพัฒนาและปรับปรุงคุณภาพการให้บริการของแพลตฟอร์ม</li>
                    </ul>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">3. การคุ้มครองและการเปิดเผยข้อมูล</h4>
                    <p>
                      ข้อมูลเอกสารบัตรประชาชนและบัญชีธนาคารจะถูกเก็บเป็นความลับและเข้าถึงได้เฉพาะแอดมินที่มีสิทธิ์ในการตรวจสอบเท่านั้น
                      เราไม่มีนโยบายจำหน่ายหรือเปิดเผยข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอกที่ไม่เกี่ยวข้อง
                    </p>
                  </section>
                </>
              )}
            </div>

            {/* Footer action */}
            <div className="p-4 border-t border-zinc-100 flex justify-end bg-zinc-50/30">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

