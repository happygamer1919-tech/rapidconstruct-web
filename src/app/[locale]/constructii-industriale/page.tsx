import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ServicePage from "@/components/ServicePage";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({
    locale: safeLocale,
    namespace: "servicePages.industriale.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/constructii-industriale",
    title: t("title"),
    description: t("description"),
  });
}

export default async function IndustrialePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ServicePage
      namespace="servicePages.industriale"
      // ⚠️ STILL INTERIM: the townhouse development is the closest
      // development-scale REAL photo we have. The whole-site crawl
      // (2026-08-05) found no genuine hall/warehouse photography — every
      // industrial image on rapidconstruct.md is stock. Needs an owner photo
      // of an actual industrial job (Q-18).
      photo="/images/slideshow/slide-4.jpg"
      serviceType="Industrial construction"
    />
  );
}
