export type BookingStatus =
  | "pending_payment"
  | "paid"
  | "in_progress"
  | "delivered"
  | "completed"
  | "disputed";

export type BookingAction =
  | "confirm_payment"
  | "start_work"
  | "deliver"
  | "approve"
  | "request_revision"
  | "dispute";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending_payment: "รอบันทึกสถานะชำระเงิน",
  paid: "รอผู้ให้บริการเริ่มงาน",
  in_progress: "กำลังดำเนินงาน",
  delivered: "ส่งมอบแล้ว • รอตรวจรับ",
  completed: "เสร็จสมบูรณ์",
  disputed: "อยู่ระหว่างตรวจสอบข้อพิพาท",
};

export interface BookingDraft {
  providerId: string;
  providerName: string;
  serviceTitle: string;
  packageTitle: string;
  price: number;
  date: string;
  timeSlot: string;
  contactName: string;
  phone: string;
  address: string;
  note: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  serviceTitle: string;
  category: string;
  packageTitle: string;
  price: number;
  date: string;
  timeSlot: string;
  contactName: string;
  phone: string;
  address: string;
  note: string;
  status: BookingStatus;
  statusNote: string;
  deliveryNote: string;
  deliveryPhotoUrls: string[];
  deliveredAt: string | null;
  viewerRole: "customer" | "provider";
  createdAt: string;
  updatedAt: string;
}

const draftStorageKey = "sarapatrabchang.booking-draft";

function isBookingDraft(value: unknown): value is BookingDraft {
  if (
    typeof value !== "object" ||
    value === null ||
    !("providerId" in value) ||
    typeof value.providerId !== "string" ||
    !("providerName" in value) ||
    typeof value.providerName !== "string" ||
    !("serviceTitle" in value) ||
    typeof value.serviceTitle !== "string" ||
    !("packageTitle" in value) ||
    typeof value.packageTitle !== "string" ||
    !("price" in value) ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    !("date" in value) ||
    typeof value.date !== "string" ||
    !("timeSlot" in value) ||
    typeof value.timeSlot !== "string" ||
    !("contactName" in value) ||
    typeof value.contactName !== "string" ||
    !("phone" in value) ||
    typeof value.phone !== "string" ||
    !("address" in value) ||
    typeof value.address !== "string" ||
    !("note" in value) ||
    typeof value.note !== "string"
  ) {
    return false;
  }
  return true;
}

export function readBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  const saved = window.sessionStorage.getItem(draftStorageKey);
  if (!saved) return null;

  const draft: unknown = JSON.parse(saved);
  if (!isBookingDraft(draft)) {
    throw new Error("ข้อมูลการจองไม่ถูกต้อง กรุณาเลือกบริการใหม่");
  }
  return draft;
}

export function saveBookingDraft(draft: BookingDraft) {
  window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
}

export function clearBookingDraft() {
  window.sessionStorage.removeItem(draftStorageKey);
}
