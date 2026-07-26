import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HouseConfigurator from "@/components/HouseConfigurator";
import {
  FENCE_CATEGORY_PRICE,
  ROOF_MATERIALS_3D,
  ROOF_MATERIAL_ORDER,
} from "@/config/configurator";
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
    namespace: "configuratorPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/configurator",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ConfiguratorPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("configuratorPage");

  // Roofing Service JSON-LD. Every roof material with an owner-supplied band is
  // published as an AggregateOffer (all four now have one — Q-10, 2026-07-25); a
  // material with `band: null` would be dropped rather than carry a made-up price.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("seo.title"),
    serviceType: "Roofing",
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
    url: `${SITE_URL}${locale === "ro" ? "" : "/ru"}/configurator`,
    offers: ROOF_MATERIAL_ORDER.filter((id) => ROOF_MATERIALS_3D[id].band).map(
      (id) => {
        const m = ROOF_MATERIALS_3D[id];
        return {
          "@type": "AggregateOffer",
          itemOffered: {
            "@type": "Service",
            name: t(`roof.materials.${id}`),
          },
          priceCurrency: "MDL",
          lowPrice: m.band!.min,
          ...(m.band!.max != null ? { highPrice: m.band!.max } : {}),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            minPrice: m.band!.min,
            ...(m.band!.max != null ? { maxPrice: m.band!.max } : {}),
            priceCurrency: "MDL",
            unitText: "m²",
          },
        };
      },
    ),
  };

  // Fence Service JSON-LD. The owner gave ONE fence data point (jaluzele,
  // 2900 lei/linear-metre) so we publish a single category-level AggregateOffer
  // with lowPrice only — NO per-type offers, NO highPrice (open-ended "de la").
  // Unit is the linear metre (unitText "m liniar"), not m².
  const fenceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("fence.title"),
    serviceType: "Fence installation",
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
    url: `${SITE_URL}${locale === "ro" ? "" : "/ru"}/configurator`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MDL",
      lowPrice: FENCE_CATEGORY_PRICE.from,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        minPrice: FENCE_CATEGORY_PRICE.from,
        priceCurrency: "MDL",
        unitText: "m liniar",
      },
    },
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

      {/* CONFIGURATOR */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <HouseConfigurator />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fenceJsonLd) }}
      />
    </main>
  );
}
