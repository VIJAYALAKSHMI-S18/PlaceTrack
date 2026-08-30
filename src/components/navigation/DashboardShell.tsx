"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Role, SessionUser } from "@/types";

interface DashboardShellProps {
  role: Role;
  user?: SessionUser | null;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  role,
  user,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar
        role={role}
        user={user}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
