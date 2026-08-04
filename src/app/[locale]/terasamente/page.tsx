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
      // INTERIM photo (RC-123): the graded plot with the fresh slab is the
      // closest earthworks shot we have. Swap for a machinery-at-work photo
      // when RC-126 sourcing lands (Q-19).
      photo="/images/stages/stage-1.jpg"
      serviceType="Earthworks"
    />
  );
}
