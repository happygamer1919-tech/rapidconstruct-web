import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/icons";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type Faq = { q: string; a: string };

/**
 * FAQ hub (moved off the homepage 2026-08-04, owner direction: the homepage
 * carried too much). All 20 answer-shaped FAQs (RC-302 GEO program) live here
 * with the FAQPage JSON-LD; the copy still comes from `home.faq.items` so the
 * move could not fork the content. Linked from header+footer on every page.
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
  const tHome = await getTranslations("home");
  const faqs = tHome.raw("faq.items") as Faq[];

  // Built from the same copy rendered below so the visible FAQ and the
  // JSON-LD can never diverge (same rule as the homepage section it replaces).
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
    </main>
  );
}
