import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { dir, getDict, locales, type Locale } from "@/i18n";

const vazir = localFont({
  src: "../../../public/fonts/Vazirmatn.woff2",
  variable: "--font-fa",
  display: "swap",
  weight: "100 900",
});
const inter = localFont({
  src: "../../../public/fonts/Inter.woff2",
  variable: "--font-en",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "دست‌یار | HandUp Iran", template: "%s · دست‌یار" },
  description: "پلتفرم کمک هدفمند و شفاف؛ خیر، خیریه و مددجو در یک چرخه قابل ردیابی.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HandUp", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { title: "دست‌یار | HandUp Iran", description: "کمک هدفمند، شفاف، قابل ردیابی", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0910" },
  ],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  const t = getDict(locale);
  const fontVar = locale === "fa" ? "var(--font-fa)" : "var(--font-en)";

  return (
    <html lang={locale} dir={dir(locale as Locale)} suppressHydrationWarning className={`${vazir.variable} ${inter.variable}`}>
      <body style={{ ["--font-app" as string]: fontVar }}>
        <Providers>
          <Navbar locale={locale} t={t} />
          <main className="relative pt-20">{children}</main>
          <Footer locale={locale} t={t} />
        </Providers>
      </body>
    </html>
  );
}
