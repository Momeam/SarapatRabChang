"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";

interface ServiceFormPricingProps {
  packageName: string;
  setPackageName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
}

export default function ServiceFormPricing({
  packageName,
  setPackageName,
  price,
  setPrice,
  duration,
  setDuration,
}: ServiceFormPricingProps) {
  const [tasks, setTasks] = useState<string[]>([
    "กวาด ดูดฝุ่น และถูพื้น",
    "เช็ดฝุ่นเฟอร์นิเจอร์และพื้นผิวทั่วไป",
    "ทำความสะอาดห้องน้ำ 1 ห้อง",
    "ทำความสะอาดครัวและทิ้งขยะ",
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addTask = () => {
    if (newTaskInput.trim()) {
      setTasks([...tasks, newTaskInput.trim()]);
      setNewTaskInput("");
      setShowInput(false);
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-zinc-950">2. กำหนดราคาและรายละเอียดแพ็กเกจ</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            ชื่อแพ็กเกจ
          </label>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="เช่น คอนโดขนาดเล็ก"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-[11px] text-zinc-400 mt-1">เช่น แพ็กเกจพื้นฐาน หรือบริการสำหรับห้องไม่เกิน 40 ตร.ม.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              ราคาเริ่มต้น ฿
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="650"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              ระยะเวลาให้บริการ
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="เช่น 3 ชั่วโมง"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* รายการงานที่รวมในแพ็กเกจ */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-zinc-800">
            รายการงานที่รวมในแพ็กเกจ
          </label>
          <div className="space-y-2">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-950 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-zinc-800 font-medium">{task}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(idx)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {showInput ? (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="ระบุรายการงานเพิ่มเติม"
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addTask}
                className="px-3.5 py-1.5 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-orange-600 transition-colors"
              >
                เพิ่ม
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-500" />
              <span>เพิ่มรายการงาน</span>
            </button>
          )}

          <p className="text-[11px] text-zinc-400 pt-1">สำหรับพื้นที่ไม่เกิน 40 ตร.ม. • ผู้ให้บริการ 1 คน</p>
        </div>
      </div>
    </div>
  );
}

