import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import PlanViewer, { type PlanRoom } from "@/components/PlanViewer";
import Reveal from "@/components/Reveal";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/i18n/metadata";

type PageProps = { params: Promise<{ locale: string }> };
type Step = { title: string; desc: string };
type Offer = {
  title: string;
  desc: string;
  bullets: string[];
  badges: string[];
};

/**
 * Proiectare și vizualizare 3D (RC-127) — the first service page to leave the
 * shared ServicePage template.
 *
 * Why bespoke: this is the company's namesake service ("& 3D Design") and the
 * owner's own live site sells FOUR distinct things under it (arhitectură,
 * design interior/exterior, fațade 3D, autorizații), each with its own
 * deliverables — one generic process list threw all of that away.
 *
 * The centrepiece is PlanViewer, an interactive floor plan that flips to the
 * 3D view of the same project. An earlier A/B facade wipe was built and
 * REJECTED (owner, 2026-08-05): comparing finished facades sells the
 * building, and this page sells the PROJECTING — plans, room programs,
 * areas, documentation. Keep that distinction when editing this page.
 */
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
    namespace: "servicePages.proiectare.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/proiectare-3d",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Proiectare3dPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("servicePages.proiectare");
  const tRoot = await getTranslations();

  const steps = t.raw("process.steps") as Step[];
  // Room geometry lives in code (it is layout, not copy); names and areas come
  // from the catalog so RO/RU stay translatable.
  const PLAN_GEOMETRY: Record<string, Omit<PlanRoom, "id" | "name" | "area">> = {
    living: { x: 60, y: 60, w: 370, h: 240 },
    bucatarie: { x: 430, y: 60, w: 270, h: 240 },
    baie: { x: 700, y: 60, w: 240, h: 240 },
    terasa: { x: 60, y: 300, w: 270, h: 260, outdoor: true },
    hol: { x: 330, y: 300, w: 230, h: 260 },
    dormitor: { x: 560, y: 300, w: 190, h: 260 },
    garaj: { x: 750, y: 300, w: 190, h: 260, outdoor: true },
  };
  const planRooms = (
    t.raw("plan.rooms") as { id: string; name: string; area: string }[]
  ).map((r) => ({ ...r, ...PLAN_GEOMETRY[r.id] }));
  const offers = t.raw("offers.items") as Offer[];
  const promises = t.raw("promise.items") as string[];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("seo.title"),
    serviceType: "Architectural design and 3D visualisation",
    provider: { "@type": "LocalBusiness", name: site.name, url: SITE_URL },
    areaServed: site.areaServed,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t("offers.title"),
      itemListElement: offers.map((o) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: o.title, description: o.desc },
      })),
    },
  };

  return (
    <main className="flex-1">
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <Image
          src="/images/hero/hero-blueprint.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/85 via-ink-950/65 to-ink-950/25" />
        <div className="mx-auto w-full max-w-6xl px-gutter py-20 lg:py-28">
          <div className="flex max-w-2xl flex-col gap-5">
            <p className="micro-label text-brand-200">{t("hero.eyebrow")}</p>
            <h1 className="font-serif text-display-xl text-neutral-50">
              {t("hero.h1")}
            </h1>
            <p className="max-w-xl text-body-lg text-neutral-200">
              {t("hero.intro")}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`tel:${site.phone}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
              >
                <Icon name="phone" size={18} />
                {t("hero.ctaCall")}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-50 px-6 py-3 text-body font-semibold text-neutral-50 transition-colors hover:bg-neutral-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50"
              >
                {t("hero.ctaQuote")}
                <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISE STRIP — the three commitments the owner already advertises. */}
      <section
        aria-label={t("hero.trust")}
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-x-10 gap-y-3 px-gutter py-4">
          {promises.map((p) => (
            <span
              key={p}
              className="flex items-center gap-2 text-caption font-medium text-foreground"
            >
              <Icon
                name="shield"
                size={16}
                className="shrink-0 text-accent-strong"
              />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* THE DELIVERABLE — plan first, then the same project in 3D. */}
      <section aria-labelledby="plan-title" className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("plan.eyebrow")}
            </p>
            <h2
              id="plan-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("plan.title")}
            </h2>
            <p className="max-w-2xl text-body-lg text-muted-foreground">
              {t("plan.intro")}
            </p>
          </div>
          <PlanViewer
            rooms={planRooms}
            view2dLabel={t("plan.view2d")}
            view3dLabel={t("plan.view3d")}
            hint={t("plan.hint")}
            sampleNote={t("plan.sampleNote")}
            renderSrc="/images/hero/hero-finished.jpg"
            renderAlt={t("plan.renderAlt")}
            totalLabel={t("plan.totalLabel")}
            totalArea={t("plan.totalArea")}
          />
        </div>
      </section>

      {/* THE FOUR OFFERS */}
      <section
        aria-labelledby="offers-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("offers.eyebrow")}
            </p>
            <h2
              id="offers-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("offers.title")}
            </h2>
          </div>
          <ul className="grid gap-6 lg:grid-cols-2">
            {offers.map((o) => (
              <li
                key={o.title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap gap-2">
                  {o.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-brand-50 px-3 py-1 text-micro font-semibold text-accent-strong"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-h3 text-foreground">
                  {o.title}
                </h3>
                <p className="text-body text-muted-foreground">{o.desc}</p>
                <ul className="flex flex-col gap-2">
                  {o.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Icon
                        name="shield"
                        size={16}
                        className="mt-1 shrink-0 text-accent-strong"
                      />
                      <span className="text-caption text-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROCESS */}
      <section
        aria-labelledby="process-title"
        className="border-b border-border"
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
              <li
                key={s.title}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5"
              >
                <span className="font-serif text-display-lg leading-none text-accent-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-body font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-caption text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ signpost — questions live on the hub (2026-08-05). */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-12">
          <a
            href={`${getPathname({ href: "/intrebari-frecvente", locale })}#proiectare`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            <span className="flex flex-col gap-0.5">
              <span className="micro-label text-accent-strong">
                {tRoot("faqPage.eyebrow")}
              </span>
              <span className="text-body font-semibold text-foreground">
                {tRoot("faqPage.seeAll", {
                  service: tRoot("services.proiectare.title"),
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
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-5 px-gutter py-16 lg:py-20">
          <Reveal>
            <h2 className="font-serif text-display-lg text-inverse-foreground">
              {t("cta.title")}
            </h2>
          </Reveal>
          <p className="max-w-xl text-body-lg text-inverse-muted-foreground">
            {t("cta.intro")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
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
