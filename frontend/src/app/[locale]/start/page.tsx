import Aurora from "@/components/aurora";
import StartForm from "@/components/start-form";
import { Container, Reveal } from "@/components/ui";
import { getDict } from "@/i18n";
import { safeApi, type Category } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const categories = await safeApi<Category[]>("/api/categories", []);
  return (
    <section className="relative overflow-hidden py-14">
      <Aurora className="opacity-35" />
      <Container className="relative z-10 max-w-3xl">
        <Reveal>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t.start.title}</h1>
          <p className="ink-soft mt-3">{t.start.sub}</p>
        </Reveal>
        <div className="mt-8">
          <StartForm categories={categories} locale={locale} t={t} />
        </div>
      </Container>
    </section>
  );
}
