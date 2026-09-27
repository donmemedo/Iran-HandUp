"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, Loader2, Wallet } from "lucide-react";
import { API_BROWSER, type Donation } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { formatDate, formatNumber } from "@/lib/utils";
import { useAuth } from "./providers";
import { LinkButton } from "./ui";

export default function DashboardClient({ locale, t }: { locale: string; t: Dict }) {
  const { user, token, ready, logout } = useAuth();
  const [donations, setDonations] = useState<Donation[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BROWSER}/api/me/donations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setDonations)
      .catch(() => setDonations([]));
  }, [token]);

  if (!ready) return <Loader2 className="mx-auto size-6 animate-spin" />;

  if (!user) {
    return (
      <div className="surface rounded-4xl p-12 text-center">
        <p className="ink-soft">{t.start.needLogin}</p>
        <LinkButton href={`/${locale}/login`} className="mt-5">{t.nav.login}</LinkButton>
      </div>
    );
  }

  const total = (donations ?? []).reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-4xl p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-3xl bg-linear-to-br from-brand-500 to-[var(--color-violet-brand)] text-xl font-black text-white">
            {user.full_name.charAt(0)}
          </span>
          <div>
            <p className="ink-soft text-xs font-semibold">{t.dash.hello}</p>
            <h1 className="text-2xl font-black">{user.full_name}</h1>
            <p className="ink-soft text-xs" dir="ltr">{user.email}</p>
          </div>
        </div>
        <button onClick={logout} className="rounded-full border border-current/15 px-5 py-2.5 text-sm font-semibold hover:border-brand-500 hover:text-brand-500">
          {t.nav.logout}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="surface rounded-4xl p-6">
          <Wallet className="size-6 text-brand-500" />
          <p className="ink-soft mt-3 text-xs font-semibold">{t.dash.total}</p>
          <p className="mt-1 text-3xl font-black">
            {formatNumber(total, locale)} <span className="text-sm ink-soft">{t.common.toman}</span>
          </p>
        </div>
        <div className="surface rounded-4xl p-6">
          <HeartHandshake className="size-6 text-[var(--color-teal-brand)]" />
          <p className="ink-soft mt-3 text-xs font-semibold">{t.dash.donations}</p>
          <p className="mt-1 text-3xl font-black">{formatNumber(donations?.length ?? 0, locale)}</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-black">{t.dash.donations}</h2>
      {donations === null ? (
        <Loader2 className="mt-6 size-5 animate-spin" />
      ) : donations.length === 0 ? (
        <div className="surface mt-4 rounded-4xl p-10 text-center">
          <p className="ink-soft">{t.dash.empty}</p>
          <LinkButton href={`/${locale}/campaigns`} className="mt-5">{t.hero.cta}</LinkButton>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {donations.map((d) => (
            <li key={d.id} className="surface flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
              <div>
                <p className="font-bold text-brand-500">{formatNumber(d.amount, locale)} {t.common.toman}</p>
                {d.message && <p className="ink-soft mt-1 text-xs">{d.message}</p>}
              </div>
              <span className="ink-soft text-xs">{formatDate(d.created_at, locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
