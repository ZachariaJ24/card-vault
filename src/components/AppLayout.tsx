"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "solar:chart-square-bold" },
  { label: "Portfolio", href: "/portfolio", icon: "solar:wallet-bold" },
  { label: "Market", href: "/market", icon: "solar:graph-up-bold" },
  { label: "Settings", href: "/settings", icon: "solar:settings-bold" },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Admin Panel", href: "/admin", icon: "solar:shield-star-bold", adminOnly: true },
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
      {/* Logo */}
      <div className={`px-4 py-5 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-[#060d18] shrink-0"
          style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)" }}
        >
          CV
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-lg">
            Card<span className="text-[#00b4ff]">Vault</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-1">
        {allNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip
              key={item.href}
              content={item.label}
              placement="right"
              isDisabled={!collapsed}
              delay={300}
              classNames={{ content: "bg-[#0a1628] text-white border border-[#00b4ff]/20" }}
            >
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? "bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
                    : "text-[#64748b] hover:text-white hover:bg-[#0a1628]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon icon={item.icon} width={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div className={`px-2 pb-4 space-y-1 border-t border-[#00b4ff]/10 pt-3`}>
        <Tooltip
          content="Sign Out"
          placement="right"
          isDisabled={!collapsed}
          classNames={{ content: "bg-[#0a1628] text-white border border-[#00b4ff]/20" }}
        >
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Icon icon="solar:logout-3-bold" width={20} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </Tooltip>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              name={initials}
              size="sm"
              classNames={{
                base: "bg-[#00b4ff]/20 border border-[#00b4ff]/30",
                name: "text-[#00b4ff] font-bold text-xs",
              }}
            />
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user.email}</p>
              {isAdmin && <p className="text-xs text-[#f59e0b]">Admin</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#060d18] overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#0a1628] border-r border-[#00b4ff]/10 transition-all duration-200 shrink-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-[#0a1628] border border-[#00b4ff]/20 rounded-r-lg flex items-center justify-center text-[#64748b] hover:text-white transition-colors"
          style={{ left: collapsed ? "56px" : "224px" }}
        >
          <Icon icon={collapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-left-bold"} width={12} />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-56 bg-[#0a1628] border-r border-[#00b4ff]/10 md:hidden transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-[#0a1628] border-b border-[#00b4ff]/10 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-[#64748b] hover:text-white">
            <Icon icon="solar:hamburger-menu-bold" width={24} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs text-[#060d18]"
              style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)" }}>CV</div>
            <span className="font-bold text-white">CardVault</span>
          </Link>
          <Button size="sm" isIconOnly variant="light" className="text-[#64748b]" onPress={handleSignOut}>
            <Icon icon="solar:logout-3-bold" width={20} />
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
