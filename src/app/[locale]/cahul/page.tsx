import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CityPage from "@/components/CityPage";
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
    namespace: "cityPages.cahul.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/cahul",
    title: t("title"),
    description: t("description"),
  });
}

export default async function CahulPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <CityPage namespace="cityPages.cahul" cityName="Cahul" region="Raionul Cahul" />
  );
}
