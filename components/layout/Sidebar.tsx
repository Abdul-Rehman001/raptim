"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, BarChart2, Settings, LogOut,
  ChevronsLeft, ChevronsRight, X, Sun, Moon, Sparkles, ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null };
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** Count of unanalyzed jobs for AI Coach badge */
  unanalyzedCount?: number;
  /** Whether user has a resume (for Settings red dot) */
  hasResume?: boolean;
  /** Count of follow-ups due today (for Dashboard bell badge) */
  followUpDueCount?: number;
}

export function Sidebar({
  user, collapsed, onToggle, mobileOpen, onMobileClose,
  unanalyzedCount = 0, hasResume = true, followUpDueCount = 0
}: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer); }, []);
  const isDark = resolvedTheme === "dark";

  const navigation = [
    {
      name: "Dashboard", href: "/dashboard", icon: LayoutDashboard,
      badge: followUpDueCount > 0 ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {followUpDueCount > 9 ? "9+" : followUpDueCount}
        </span>
      ) : null,
    },
    { name: "My Jobs", href: "/jobs", icon: Briefcase, badge: null },
    {
      name: "AI Coach", href: "/ai-coach", icon: Sparkles,
      badge: unanalyzedCount > 0 ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary border border-primary/30">
          {unanalyzedCount > 9 ? "9+" : unanalyzedCount}
        </span>
      ) : null,
    },
    { name: "Analytics", href: "/analytics", icon: BarChart2, badge: null },
    {
      name: "Settings", href: "/settings", icon: Settings,
      badge: !hasResume ? (
        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0" />
      ) : null,
    },
    ...(user?.role === "admin" || user?.email === "admin@gmail.com" ? [
      { name: "Admin", href: "/admin", icon: ShieldCheck, badge: null }
    ] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo & Collapse */}
      <div className={cn("flex items-center mb-8", collapsed ? "px-4 flex-col gap-4 justify-center" : "px-6 justify-between")}>
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
              <Image src="/logo.svg" alt="Raptim" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <span className="text-lg font-extrabold tracking-tight text-text-primary whitespace-nowrap">Raptim</span>
            )}
        </div>
        <button onClick={onToggle} className="hidden lg:flex p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-sidebar-hover transition-colors" title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={onMobileClose}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-200",
                collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5",
                isActive
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-sidebar-hover"
              )}
            >
              <item.icon className={cn(
                "h-4.5 w-4.5 shrink-0 transition-colors duration-200",
                isActive ? "text-primary" : "text-text-tertiary group-hover:text-text-secondary"
              )} />
              {!collapsed && <span className="flex-1">{item.name}</span>}
              {!collapsed && item.badge}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className={cn("mb-3", collapsed ? "px-2 flex justify-center" : "px-3")}>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={collapsed ? (isDark ? "Switch to Light" : "Switch to Dark") : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover",
            collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5 w-full"
          )}
        >
          {!mounted ? (
            <span className="h-4.5 w-4.5 shrink-0" />
          ) : isDark ? (
            <Sun className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <Moon className="h-4.5 w-4.5 shrink-0" />
          )}
          {!collapsed && mounted && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          {!collapsed && !mounted && <span>Theme</span>}
        </button>
      </div>

      {/* Footer / User */}
      <div className={cn(collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            {user?.image ? (
              <Image width={24} height={24} unoptimized src={user.image} alt={user.name || "User"} className="h-9 w-9 rounded-full object-cover border border-border-default" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-sm font-bold text-primary">{user?.name?.charAt(0) || "U"}</span>
              </div>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-2 rounded-lg text-text-tertiary hover:bg-red-500/10 hover:text-red-400 transition-all" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-elevated border border-border-subtle">
            <div className="flex items-center gap-3 overflow-hidden">
              {user?.image ? (
                <Image width={24} height={24} unoptimized src={user.image} alt={user.name || "User"} className="h-9 w-9 rounded-full object-cover shrink-0 border border-border-default" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                  <span className="text-sm font-bold text-primary">{user?.name?.charAt(0) || "U"}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.name || "User"}</p>
                <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-1.5 rounded-lg text-text-tertiary hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>


    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onMobileClose} />
      )}
      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-border-subtle flex flex-col py-6 z-50 transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button onClick={onMobileClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-sidebar-hover transition-colors">
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed top-0 left-0 h-screen bg-sidebar border-r border-border-subtle flex-col py-6 z-50 transition-all duration-300",
        collapsed ? "w-18" : "w-64"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
