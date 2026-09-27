"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Users, Zap } from "lucide-react";
import type { Campaign } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { cCity, cName, cSummary, cTitle, daysLeft, formatAmount, formatNumber, isFa, pct } from "@/lib/utils";
import { Progress, Reveal } from "./ui";

export default function CampaignCard({
  c, locale, t, delay = 0, priority = false,
}: { c: Campaign; locale: string; t: Dict; delay?: number; priority?: boolean }) {
  const p = pct(c);
  const left = daysLeft(c.deadline);
  const cat = c.category ? (isFa(locale) ? c.category.name : c.category.name_en) : null;

  return (
    <Reveal delay={delay} className="h-full">
      <Link
        href={`/${locale}/campaigns/${c.slug}`}
        className="surface card-hover group flex h-full flex-col overflow-hidden rounded-4xl"
      >
        <div className="relative aspect-16/10 overflow-hidden">
          <Image
            src={c.cover}
            alt={cTitle(c, locale)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-3 top-3 flex flex-wrap items-center gap-2">
            {c.urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
                <Zap className="size-3" /> {t.campaign.urgent}
              </span>
            )}
            {c.status === "funded" && (
              <span className="rounded-full bg-[var(--color-teal-brand)] px-2.5 py-1 text-[11px] font-bold text-white">
                {t.campaign.funded}
              </span>
            )}
            {cat && (
              <span className="ms-auto rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-black backdrop-blur">
                {cat}
              </span>
            )}
          </div>
          <div className="absolute inset-x-4 bottom-3 flex items-center gap-3 text-xs font-medium text-white/90">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {cCity(c, locale)}</span>
            {c.verified && <span className="inline-flex items-center gap-1"><BadgeCheck className="size-3.5" /> {t.campaign.verified}</span>}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-7 transition-colors group-hover:text-brand-500">
            {cTitle(c, locale)}
          </h3>
          <p className="ink-soft mt-2 line-clamp-2 text-sm leading-6">{cSummary(c, locale)}</p>

          <div className="mt-auto pt-5">
            <Progress value={p} />
            <div className="mt-3 flex items-baseline justify-between text-sm">
              <span className="font-black text-brand-500">
                {formatAmount(c.raised_amount, locale)} <span className="text-xs font-semibold">{t.common.toman}</span>
              </span>
              <span className="ink-soft text-xs">
                {formatNumber(p, locale)}٪ {t.campaign.complete}
              </span>
            </div>
            <div className="ink-soft mt-3 flex items-center justify-between border-t border-current/10 pt-3 text-xs">
              <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> {formatNumber(c.donors_count, locale)} {t.campaign.donors}</span>
              {left !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {left > 0 ? `${formatNumber(left, locale)} ${t.campaign.daysLeft}` : t.campaign.ended}
                </span>
              )}
            </div>
            <p className="ink-soft mt-2 truncate text-[11px]">{t.campaign.beneficiary}: {cName(c, locale)}</p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
