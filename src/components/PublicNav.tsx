"use client";

import { useState, useEffect } from "react";
import {
  Button, Navbar, NavbarBrand, NavbarContent, NavbarItem,
  NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Link as HeroLink, Divider,
} from "@heroui/react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Market", href: "/market" },
  { label: "Pricing", href: "/pricing" },
  { label: "Sports", href: "/#sports" },
];

export default function PublicNav() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
        setIsAdmin(data?.is_admin === true);
      }
    });
  }, []);

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: "border-b border-default-200 bg-background/80 backdrop-blur-lg",
        wrapper: "w-full justify-center max-w-7xl",
        item: "hidden md:flex",
      }}
      height="60px"
    >
      <NavbarContent>
        <NavbarMenuToggle className="text-default-400 md:hidden" />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-black text-sm text-white">
              CV
            </div>
            <span className="text-lg font-semibold">CardVault</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center">
        {NAV_LINKS.map((link) => (
          <NavbarItem key={link.href}>
            <Link href={link.href} className="text-sm text-default-500 hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="flex! gap-2">
          {user ? (
            <>
              <Button as={Link} href="/dashboard" size="sm" variant="flat" color="primary">
                Dashboard
              </Button>
              {isAdmin && (
                <Button as={Link} href="/admin" size="sm" variant="flat" color="warning">
                  Admin
                </Button>
              )}
            </>
          ) : (
            <>
              <Button as={Link} href="/login" size="sm" variant="light" className="text-default-500">
                Log in
              </Button>
              <Button
                as={Link}
                href="/login"
                size="sm"
                color="primary"
                className="font-medium"
                endContent={<Icon icon="solar:alt-arrow-right-linear" width={16} />}
              >
                Get Started
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-background/95 backdrop-blur-lg pt-6 pb-6">
        <NavbarMenuItem className="mb-2">
          <Button fullWidth as={Link} href="/login" variant="flat" color="primary">
            {user ? "Dashboard" : "Sign In"}
          </Button>
        </NavbarMenuItem>
        {!user && (
          <NavbarMenuItem className="mb-4">
            <Button fullWidth as={Link} href="/login" color="primary">
              Get Started
            </Button>
          </NavbarMenuItem>
        )}
        <Divider className="my-2" />
        {NAV_LINKS.map((link) => (
          <NavbarMenuItem key={link.href}>
            <Link
              href={link.href}
              className="text-default-500 w-full py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
