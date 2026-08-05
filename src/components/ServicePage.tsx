import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { site } from "@/config/site";
import { SITE_URL } from "@/i18n/metadata";

type Step = { title: string; desc: string };

type ServicePageProps = {
  /** Message namespace holding this page's copy, e.g. "servicePages.fatade". */
  namespace: string;
  /** Hero photo under public/images/projects, or null for a dark hero (no photo). */
  photo: string | null;
  /** schema.org Service.serviceType (freeform text). */
  serviceType: string;
  /** #id of this service's group on the FAQ hub (questions live there now). */
  faqAnchor: string;
  /** Message key for this service's display name, e.g. "services.fatade.title". */
  serviceLabelKey: string;
};

/**
 * Shared layout for the RC-103 service pages. Mirrors the /acoperisuri template
 * (hero + process + FAQ + CTA + Service/FAQPage JSON-LD) minus the 3D cutaway,
 * which each service page marks with a TODO(3d) slot for the white session.
 *
 * These services have no published per-m² price (only roofing does, at 160
 * lei/m²), so the hero shows a "Deviz gratuit" chip and the Service JSON-LD
 * carries NO UnitPriceSpecification — we never invent a number.
 */
export default async function ServicePage({
  namespace,
  photo,
  serviceType,
  faqAnchor,
  serviceLabelKey,
}: ServicePageProps) {
  const t = await getTranslations(namespace);
  const tRoot = await getTranslations();
  const locale = await getLocale();

  const steps = t.raw("process.steps") as Step[];
  // FAQs moved to the /intrebari-frecvente hub (owner direction 2026-08-05).
  // The copy still lives in this namespace — the hub reads it from there — so
  // nothing forked. The FAQPage JSON-LD moved with it: structured data on a
  // page with no visible FAQs is a Google penalty, not a bonus.

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("seo.title"),
    serviceType,
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
  };
  const heroTitle = photo ? "text-neutral-50" : "text-inverse-foreground";
  const heroIntro = photo
    ? "text-neutral-200"
    : "text-inverse-muted-foreground";
  const heroTrust = photo ? "text-neutral-50" : "text-inverse-foreground";

  return (
    <main className="flex-1">
      {/* HERO — photo where one fits, otherwise a solid dark hero (contact pattern) */}
      <section
        className={`relative isolate overflow-hidden border-b border-border${
          photo ? "" : " bg-inverse-background"
        }`}
      >
        {photo ? (
          <>
            <Image
              src={photo}
              alt=""
              fill
              priority
              sizes="100vw"
              className="-z-10 object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/92 via-ink-950/75 to-ink-950/40"
            />
          </>
        ) : null}
        <div className="mx-auto w-full max-w-6xl px-gutter py-20 lg:py-28">
          <div className="flex max-w-2xl flex-col gap-5">
            <p className="micro-label text-inverse-accent">
              {t("hero.eyebrow")}
            </p>
            <h1 className={`font-serif text-display-xl ${heroTitle}`}>
              {t("hero.h1")}
            </h1>
            <p className={`max-w-xl text-body-lg ${heroIntro}`}>
              {t("hero.intro")}
            </p>
            <p
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-caption font-medium ${heroTrust}`}
            >
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

      {/* PROCESS */}
      <section
        aria-labelledby="process-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("process.eyebrow")}
            </p>
            <h2
              id="process-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("process.title")}
            </h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* FAQ lives on the hub now — this is the signpost to the right group. */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-12">
          <a
            href={`${getPathname({ href: "/intrebari-frecvente", locale })}#${faqAnchor}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            <span className="flex flex-col gap-0.5">
              <span className="micro-label text-accent-strong">
                {tRoot("faqPage.eyebrow")}
              </span>
              <span className="text-body font-semibold text-foreground">
                {tRoot("faqPage.seeAll", {
                  service: tRoot(serviceLabelKey),
                })}
              </span>
            </span>
            <Icon
              name="arrowRight"
              size={20}
              className="shrink-0 text-accent-strong transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </main>
  );
}
