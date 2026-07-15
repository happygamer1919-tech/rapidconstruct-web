import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { site } from "@/config/site";
import { SITE_URL } from "@/i18n/metadata";

type Step = { title: string; desc: string };
type Faq = { q: string; a: string };

type ServicePageProps = {
  /** Message namespace holding this page's copy, e.g. "servicePages.fatade". */
  namespace: string;
  /** Hero photo under public/images/projects, or null for a dark hero (no photo). */
  photo: string | null;
  /** schema.org Service.serviceType (freeform text). */
  serviceType: string;
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
}: ServicePageProps) {
  const t = await getTranslations(namespace);

  const steps = t.raw("process.steps") as Step[];
  const faqs = t.raw("faq.items") as Faq[];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("seo.title"),
    serviceType,
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
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

  const heroTitle = photo ? "text-neutral-50" : "text-inverse-foreground";
  const heroIntro = photo ? "text-neutral-200" : "text-inverse-muted-foreground";
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
            <p className="micro-label text-inverse-accent">{t("hero.eyebrow")}</p>
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

      {/* FAQ */}
      <section aria-labelledby="service-faq-title" className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">{t("faq.eyebrow")}</p>
            <h2
              id="service-faq-title"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
