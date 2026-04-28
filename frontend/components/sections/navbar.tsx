"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Globe, LogOut, Menu, UserCircle2, X } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import type { BridgeMenuItem, BridgeSessionUser, BridgeSystemSettings } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";
import { navItems } from "@/lib/site-data";
import { normalizeFrontendHref } from "@/lib/platform";

type NavbarProps = {
  currentUser?: BridgeSessionUser | null;
  settings?: BridgeSystemSettings | null;
  menuItems?: BridgeMenuItem[];
};

type NavigationItem = {
  title: string;
  href: string;
  target?: string;
};

export function Navbar({ currentUser, settings, menuItems = [] }: NavbarProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const siteBrand = resolveBrand(settings);
  const logoUrl = siteBrand.logoShortUrl || siteBrand.logoUrl;
  const databaseNavigationItems = menuItems
    .filter((item) => item.is_active !== 0 && Number(item.parent_id || 0) === 0 && item.name.trim().length > 0)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((item) => ({
      title: item.name.trim(),
      href: normalizeFrontendHref(item.route_name || item.url || "#"),
      target: item.open_in_new_tab || item.target_blank ? "_blank" : undefined,
    }));
  const navigationItems: NavigationItem[] =
    databaseNavigationItems.length > 0
      ? databaseNavigationItems
      : navItems.map((item) => ({ ...item }));

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  const actionClass =
    "rounded-lg border border-white/50 bg-white/90 p-3 text-slate-800 shadow-sm transition hover:bg-white";

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.16)",
        boxShadow: scrolled
          ? "0 16px 48px -34px rgba(15,23,42,0.42)"
          : "0 0 0 rgba(15,23,42,0)",
        borderColor: scrolled ? "rgba(226,232,240,0.9)" : "rgba(255,255,255,0.24)",
      }}
      className="fixed inset-x-0 top-0 z-50 overflow-x-auto border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex min-w-[1180px] max-w-[1440px] items-center justify-between gap-3 px-6 py-4 lg:px-10">
        <div className="order-3 flex items-center gap-2">
          <Link href="/dashboard/notifications" className={actionClass} aria-label="الإشعارات">
            <Bell className="size-4" />
          </Link>
          <Link href="/dashboard/system/languages" className={actionClass} aria-label="اللغة">
            <Globe className="size-4" />
          </Link>

          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex rounded-lg border border-white/50 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
              >
                {currentUser.display_name}
              </Link>
              <Link
                href="/api/session/logout"
                prefetch={false}
                className={actionClass}
                aria-label="تسجيل الخروج"
              >
                <LogOut className="size-4" />
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className={actionClass} aria-label="تسجيل الدخول">
              <UserCircle2 className="size-4" />
            </Link>
          )}
        </div>

        <nav className="order-2 flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link key={`${item.title}-${item.href}`} href={item.href} target={item.target} className="text-sm font-semibold text-slate-800 transition hover:text-rose-600">
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="order-1 flex items-center gap-3">
          <Link
            href="/"
            className="flex size-12 items-center justify-center rounded-lg bg-slate-950 text-lg font-semibold text-white shadow-lg shadow-slate-950/20"
            aria-label={siteBrand.nameAr}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteBrand.nameAr}
                width={48}
                height={48}
                className="h-full w-full rounded-lg object-contain"
                unoptimized
              />
            ) : (
              siteBrand.nameAr.charAt(0) || "ل"
            )}
          </Link>
          <div className="hidden text-right md:block">
            <div className="text-xs uppercase tracking-[0.3em] text-rose-500">{siteBrand.nameEn}</div>
            <div className="text-xl font-semibold tracking-tight text-slate-950">{siteBrand.nameAr}</div>
          </div>
          <button
            className={actionClass + " hidden"}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg">
          <nav className="mx-auto grid max-w-[1440px] gap-2">
            {navigationItems.map((item) => (
              <Link
                key={`${item.title}-${item.href}`}
                href={item.href}
                target={item.target}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </motion.header>
  );
}
