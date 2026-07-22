import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RoofCalculator, { type CalcMaterial } from "@/components/RoofCalculator";
import { publicMaterials } from "@/lib/pricing";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/i18n/metadata";

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
    namespace: "calcPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/calculator-acoperis",
    title: t("title"),
    description: t("description"),
  });
}

export default async function CalculatorAcoperisPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calcPage");

  // Only owner-confirmed materials (unverified ones stay internal, Q-10).
  const materials: CalcMaterial[] = publicMaterials().map((m) => ({
    id: m.id,
    name: m.name,
    pricePerM2: m.pricePerM2,
  }));

  // Service JSON-LD. The price info is the materials list itself (an Offer per
  // material), not a single headline price chip.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("seo.title"),
    serviceType: "Roofing",
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
    url: `${SITE_URL}${locale === "ro" ? "" : "/ru"}/calculator-acoperis`,
    offers: materials.map((m) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: m.name },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: m.pricePerM2,
        priceCurrency: "MDL",
        unitText: "m²",
      },
    })),
  };

  return (
    <main className="flex-1">
      {/* HERO — instant server render, single H1 */}
      <section className="border-b border-border bg-inverse-background text-inverse-foreground">
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="flex max-w-2xl flex-col gap-5">
            <p className="micro-label text-inverse-accent">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-serif text-display-xl text-inverse-foreground">
              {t("hero.h1")}
            </h1>
            <p className="max-w-xl text-body-lg text-inverse-muted-foreground">
              {t("hero.intro")}
            </p>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <RoofCalculator locale={locale} materials={materials} />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </main>
  );
}
