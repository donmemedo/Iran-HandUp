"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HandHeart, LayoutDashboard, LogOut, Menu, X, Languages } from "lucide-react";
import type { Dict } from "@/i18n/fa";
import { cn } from "@/lib/utils";
import ThemeToggle from "./theme-toggle";
import { useAuth } from "./providers";
import { LinkButton } from "./ui";

export default function Navbar({ locale, t }: { locale: string; t: Dict }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout, ready } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const other = locale === "fa" ? "en" : "fa";
  const swapPath = pathname.replace(`/${locale}`, `/${other}`) || `/${other}`;

  const links = [
    { href: `/${locale}/campaigns`, label: t.nav.campaigns },
    { href: `/${locale}#how`, label: t.nav.how },
    { href: `/${locale}#partners`, label: t.nav.partners },
    { href: `/${locale}/about`, label: t.nav.about },
  ];

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-4")}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "flex items-center justify-between gap-3 rounded-full px-3 transition-all duration-500",
            scrolled ? "glass h-14 shadow-lg shadow-black/5" : "h-16 border border-transparent",
          )}
        >
          <Link href={`/${locale}`} className="group flex items-center gap-2.5 ps-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-[var(--color-violet-brand)] text-white shadow-lg shadow-brand-500/30 transition-transform group-hover:scale-110 group-hover:rotate-6">
              <HandHeart className="size-5" />
            </span>
            <span className="text-lg font-black tracking-tight">{t.brand}</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium ink-soft transition-colors hover:bg-brand-500/10 hover:text-brand-500"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={swapPath}
              className="hidden size-10 place-items-center rounded-full border border-current/15 transition-colors hover:border-brand-500 hover:text-brand-500 sm:grid"
              title={t.nav.lang}
            >
              <Languages className="size-[18px]" />
            </Link>
            <ThemeToggle label={t.nav.theme} />
            {ready && user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href={`/${locale}/dashboard`}
                  className="grid size-10 place-items-center rounded-full border border-current/15 hover:border-brand-500 hover:text-brand-500"
                  title={t.nav.dashboard}
                >
                  <LayoutDashboard className="size-[18px]" />
                </Link>
                <button onClick={logout} className="grid size-10 place-items-center rounded-full border border-current/15 hover:border-brand-500 hover:text-brand-500" title={t.nav.logout}>
                  <LogOut className="size-[18px]" />
                </button>
              </div>
            ) : (
              <Link href={`/${locale}/login`} className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:text-brand-500 sm:block">
                {t.nav.login}
              </Link>
            )}
            <LinkButton href={`/${locale}/start`} size="sm" className="hidden md:inline-flex">
              {t.nav.start}
            </LinkButton>
            <button className="grid size-10 place-items-center rounded-full border border-current/15 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="glass mt-2 space-y-1 rounded-3xl p-3 lg:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-2xl px-4 py-3 font-medium hover:bg-brand-500/10">
                {l.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href={swapPath} className="rounded-2xl border border-current/15 px-4 py-3 text-center text-sm font-semibold">
                {t.nav.lang}
              </Link>
              <Link href={user ? `/${locale}/dashboard` : `/${locale}/login`} className="rounded-2xl border border-current/15 px-4 py-3 text-center text-sm font-semibold">
                {user ? t.nav.dashboard : t.nav.login}
              </Link>
            </div>
            <LinkButton href={`/${locale}/start`} className="mt-1 w-full">{t.nav.start}</LinkButton>
          </div>
        )}
      </div>
    </header>
  );
}
