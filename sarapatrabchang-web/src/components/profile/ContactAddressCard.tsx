"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, Lock, Plus, Check, Edit3 } from "lucide-react";
import type { AccountProfile, ProfileUpdate } from "@/lib/profile";

interface ContactAddressCardProps {
  email: string;
  phone: string;
  address: string;
  onSave: (updates: ProfileUpdate) => Promise<AccountProfile>;
}

export default function ContactAddressCard({
  email,
  phone,
  address,
  onSave,
}: ContactAddressCardProps) {
  const [phoneText, setPhoneText] = useState(phone);
  const [addressText, setAddressText] = useState(address);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");

  const savePhone = async (event: FormEvent) => {
    event.preventDefault();
    setSavingPhone(true);
    setPhoneError("");
    try {
      await onSave({ phone: phoneText });
      setEditingPhone(false);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "บันทึกเบอร์โทรศัพท์ไม่สำเร็จ");
    } finally {
      setSavingPhone(false);
    }
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    setSavingAddress(true);
    setAddressError("");
    try {
      await onSave({ address: addressText });
      setEditingAddress(false);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "บันทึกที่อยู่ไม่สำเร็จ");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">ข้อมูลติดต่อและที่อยู่</h3>
            <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> เฉพาะเจ้าของบัญชี
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">ข้อมูลส่วนนี้ไม่แสดงต่อสาธารณะ</p>
        </div>

        {/* Email & Phone */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block">อีเมลที่เชื่อมโยง</span>
                <span className="font-medium text-zinc-900">{email}</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400">ไม่สามารถแก้ไขอีเมลจากหน้านี้</span>
          </div>

          <form onSubmit={savePhone} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 block">เบอร์โทรศัพท์</span>
                  {editingPhone ? (
                    <input
                      type="tel"
                      maxLength={30}
                      value={phoneText}
                      onChange={(event) => setPhoneText(event.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs"
                      aria-label="เบอร์โทรศัพท์"
                    />
                  ) : (
                    <span className="font-medium text-zinc-900">{phone || "ยังไม่ได้ระบุ"}</span>
                  )}
                </div>
              </div>
              {editingPhone ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneText(phone);
                      setPhoneError("");
                      setEditingPhone(false);
                    }}
                    disabled={savingPhone}
                    className="text-[11px] text-zinc-500 hover:underline disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={savingPhone}
                    className="text-[11px] text-orange-600 hover:underline disabled:opacity-50"
                  >
                    {savingPhone ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingPhone(true)}
                  className="text-[11px] text-orange-600 hover:underline"
                >
                  แก้ไข
                </button>
              )}
            </div>
            {phoneError && <p role="alert" className="text-[11px] text-red-600 mt-1">{phoneError}</p>}
          </form>
        </div>

        {/* Saved addresses */}
        <form onSubmit={saveAddress} className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700">ที่อยู่ที่บันทึกไว้</span>
            {!editingAddress && (
              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="text-xs text-orange-600 font-semibold flex items-center gap-1"
              >
                {address ? <Edit3 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {address ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"}
              </button>
            )}
          </div>
          {editingAddress ? (
            <>
              <textarea
                rows={3}
                maxLength={500}
                value={addressText}
                onChange={(event) => setAddressText(event.target.value)}
                placeholder="กรอกที่อยู่ที่ต้องการบันทึก"
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                aria-label="ที่อยู่ที่บันทึกไว้"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddressText(address);
                    setAddressError("");
                    setEditingAddress(false);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  {savingAddress ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
                </button>
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-600 whitespace-pre-wrap">
              {address || "ยังไม่มีที่อยู่ที่บันทึกไว้"}
            </p>
          )}
          {addressError && <p role="alert" className="text-[11px] text-red-600">{addressError}</p>}
        </form>
      </div>
    </div>
  );
}

