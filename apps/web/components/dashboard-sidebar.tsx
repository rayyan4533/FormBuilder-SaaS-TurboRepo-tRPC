"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Layers,
  LayoutDashboard,
  FileText,
  Menu,
  X,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useUser } from "~/hooks/api/auth";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileOpen: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleMobileOpen = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        mobileOpen,
        setMobileOpen,
        toggleMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobileOpen: () => {},
    };
  }
  return context;
}

export function DashboardHamburgerToggle({ className = "" }: { className?: string }) {
  const { mobileOpen, toggleMobileOpen } = useSidebar();

  return (
    <button
      onClick={toggleMobileOpen}
      className={`p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors flex items-center justify-center ${className}`}
      title={mobileOpen ? "Close dashboard menu" : "Open dashboard menu"}
      aria-label="Toggle dashboard menu"
    >
      {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Forms",
      href: "/dashboard/forms",
      icon: FileText,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const navContent = (
    <div
      className={`flex flex-col h-full bg-zinc-900/95 backdrop-blur-md border-r border-yellow-500/25 p-3 text-zinc-100 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-yellow-500/25 min-h-[57px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/35 text-yellow-400 shrink-0 glow-yellow">
            <Layers className="w-6 h-6 text-yellow-400" />
          </div>
          {!isCollapsed && (
            <div className="truncate transition-opacity duration-200">
              <h2 className="font-black text-lg leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                FormBuilder
              </h2>
              <p className="text-[11px] text-yellow-400/75 font-medium">Dark Yellow Neon</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg border border-transparent hover:border-yellow-500/30 transition-all shrink-0 ml-1"
          title={isCollapsed ? "Expand side panel" : "Collapse side panel"}
          aria-label="Toggle side panel"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Options */}
      <div className="space-y-1.5 flex-1">
        {!isCollapsed && (
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-yellow-400/60 mb-2">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-zinc-950 font-black shadow-lg shadow-yellow-500/25 glow-yellow"
                  : "text-zinc-400 hover:text-yellow-300 hover:bg-yellow-500/10 hover:border hover:border-yellow-500/25"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? "text-zinc-950" : "text-yellow-400/80"}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Info Section */}
      <div className="pt-3 mt-auto border-t border-yellow-500/25">
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-950/70 border border-yellow-500/20 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center justify-center font-bold text-sm shrink-0 glow-yellow">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 truncate">
              <p className="text-xs font-bold text-zinc-200 truncate">
                {user?.fullName || user?.email || "User"}
              </p>
              <p className="text-[10px] text-yellow-400/70 truncate">
                {user?.email || "Signed in"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile Overlay Drawer Slider */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl bg-card">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}


