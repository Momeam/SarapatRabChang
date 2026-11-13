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
  Clock,
  Sparkles,
  ExternalLink,
  PlusCircle,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [authActionError, setAuthActionError] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    hasUnreadNotifications,
    hasUnreadMessages,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    markMessagesAsRead,
    simulateIncomingNotification,
  } = useNotificationStore();

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

  // Automatically mark messages as read if on /messages page
  useEffect(() => {
    if (pathname === "/messages") {
      markMessagesAsRead();
    }
  }, [pathname, markMessagesAsRead]);

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

  const handleToggleNotifications = () => {
    const nextState = !showNotificationMenu;
    setShowNotificationMenu(nextState);
    if (nextState) {
      // When opened, close profile menu if open
      setShowProfileMenu(false);
      // As requested: "อยากให้กดดูแล้วแจ้งเตือนสีส้มออกไปด้วยครับ"
      // Mark all as read when opening notification panel
      markAllNotificationsAsRead();
    }
  };

  const handleNotificationClick = (id: string, link: string) => {
    markNotificationAsRead(id);
    setShowNotificationMenu(false);
    router.push(link);
  };

  const handleMessageIconClick = () => {
    markMessagesAsRead();
    setShowNotificationMenu(false);
    setShowProfileMenu(false);
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
                <Link
                  href="/"
                  className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors hidden sm:flex items-center justify-center"
                  title="ค้นหา"
                >
                  <Search className="w-5 h-5" />
                </Link>

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
                          onClick={markAllNotificationsAsRead}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                        >
                          อ่านทั้งหมดแล้ว
                        </button>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                        {notifications.length === 0 ? (
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
                                    {item.time}
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

                      {/* Footer: Simulation trigger for user testing */}
                      <div className="p-2.5 border-t border-zinc-100 bg-zinc-50/60 rounded-b-2xl">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            simulateIncomingNotification();
                          }}
                          className="w-full py-1.5 px-3 bg-white hover:bg-orange-50 text-orange-600 rounded-lg border border-orange-200 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>จำลองข้อความ/แจ้งเตือนใหม่เข้า (ทดสอบจุดส้ม)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Chat Icon */}
                <Link
                  href="/messages"
                  onClick={handleMessageIconClick}
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
                            markMessagesAsRead();
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          แชทข้อความของฉัน
                        </Link>
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
    </header>
  );
}
