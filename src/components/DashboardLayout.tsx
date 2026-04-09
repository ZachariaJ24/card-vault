"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Chip,
  Divider,
  Input,
  Kbd,
  ScrollShadow,
  Spacer,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ScrollingTicker, type TickerItem } from "@/components/heroui-pro";
import { TICKER_DATA } from "@/lib/mock-data";
import type { User } from "@supabase/supabase-js";

// --- Sidebar nav definition ---
const NAV_SECTIONS = [
  {
    title: "Market",
    items: [
      { key: "market", label: "Market", href: "/", icon: "solar:chart-2-linear", iconActive: "solar:chart-2-bold" },
      { key: "marketplace", label: "Marketplace", href: "/marketplace", icon: "solar:shop-linear", iconActive: "solar:shop-bold" },
      { key: "movers", label: "Market Movers", href: "/movers", icon: "solar:fire-linear", iconActive: "solar:fire-bold" },
      { key: "alerts", label: "Price Alerts", href: "/alerts", icon: "solar:bell-linear", iconActive: "solar:bell-bold" },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { key: "portfolio", label: "Portfolio", href: "/portfolio", icon: "solar:wallet-money-linear", iconActive: "solar:wallet-money-bold" },
      { key: "watchlist", label: "Watchlist", href: "/watchlist", icon: "solar:eye-linear", iconActive: "solar:eye-bold" },
      { key: "collection", label: "My Collection", href: "/collection", icon: "solar:box-linear", iconActive: "solar:box-bold" },
      { key: "sell", label: "Sell a Card", href: "/sell", icon: "solar:tag-price-linear", iconActive: "solar:tag-price-bold" },
      { key: "orders", label: "My Orders", href: "/orders", icon: "solar:bag-check-linear", iconActive: "solar:bag-check-bold" },
      { key: "reports", label: "Reports", href: "/reports", icon: "solar:document-text-linear", iconActive: "solar:document-text-bold" },
    ],
  },
];

const ADMIN_SECTION = {
  title: "Admin",
  items: [
    { key: "admin", label: "Admin Panel", href: "/admin", icon: "solar:shield-star-linear", iconActive: "solar:shield-star-bold" },
  ],
};

function resolveActiveKey(pathname: string): string {
  if (pathname === "/" || pathname === "/market") return "market";
  if (pathname.startsWith("/card/")) return "market";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  if (pathname.startsWith("/watchlist")) return "watchlist";
  if (pathname.startsWith("/sell")) return "sell";
  if (pathname.startsWith("/orders")) return "orders";
  if (pathname.startsWith("/collection")) return "collection";
  if (pathname.startsWith("/movers")) return "movers";
  if (pathname.startsWith("/alerts")) return "alerts";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/dashboard")) return "market";
  return "market";
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** If provided, skips the client-side auth check */
  user?: User | null;
  isAdmin?: boolean;
}

