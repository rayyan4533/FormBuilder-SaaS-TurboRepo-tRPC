"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Layers, LayoutDashboard, FileText, Menu, X, User, LogOut } from "lucide-react";
import { useUser } from "~/hooks/api/auth";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="flex flex-col h-full bg-card border-r border-border w-64 p-4 text-card-foreground">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-border">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight tracking-tight">FormBuilder</h2>
          <p className="text-xs text-muted-foreground">SaaS Workspace</p>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="space-y-1.5 flex-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info Section */}
      <div className="pt-4 mt-auto border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/40">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.fullName || user?.email || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email || "Signed in"}
            </p>
          </div>
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

      {/* Mobile Top Bar & Drawer Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary text-base">
          <Layers className="w-5 h-5" />
          <span>FormBuilder</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
