"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar, Tooltip, ScrollShadow, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "solar:home-2-linear" },
  { label: "Portfolio", href: "/portfolio", icon: "solar:wallet-money-linear" },
  { label: "Market", href: "/market", icon: "solar:chart-2-linear" },
  { label: "Settings", href: "/settings", icon: "solar:settings-linear" },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Admin Panel", href: "/admin", icon: "solar:shield-star-linear" },
];

interface Props {
  user: User;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export default function AppLayout({ user, isAdmin = false, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;
  const initials = (user.email ?? "U").slice(0, 1).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-5 flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-black text-sm text-white shrink-0">
          CV
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground">CardVault</span>
        )}
      </div>

      <ScrollShadow className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {allNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip
                key={item.href}
                content={item.label}
                placement="right"
                isDisabled={!collapsed}
                delay={300}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-default-500 hover:text-foreground hover:bg-default-100"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    icon={active ? item.icon.replace("-linear", "-bold") : item.icon}
                    width={20}
                    className="shrink-0"
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </Tooltip>
            );
          })}
        </nav>
      </ScrollShadow>

      <Divider />
      <div className="px-3 py-3 space-y-1">
        <Tooltip content="Sign Out" placement="right" isDisabled={!collapsed}>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-default-500 hover:text-danger hover:bg-danger/5 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Icon icon="solar:logout-3-linear" width={20} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </Tooltip>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              name={initials}
              size="sm"
              classNames={{
                base: "bg-default-200",
                name: "text-default-600 font-semibold text-xs",
              }}
            />
            <div className="min-w-0">
              <p className="text-xs text-foreground font-medium truncate">{user.email}</p>
              {isAdmin && <p className="text-xs text-warning">Admin</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-default-200 bg-content1 transition-all duration-200 shrink-0 relative ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-content1 border border-default-200 flex items-center justify-center text-default-400 hover:text-foreground transition-colors z-10"
        >
          <Icon icon={collapsed ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"} width={12} />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-56 bg-content1 border-r border-default-200 md:hidden transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-content1 border-b border-default-200 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-default-400 hover:text-foreground">
            <Icon icon="solar:hamburger-menu-linear" width={24} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-black text-xs text-white">CV</div>
            <span className="font-semibold">CardVault</span>
          </Link>
          <Button size="sm" isIconOnly variant="light" className="text-default-400" onPress={handleSignOut}>
            <Icon icon="solar:logout-3-linear" width={20} />
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
