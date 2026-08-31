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
        const list = json.data || [];
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.is_read).length);
      }
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md relative shadow-sm">
      {/* Rathinam Signature Tri-Color Gradient Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] rgu-gradient-bar" />
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rgu-emblem.svg"
            alt="Rathinam Emblem"
            className="h-9 w-9 rounded-xl object-contain shadow-sm border border-slate-200"
          />
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900 tracking-wide">
              Rathinam Global Deemed to be University
            </span>
            <span className="text-[10px] text-[#0284C7] font-bold">
              Placement & Career Development Cell
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Display */}
        <span className="hidden md:inline-block text-xs font-semibold text-slate-500">
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
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] text-[#0284C7] hover:underline font-medium"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto pt-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No recent notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2 text-xs transition ${
                        n.is_read
                          ? "text-slate-500 hover:bg-slate-50"
                          : "bg-blue-50/60 text-slate-800 border-l-2 border-[#0284C7]"
                      }`}
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 transition hover:bg-slate-100 shadow-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0284C7] text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || "Dr. Sivasubramaniam"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight">
                {user?.role || "ADMIN"}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Dr. Sivasubramaniam"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email || "admin@rathinam.ac.in"}
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
