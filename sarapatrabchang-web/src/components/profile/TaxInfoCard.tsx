"use client";

import { useState, type FormEvent } from "react";
import { Edit3 } from "lucide-react";
import type { AccountProfile, ProfileUpdate } from "@/lib/profile";

interface TaxInfoCardProps {
  displayName: string;
  email: string;
  taxId: string;
  taxAddress: string;
  taxEmail: string;
  onSave: (updates: ProfileUpdate) => Promise<AccountProfile>;
}

export default function TaxInfoCard({
  displayName,
  email,
  taxId,
  taxAddress,
  taxEmail,
  onSave,
}: TaxInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [taxIdText, setTaxIdText] = useState(taxId);
  const [taxAddressText, setTaxAddressText] = useState(taxAddress);
  const [taxEmailText, setTaxEmailText] = useState(taxEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        taxId: taxIdText,
        taxAddress: taxAddressText,
        taxEmail: taxEmailText,
      });
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกข้อมูลภาษีไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">ข้อมูลใบกำกับภาษีเริ่มต้น</h3>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> แก้ไขข้อมูลภาษี
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500">เลขประจำตัวผู้เสียภาษี</span>
              <input
                type="text"
                maxLength={50}
                value={taxIdText}
                onChange={(event) => setTaxIdText(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white p-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500">ที่อยู่ใบกำกับภาษี</span>
              <textarea
                rows={2}
                maxLength={500}
                value={taxAddressText}
                onChange={(event) => setTaxAddressText(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white p-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500">อีเมลรับเอกสาร</span>
              <input
                type="email"
                maxLength={320}
                value={taxEmailText}
                onChange={(event) => setTaxEmailText(event.target.value)}
                placeholder={email}
                className="w-full rounded-lg border border-zinc-200 bg-white p-2"
              />
            </label>
            {error && <p role="alert" className="text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTaxIdText(taxId);
                  setTaxAddressText(taxAddress);
                  setTaxEmailText(taxEmail);
                  setError("");
                  setEditing(false);
                }}
                disabled={saving}
                className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-500 px-3 py-1.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block">ประเภทและชื่อ</span>
              <span className="font-bold text-zinc-900">บุคคลธรรมดา • {displayName}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">เลขประจำตัวผู้เสียภาษี</span>
              <span className="font-mono text-zinc-700">{taxId || "ยังไม่ได้ระบุ"}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">ที่อยู่ใบกำกับภาษี</span>
              <span className="text-zinc-600 leading-tight block whitespace-pre-wrap">
                {taxAddress || "ยังไม่ได้ระบุ"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">อีเมลรับเอกสาร</span>
              <span className="text-zinc-700 font-medium">{taxEmail || email}</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-100 pt-3">
        ข้อมูลใบกำกับภาษีจะใช้งานได้เมื่อเพิ่มและยืนยันข้อมูลจริง
      </p>
    </div>
  );
}

