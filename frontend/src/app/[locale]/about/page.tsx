import { Eye, HeartHandshake, ScrollText, Smartphone } from "lucide-react";
import Aurora from "@/components/aurora";
import { Container, LinkButton, Reveal, SectionHead } from "@/components/ui";
import { getDict } from "@/i18n";

const icons = [Eye, HeartHandshake, ScrollText, Smartphone];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <section className="relative overflow-hidden py-16">
      <Aurora />
      <Container className="relative z-10 max-w-4xl">
        <Reveal>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            <span className="gradient-text">{t.about.title}</span>
          </h1>
          <p className="ink-soft mt-6 text-lg leading-9">{t.about.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {t.about.values.map((v, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={v.t} delay={i * 0.08}>
                <div className="surface card-hover h-full rounded-4xl p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-500/12 text-brand-500">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-black">{v.t}</h3>
                  <p className="ink-soft mt-2 text-sm leading-7">{v.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16">
          <SectionHead title={t.ctaBand.title} sub={t.ctaBand.desc} />
          <div className="mt-8 flex justify-center gap-3">
            <LinkButton href={`/${locale}/campaigns`} size="lg">{t.hero.cta}</LinkButton>
            <LinkButton href={`/${locale}/start`} variant="outline" size="lg">{t.nav.start}</LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
