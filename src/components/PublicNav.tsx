"use client";

import { useState, useEffect } from "react";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import Link from "next/link";
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
      className="bg-[#060d18]/95 border-b border-[#00b4ff]/10 backdrop-blur-md"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden text-[#64748b]" />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-[#060d18]"
              style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)" }}
            >
              CV
            </div>
            <span className="font-bold text-white text-lg">
              Card<span className="text-[#00b4ff]">Vault</span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {NAV_LINKS.map((link) => (
          <NavbarItem key={link.href}>
            <Link href={link.href} className="text-sm text-[#64748b] hover:text-white transition-colors">
              {link.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        {user ? (
          <>
            <NavbarItem>
              <Button as={Link} href="/dashboard" size="sm" variant="flat"
                className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                Dashboard
              </Button>
            </NavbarItem>
            {isAdmin && (
              <NavbarItem>
                <Button as={Link} href="/admin" size="sm" variant="flat"
                  className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                  Admin
                </Button>
              </NavbarItem>
            )}
          </>
        ) : (
          <>
            <NavbarItem>
              <Button as={Link} href="/login" size="sm" variant="light" className="text-[#64748b]">
                Log in
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link} href="/login" size="sm"
                className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold"
              >
                Get Started
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-[#060d18]/98 pt-6 gap-2">
        {NAV_LINKS.map((link) => (
          <NavbarMenuItem key={link.href}>
            <Link href={link.href} className="text-base text-[#64748b] hover:text-white transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link href="/login" className="text-base text-[#00b4ff] py-2 block"
            onClick={() => setIsMenuOpen(false)}>
            {user ? "Dashboard" : "Log in / Sign up"}
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
