import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { SERVICES } from "@/config/navigation";
import { site } from "@/config/site";
import { SITE_URL } from "@/i18n/metadata";
import { OG_IMAGE_URL } from "@/lib/seo";

type Step = { title: string; desc: string };
type Faq = { q: string; a: string };

type CityPageProps = {
  /** Message namespace holding this page's copy, e.g. "cityPages.chisinau". */
  namespace: string;
  /**
   * City name (Latin, matching `site.areaServed`) for the LocalBusiness
   * `areaServed`. Kept in code, not messages, so the structured-data facts can
   * never drift from `site.ts`.
   */
  cityName: string;
  /** Administrative region for `areaServed`, e.g. "Raionul Orhei". */
  region: string;
};

/**
 * Shared layout for the RC-303 city landing pages (Chișinău, Orhei, Cahul).
 *
 * Each page answers a local "construcții/renovări în <oraș>" search: a hero that
 * states we build/renovate in the city with a free quote and written warranty, a
 * grid linking every service, a short "cum lucrăm în <oraș>" process, and
 * city-specific FAQs. It carries two JSON-LD blocks — a LocalBusiness scoped to
 * the city (`areaServed` = city + region, all NAP from `site.ts`) and a FAQPage
 * built from the same FAQ array — so the city facts are a crawlable GEO surface.
 *
 * The six service cards reuse the sitewide `services` namespace (single source
 * for the taxonomy) and link to the service pages; the calculator card links to
 * /calculator-acoperis.
 */
export default async function CityPage({
  namespace,
  cityName,
  region,
}: CityPageProps) {
  const t = await getTranslations(namespace);
  const tServices = await getTranslations("services");

  const steps = t.raw("process.steps") as Step[];
  const faqs = t.raw("faq.items") as Faq[];

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name,
    url: `${SITE_URL}/`,
    image: OG_IMAGE_URL,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressCountry: site.address.addressCountry,
    },
    areaServed: [
      { "@type": "City", name: cityName },
      { "@type": "AdministrativeArea", name: region },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: site.openingHours.days.map(
          (d) =>
            ({
              Mo: "Monday",
              Tu: "Tuesday",
              We: "Wednesday",
              Th: "Thursday",
              Fr: "Friday",
              Sa: "Saturday",
              Su: "Sunday",
            })[d],
        ),
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="flex-1">
      {/* HERO — solid dark hero (no invented city photo) */}
      <section className="relative isolate overflow-hidden border-b border-border bg-inverse-background">
        <div className="mx-auto w-full max-w-6xl px-gutter py-20 lg:py-28">
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
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption font-medium text-inverse-foreground">
              <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">
                {t("hero.chip")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon
                  name="shield"
                  size={18}
                  className="shrink-0 text-inverse-accent"
                />
                {t("hero.trust")}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${site.phone}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
              >
                <Icon name="phone" size={18} />
                {t("hero.ctaCall")}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-50 px-6 py-3 text-body font-semibold text-neutral-50 transition-colors hover:bg-neutral-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
              >
                {t("hero.ctaQuote")}
                <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section
        aria-labelledby="city-services-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex max-w-2xl flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("services.eyebrow")}
            </p>
            <h2
              id="city-services-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("services.title")}
            </h2>
            <p className="text-body-lg text-muted-foreground">
              {t("services.intro")}
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={i * 0.06}>
                <Link
                  href={s.slug}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
                >
                  <Icon
                    name={s.icon}
                    size={28}
                    className="text-accent-strong"
                  />
                  <h3 className="text-body font-semibold text-surface-foreground">
                    {tServices(`${s.key}.title`)}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {tServices(`${s.key}.desc`)}
                  </p>
                </Link>
              </Reveal>
            ))}
            <Reveal as="li" delay={SERVICES.length * 0.06}>
              <Link
                href="/calculator-acoperis"
                className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
              >
                <Icon name="roof" size={28} className="text-accent-strong" />
                <h3 className="text-body font-semibold text-surface-foreground">
                  {t("services.calcTitle")}
                </h3>
                <p className="text-caption text-muted-foreground">
                  {t("services.calcDesc")}
                </p>
              </Link>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* PROCESS — "cum lucrăm în <oraș>" */}
      <section
        aria-labelledby="city-process-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("process.eyebrow")}
            </p>
            <h2
              id="city-process-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("process.title")}
            </h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-6">
                  <span className="font-serif text-display-lg leading-none lining-nums text-accent-strong">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-body font-semibold text-surface-foreground">
                    {s.title}
                  </h3>
                  <p className="text-caption text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="city-faq-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">{t("faq.eyebrow")}</p>
            <h2
              id="city-faq-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("faq.title")}
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-body font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong">
                  {f.q}
                  <Icon
                    name="chevronDown"
                    size={20}
                    className="shrink-0 text-accent-strong transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 text-body text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-inverse-background text-inverse-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-gutter py-16 lg:py-20">
          <h2 className="max-w-2xl font-serif text-display-lg text-inverse-foreground">
            {t("cta.title")}
          </h2>
          <p className="max-w-xl text-body-lg text-inverse-muted-foreground">
            {t("cta.intro")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
            >
              {t("cta.ctaQuote")}
              <Icon name="arrowRight" size={18} />
            </Link>
            <a
              href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-inverse-foreground px-6 py-3 text-body font-semibold text-inverse-foreground transition-colors hover:bg-inverse-foreground hover:text-inverse-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
            >
              <Icon name="phone" size={18} />
              {t("cta.ctaCall")}
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
