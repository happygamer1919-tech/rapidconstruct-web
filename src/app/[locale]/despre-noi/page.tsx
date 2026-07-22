import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL, localeAlternates } from "@/i18n/metadata";

type PageProps = { params: Promise<{ locale: string }> };

// Shapes read from the message catalog via t.raw (RO source of truth).
type Value = { title: string; desc: string };
type Step = { title: string; desc: string };
type Stat = { value: string; label: string };

// Icons for the four values, aligned by index to aboutPage.values.items.
// Reused from the home trust-badge icon set (shield/certificate/receipt/support).
const VALUE_ICONS: IconName[] = ["shield", "certificate", "receipt", "support"];

// Pre-render both locales at build time (SSG), same as the service pages.
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
    namespace: "aboutPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/despre-noi",
    title: t("title"),
    description: t("description"),
  });
}

export default async function DespreNoiPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const t = await getTranslations("aboutPage");
  // Stats reuse the home band's copy so the numbers stay single-sourced.
  const tHome = await getTranslations("home");

  const values = t.raw("values.items") as Value[];
  const steps = t.raw("process.steps") as Step[];
  const stats = tHome.raw("stats.items") as Stat[];

  // AboutPage structured data pointing at the sitewide LocalBusiness node.
  // No rating/experience counts here — those stay guarded in LocalBusinessJsonLd
  // (Q-07) until the owner confirms the numbers. The stats below are visible,
  // crawlable text (GEO surface) but are not asserted as schema claims.
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("seo.title"),
    url: String(localeAlternates(safeLocale, "/despre-noi").canonical),
    mainEntity: {
      "@type": "HomeAndConstructionBusiness",
      name: site.name,
      url: SITE_URL,
      telephone: site.phone,
      areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    },
  };

  return (
    <main className="flex-1">
      {/* HERO — editorial intro, first person plural. No stock/invented photo:
          real team/site photos are pending Q-06 (see placeholder band below). */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto w-full max-w-4xl px-gutter py-20 lg:py-28">
          <div className="flex flex-col gap-6">
            <p className="micro-label text-accent-strong">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-serif text-display-xl text-foreground">
              {t("hero.h1")}
            </h1>
            <p className="max-w-2xl text-body-lg text-muted-foreground">
              {t("hero.intro")}
            </p>
            <p className="max-w-2xl text-body-lg text-muted-foreground">
              {t("hero.intro2")}
            </p>
          </div>
        </div>
      </section>

      {/* TEAM / SITE PHOTOS — placeholder slots, real photos pending Q-06 */}
      <section aria-hidden="true" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-gutter py-10">
          <ul className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="aspect-[4/3] rounded-lg border border-dashed border-border bg-surface"
              >
                {/* TODO(photos): real team/site photos pending Q-06 */}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* VALUES — what the client can rely on (reuses badge icon set) */}
      <section
        aria-labelledby="values-title"
        className="border-b border-border"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("values.eyebrow")}
            </p>
            <h2
              id="values-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("values.title")}
            </h2>
          </div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {values.map((v, i) => (
              <li key={v.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-accent-strong">
                  <Icon name={VALUE_ICONS[i]} size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-body font-semibold text-foreground">
                    {v.title}
                  </h3>
                  <p className="text-caption text-muted-foreground">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STATS band — real numbers in server HTML (reuses home.stats copy) */}
      <section
        aria-labelledby="about-stats-title"
        className="bg-inverse-background text-inverse-foreground"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16">
          <h2 id="about-stats-title" className="sr-only">
            {tHome("stats.title")}
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

      {/* CUM LUCRĂM — four steps (reuses the roof-page process pattern) */}
      <section
        aria-labelledby="about-process-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">
              {t("process.eyebrow")}
            </p>
            <h2
              id="about-process-title"
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

      {/* CTA — to /contact + tel */}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
    </main>
  );
}
