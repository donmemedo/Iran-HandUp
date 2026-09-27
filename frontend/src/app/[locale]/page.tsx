import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, FileText, HandHeart, Receipt, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import Aurora from "@/components/aurora";
import CampaignCard from "@/components/campaign-card";
import CategoryIcon from "@/components/icon";
import StatsBand from "@/components/stats-band";
import { Container, LinkButton, Reveal, SectionHead } from "@/components/ui";
import { getDict } from "@/i18n";
import { safeApi, type Campaign, type Category, type Organization, type Stats } from "@/lib/api";
import { formatAmount, formatNumber, isFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const fa = isFa(locale);
  const Arrow = fa ? ArrowLeft : ArrowRight;

  const [featured, urgent, categories, orgs, stats] = await Promise.all([
    safeApi<Campaign[]>("/api/campaigns?featured=true&limit=6", []),
    safeApi<Campaign[]>("/api/campaigns?urgent=true&limit=3", []),
    safeApi<Category[]>("/api/categories", []),
    safeApi<Organization[]>("/api/organizations", []),
    safeApi<Stats>("/api/stats", { total_raised: 0, campaigns_count: 0, donors_count: 0, organizations_count: 0, beneficiaries_helped: 0 }),
  ]);
  const heroCampaign = featured[0];

  return (
    <>
      {/* HERO */}
      <section className="noise relative overflow-hidden pb-16 pt-10 sm:pt-16">
        <Aurora />
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden />
        <Container className="relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
                  <Sparkles className="size-4 text-brand-500" /> {t.hero.badge}
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-6 text-[clamp(2.4rem,7vw,4.7rem)] font-black leading-[1.08] tracking-tight">
                  {t.hero.title1}
                  <br />
                  <span className="gradient-text">{t.hero.title2}</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ink-soft mt-6 max-w-xl text-base leading-8 sm:text-lg">{t.hero.desc}</p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <LinkButton href={`/${locale}/campaigns`} size="lg" className="animate-[pulseRing_2.6s_ease-out_infinite]">
                    <HandHeart className="size-5" /> {t.hero.cta}
                  </LinkButton>
                  <LinkButton href={`/${locale}#featured`} variant="outline" size="lg">
                    {t.hero.cta2} <Arrow className="size-4" />
                  </LinkButton>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <p className="ink-soft mt-6 flex items-center gap-2 text-xs sm:text-sm">
                  <ShieldCheck className="size-4 text-[var(--color-teal-brand)]" /> {t.hero.trust}
                </p>
              </Reveal>
            </div>

            {heroCampaign && (
              <Reveal delay={0.2} y={40}>
                <div className="relative mx-auto max-w-md">
                  <div className="absolute -inset-4 rounded-5xl bg-linear-to-tr from-brand-500/25 via-[var(--color-violet-brand)]/20 to-[var(--color-teal-brand)]/25 blur-2xl" aria-hidden />
                  <div className="glass relative overflow-hidden rounded-5xl p-3 shadow-2xl">
                    <div className="relative aspect-4/3 overflow-hidden rounded-4xl">
                      <Image src={heroCampaign.cover} alt="" fill priority sizes="480px" className="object-cover" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 text-white">
                        <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold">{t.campaign.urgent}</span>
                        <h3 className="mt-2 text-lg font-black leading-7">
                          {fa ? heroCampaign.title : heroCampaign.title_en}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-4 text-center">
                      {[
                        { v: formatAmount(heroCampaign.raised_amount, locale), l: t.campaign.raised },
                        { v: formatAmount(heroCampaign.goal_amount, locale), l: t.campaign.goal },
                        { v: formatNumber(heroCampaign.donors_count, locale), l: t.campaign.donors },
                      ].map((x) => (
                        <div key={x.l}>
                          <p className="text-lg font-black text-brand-500">{x.v}</p>
                          <p className="ink-soft text-[11px] font-semibold">{x.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass absolute -bottom-6 start-0 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl">
                    <Receipt className="size-5 text-[var(--color-teal-brand)]" />
                    <span className="text-xs font-bold">{t.campaign.updates} · {t.campaign.verified}</span>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <div className="mt-20">
            <StatsBand stats={stats} locale={locale} t={t} />
          </div>
        </Container>
      </section>

      {/* HOW */}
      <section id="how" className="scroll-mt-24 py-20">
        <Container>
          <SectionHead eyebrow={t.brandSub} title={t.how.title} sub={t.how.sub} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.how.steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.1}>
                <div className="surface card-hover relative h-full overflow-hidden rounded-4xl p-7">
                  <span className="absolute -top-6 -end-2 text-8xl font-black text-brand-500/10">{i + 1}</span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-[var(--color-violet-brand)] text-white shadow-lg shadow-brand-500/25">
                    {[<BadgeCheck key="a" className="size-6" />, <Wallet key="b" className="size-6" />, <FileText key="c" className="size-6" />][i]}
                  </span>
                  <h3 className="mt-5 text-xl font-black">{s.t}</h3>
                  <p className="ink-soft mt-3 text-sm leading-7">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CATEGORIES */}
      <section className="py-10">
        <Container>
          <SectionHead title={t.categories.title} sub={t.categories.sub} />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.05}>
                <Link
                  href={`/${locale}/campaigns?category=${c.slug}`}
                  className="surface card-hover group flex h-full flex-col items-center gap-3 rounded-4xl p-5 text-center"
                >
                  <span
                    className="grid size-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: `color-mix(in oklab, ${c.color} 16%, transparent)`, color: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="size-6" />
                  </span>
                  <span className="text-sm font-bold">{fa ? c.name : c.name_en}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURED */}
      <section id="featured" className="scroll-mt-24 py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.featured.title}</h2>
              <p className="ink-soft mt-3 max-w-xl">{t.featured.sub}</p>
            </div>
            <LinkButton href={`/${locale}/campaigns`} variant="outline">
              {t.featured.all} <Arrow className="size-4" />
            </LinkButton>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <CampaignCard key={c.id} c={c} locale={locale} t={t} delay={i * 0.07} priority={i < 3} />
            ))}
          </div>
        </Container>
      </section>

      {/* URGENT */}
      {urgent.length > 0 && (
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-500/8 to-transparent" aria-hidden />
          <Container>
            <SectionHead eyebrow={t.campaign.urgent} title={t.urgent.title} sub={t.urgent.sub} />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {urgent.map((c, i) => (
                <CampaignCard key={c.id} c={c} locale={locale} t={t} delay={i * 0.07} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* PARTNERS */}
      <section id="partners" className="scroll-mt-24 py-20">
        <Container>
          <SectionHead title={t.partners.title} sub={t.partners.sub} />
        </Container>
        <div className="marquee relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track flex w-max gap-4">
            {[...orgs, ...orgs, ...orgs].map((o, i) => (
              <div key={`${o.slug}-${i}`} className="surface flex w-80 shrink-0 flex-col gap-2 rounded-4xl p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-500/12 text-lg font-black text-brand-500">
                    {(fa ? o.name : o.name_en).charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold leading-6">{fa ? o.name : o.name_en}</p>
                    <p className="ink-soft inline-flex items-center gap-1 text-[11px]">
                      <BadgeCheck className="size-3.5 text-[var(--color-teal-brand)]" /> {o.city} · {t.campaign.verified}
                    </p>
                  </div>
                </div>
                <p className="ink-soft line-clamp-2 text-xs leading-6">{fa ? o.description : o.description_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="noise relative overflow-hidden rounded-5xl bg-linear-to-br from-brand-600 via-brand-500 to-[var(--color-violet-brand)] px-6 py-16 text-center text-white sm:px-14">
              <div className="absolute -start-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" aria-hidden />
              <div className="absolute -bottom-24 -end-10 size-80 rounded-full bg-[var(--color-teal-brand)]/35 blur-3xl" aria-hidden />
              <h2 className="relative text-3xl font-black sm:text-5xl">{t.ctaBand.title}</h2>
              <p className="relative mx-auto mt-4 max-w-2xl text-white/85">{t.ctaBand.desc}</p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link href={`/${locale}/start`} className="rounded-full bg-white px-8 py-4 text-sm font-black text-brand-600 shadow-xl transition-transform hover:-translate-y-0.5">
                  {t.ctaBand.btn}
                </Link>
                <Link href={`/${locale}/campaigns`} className="rounded-full border border-white/40 px-8 py-4 text-sm font-black backdrop-blur transition-colors hover:bg-white/15">
                  {t.featured.all}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
