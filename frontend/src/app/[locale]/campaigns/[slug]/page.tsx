import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Clock, MapPin, Receipt, ShieldCheck, User, Users } from "lucide-react";
import CampaignCard from "@/components/campaign-card";
import DonateDialog from "@/components/donate-dialog";
import ShareButton from "@/components/share-button";
import { Container, Progress, Reveal } from "@/components/ui";
import { getDict } from "@/i18n";
import { api, safeApi, type Campaign, type CampaignDetail } from "@/lib/api";
import { cCity, cName, cSummary, cTitle, daysLeft, formatDate, formatNumber, isFa, pct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const c = await safeApi<CampaignDetail | null>(`/api/campaigns/${slug}`, null);
  if (!c) return { title: "404" };
  return { title: cTitle(c, locale), description: cSummary(c, locale) };
}

export default async function CampaignPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const fa = isFa(locale);

  let c: CampaignDetail;
  try {
    c = await api<CampaignDetail>(`/api/campaigns/${slug}`);
  } catch {
    notFound();
  }

  const related = (await safeApi<Campaign[]>(
    `/api/campaigns?limit=4${c.category ? `&category=${c.category.slug}` : ""}`, []
  )).filter((x) => x.slug !== c.slug).slice(0, 3);

  const p = pct(c);
  const left = daysLeft(c.deadline);
  const story = (fa ? c.story : c.story_en || c.story).split("\n").filter(Boolean);

  return (
    <article className="pb-20">
      <Container className="pt-6">
        <nav className="ink-soft mb-5 flex items-center gap-2 text-xs">
          <Link href={`/${locale}`} className="hover:text-brand-500">{t.brand}</Link>
          <span>/</span>
          <Link href={`/${locale}/campaigns`} className="hover:text-brand-500">{t.list.title}</Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              <div className="relative aspect-16/10 overflow-hidden rounded-5xl">
                <Image src={c.cover} alt={cTitle(c, locale)} fill priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2">
                  {c.urgent && <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">{t.campaign.urgent}</span>}
                  {c.category && <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black">{fa ? c.category.name : c.category.name_en}</span>}
                  {c.status === "funded" && <span className="rounded-full bg-[var(--color-teal-brand)] px-3 py-1 text-xs font-bold text-white">{t.campaign.funded}</span>}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{cTitle(c, locale)}</h1>
              <div className="ink-soft mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {cCity(c, locale)}</span>
                <span className="inline-flex items-center gap-1.5"><User className="size-4" /> {cName(c, locale)}{c.beneficiary_age ? ` · ${formatNumber(c.beneficiary_age, locale)}` : ""}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(c.created_at, locale)}</span>
                {c.verified && <span className="inline-flex items-center gap-1.5 text-[var(--color-teal-brand)]"><BadgeCheck className="size-4" /> {t.campaign.verified}</span>}
              </div>
              <p className="mt-6 text-lg leading-9">{cSummary(c, locale)}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <section className="mt-10">
                <h2 className="text-xl font-black">{t.campaign.story}</h2>
                <div className="ink-soft mt-4 space-y-4 text-[15px] leading-9">
                  {story.map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.14}>
              <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-black"><Receipt className="size-5 text-[var(--color-teal-brand)]" /> {t.campaign.updates}</h2>
                {c.updates.length === 0 ? (
                  <p className="ink-soft mt-4 text-sm">{t.campaign.noUpdates}</p>
                ) : (
                  <ol className="mt-5 space-y-4 ltr:border-l rtl:border-r border-current/15 ltr:pl-6 rtl:pr-6">
                    {c.updates.map((u) => (
                      <li key={u.id} className="relative">
                        <span className="absolute top-2 size-3 rounded-full bg-brand-500 ring-4 ring-[var(--bg)] ltr:-left-[1.93rem] rtl:-right-[1.93rem]" />
                        <div className="surface rounded-3xl p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold">{fa ? u.title : u.title_en || u.title}</h3>
                            <span className="ink-soft text-xs">{formatDate(u.created_at, locale)}</span>
                          </div>
                          <p className="ink-soft mt-2 text-sm leading-7">{fa ? u.body : u.body_en || u.body}</p>
                          {u.spent_amount && (
                            <p className="mt-3 inline-flex rounded-full bg-[var(--color-teal-brand)]/12 px-3 py-1 text-xs font-bold text-[var(--color-teal-brand)]">
                              {t.campaign.spent}: {formatNumber(u.spent_amount, locale)} {t.common.toman}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </Reveal>

            <Reveal delay={0.16}>
              <section className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-black"><Users className="size-5" /> {t.campaign.donations}</h2>
                {c.recent_donations.length === 0 ? (
                  <p className="ink-soft mt-4 text-sm">{t.campaign.noDonations}</p>
                ) : (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {c.recent_donations.map((d) => (
                      <li key={d.id} className="surface flex items-start gap-3 rounded-3xl p-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500/12 font-black text-brand-500">
                          {d.donor_name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{d.donor_name}</p>
                          <p className="text-xs font-semibold text-brand-500">{formatNumber(d.amount, locale)} {t.common.toman}</p>
                          {d.message && <p className="ink-soft mt-1 line-clamp-2 text-xs leading-6">{d.message}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Reveal delay={0.08}>
              <div className="glass rounded-5xl p-6 shadow-xl">
                <p className="text-3xl font-black text-brand-500">
                  {formatNumber(c.raised_amount, locale)}
                  <span className="ms-1 text-sm font-bold ink-soft">{t.common.toman}</span>
                </p>
                <p className="ink-soft mt-1 text-sm">
                  {t.campaign.goal}: {formatNumber(c.goal_amount, locale)} {t.common.toman}
                </p>
                <Progress value={p} className="mt-4" />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-black">{formatNumber(p, locale)}٪</p><p className="ink-soft text-[11px]">{t.campaign.complete}</p></div>
                  <div><p className="text-lg font-black">{formatNumber(c.donors_count, locale)}</p><p className="ink-soft text-[11px]">{t.campaign.donors}</p></div>
                  <div>
                    <p className="text-lg font-black">{left !== null ? formatNumber(left, locale) : "—"}</p>
                    <p className="ink-soft text-[11px]">{t.campaign.daysLeft}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <DonateDialog slug={c.slug} title={cTitle(c, locale)} locale={locale} t={t} className="w-full" />
                  <ShareButton label={t.campaign.share} title={cTitle(c, locale)} />
                </div>

                <p className="ink-soft mt-5 flex items-start gap-2 text-xs leading-6">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-teal-brand)]" /> {t.hero.trust}
                </p>
              </div>
            </Reveal>

            {c.organization && (
              <Reveal delay={0.12}>
                <div className="surface mt-5 rounded-4xl p-6">
                  <p className="ink-soft text-xs font-bold">{t.campaign.org}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-xl font-black text-brand-500">
                      {(fa ? c.organization.name : c.organization.name_en).charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold">{fa ? c.organization.name : c.organization.name_en}</p>
                      <p className="ink-soft inline-flex items-center gap-1 text-xs">
                        <BadgeCheck className="size-3.5 text-[var(--color-teal-brand)]" /> {c.organization.city}
                      </p>
                    </div>
                  </div>
                  <p className="ink-soft mt-3 text-xs leading-7">{fa ? c.organization.description : c.organization.description_en}</p>
                </div>
              </Reveal>
            )}

            {left !== null && left <= 14 && (
              <Reveal delay={0.16}>
                <p className="mt-5 flex items-center justify-center gap-2 rounded-3xl bg-brand-500/10 px-4 py-3 text-xs font-bold text-brand-600 dark:text-brand-300">
                  <Clock className="size-4" /> {formatNumber(left, locale)} {t.campaign.daysLeft}
                </p>
              </Reveal>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-black">{t.featured.title}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => <CampaignCard key={r.id} c={r} locale={locale} t={t} delay={i * 0.07} />)}
            </div>
          </section>
        )}
      </Container>
    </article>
  );
}
