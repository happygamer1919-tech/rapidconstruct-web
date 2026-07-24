import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HouseConfigurator from "@/components/HouseConfigurator";
import {
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

  // Service JSON-LD. Only the owner-supplied category bands are published as
  // offers; țiglă ceramică has no public price (Q-10) and is deliberately
  // absent — a "price on request" material must not carry a made-up number.
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
          highPrice: m.band!.max,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            minPrice: m.band!.min,
            maxPrice: m.band!.max,
            priceCurrency: "MDL",
            unitText: "m²",
          },
        };
      },
    ),
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
    </main>
  );
}
