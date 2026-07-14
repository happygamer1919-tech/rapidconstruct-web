import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL, localeAlternates } from "@/i18n/metadata";
import { serif, sans } from "../fonts";
import "../globals.css";

// This is the ROOT layout — with the `[locale]` segment there is no separate
// app/layout.tsx (per the Next 16 i18n guide), so `<html lang={locale}>` lives
// here. Fonts are RC-003's Playfair Display (--font-serif) + Inter (--font-sans).

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Pre-render both locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    metadataBase: new URL(SITE_URL),
    // Site-wide reciprocal hreflang (ro, ru, x-default) with absolute URLs.
    // Per-route pages (later tickets) can override with localeAlternates(locale, pathname).
    alternates: localeAlternates(safeLocale, "/"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // Guard the catch-all `[locale]` segment: unknown values 404 (never 500).
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
