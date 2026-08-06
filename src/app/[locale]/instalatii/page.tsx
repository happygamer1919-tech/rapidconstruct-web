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
    namespace: "servicePages.instalatii.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/instalatii",
    title: t("title"),
    description: t("description"),
  });
}

export default async function InstalatiiPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // No project photo fits electrics/plumbing, so this hero is a solid dark
  // hero (the contact-page pattern) instead of a misleading roof photo.
  return (
    <ServicePage
      namespace="servicePages.instalatii"
      photo={null}
      serviceType="Electrical and plumbing installation"
    />
  );
}
