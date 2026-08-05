import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/icons";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type Faq = { q: string; a: string };

/**
 * FAQ hub — the ONE place questions live (owner direction 2026-08-05).
 *
 * Every service page used to carry its own FAQ block; they are consolidated
 * here, grouped by service and sorted alphabetically by the group label, so a
 * visitor scanning for "Fațade" finds every facade question in one spot.
 * City-page FAQs deliberately stay put: they are location-specific ("veniți la
 * măsurători în Orhei?") and are the whole GEO point of those pages.
 *
 * `anchor` gives each group a stable #id, which the service pages link to.
 * The FAQPage JSON-LD is built from the same arrays rendered below, so the
 * visible copy and the structured data can never drift apart.
 */
const GROUPS = [
  { anchor: "general", key: "home.faq.items", labelKey: "faqPage.groups.general" },
  { anchor: "acoperisuri", key: "roofPage.faq.items", labelKey: "services.acoperisuri.title" },
  { anchor: "fatade", key: "servicePages.fatade.faq.items", labelKey: "services.fatade.title" },
  { anchor: "renovari", key: "servicePages.renovari.faq.items", labelKey: "services.renovari.title" },
  { anchor: "finisaje", key: "servicePages.finisaje.faq.items", labelKey: "services.finisaje.title" },
  { anchor: "proiectare", key: "servicePages.proiectare.faq.items", labelKey: "services.proiectare.title" },
  { anchor: "instalatii", key: "servicePages.instalatii.faq.items", labelKey: "services.instalatii.title" },
  { anchor: "industriale", key: "servicePages.industriale.faq.items", labelKey: "services.industriale.title" },
  { anchor: "terasamente", key: "servicePages.terasamente.faq.items", labelKey: "services.terasamente.title" },
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
    namespace: "faqPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/intrebari-frecvente",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faqPage");
  const tRoot = await getTranslations();

  // Resolve, then sort by the localized label so RO and RU each read
  // alphabetically in their own language.
  const groups = GROUPS.map((g) => ({
    anchor: g.anchor,
    label: tRoot(g.labelKey),
    items: tRoot.raw(g.key) as Faq[],
  }))
    .filter((g) => g.items?.length)
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    ),
  };

  return (
    <main className="flex-1">
      <section aria-labelledby="faq-title" className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <p className="micro-label text-accent-strong">{t("eyebrow")}</p>
            <h1
              id="faq-title"
              className="font-serif text-display-lg text-foreground"
            >
              {t("title")}
            </h1>
            <p className="max-w-2xl text-body-lg text-muted-foreground">
              {t("intro")}
            </p>
          </div>

          {/* Jump list — with 58 questions the page needs a way in. */}
          <nav aria-label={t("title")} className="mb-10 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.anchor}
                href={`#${g.anchor}`}
                className="rounded-full border border-border px-3 py-1.5 text-caption font-medium text-foreground transition-colors hover:border-accent-strong hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
              >
                {g.label}
                <span className="ml-1.5 text-muted-foreground">
                  {g.items.length}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-12">
            {groups.map((g) => (
              <section
                key={g.anchor}
                id={g.anchor}
                aria-labelledby={`faq-${g.anchor}`}
                className="scroll-mt-24"
              >
                <h2
                  id={`faq-${g.anchor}`}
                  className="mb-4 font-serif text-h3 text-foreground"
                >
                  {g.label}
                </h2>
                <div className="flex flex-col divide-y divide-border border-y border-border">
                  {g.items.map((f) => (
                    <details key={f.q} className="group py-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-body font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong">
                        {f.q}
                        <Icon
                          name="chevronDown"
                          size={20}
                          className="shrink-0 text-accent-strong transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <p className="pb-4 text-body text-muted-foreground">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </section>
    </main>
  );
}
