"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { requestApi } from "@/lib/api";

interface KycDocument {
  name: string;
  type: string;
  content: string;
}

interface KycSubmission {
  status: "pending" | "approved" | "rejected";
  fullName: string;
  categoryKey: string;
  submittedAt: string;
}

interface KycCategory {
  id: string;
  name: string;
}

function readDocument(file: File): Promise<KycDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("อ่านไฟล์ไม่สำเร็จ กรุณาเลือกไฟล์ใหม่"));
        return;
      }
      const separator = reader.result.indexOf(",");
      if (separator < 0) {
        reject(new Error("อ่านไฟล์ไม่สำเร็จ กรุณาเลือกไฟล์ใหม่"));
        return;
      }
      resolve({
        name: file.name,
        type: file.type,
        content: reader.result.slice(separator + 1),
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

function submittedMessage(status: KycSubmission["status"]) {
  if (status === "approved") {
    return {
      title: "ยืนยันตัวตนเรียบร้อยแล้ว",
      description: "เอกสาร KYC ของคุณได้รับการตรวจสอบและอนุมัติแล้ว",
    };
  }
  if (status === "rejected") {
    return {
      title: "เอกสารต้องได้รับการแก้ไข",
      description: "กรุณาตรวจสอบข้อมูลและส่งเอกสาร KYC อีกครั้ง",
    };
  }
  return {
    title: "ส่งเอกสารยืนยันตัวตนเรียบร้อยแล้ว",
    description: "เจ้าหน้าที่จะตรวจสอบเอกสารของคุณ ข้อมูลและเอกสารถูกบันทึกไว้ในระบบแล้ว",
  };
}

interface KycFormProps {
  initialName: string;
  isAuthLoading: boolean;
}

export default function KycForm({ initialName, isAuthLoading }: KycFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [nationalId, setNationalId] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [categories, setCategories] = useState<KycCategory[]>([]);
  const [categoryKey, setCategoryKey] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [bankDocument, setBankDocument] = useState<File | null>(null);
  const [submission, setSubmission] = useState<KycSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;
    Promise.all([
      requestApi<KycSubmission | null>("/api/kyc"),
      requestApi<KycCategory[]>("/api/categories"),
    ])
      .then(([savedSubmission, availableCategories]) => {
        if (!active) return;
        const serviceCategories = availableCategories.filter((category) => category.id !== "all");
        if (serviceCategories.length === 0) {
          throw new Error("ไม่พบหมวดหมู่บริการ กรุณาลองใหม่ภายหลัง");
        }
        setSubmission(savedSubmission);
        setCategories(serviceCategories);
        setCategoryKey(
          savedSubmission?.categoryKey ??
            serviceCategories.find((category) => category.id === "maid")?.id ??
            serviceCategories[0]?.id ??
            "",
        );
        if (savedSubmission?.fullName) setFullName(savedSubmission.fullName);
        else if (initialName.trim()) setFullName(initialName);
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(cause instanceof Error ? cause.message : "โหลดข้อมูล KYC ไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialName, isAuthLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idDocument || !bankDocument) {
      setSubmitError("กรุณาแนบไฟล์บัตรประชาชนและหน้าสมุดบัญชีให้ครบ");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const [idFile, bankFile] = await Promise.all([
        readDocument(idDocument),
        readDocument(bankDocument),
      ]);
      const saved = await requestApi<KycSubmission>("/api/kyc", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          nationalId,
          categoryKey,
          bankName,
          bankAccountNumber,
          idDocument: idFile,
          bankDocument: bankFile,
        }),
      });
      setSubmission(saved);
    } catch (cause: unknown) {
      setSubmitError(cause instanceof Error ? cause.message : "ส่งเอกสาร KYC ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submission && submission.status !== "rejected") {
    const message = submittedMessage(submission.status);
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-950">{message.title}</h3>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">{message.description}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/provider/dashboard")}
          className="w-full sm:w-auto px-6 py-3 bg-zinc-950 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
        >
          <span>ไปที่แดชบอร์ดผู้รับจ้าง</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isLoading && (
        <p role="status" className="text-sm text-zinc-500">กำลังโหลดข้อมูล KYC...</p>
      )}
      {loadError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}
      {submission?.status === "rejected" && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {submittedMessage("rejected").description}
        </p>
      )}

      <fieldset disabled={isLoading || Boolean(loadError) || isSubmitting} className="space-y-6">
        <legend className="sr-only">ข้อมูลและเอกสารยืนยันตัวตน</legend>
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-zinc-950">1. ข้อมูลส่วนตัว</h3>
            <p className="text-xs text-zinc-500 mt-1">ใช้ชื่อและข้อมูลของเจ้าของบัญชีในการยืนยันตัวตน</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="kyc-full-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                ชื่อ-นามสกุลตามบัตรประชาชน
              </label>
              <input
                id="kyc-full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="kyc-national-id" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                เลขบัตรประจำตัวประชาชน 13 หลัก
              </label>
              <input
                id="kyc-national-id"
                type="text"
                inputMode="numeric"
                maxLength={13}
                value={nationalId}
                onChange={(event) => setNationalId(event.target.value.replace(/\D/g, ""))}
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-wider"
                required
              />
              <p className="text-[11px] text-zinc-400 mt-1">กรอกเฉพาะตัวเลข โดยไม่ต้องเว้นวรรคหรือใส่ขีด</p>
            </div>

            <div>
              <label htmlFor="kyc-category" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                ความเชี่ยวชาญ / หมวดหมู่บริการหลัก
              </label>
              <select
                id="kyc-category"
                value={categoryKey}
                onChange={(event) => setCategoryKey(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="kyc-bank-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                ธนาคารสำหรับรับเงิน
              </label>
              <input
                id="kyc-bank-name"
                type="text"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="kyc-bank-account" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                เลขบัญชีธนาคาร
              </label>
              <input
                id="kyc-bank-account"
                type="text"
                value={bankAccountNumber}
                onChange={(event) => setBankAccountNumber(event.target.value)}
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-zinc-950">2. อัปโหลดเอกสาร</h3>
            <p className="text-xs text-zinc-500 mt-1">
              ใช้ภาพที่ชัดเจน เห็นข้อมูลครบทุกมุม และเป็นเอกสารของเจ้าของบัญชีเท่านั้น
            </p>
          </div>

          <div className="space-y-4">
            <label
              htmlFor="kyc-id-document"
              className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                idDocument
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
              }`}
            >
              {idDocument ? (
                <div className="space-y-2">
                  <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-700">แนบไฟล์แล้ว: {idDocument.name}</p>
                  <p className="text-[11px] text-zinc-500">เลือกเพื่อเปลี่ยนไฟล์</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-800">อัปโหลดรูปถ่ายบัตรประชาชน</h4>
                  <p className="text-xs text-zinc-500">เห็นชื่อ-นามสกุล เลขบัตร และวันหมดอายุชัดเจน</p>
                  <p className="text-xs text-zinc-400">เลือกไฟล์จากอุปกรณ์</p>
                  <span className="inline-block mt-2 px-4 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 shadow-xs">
                    เลือกไฟล์
                  </span>
                  <p className="text-[10px] text-zinc-400 pt-1">JPG, PNG หรือ PDF • ขนาดไม่เกิน 10 MB</p>
                </div>
              )}
              <input
                id="kyc-id-document"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="sr-only"
                onChange={(event) => setIdDocument(event.target.files?.[0] ?? null)}
                required={!idDocument}
              />
            </label>

            <label
              htmlFor="kyc-bank-document"
              className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                bankDocument
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-zinc-300 hover:border-orange-500 bg-zinc-50/50"
              }`}
            >
              {bankDocument ? (
                <div className="space-y-2">
                  <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-700">แนบไฟล์แล้ว: {bankDocument.name}</p>
                  <p className="text-[11px] text-zinc-500">เลือกเพื่อเปลี่ยนไฟล์</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-800">อัปโหลดรูปถ่ายหน้าสมุดบัญชีธนาคาร</h4>
                  <p className="text-xs text-zinc-500">ชื่อบัญชีต้องตรงกับชื่อ-นามสกุลบนบัตรประชาชน</p>
                  <p className="text-xs text-zinc-400">เลือกไฟล์จากอุปกรณ์</p>
                  <span className="inline-block mt-2 px-4 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 shadow-xs">
                    เลือกไฟล์
                  </span>
                  <p className="text-[10px] text-zinc-400 pt-1">JPG, PNG หรือ PDF • ขนาดไม่เกิน 10 MB</p>
                </div>
              )}
              <input
                id="kyc-bank-document"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="sr-only"
                onChange={(event) => setBankDocument(event.target.files?.[0] ?? null)}
                required={!bankDocument}
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-600">
              เอกสารใช้สำหรับยืนยันตัวตนและบัญชีรับเงินเท่านั้น ไม่แสดงบนโปรไฟล์สาธารณะ
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(loadError) || isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "กำลังส่งเอกสาร..." : "ส่งเอกสารยืนยันตัวตน"}
          </button>

          <p className="text-center text-[11px] text-zinc-400">
            ตรวจสอบข้อมูลและแนบเอกสารทั้ง 2 รายการให้ครบก่อนส่ง
          </p>
        </div>
      </fieldset>
    </form>
  );
}
