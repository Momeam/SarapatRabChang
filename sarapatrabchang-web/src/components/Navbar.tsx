"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  Search,
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  ShieldAlert,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { requestApi } from "@/lib/api";
import {
  NotificationItem,
  useNotificationStore,
} from "@/store/useNotificationStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [authActionError, setAuthActionError] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [notificationsOwnerId, setNotificationsOwnerId] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    notifications: storedNotifications,
    setNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    markNotificationsByTypeAsRead,
  } = useNotificationStore();
  const userId = user?.id;
  const notifications = userId === notificationsOwnerId ? storedNotifications : [];
  const isLoadingNotifications = Boolean(
    userId && notificationsOwnerId !== userId && !notificationError,
  );
  const hasUnreadNotifications = notifications.some((item) => !item.read);
  const hasUnreadMessages = notifications.some(
    (item) => !item.read && item.type === "message",
  );

  const isAuthPage = pathname === "/auth";
  const displayName =
    typeof user?.user_metadata.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user?.email ?? "ผู้ใช้";

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
      router.push("/auth");
    } catch (error) {
      setAuthActionError(
        error instanceof Error ? error.message : "ออกจากระบบไม่สำเร็จ",
      );
    }
  };

  useEffect(() => {
    if (loading || !userId) return;

    let active = true;
    const loadNotifications = async () => {
      try {
        const result = await requestApi<NotificationItem[]>("/api/notifications");
        if (active) {
          setNotifications(result);
          setNotificationsOwnerId(userId);
          setNotificationError("");
        }
      } catch (cause: unknown) {
        if (active) {
          setNotificationError(
            cause instanceof Error ? cause.message : "โหลดการแจ้งเตือนไม่สำเร็จ",
          );
        }
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(() => void loadNotifications(), 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [loading, userId, setNotifications]);

  useEffect(() => {
    if (!userId || pathname !== "/messages") return;
    let active = true;
    requestApi<{ updated: number }>("/api/notifications/read-all", {
      method: "PATCH",
      body: JSON.stringify({ type: "message" }),
    })
      .then(() => {
        if (active) markNotificationsByTypeAsRead("message");
      })
      .catch((cause: unknown) => {
        if (active) {
          setNotificationError(
            cause instanceof Error ? cause.message : "อัปเดตสถานะการอ่านข้อความไม่สำเร็จ",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [pathname, userId, markNotificationsByTypeAsRead]);

  // Click outside listener to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllRead = async (type?: NotificationItem["type"]) => {
    if (!user) return;
    try {
      await requestApi<{ updated: number }>("/api/notifications/read-all", {
        method: "PATCH",
        body: JSON.stringify(type ? { type } : {}),
      });
      if (type) markNotificationsByTypeAsRead(type);
      else markAllNotificationsAsRead();
      setNotificationError("");
    } catch (cause: unknown) {
      setNotificationError(
        cause instanceof Error ? cause.message : "อัปเดตการแจ้งเตือนไม่สำเร็จ",
      );
    }
  };

  const markOneRead = async (id: string) => {
    if (!user) return false;
    try {
      await requestApi<{ updated: number }>(`/api/notifications/${encodeURIComponent(id)}`, {
        method: "PATCH",
      });
      markNotificationAsRead(id);
      setNotificationError("");
      return true;
    } catch (cause: unknown) {
      setNotificationError(
        cause instanceof Error ? cause.message : "อัปเดตการแจ้งเตือนไม่สำเร็จ",
      );
      return false;
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotificationMenu;
    setShowNotificationMenu(nextState);
    if (nextState) {
      setShowProfileMenu(false);
      void markAllRead();
    }
  };

  const handleNotificationClick = async (id: string, link: string) => {
    if (!await markOneRead(id)) return;
    setShowNotificationMenu(false);
    router.push(link);
  };

  const formatNotificationTime = (value: string) => {
    return new Date(value).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "order":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case "payment":
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-zinc-950 font-sans">
                  sarapat<span className="text-orange-500">rabchang</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium -mt-1 hidden sm:block">
                  สารพัดรับจ้าง • ใกล้บ้าน อุ่นใจ
                </span>
              </div>
            </Link>

            {!isAuthPage && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link
                  href="/"
                  className={`transition-colors hover:text-orange-600 ${
                    pathname === "/" ? "text-orange-600 font-semibold" : "text-zinc-600"
                  }`}
                >
                  ค้นหาบริการ
                </Link>
                <Link
                  href="/services"
                  className={`transition-colors hover:text-orange-600 ${
                    pathname.startsWith("/services") ? "text-orange-600 font-semibold" : "text-zinc-600"
                  }`}
                >
                  บริการยอดนิยม
                </Link>
                <Link
                  href="/tracking"
                  className={`transition-colors hover:text-orange-600 ${
                    pathname.startsWith("/orders") || pathname.startsWith("/tracking")
                      ? "text-orange-600 font-semibold"
                      : "text-zinc-600"
                  }`}
                >
                  ติดตามงาน
                </Link>
                <Link
                  href="/profile"
                  className={`transition-colors hover:text-orange-600 ${
                    pathname === "/profile" ? "text-orange-600 font-semibold" : "text-zinc-600"
                  }`}
                >
                  โปรไฟล์
                </Link>
              </nav>
            )}
          </div>

          {/* Right: Actions / Profile */}
          <div className="flex items-center gap-3">
            {isAuthPage ? (
              <div className="text-xs sm:text-sm text-zinc-500 flex items-center gap-2">
                <span>ต้องการความช่วยเหลือ?</span>
                <a
                  href="#contact"
                  className="font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  ติดต่อเรา
                </a>
              </div>
            ) : (
              <>
                {/* Search Quick Button */}
                <button
                  type="button"
                  onClick={() => setShowSearchModal(true)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors hidden sm:flex items-center justify-center cursor-pointer"
                  title="ค้นหาบริการ"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Notifications Dropdown Container */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`p-2 rounded-full transition-all relative cursor-pointer ${
                      showNotificationMenu
                        ? "bg-orange-50 text-orange-600"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                    title="การแจ้งเตือน"
                  >
                    <Bell className="w-5 h-5" />
                    {/* Orange Dot Indicator */}
                    {hasUnreadNotifications && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white animate-pulse"></span>
                    )}
                  </button>

                  {/* Notification Popover Panel */}
                  {showNotificationMenu && (
                    <div className="absolute right-[-60px] sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header */}
                      <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-900">
                            การแจ้งเตือน
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            {notifications.length} รายการ
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void markAllRead()}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                        >
                          อ่านทั้งหมดแล้ว
                        </button>
                      </div>

                      {notificationError && (
                        <p role="alert" className="px-4 py-2 text-xs text-red-700">
                          {notificationError}
                        </p>
                      )}

                      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                        {isLoadingNotifications ? (
                          <p role="status" className="p-6 text-center text-xs text-zinc-400">
                            กำลังโหลดการแจ้งเตือน...
                          </p>
                        ) : !user ? (
                          <div className="p-6 text-center text-xs text-zinc-400">
                            <Link href="/auth" className="font-semibold text-orange-600">
                              เข้าสู่ระบบเพื่อดูการแจ้งเตือน
                            </Link>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-zinc-400">
                            ไม่มีการแจ้งเตือนในขณะนี้
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleNotificationClick(item.id, item.link)}
                              className={`p-3.5 hover:bg-orange-50/40 transition-colors cursor-pointer flex items-start gap-3 ${
                                !item.read ? "bg-orange-50/20" : "bg-white"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                                {getNotifIcon(item.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p
                                    className={`text-xs font-semibold truncate ${
                                      !item.read ? "text-zinc-950 font-bold" : "text-zinc-700"
                                    }`}
                                  >
                                    {item.title}
                                  </p>
                                  <span className="text-[10px] text-zinc-400 shrink-0">
                                    {formatNotificationTime(item.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                                  {item.description}
                                </p>
                              </div>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-2"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* Messages Chat Icon */}
                <Link
                  href="/messages"
                  onClick={() => setShowNotificationMenu(false)}
                  className={`p-2 rounded-full transition-all relative cursor-pointer ${
                    pathname === "/messages"
                      ? "bg-orange-50 text-orange-600"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                  title="แชทข้อความ"
                >
                  <MessageSquare className="w-5 h-5" />
                  {/* Orange Dot Indicator for unread messages */}
                  {hasUnreadMessages && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </Link>

                {loading ? (
                  <span className="text-xs text-zinc-400">กำลังตรวจสอบบัญชี...</span>
                ) : user ? (
                  <>
                    {user.role?.toLowerCase() === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        <span>แผงควบคุมแอดมิน</span>
                      </Link>
                    )}
                    <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(!showProfileMenu);
                        setShowNotificationMenu(false);
                        setAuthActionError("");
                      }}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-800 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                        {displayName.slice(0, 1)}
                      </div>
                      <span className="hidden sm:inline-block">{displayName}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-zinc-100">
                          <p className="font-semibold text-zinc-900">{displayName}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          โปรไฟล์และข้อมูลส่วนตัว
                        </Link>
                        <Link
                          href="/tracking"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          ประวัติและติดตามงาน
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowNotificationMenu(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          แชทข้อความของฉัน
                        </Link>
                        <div className="border-t border-zinc-100 my-1"></div>
                        <Link
                          href="/provider/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-orange-500" />
                          แดชบอร์ดผู้ให้บริการ
                        </Link>
                        {user.role?.toLowerCase() === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors font-medium"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            จัดการระบบ (Admin)
                          </Link>
                        )}
                        {authActionError && (
                          <p role="alert" className="px-4 py-2 text-xs text-red-600">
                            {authActionError}
                          </p>
                        )}
                        <div className="border-t border-zinc-100 my-1"></div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          ออกจากระบบ
                        </button>
                      </div>
                    )}
                  </div>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Quick Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchKeyword.trim()) return;
                setShowSearchModal(false);
                router.push(`/?q=${encodeURIComponent(searchKeyword.trim())}`);
              }}
              className="p-4 border-b border-zinc-100 flex items-center gap-3"
            >
              <Search className="w-5 h-5 text-orange-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="พิมพ์ค้นหาบริการ เช่น ล้างแอร์, ทำความสะอาด, ช่างไฟ, ซ่อมประปา..."
                className="w-full text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            <div className="p-4 bg-zinc-50/50 space-y-3">
              <p className="text-xs font-semibold text-zinc-500">ค้นหายอดนิยม</p>
              <div className="flex flex-wrap gap-2">
                {["ทำความสะอาดคอนโด", "ซ่อมแอร์", "ช่างไฟ/ประปา", "ย้ายหอพัก", "จัดสวน"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchKeyword(tag);
                      setShowSearchModal(false);
                      router.push(`/?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-3 py-1.5 bg-white border border-zinc-200 hover:border-orange-400 hover:text-orange-600 rounded-xl text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
