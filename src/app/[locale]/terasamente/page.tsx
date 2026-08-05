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
    namespace: "servicePages.terasamente.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/terasamente",
    title: t("title"),
    description: t("description"),
  });
}

export default async function TerasamentePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ServicePage
      namespace="servicePages.terasamente"
      // REAL earthworks photo from the owner's own site (crawl 2026-08-05):
      // formed-up foundation on a cleared plot, with their JCB in frame —
      // exactly this service. Owner to confirm provenance (Q-14).
      photo="/images/projects/terasament-fundatie.jpg"
      serviceType="Earthworks"
      faqAnchor="terasamente"
      serviceLabelKey="services.terasamente.title"
    />
  );
}
