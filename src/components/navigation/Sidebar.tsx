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
import { RathinamLogo } from "@/components/common/RathinamLogo";

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
    { label: "Students Directory", href: "/admin/students", icon: Users },
    { label: "Companies", href: "/admin/companies", icon: Building2 },
    { label: "Company Approvals", href: "/admin/company-approvals", icon: CheckSquare },
    { label: "Placement Drives", href: "/admin/drives", icon: Briefcase },
    { label: "Placement Team", href: "/admin/placement-team", icon: UserCheck },
    { label: "Offers & Letters", href: "/admin/offers", icon: Award },
    { label: "Placement Reports", href: "/admin/reports", icon: FileBarChart },
    { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "System & ATS Settings", href: "/admin/settings", icon: Settings },
  ];

  const managerNav = [
    { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Students Records", href: "/manager/students", icon: Users },
    { label: "Companies", href: "/manager/companies", icon: Building2 },
    { label: "Placement Drives", href: "/manager/drives", icon: Briefcase },
    { label: "Offers", href: "/manager/offers", icon: Award },
    { label: "Team Members", href: "/manager/placement-team", icon: UserCheck },
    { label: "Reports & Analytics", href: "/manager/reports", icon: FileBarChart },
  ];

  const placementNav = [
    { label: "Dashboard", href: "/placement-team/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/placement-team/students", icon: Users },
    { label: "Companies", href: "/placement-team/companies", icon: Building2 },
    { label: "Placement Drives", href: "/placement-team/drives", icon: Briefcase },
    { label: "Offers", href: "/placement-team/offers", icon: Award },
  ];

  const navItems =
    role === "ADMIN"
      ? adminNav
      : role === "MANAGER"
      ? managerNav
      : placementNav;

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1E293B] bg-[#0F172A] text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-xl",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header / Rathinam Branding */}
        <div className="flex flex-col border-b border-[#1E293B] px-3.5 py-4 bg-[#1E293B]/40">
          <Link href={`/${role.toLowerCase().replace("_", "-")}/dashboard`} className="flex items-center justify-center rounded-xl bg-white p-2 shadow-sm transition-transform duration-200 hover:scale-105">
            <RathinamLogo className="w-full h-auto max-h-11" isDark={false} />
          </Link>
        </div>

        {/* Action Button for non-admin */}
        {role === "PLACEMENT_TEAM" && (
          <div className="px-4 pt-4">
            <Link
              href="/placement-team/add-company"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-900/30 transition"
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
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-[#0284C7] text-white font-bold shadow-md shadow-sky-950/40"
                    : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-sky-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile card & Logout */}
        <div className="border-t border-[#1E293B] p-3 space-y-2 bg-[#0B132B]">
          <div className="flex items-center gap-3 rounded-xl bg-[#1E293B] p-2.5 border border-slate-700/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0284C7] text-sm font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.role || role).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || (role === "ADMIN" ? "Dr. Sivasubramaniam" : role === "MANAGER" ? "Jeyakannan" : "Prof. M. Anbarasan")}
              </p>
              <p className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">
                {(user?.role || role).replace("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-[#1E293B] py-2 text-xs font-medium text-slate-300 transition hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
