import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: "order" | "message" | "payment" | "review";
  link: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  setNotifications: (notifications: NotificationItem[]) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationsByTypeAsRead: (type: NotificationItem["type"]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, read: true })),
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    })),
  markNotificationsByTypeAsRead: (type) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.type === type ? { ...item, read: true } : item,
      ),
    })),
}));
