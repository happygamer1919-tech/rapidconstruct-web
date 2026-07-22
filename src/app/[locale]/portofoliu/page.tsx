import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { site } from "@/config/site";
import { SITE_URL } from "@/i18n/metadata";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type Project = { tag: string; title: string; desc: string; alt: string };

/**
 * Photo files for the portfolio grid (RC-104), paired with `projects.items` BY
 * INDEX. The owner supplied these as drone stills on 2026-07-22; originals live
 * outside the repo (`~/rc-owner-assets/drone-2026-07-22/`) and these are the
 * 1600px webp derivatives.
 *
 * The copy in `messages/*.json` describes only what is VISIBLE in each frame.
 * We deliberately publish no location, floor area or completion year: nobody has
 * confirmed those facts, and inventing them on a page whose whole job is proof
 * would be the one thing that discredits it. Q-14 asks the owner for the real
 * metadata; when it lands, add it here and extend the ItemList JSON-LD.
 *
 * `priority` on the first image only — it is the LCP candidate on this route.
 */
const PHOTOS = [
  "p-0018",
  "p-0020",
  "p-0021",
  "p-0022",
  "p-0023",
  "p-0024",
  "p-0034",
  "p-0037",
] as const;

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
    namespace: "portfolioPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/portofoliu",
    title: t("title"),
    description: t("description"),
  });
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const t = await getTranslations("portfolioPage");
  const projects = t.raw("projects.items") as Project[];

  const pageUrl = `${SITE_URL}${getPathname({ href: "/portofoliu", locale: safeLocale })}`;

  // ItemList of the works shown, so the gallery is a crawlable surface rather
  // than eight opaque <img> tags. Each item points at its own image URL.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("seo.title"),
    description: t("seo.description"),
    url: pageUrl,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.title,
        description: p.desc,
        image: `${SITE_URL}/portofoliu/${PHOTOS[i]}.webp`,
        creator: { "@type": "Organization", name: site.name },
      },
    })),
  };

  return (
    <main id="main">
      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="micro-label text-accent-strong">{t("hero.eyebrow")}</p>
            <h1 className="font-serif text-display-xl text-foreground">
              {t("hero.h1")}
            </h1>
            <p className="text-body-lg text-muted-foreground">
              {t("hero.intro")}
            </p>
          </div>
        </div>
      </section>

      {/* WORKS GRID */}
      <section
        aria-labelledby="portfolio-works-title"
        className="border-b border-border bg-muted"
      >
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
          <h2 id="portfolio-works-title" className="sr-only">
            {t("hero.h1")}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal as="li" key={p.title} delay={Math.min(i, 5) * 0.06}>
                <figure className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <Image
                      src={`/portofoliu/${PHOTOS[i]}.webp`}
                      alt={p.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      priority={i === 0}
                    />
                  </div>
                  <figcaption className="flex flex-1 flex-col gap-2 p-6">
                    <p className="micro-label text-accent-strong">{p.tag}</p>
                    <h3 className="text-body font-semibold text-surface-foreground">
                      {p.title}
                    </h3>
                    <p className="text-caption text-muted-foreground">
                      {p.desc}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-inverse-background text-inverse-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-gutter py-16 lg:py-20">
          <h2 className="max-w-2xl font-serif text-display-lg text-inverse-foreground">
            {t("cta.title")}
          </h2>
          <p className="max-w-xl text-body-lg text-inverse-muted-foreground">
            {t("cta.desc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
            >
              {t("cta.button")}
              <Icon name="arrowRight" size={18} />
            </Link>
            <a
              href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-inverse-foreground px-6 py-3 text-body font-semibold text-inverse-foreground transition-colors hover:bg-inverse-foreground hover:text-inverse-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-accent"
            >
              <Icon name="phone" size={18} />
              {t("cta.secondary")}
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </main>
  );
}