export default function DashboardLayout({ children, user: userProp, isAdmin: isAdminProp }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(userProp ?? null);
  const [isAdmin, setIsAdmin] = useState(isAdminProp ?? false);
  const activeKey = resolveActiveKey(pathname);

  // Client-side auth check if not provided via props
  useEffect(() => {
    if (userProp !== undefined) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
        setIsAdmin(data?.is_admin === true);
      }
    });
  }, [userProp]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user ? (user.email ?? "U").slice(0, 1).toUpperCase() : "?";
  const allSections = isAdmin ? [...NAV_SECTIONS, ADMIN_SECTION] : NAV_SECTIONS;

  // --- Sidebar content ---
  const SidebarNav = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center px-4 py-4", collapsed ? "justify-center" : "gap-2.5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-black text-sm text-black">
          CV
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground tracking-tight">CardVault</span>
            <Chip
              size="sm"
              variant="flat"
              color="success"
              classNames={{ content: "text-[0.6rem] font-semibold px-1" }}
              startContent={<span className="w-1.5 h-1.5 rounded-full bg-success animate-live" />}
            >
              LIVE
            </Chip>
          </div>
        )}
      </div>

      <Spacer y={2} />

      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <Input
            aria-label="Search cards"
            classNames={{
              inputWrapper: "bg-default-100 border-none h-9",
              input: "text-xs",
            }}
            placeholder="Search cards..."
            size="sm"
            startContent={<Icon className="text-default-400" icon="solar:magnifer-linear" width={16} />}
            endContent={<Kbd className="text-[0.55rem] py-0" keys={["command"]}>K</Kbd>}
          />
        </div>
      )}

      <Spacer y={1} />

      {/* Nav sections */}
      <ScrollShadow className="flex-1 px-3 -mr-3 pr-3">
        {allSections.map((section, si) => (
          <div key={section.title} className={cn(si > 0 && "mt-4")}>
            {!collapsed && (
              <p className="text-tiny text-default-400 font-medium uppercase tracking-wider pl-3 mb-1.5">
                {section.title}
              </p>
            )}
            <nav className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = activeKey === item.key;
                return (
                  <Tooltip
                    key={item.key}
                    content={item.label}
                    placement="right"
                    isDisabled={!collapsed}
                    delay={200}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-default-500 hover:text-foreground hover:bg-default-100",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon
                        icon={active ? item.iconActive : item.icon}
                        width={20}
                        className="shrink-0"
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </Tooltip>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollShadow>

      <Divider className="my-2" />

      {/* Bottom: settings + user */}
      <div className="px-3 pb-3 space-y-0.5">
        <Tooltip content="Settings" placement="right" isDisabled={!collapsed}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeKey === "settings"
                ? "bg-primary/10 text-primary"
                : "text-default-500 hover:text-foreground hover:bg-default-100",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon
              icon={activeKey === "settings" ? "solar:settings-bold" : "solar:settings-linear"}
              width={20}
              className="shrink-0"
            />
            {!collapsed && <span>Settings</span>}
          </Link>
        </Tooltip>

        {user && (
          <Tooltip content="Sign Out" placement="right" isDisabled={!collapsed}>
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-default-500 hover:text-danger hover:bg-danger/5 transition-colors",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon icon="solar:logout-3-linear" width={20} className="shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </Tooltip>
        )}

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <Avatar
              name={initials}
              size="sm"
              classNames={{
                base: "bg-default-200 shrink-0",
                name: "text-default-600 font-semibold text-xs",
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user.email}</p>
              <p className="text-[0.65rem] text-default-400">
                {isAdmin ? "Admin" : "Free Plan"}
              </p>
            </div>
          </div>
        )}

        {!user && !collapsed && (
          <Button
            as={Link}
            href="/login"
            fullWidth
            size="sm"
            color="primary"
            className="mt-2"
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Ticker bar */}
      <ScrollingTicker items={TICKER_DATA} />

      {/* Top bar */}
      <header className="flex items-center h-12 px-4 border-b border-default-200 bg-content1 shrink-0 gap-4">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-default-400 hover:text-foreground"
          onClick={() => setMobileOpen(true)}
        >
          <Icon icon="solar:hamburger-menu-linear" width={22} />
        </button>

        {/* Logo (mobile only) */}
        <Link href="/" className="md:hidden flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary font-black text-[0.6rem] text-black">CV</div>
          <span className="font-semibold text-sm">CardVault</span>
        </Link>

        {/* Search (desktop, centered) */}
        <div className="hidden md:flex flex-1 justify-center">
          <Input
            aria-label="Search players and cards"
            classNames={{
              base: "max-w-md",
              inputWrapper: "bg-default-100 border-none h-8",
              input: "text-xs",
            }}
            placeholder="Search players, sets, cards..."
            size="sm"
            startContent={<Icon className="text-default-400" icon="solar:magnifer-linear" width={16} />}
            endContent={<Kbd className="text-[0.55rem] py-0" keys={["command"]}>K</Kbd>}
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Portfolio value badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-default-400">Portfolio</span>
              <span className="font-mono font-semibold text-foreground">$12,450</span>
              <Chip
                size="sm"
                variant="flat"
                color="success"
                classNames={{ content: "text-[0.6rem] font-mono font-semibold px-0.5" }}
              >
                +3.2%
              </Chip>
            </div>
          )}

          {/* Notifications */}
          {user && (
            <Tooltip content="Notifications">
              <Button isIconOnly size="sm" variant="light" className="text-default-400">
                <Badge content="3" size="sm" color="danger" shape="circle">
                  <Icon icon="solar:bell-linear" width={18} />
                </Badge>
              </Button>
            </Tooltip>
          )}

          {/* User avatar or Sign In */}
          {user ? (
            <Avatar
              name={initials}
              size="sm"
              className="cursor-pointer"
              classNames={{
                base: "bg-default-200 w-7 h-7",
                name: "text-default-600 font-semibold text-[0.6rem]",
              }}
              onClick={() => router.push("/settings")}
            />
          ) : (
            <Button as={Link} href="/login" size="sm" color="primary" variant="flat" className="text-xs">
              Sign In
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-default-200 bg-content1 transition-all duration-200 shrink-0 relative",
            collapsed ? "w-[60px]" : "w-[220px]",
          )}
        >
          <SidebarNav />
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-content1 border border-default-200 flex items-center justify-center text-default-400 hover:text-foreground transition-colors z-10"
          >
            <Icon
              icon={collapsed ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"}
              width={12}
            />
          </button>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 bottom-0 z-50 w-[220px] bg-content1 border-r border-default-200 md:hidden transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
