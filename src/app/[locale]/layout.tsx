import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { OG_LOCALE, SITE_URL, localeAlternates } from "@/i18n/metadata";
import { site } from "@/config/site";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatButtons from "@/components/ChatButtons";
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
  const t = await getTranslations({ locale: safeLocale, namespace: "seo" });

  return {
    metadataBase: new URL(SITE_URL),
    // Fallback title for any segment without its own (a plain string is replaced
    // by a child page's title). Real pages set their own title — brand suffix
    // included — via buildMetadata; the suffix is baked there, not via
    // title.template, because a same-segment layout template does not apply to
    // the home page (see src/lib/seo.ts).
    title: site.name,
    // Site-wide default description; every real page overrides with its own via
    // buildMetadata (RC-006). Present so nothing is ever description-less.
    description: t("default.description"),
    // Site-wide reciprocal hreflang (ro, ru, x-default) with absolute URLs.
    // Per-route pages override with buildMetadata(locale, path).
    alternates: localeAlternates(safeLocale, "/"),
    // Open Graph / Twitter defaults (absolute branded share image). Real pages
    // override via buildMetadata; this covers e.g. the not-found page.
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: OG_LOCALE[safeLocale],
      url: SITE_URL,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      images: [DEFAULT_OG_IMAGE],
    },
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
        {/* Sitewide LocalBusiness structured data — carried by every page. */}
        <LocalBusinessJsonLd />
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          {/* Floating click-to-chat widget (RC-106) — sitewide, all pages. */}
          <ChatButtons />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
