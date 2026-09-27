"use client";

import type { Stats } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { formatAmount, formatNumber } from "@/lib/utils";
import { Counter, Reveal } from "./ui";

export default function StatsBand({ stats, locale, t }: { stats: Stats; locale: string; t: Dict }) {
  const items = [
    { v: stats.total_raised, label: t.stats.raised, fmt: (n: number) => formatAmount(n, locale), suffix: t.common.toman },
    { v: stats.campaigns_count, label: t.stats.campaigns, fmt: (n: number) => formatNumber(n, locale) },
    { v: stats.donors_count, label: t.stats.donors, fmt: (n: number) => formatNumber(n, locale) },
    { v: stats.beneficiaries_helped, label: t.stats.helped, fmt: (n: number) => formatNumber(n, locale) },
  ];
  return (
    <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-4xl lg:grid-cols-4">
      {items.map((it, i) => (
        <Reveal key={it.label} delay={i * 0.08} className="px-5 py-7 text-center">
          <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            <span className="gradient-text"><Counter to={it.v} format={it.fmt} /></span>
            {it.suffix && <span className="text-sm font-bold ink-soft">{it.suffix}</span>}
          </div>
          <p className="ink-soft mt-2 text-xs font-semibold sm:text-sm">{it.label}</p>
        </Reveal>
      ))}
    </div>
  );
}
