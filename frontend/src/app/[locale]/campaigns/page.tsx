import { Suspense } from "react";
import Aurora from "@/components/aurora";
import CampaignCard from "@/components/campaign-card";
import FilterBar from "@/components/filter-bar";
import { Container, Reveal } from "@/components/ui";
import { getDict } from "@/i18n";
import { safeApi, type Campaign, type Category } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getDict(locale);

  const query = new URLSearchParams({ limit: "48" });
  (["q", "category", "city", "sort"] as const).forEach((k) => sp[k] && query.set(k, sp[k]!));

  const [campaigns, categories] = await Promise.all([
    safeApi<Campaign[]>(`/api/campaigns?${query}`, []),
    safeApi<Category[]>("/api/categories", []),
  ]);

  return (
    <section className="relative pb-20 pt-10">
      <Aurora className="opacity-40" />
      <Container className="relative z-10">
        <Reveal>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t.list.title}</h1>
          <p className="ink-soft mt-3">{t.list.sub}</p>
        </Reveal>

        <div className="mt-8">
          <Suspense fallback={<div className="glass h-40 rounded-4xl" />}>
            <FilterBar categories={categories} locale={locale} t={t} />
          </Suspense>
        </div>

        <p className="ink-soft mt-6 text-sm font-semibold">
          {formatNumber(campaigns.length, locale)} {t.list.results}
        </p>

        {campaigns.length === 0 ? (
          <div className="surface mt-6 rounded-4xl p-16 text-center">
            <p className="ink-soft">{t.list.empty}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c, i) => (
              <CampaignCard key={c.id} c={c} locale={locale} t={t} delay={(i % 3) * 0.07} priority={i < 3} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
