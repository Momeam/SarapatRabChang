"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import type { AccountProfile, ProfileUpdate } from "@/lib/profile";

interface InterestsCardProps {
  initial: string[];
  onSave: (updates: ProfileUpdate) => Promise<AccountProfile>;
}

export default function InterestsCard({ initial, onSave }: InterestsCardProps) {
  const [interests, setInterests] = useState(initial);
  const [newInterest, setNewInterest] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remove = (item: string) =>
    setInterests((current) => current.filter((interest) => interest !== item));

  const add = () => {
    const value = newInterest.trim();
    if (
      value &&
      value.length <= 50 &&
      !interests.some((interest) => interest.toLocaleLowerCase() === value.toLocaleLowerCase())
    ) {
      setInterests((current) => [...current, value]);
      setNewInterest("");
      setShowAdd(false);
      setError("");
    } else if (value.length > 50) {
      setError("ประเภทงานต้องไม่เกิน 50 ตัวอักษร");
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const saved = await onSave({ interests });
      setInterests(saved.interests);
      setShowAdd(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกประเภทงานไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">ประเภทงานที่สนใจ / ความเชี่ยวชาญ</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            เลือกประเภทงานเพื่อให้เราช่วยแนะนำบริการที่เหมาะกับคุณ
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {interests.length === 0 && (
            <p className="text-xs text-zinc-400">ยังไม่ได้เลือกประเภทงาน</p>
          )}
          {interests.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
            >
              <span>{item}</span>
              {showAdd && (
                <button
                  type="button"
                  aria-label={`ลบ ${item}`}
                  onClick={() => remove(item)}
                  className="text-zinc-400 hover:text-zinc-700 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {showAdd && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="พิมพ์ชื่อประเภทงาน"
              maxLength={50}
              className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={add}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"
            >
              เพิ่ม
            </button>
          </div>
        )}
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="pt-3 border-t border-zinc-100 space-y-2">
        <button
          type="button"
          onClick={() => {
            if (showAdd) {
              setInterests(initial);
              setNewInterest("");
              setError("");
              setShowAdd(false);
            } else {
              setShowAdd(true);
            }
          }}
          className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl border border-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAdd ? "ยกเลิกการแก้ไข" : "เพิ่ม/แก้ไขประเภทงาน"}</span>
        </button>
        {showAdd && (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกประเภทงาน"}</span>
          </button>
        )}
        <p className="text-[10px] text-zinc-400 leading-tight">
          ความสนใจใช้เพื่อแนะนำบริการให้คุณเท่านั้น ไม่แสดงบนโปรไฟล์สาธารณะ
        </p>
      </div>
    </div>
  );
}

