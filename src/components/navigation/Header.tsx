"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut, User as UserIcon, Check } from "lucide-react";
import { SessionUser } from "@/types";
import { Badge } from "../ui/Badge";

interface HeaderProps {
  user?: SessionUser | null;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenMobileSidebar,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1E293B] bg-[#0F172A]/95 px-6 backdrop-blur-md relative">
      {/* Rathinam Signature Tri-Color Gradient Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rgu-gradient-bar" />
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rgu-logo.png"
            alt="Rathinam Global University"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#F8FAFC]">
              Rathinam Global Deemed to be University
            </span>
            <span className="text-[10px] text-[#0EA5E9] font-medium">
              Placement & Career Development Cell
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Display */}
        <span className="hidden md:inline-block text-xs font-medium text-[#94A3B8]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative rounded-lg p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#1E293B] bg-[#111827] p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold text-[#F8FAFC]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-[#818CF8] hover:underline"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#64748B]">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2.5 text-xs transition ${
                        n.is_read ? "bg-[#0F172A]/40 text-[#94A3B8]" : "bg-[#1E293B]/80 text-[#F8FAFC] border-l-2 border-[#6366F1]"
                      }`}
                    >
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-1.5 transition hover:border-[#334155]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6366F1]/20 text-[#818CF8]">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-[#F8FAFC] leading-none">
                {user?.name || "User"}
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">
                {user?.email}
              </div>
            </div>
            <Badge
              variant={
                user?.role === "ADMIN"
                  ? "danger"
                  : user?.role === "MANAGER"
                  ? "warning"
                  : "info"
              }
              size="sm"
              className="ml-1 uppercase text-[10px]"
            >
              {user?.role?.replace("_", " ")}
            </Badge>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#1E293B] bg-[#111827] p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-[#1E293B]">
                <p className="text-xs font-bold text-[#F8FAFC]">{user?.name}</p>
                <p className="text-[11px] text-[#64748B]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#EF4444] transition hover:bg-[#EF4444]/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
