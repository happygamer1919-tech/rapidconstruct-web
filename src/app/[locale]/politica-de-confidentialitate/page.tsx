import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type Section = { title: string; body: string };

/**
 * Privacy policy (RC-402 launch requirement).
 *
 * The old Tilda site had `/privacypolicy`, which redirected here — into a 404 —
 * while the contact form was already collecting a name and a phone number. This
 * page closes both holes.
 *
 * ⚠️ The copy describes what the CODE ACTUALLY DOES, verified before writing:
 *   - no analytics, tag manager or third-party scripts anywhere in src/
 *   - no cookies; localStorage holds only the promo-bar dismissal id
 *   - `next/font` self-hosts the Google fonts at build time, so a visit sends
 *     nothing to Google at runtime
 *   - the only runtime outbound call is Resend, to deliver the lead email
 *   - the form collects nume, telefon, mesaj, locale, timestamp (+ calculator
 *     config when the lead comes from /calculator-acoperis)
 *
 * If any of that changes — adding GA4 under RC-404 is the obvious one — this
 * page MUST change in the same PR. A privacy policy that describes a site you
 * no longer run is worse than none, because it is a written false statement.
 *
 * Deliberately NOT stated: the registered legal entity and IDNO, and a concrete
 * retention period in months. Nobody confirmed those, and inventing them here
 * would be inventing a legal fact. Q-16 asks the owner; the retention wording
 * used instead ("as long as needed to answer, plus what accounting law requires")
 * is true as written.
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
    namespace: "privacyPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/politica-de-confidentialitate",
    title: t("title"),
    description: t("description"),
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacyPage");
  const sections = t.raw("sections") as Section[];

  return (
    <main id="main">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="flex flex-col gap-4">
            <p className="micro-label text-accent-strong">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-serif text-display-xl text-foreground">
              {t("hero.h1")}
            </h1>
            <p className="text-caption text-muted-foreground">
              {t("hero.updated")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="mx-auto w-full max-w-3xl px-gutter py-16 lg:py-20">
          <div className="flex flex-col gap-10">
            {sections.map((s) => (
              <article key={s.title} className="flex flex-col gap-3">
                <h2 className="font-serif text-display-sm text-foreground">
                  {s.title}
                </h2>
                <p className="text-body text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
