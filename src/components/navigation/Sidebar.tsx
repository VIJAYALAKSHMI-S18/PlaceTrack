"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  Briefcase,
  UserCheck,
  Award,
  FileBarChart,
  ShieldAlert,
  Settings,
  PlusCircle,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Role, SessionUser } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: Role;
  user?: SessionUser | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  user,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Companies", href: "/admin/companies", icon: Building2 },
    { label: "Company Approvals", href: "/admin/company-approvals", icon: CheckSquare },
    { label: "Placement Drives", href: "/admin/drives", icon: Briefcase },
    { label: "Placement Team", href: "/admin/placement-team", icon: UserCheck },
    { label: "Offers Tracking", href: "/admin/offers", icon: Award },
    { label: "Reports Generator", href: "/admin/reports", icon: FileBarChart },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const managerNav = [
    { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/manager/students", icon: Users },
    { label: "Companies", href: "/manager/companies", icon: Building2 },
    { label: "Placement Drives", href: "/manager/drives", icon: Briefcase },
    { label: "Placement Team", href: "/manager/placement-team", icon: UserCheck },
    { label: "Offers Tracking", href: "/manager/offers", icon: Award },
    { label: "Reports", href: "/manager/reports", icon: FileBarChart },
  ];

  const placementTeamNav = [
    { label: "Dashboard", href: "/placement-team/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/placement-team/students", icon: Users },
    { label: "Companies", href: "/placement-team/companies", icon: Building2 },
    { label: "Placement Drives", href: "/placement-team/drives", icon: Briefcase },
    { label: "Offers Tracking", href: "/placement-team/offers", icon: Award },
  ];

  const navItems =
    role === "ADMIN"
      ? adminNav
      : role === "MANAGER"
      ? managerNav
      : placementTeamNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1E293B] bg-[#111827] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header / Rathinam Branding */}
        <div className="flex flex-col border-b border-[#1E293B] px-3.5 py-4 bg-gradient-to-b from-[#7C2D87]/20 via-[#0F172A] to-[#111827]">
          <Link href={`/${role.toLowerCase().replace("_", "-")}/dashboard`} className="flex items-center justify-center transition-transform duration-200 hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rgu-logo.png"
              alt="Rathinam Global University"
              className="w-full h-auto max-h-12 object-contain"
            />
          </Link>
        </div>

        {/* Action Button for non-admin */}
        {role === "MANAGER" && (
          <div className="px-4 pt-4">
            <Link
              href="/manager/submit-company"
              className="flex w-full items-center justify-center gap-2 rounded-lg rgu-btn-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-950/30 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Submit Company
            </Link>
          </div>
        )}

        {role === "PLACEMENT_TEAM" && (
          <div className="px-4 pt-4">
            <Link
              href="/placement-team/add-company"
              className="flex w-full items-center justify-center gap-2 rounded-lg rgu-btn-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-950/30 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Add Company
            </Link>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role.toLowerCase()}/dashboard` &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#7C2D87]/30 via-[#7C2D87]/15 to-[#0EA5E9]/10 text-white font-bold border border-[#7C2D87]/40 shadow-lg shadow-purple-950/20"
                    : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-[#38BDF8]"
                      : "text-[#64748B] group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile card & Logout matching screenshot */}
        <div className="border-t border-[#1E293B] p-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-[#0F172A] p-2.5 border border-[#1E293B]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#334155] text-sm font-bold text-[#F8FAFC]">
              {user?.name ? user.name.charAt(0).toUpperCase() : role.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#F8FAFC] truncate">
                {user?.name || (role === "ADMIN" ? "Dr. Sivasubramaniam" : role === "MANAGER" ? "Jeyakannan" : "Prof. M. Anbarasan")}
              </p>
              <p className="text-[10px] font-semibold text-[#818CF8] tracking-wider uppercase">
                {role.replace("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1E293B] bg-[#111827] py-2 text-xs font-medium text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
