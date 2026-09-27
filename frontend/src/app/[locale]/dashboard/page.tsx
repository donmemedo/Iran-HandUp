import DashboardClient from "@/components/dashboard-client";
import { Container } from "@/components/ui";
import { getDict } from "@/i18n";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <section className="py-14">
      <Container className="max-w-4xl">
        <DashboardClient locale={locale} t={getDict(locale)} />
      </Container>
    </section>
  );
}
