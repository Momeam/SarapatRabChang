"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { mockProfileReviews } from "@/data/mockData";
import {
  Camera,
  Edit3,
  Star,
  MapPin,
  Mail,
  Phone,
  Plus,
  FileText,
  Lock,
  Globe,
  MessageSquare,
  CornerDownRight,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const [reviews, setReviews] = useState(mockProfileReviews);
  const [commentText, setCommentText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "jobs">("all");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(
    "ชอบดูแลบ้านและสวนให้เป็นพื้นที่พักผ่อน มองหาผู้ให้บริการที่ใส่ใจรายละเอียด ตรงต่อเวลา และพูดคุยเรื่องงานได้ชัดเจนค่ะ"
  );

  const [interests, setInterests] = useState(["แม่บ้าน", "ช่างไฟ", "จัดสวน"]);
  const [newInterest, setNewInterest] = useState("");
  const [showAddInterest, setShowAddInterest] = useState(false);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      authorName: "ผู้ใช้งาน sarapatrabchang",
      authorRole: "ผู้ใช้งานทั่วไป",
      rating: 5.0,
      date: "วันนี้",
      content: commentText,
    };

    setReviews([newRev, ...reviews]);
    setCommentText("");
  };

  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
      setShowAddInterest(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">
            หน้าหลัก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">บัญชีของฉัน</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">
            โปรไฟล์และข้อมูลส่วนตัว
          </span>
        </div>

        {/* Header with Account View Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              โปรไฟล์และข้อมูลส่วนตัว
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              จัดการโปรไฟล์ ข้อมูลสำหรับใช้บริการ และความคิดเห็นจากผู้ร่วมงาน
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white shadow-xs w-fit">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span>มุมมองเจ้าของบัญชี</span>
          </span>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-orange-100">
                  พ
                </div>
                <button
                  type="button"
                  title="เปลี่ยนรูปโปรไฟล์"
                  className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    พิมพ์ชนก ใจดี
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Globe className="w-3 h-3" />
                    โปรไฟล์สาธารณะ
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-600">
                  ผู้ใช้งานทั่วไป / ผู้ว่าจ้าง
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                  <span>สมาชิกตั้งแต่ มกราคม 2569 • กรุงเทพฯ</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 font-semibold text-zinc-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>4.7 จาก 5</span>
                    <span className="text-zinc-400 font-normal">
                      (3 รีวิวจากผู้ร่วมงาน)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="px-4 py-2 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingBio ? "ปิดการแก้ไข" : "แก้ไขข้อมูลส่วนตัว"}</span>
            </button>
          </div>

          {/* About Me Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                แนะนำตัว / เกี่ยวกับฉัน
              </h3>
              <span className="text-[11px] text-zinc-400">
                ข้อความนี้จะแสดงบนโปรไฟล์สาธารณะ
              </span>
            </div>

            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  maxLength={300}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">{bioText.length}/300 ตัวอักษร</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"
                  >
                    บันทึกข้อความ
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                {bioText}
              </p>
            )}
            <p className="text-[11px] text-zinc-400">
              กดแก้ไขข้อมูลส่วนตัวเพื่อเปลี่ยนข้อความ • สูงสุด 300 ตัวอักษร
            </p>
          </div>

          {/* Privacy Visibility Banner */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-600 space-y-1">
            <span className="font-bold text-zinc-900 block">
              ใครเห็นข้อมูลอะไรบ้าง?
            </span>
            <p className="text-zinc-500">
              <strong className="text-zinc-700">สาธารณะ:</strong> รูป, ชื่อ, ประเภทผู้ใช้, คำแนะนำตัว และความคิดเห็น/รีวิว
            </p>
            <p className="text-zinc-500">
              <strong className="text-zinc-700">เฉพาะคุณ:</strong> ความสนใจ, อีเมล, เบอร์โทร, ที่อยู่ และข้อมูลใบกำกับภาษี
            </p>
          </div>
        </div>

        {/* 3 Information Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Interests / Specialties */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  ประเภทงานที่สนใจ / ความเชี่ยวชาญ
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  เลือกประเภทงานเพื่อให้เราช่วยแนะนำบริการที่เหมาะกับคุณ
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {interests.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(item)}
                      className="text-zinc-400 hover:text-zinc-700 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {showAddInterest && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="พิมพ์ชื่อประเภทงาน"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"
                  >
                    เพิ่ม
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <button
                type="button"
                onClick={() => setShowAddInterest(!showAddInterest)}
                className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl border border-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม/แก้ไขประเภทงาน</span>
              </button>
              <p className="text-[10px] text-zinc-400 leading-tight">
                ความสนใจใช้เพื่อแนะนำบริการให้คุณเท่านั้น ไม่แสดงบนโปรไฟล์สาธารณะ
              </p>
            </div>
          </div>

          {/* Card 2: Contact & Addresses */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">
                    ข้อมูลติดต่อและที่อยู่
                  </h3>
                  <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> เฉพาะเจ้าของบัญชี
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ข้อมูลส่วนนี้ไม่แสดงต่อสาธารณะ
                </p>
              </div>

              {/* Email & Phone */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">อีเมลที่เชื่อมโยง • ยืนยันแล้ว</span>
                      <span className="font-medium text-zinc-900">pimchanok@example.com</span>
                    </div>
                  </div>
                  <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">เบอร์โทรศัพท์ • ยืนยันแล้ว</span>
                      <span className="font-medium text-zinc-900">08X-XXX-1234</span>
                    </div>
                  </div>
                  <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">
                    ที่อยู่ที่บันทึกไว้ (2)
                  </span>
                  <button className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> เพิ่มที่อยู่
                  </button>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">บ้าน • ค่าเริ่มต้น</span>
                    <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    พิมพ์ชนก ใจดี • 08X-XXX-1234
                  </p>
                  <p className="text-[11px] text-zinc-600 line-clamp-1">
                    88/12 ซอยบ้านตัวอย่าง แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10230
                  </p>
                </div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">คอนโด</span>
                    <button className="text-[11px] text-orange-600 hover:underline">แก้ไข</button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    พิมพ์ชนก ใจดี • 08X-XXX-1234
                  </p>
                  <p className="text-[11px] text-zinc-600 line-clamp-1">
                    25/8 อาคารตัวอย่าง ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Default e-Tax Info */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900">
                  ข้อมูลใบกำกับภาษีเริ่มต้น
                </h3>
                <button className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> แก้ไขข้อมูลภาษี
                </button>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">ประเภทและชื่อ</span>
                  <span className="font-bold text-zinc-900">บุคคลธรรมดา • พิมพ์ชนก ใจดี</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">เลขประจำตัวผู้เสียภาษี</span>
                  <span className="font-mono text-zinc-700">1-1002-00345-67-8</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">ที่อยู่ใบกำกับภาษี</span>
                  <span className="text-zinc-600 leading-tight block">
                    ใช้ที่อยู่บ้าน (ค่าเริ่มต้น)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">อีเมลรับเอกสาร</span>
                  <span className="text-zinc-700 font-medium">
                    pimchanok@example.com
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-100 pt-3">
              ใบกำกับภาษีอิเล็กทรอนิกส์ (e-Tax) จะถูกจัดส่งผ่านอีเมลนี้โดยอัตโนมัติเมื่อรายการได้รับการชำระเสร็จสมบูรณ์
            </p>
          </div>
        </div>

        {/* Public Comments & Reviews Section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                  ความคิดเห็นและรีวิวบนโปรไฟล์ (Public Comments)
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  สาธารณะ
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                ทุกคนสามารถอ่านได้ • กรุณาแสดงความคิดเห็นอย่างสุภาพและไม่เปิดเผยข้อมูลส่วนตัว
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeFilter === "all"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                ทั้งหมด ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("jobs")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeFilter === "jobs"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                รีวิวจากงาน ({reviews.length})
              </button>
            </div>
          </div>

          {/* Write comment box */}
          <form onSubmit={handlePostComment} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="เขียนความคิดเห็นบนโปรไฟล์นี้... พื้นที่สำหรับผู้เยี่ยมชมที่เข้าสู่ระบบ (แบ่งปันประสบการณ์หรือฝากข้อความถึงเจ้าของโปรไฟล์)"
                className="w-full p-3.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-zinc-400">
                {commentText.length} / 500
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-[11px] text-zinc-400">
                คะแนนดาวมาจากรีวิวหลังจบงาน • ความคิดเห็นทั่วไปไม่จำเป็นต้องให้คะแนน
              </p>
              <button
                type="submit"
                className="py-2 px-5 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>โพสต์ความคิดเห็น</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6 pt-4 border-t border-zinc-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="space-y-3 pb-6 border-b border-zinc-100 last:border-none last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">
                          {rev.authorName}
                        </span>
                        <div className="flex items-center text-xs">
                          <StarRating value={rev.rating} size="sm" showValueText={true} />
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {rev.authorRole} · {rev.date}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-12">
                  {rev.content}
                </p>

                <div className="pl-12 flex items-center gap-4 text-xs">
                  <button className="text-orange-600 font-semibold hover:underline">
                    ตอบกลับ
                  </button>
                </div>

                {/* Reply Thread */}
                {rev.reply && (
                  <div className="ml-12 mt-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-orange-500" />
                      <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                        พ
                      </div>
                      <span className="font-bold text-xs text-zinc-900">
                        {rev.reply.authorName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        · {rev.reply.date}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed pl-5">
                      {rev.reply.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <span className="text-xs text-zinc-400">
              แสดงครบทั้ง {reviews.length} รีวิวแล้ว
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">
              ชื่อ รูปบุคคล ที่อยู่ และรีวิวเป็นข้อมูลสมมติสำหรับประกอบการออกแบบ หน้าจอตัวอย่าง • ไม่บันทึกข้อมูลหรือโพสต์จริง
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

