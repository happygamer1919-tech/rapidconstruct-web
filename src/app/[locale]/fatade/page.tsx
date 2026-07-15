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
    namespace: "servicePages.fatade.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/fatade",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FatadePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* TODO(3d): white session — facade layer cutaway (termoizolatie / tencuiala / piatra) */}
      <ServicePage
        namespace="servicePages.fatade"
        photo="/images/projects/facade-stone.jpg"
        serviceType="Facade insulation and rendering"
      />
    </>
  );
}
