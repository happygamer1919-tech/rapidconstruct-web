import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon, type IconName } from "@/components/icons";
import ContactForm from "@/components/ContactForm";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/i18n/metadata";

type PageProps = { params: Promise<{ locale: string }> };

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
    namespace: "contactPage.seo",
  });
  return buildMetadata({
    locale: safeLocale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contactPage");
  // The promo line is shared with the homepage contact block (single source).
  const tHomeContact = await getTranslations("home.contact");

  // ContactPage + LocalBusiness reference (GEO/SEO surface, AGENTS.md). The
  // LocalBusiness facts all come from site.ts so they match the sitewide
  // LocalBusiness JSON-LD and the NAP block rendered below.
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("seo.title"),
    description: t("seo.description"),
    url: `${SITE_URL}${locale === "ro" ? "" : "/ru"}/contact`,
    mainEntity: {
      "@type": "LocalBusiness",
      name: site.name,
      url: SITE_URL,
      telephone: site.phone,
      email: site.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.streetAddress,
        addressLocality: site.address.addressLocality,
        addressCountry: site.address.addressCountry,
      },
      areaServed: site.areaServed,
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: site.openingHours.days,
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
    },
  };

  return (
    <main className="flex-1">
      {/* HERO — invite tone, instant server render (no gating) */}
      <section className="border-b border-border bg-inverse-background text-inverse-foreground">
        <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
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
            <p className="flex items-center gap-2 text-caption font-medium text-inverse-foreground">
              <Icon
                name="clock"
                size={18}
                className="shrink-0 text-inverse-accent"
              />
              {t("response")}
            </p>
          </div>
        </div>
      </section>

      {/* BODY — form (left) + contact details / promo (right) */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-gutter py-16 lg:grid-cols-[3fr_2fr] lg:py-20">
          {/* Lead form */}
          <div>
            <ContactForm locale={locale} />
          </div>

          {/* NAP + promo — identical values to footer/home (source: site.ts) */}
          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="mb-5 text-h3 font-semibold text-foreground">
                {t("nap.title")}
              </h2>
              <dl className="flex flex-col gap-5">
                <ContactRow
                  icon="mapPin"
                  label={t("nap.addressLabel")}
                  value={`${site.address.streetAddress}, ${site.address.addressLocality}`}
                />
                <ContactRow
                  icon="phone"
                  label={t("nap.phoneLabel")}
                  value={site.phoneDisplay}
                  href={`tel:${site.phone}`}
                />
                <ContactRow
                  icon="mail"
                  label={t("nap.emailLabel")}
                  value={site.email}
                  href={`mailto:${site.email}`}
                />
                <ContactRow
                  icon="clock"
                  label={t("nap.hoursLabel")}
                  value={t("nap.hours")}
                />
              </dl>
            </div>

            <p className="rounded-lg border border-border bg-muted p-4 text-caption text-foreground">
              {tHomeContact("promo")}
            </p>
          </aside>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
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
      <Icon
        name={icon}
        size={20}
        className="mt-0.5 shrink-0 text-accent-strong"
      />
      <div className="flex flex-col">
        <dt className="micro-label text-muted-foreground">{label}</dt>
        <dd className="text-body text-foreground">
          {href ? (
            <a
              href={href}
              className="transition-colors hover:text-accent-strong focus-visible:text-accent-strong focus-visible:outline-none"
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
