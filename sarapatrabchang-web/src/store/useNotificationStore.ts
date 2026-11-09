import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "order" | "message" | "payment" | "review";
  link: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  hasUnreadNotifications: boolean;
  hasUnreadMessages: boolean;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  markMessagesAsRead: () => void;
  simulateIncomingMessage: () => void;
  simulateIncomingNotification: () => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "ส่งมอบงานเรียบร้อยแล้ว",
    description: "สุภาวดี ใจดี ได้ส่งมอบงานทำความสะอาดแล้ว กรุณาตรวจสอบผลงาน",
    time: "5 นาทีที่แล้ว",
    read: false,
    type: "order",
    link: "/orders/SRP-691105-024",
  },
  {
    id: "notif-2",
    title: "ข้อความใหม่จาก สุภาวดี ใจดี",
    description: "ยินดีค่ะ สุภาวดีส่งสรุปข้อตกลงบริการให้เรียบร้อยแล้วค่ะ",
    time: "15 นาทีที่แล้ว",
    read: false,
    type: "message",
    link: "/messages",
  },
  {
    id: "notif-3",
    title: "ยืนยันยอดเงินในระบบ Escrow",
    description: "เงิน ฿650 ของคุณได้รับการปกป้องในระบบประกันกลางเรียบร้อยแล้ว",
    time: "2 ชั่วโมงที่แล้ว",
    read: true,
    type: "payment",
    link: "/orders/SRP-691105-024",
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  hasUnreadNotifications: true,
  hasUnreadMessages: true,

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      hasUnreadNotifications: false,
    })),

  markNotificationAsRead: (id: string) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const stillHasUnread = updated.some((n) => !n.read);
      return {
        notifications: updated,
        hasUnreadNotifications: stillHasUnread,
      };
    }),

  markMessagesAsRead: () =>
    set({
      hasUnreadMessages: false,
    }),

  simulateIncomingMessage: () =>
    set({
      hasUnreadMessages: true,
    }),

  simulateIncomingNotification: () =>
    set((state) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: "มีข้อความใหม่เข้ามา!",
        description: "สุภาวดี ใจดี: ได้ค่ะ พรุ่งนี้พร้อมเข้าบริการตรงเวลา 09:00 น. ค่ะ",
        time: "เมื่อสักครู่",
        read: false,
        type: "message",
        link: "/messages",
      };
      return {
        notifications: [newNotif, ...state.notifications],
        hasUnreadNotifications: true,
        hasUnreadMessages: true,
      };
    }),
}));

