import Link from "next/link";
import { HandHeart, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Dict } from "@/i18n/fa";
import { Container } from "./ui";

export default function Footer({ locale, t }: { locale: string; t: Dict }) {
  const year = locale === "fa" ? "۱۴۰۵" : "2026";
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-current/10">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-[var(--color-violet-brand)] text-white">
              <HandHeart className="size-5" />
            </span>
            <span className="text-lg font-black">{t.brand}</span>
          </div>
          <p className="ink-soft mt-4 text-sm leading-7">{t.brandSub}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-teal-brand)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--color-teal-brand)]">
            <ShieldCheck className="size-4" /> {t.hero.badge}
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold">{t.footer.links}</h3>
          <ul className="ink-soft space-y-3 text-sm">
            <li><Link href={`/${locale}/campaigns`} className="hover:text-brand-500">{t.nav.campaigns}</Link></li>
            <li><Link href={`/${locale}/start`} className="hover:text-brand-500">{t.nav.start}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-brand-500">{t.nav.about}</Link></li>
            <li><Link href={`/${locale}#partners`} className="hover:text-brand-500">{t.nav.partners}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold">{t.footer.contact}</h3>
          <ul className="ink-soft space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="size-4" /> hello@handup.ir</li>
            <li className="flex items-center gap-2"><Phone className="size-4" /> ۰۲۱-۹۱۰۰۰۰۰۰</li>
            <li>{t.footer.support}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold">{t.footer.privacy}</h3>
          <ul className="ink-soft space-y-3 text-sm">
            <li>{t.footer.privacy}</li>
            <li>{t.footer.terms}</li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col items-center justify-between gap-3 border-t border-current/10 py-6 text-xs ink-soft sm:flex-row">
        <span>© {year} {t.brand} — {t.footer.rights}</span>
        <span>{t.footer.made}</span>
      </Container>
    </footer>
  );
}
