import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons";
import Reveal from "@/components/Reveal";
import HouseBuild from "@/components/HouseBuild";
import HouseTour, { type BuildPhase } from "@/components/HouseTour";
import ConstructionStory, {
  type StoryPhase,
} from "@/components/ConstructionStory";
import { SERVICES } from "@/config/navigation";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
};

// Shapes read from the message catalog via t.raw (RO source of truth).
type Badge = { title: string; desc: string };
type Stat = { value: string; label: string };
type Project = { location: string; size: string; work: string; year: string };
type Testimonial = { quote: string; name: string; meta: string };
type Faq = { q: string; a: string };

// Icons for the six trust badges, aligned by index to home.badges.items.
const BADGE_ICONS: IconName[] = [
  "shield",
  "certificate",
  "clock",
  "users",
  "receipt",
  "support",
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "seo.home" });

  return buildMetadata({
    locale: safeLocale,
    path: "/",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tServices = await getTranslations("services");

  const badges = t.raw("badges.items") as Badge[];
  const stats = t.raw("stats.items") as Stat[];
  const projects = t.raw("projects.items") as Project[];
  const testimonials = t.raw("testimonials.items") as Testimonial[];
  const faqs = t.raw("faq.items") as Faq[];

  // Construction-story phases: copy from the catalog, photos mapped by index.
  const STORY_IMAGES = [
    "/images/projects/phase-foundation.jpg",
    "/images/projects/roof-install.jpg",
    "/images/projects/facade-stone.jpg",
    "/images/projects/hero-house.jpg",
  ];
  const storyPhases: StoryPhase[] = (
    t.raw("story.phases") as Omit<StoryPhase, "image">[]
  ).map((p, i) => ({ ...p, image: STORY_IMAGES[i] ?? STORY_IMAGES[0] }));

  // Real interim imagery for the project index rows (Q-06 placeholders retired).
  const PROJECT_IMAGES = [
    "/images/projects/hero-house.jpg",
    "/images/projects/facade-stone.jpg",
    "/images/projects/roof-install.jpg",
    "/images/projects/finish-terrace.jpg",
  ];

  // FAQPage structured data (GEO surface, AGENTS.md) — built from the same copy
  // rendered below so the visible FAQ and the JSON-LD can never diverge.
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
      {/* 1 — HERO: one screen. The house builds itself once, then the headline
          + CTAs slide in (owner direction). H1 renders instantly (SSR); the
          WebGL chunk loads only after first interaction (perf law). */}
      <HouseBuild
        eyebrow={t("hero.eyebrow")}
        h1={t("hero.h1")}
        subline={t("hero.subline")}
        trust={t("hero.trust")}
        ctaCall={t("hero.ctaCall")}
        ctaQuote={t("hero.ctaQuote")}
        phone={site.phone}
        hint={t("hero.scrollHint")}
      />

      {/* 2 — HOUSE TOUR: the scroll story, boxed, directly under the hero. */}
      <HouseTour
        eyebrow={t("build.eyebrow")}
        title={t("build.title")}
        intro={t("build.intro")}
        phases={t.raw("build.phases") as BuildPhase[]}
        hint={t("design3d.hint")}
      />

      {/* 3 — TRUST BADGES */}
      <section aria-labelledby="badges-title" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-gutter py-14">
          <h2 id="badges-title" className="sr-only">
            {t("badges.title")}
          </h2>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b, i) => (
              <li key={b.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-accent-strong">
                  <Icon name={BADGE_ICONS[i]} size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-body font-semibold text-foreground">
                    {b.title}
                  </h3>
                  <p className="text-caption text-muted-foreground">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — STATS as typography over a dark band (real numbers, server HTML) */}
      <section
        aria-labelledby="stats-title"
        className="bg-inverse-background text-inverse-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16">
          <h2 id="stats-title" className="sr-only">
            {t("stats.title")}
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2">
                <dt className="order-2 text-caption text-inverse-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 font-serif text-display-lg leading-none text-inverse-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 4 — SERVICES grid */}
      <section
        aria-labelledby="services-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("servicesSection.eyebrow")}
            </p>
            <h2
              id="services-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("servicesSection.title")}
            </h2>
            <p className="max-w-2xl text-body-lg text-muted-foreground">
              {t("servicesSection.intro")}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={s.slug}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-accent-strong">
                    <Icon name={s.icon} size={24} />
                  </span>
                  <h3 className="text-h3 font-semibold text-surface-foreground">
                    {tServices(`${s.key}.title`)}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {tServices(`${s.key}.desc`)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-caption font-semibold text-accent-strong">
                    {t("servicesSection.cardCta")}
                    <Icon
                      name="arrowRight"
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4c — CONSTRUCTION STORY (signature scroll narrative, design ref Reel 1) */}
      <ConstructionStory
        eyebrow={t("story.eyebrow")}
        title={t("story.title")}
        phases={storyPhases}
      />

      {/* 5 — EDITORIAL STATEMENT beat (dark band) */}
      {/* TODO(copy): final statement copy pending owner approval. */}
      <section className="bg-ink-950 text-inverse-foreground">
        <div className="mx-auto w-full max-w-5xl px-gutter py-24 text-center">
          <Reveal>
            <p className="font-serif text-display-xl leading-tight text-inverse-foreground">
              {t("statement.text")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6 — RECENT PROJECTS as editorial index rows */}
      <section
        aria-labelledby="projects-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className="micro-label text-accent-strong">
                {t("projects.eyebrow")}
              </p>
              <h2
                id="projects-title"
                className="font-serif text-display-lg text-foreground"
              >
                {t("projects.title")}
              </h2>
            </div>
            {/* "Vezi tot portofoliul" CTA returns when RC-104 builds /portofoliu (Q-06) */}
          </div>
          <ul className="border-t border-border">
            {projects.map((p, i) => (
              <li key={`${p.location}-${p.work}`}>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-5 sm:gap-6">
                  {/* Interim real project thumbnail (Q-06) */}
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border sm:h-16 sm:w-24">
                    <Image
                      src={PROJECT_IMAGES[i % PROJECT_IMAGES.length]}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-baseline gap-2 font-serif text-h3 text-foreground">
                      {p.location}
                      <span className="text-caption font-sans text-muted-foreground">
                        {p.size}
                      </span>
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {p.work}
                    </span>
                  </div>
                  <span className="micro-label hidden shrink-0 text-muted-foreground sm:block">
                    {p.year}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7 — TESTIMONIALS — VERBATIM quotes as published on the owner's live
          site rapidconstruct.md (2026-07-13 audit, SPEC §2); RU = translations. */}
      <section
        aria-labelledby="testimonials-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("testimonials.eyebrow")}
            </p>
            <h2
              id="testimonials-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("testimonials.title")}
            </h2>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {testimonials.map((tm) => (
              <li
                key={tm.name}
                className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
              >
                <div className="flex gap-0.5 text-accent" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="star" size={16} />
                  ))}
                </div>
                <blockquote className="text-body text-surface-foreground">
                  “{tm.quote}”
                </blockquote>
                <div className="mt-auto flex flex-col">
                  <span className="text-caption font-semibold text-foreground">
                    {tm.name}
                  </span>
                  <span className="text-micro text-muted-foreground">
                    {tm.meta}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8 — FAQ (accessible details/summary + FAQPage JSON-LD) */}
      <section aria-labelledby="faq-title" className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">{t("faq.eyebrow")}</p>
            <h2
              id="faq-title"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </section>

      {/* 9 — CONTACT block */}
      <section
        aria-labelledby="contact-title"
        className="bg-inverse-background text-inverse-foreground"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-gutter py-16 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-5">
            <p className="micro-label text-inverse-accent">
              {t("contact.eyebrow")}
            </p>
            <h2
              id="contact-title"
              className="font-serif text-display-lg text-inverse-foreground"
            >
              {t("contact.title")}
            </h2>
            <p className="max-w-md text-body-lg text-inverse-muted-foreground">
              {t("contact.intro")}
            </p>
            <p className="rounded-lg border border-inverse-border bg-ink-800 p-4 text-caption text-inverse-foreground">
              {t("contact.promo")}
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
              >
                {t("contact.ctaQuote")}
                <Icon name="arrowRight" size={18} />
              </Link>
              <a
                href={`tel:${site.phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-inverse-foreground px-6 py-3 text-body font-semibold text-inverse-foreground transition-colors hover:bg-inverse-foreground hover:text-inverse-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
              >
                <Icon name="phone" size={18} />
                {t("contact.ctaCall")}
              </a>
            </div>
            <p className="text-caption text-inverse-muted-foreground">
              {t("contact.responsePromise")}
            </p>
          </div>

          {/* NAP — identical to footer/JSON-LD (single source: site.ts) */}
          <dl className="flex flex-col gap-5 self-center border-t border-inverse-border pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <ContactRow
              icon="mapPin"
              label={t("contact.addressLabel")}
              value={`${site.address.streetAddress}, ${site.address.addressLocality}`}
            />
            <ContactRow
              icon="phone"
              label={t("contact.phoneLabel")}
              value={site.phoneDisplay}
              href={`tel:${site.phone}`}
            />
            <ContactRow
              icon="mail"
              label={t("contact.emailLabel")}
              value={site.email}
              href={`mailto:${site.email}`}
            />
            <ContactRow
              icon="clock"
              label={t("contact.hoursLabel")}
              value="Lun–Sâm 08:00–17:00 · Dum: închis"
            />
          </dl>
        </div>
      </section>
    </main>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} size={20} className="mt-0.5 shrink-0 text-inverse-accent" />
      <div className="flex flex-col">
        <dt className="micro-label text-inverse-muted-foreground">{label}</dt>
        <dd className="text-body text-inverse-foreground">
          {href ? (
            <a
              href={href}
              className="transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
            >
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}
