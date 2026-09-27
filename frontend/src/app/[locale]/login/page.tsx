import Aurora from "@/components/aurora";
import AuthForm from "@/components/auth-form";
import { getDict } from "@/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden px-4 py-16">
      <Aurora />
      <div className="relative z-10 w-full max-w-md">
        <AuthForm locale={locale} t={getDict(locale)} />
      </div>
    </section>
  );
}
