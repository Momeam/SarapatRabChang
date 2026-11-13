"use client";

import { Camera, Edit3, Star, Globe } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import type { AccountProfile, ProfileUpdate } from "@/lib/profile";

interface ProfileHeaderProps {
  fullName: string;
  avatarUrl: string;
  bio: string;
  displayName: string;
  memberSince: string;
  rating: number;
  reviewCount: number;
  isProvider: boolean;
  onSave: (updates: ProfileUpdate) => Promise<AccountProfile>;
}

export default function ProfileHeader({
  fullName,
  avatarUrl,
  bio,
  displayName,
  memberSince,
  rating,
  reviewCount,
  isProvider,
  onSave,
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameText, setNameText] = useState(fullName);
  const [avatarText, setAvatarText] = useState(avatarUrl);
  const [bioText, setBioText] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        fullName: nameText,
        avatarUrl: avatarText,
        bio: bioText,
      });
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกโปรไฟล์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Avatar + name row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 bg-cover bg-center text-white flex items-center justify-center text-3xl font-bold ring-4 ring-orange-100"
              style={
                avatarUrl
                  ? { backgroundImage: `url("${avatarUrl}")` }
                  : undefined
              }
            >
              {!avatarUrl && displayName.slice(0, 1)}
            </div>
            <button
              type="button"
              title="เปลี่ยนรูปโปรไฟล์"
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">{displayName}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Globe className="w-3 h-3" />
                โปรไฟล์สาธารณะ
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-zinc-600">
              {isProvider ? "ผู้ให้บริการ / ผู้รับจ้าง" : "ผู้ใช้งานทั่วไป / ผู้ว่าจ้าง"}
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
              <span>สมาชิกตั้งแต่ {memberSince}</span>
              <span>•</span>
              <div className="flex items-center gap-1 font-semibold text-zinc-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating.toFixed(1)} จาก 5</span>
                <span className="text-zinc-400 font-normal">({reviewCount} รีวิวจากงานจริง)</span>
              </div>
            </div>
          </div>
        </div>

        {!isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>แก้ไขข้อมูลส่วนตัว</span>
        </button>
        )}
      </div>

      {/* Bio section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            แนะนำตัว / เกี่ยวกับฉัน
          </h3>
          <span className="text-[11px] text-zinc-400">ข้อความนี้จะแสดงบนโปรไฟล์สาธารณะ</span>
        </div>

        {isEditing ? (
          <form onSubmit={save} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-zinc-700">ชื่อที่แสดง</span>
              <input
                type="text"
                required
                maxLength={120}
                value={nameText}
                onChange={(event) => setNameText(event.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-zinc-700">ลิงก์รูปโปรไฟล์ (HTTPS)</span>
              <input
                type="url"
                maxLength={2048}
                value={avatarText}
                onChange={(event) => setAvatarText(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-zinc-700">แนะนำตัว / เกี่ยวกับฉัน</span>
              <textarea
                rows={3}
                maxLength={300}
                value={bioText}
                onChange={(event) => setBioText(event.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <span className="block text-right text-[11px] text-zinc-400">
                {bioText.length}/300 ตัวอักษร
              </span>
            </label>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNameText(fullName);
                  setAvatarText(avatarUrl);
                  setBioText(bio);
                  setError("");
                  setIsEditing(false);
                }}
                disabled={saving}
                className="px-3 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            {bio || "ยังไม่ได้เพิ่มคำแนะนำตัว"}
          </p>
        )}
        {!isEditing && <p className="text-[11px] text-zinc-400">กดแก้ไขข้อมูลส่วนตัวเพื่อปรับชื่อ รูปโปรไฟล์ หรือคำแนะนำตัว</p>}
      </div>

      {/* Privacy banner */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-600 space-y-1">
        <span className="font-bold text-zinc-900 block">ใครเห็นข้อมูลอะไรบ้าง?</span>
        <p className="text-zinc-500">
          <strong className="text-zinc-700">สาธารณะ:</strong> รูป, ชื่อ, ประเภทผู้ใช้,
          คำแนะนำตัว และความคิดเห็น/รีวิว
        </p>
        <p className="text-zinc-500">
          <strong className="text-zinc-700">เฉพาะคุณ:</strong> ความสนใจ, อีเมล, เบอร์โทร,
          ที่อยู่ และข้อมูลใบกำกับภาษี
        </p>
      </div>
    </div>
  );
}

