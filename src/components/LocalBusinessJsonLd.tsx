import { SITE_URL } from "@/i18n/metadata";
import { OG_IMAGE_URL } from "@/lib/seo";
import { site } from "@/config/site";

/**
 * Sitewide LocalBusiness structured data (RC-006).
 *
 * Rendered once in the root (`[locale]`) layout so every page carries it — this
 * is the JSON-LD the Tilda site never had (SPEC §7) and is a primary GEO surface
 * (AI engines cite structured facts). All values come from `site.ts` (single NAP
 * source) so they can never drift from the visible contact details.
 *
 * `HomeAndConstructionBusiness` is the most specific schema.org LocalBusiness
 * subtype for a construction/renovation company.
 *
 * Q-07 GUARD: the claimed review score / counts ("4.9/5 from 250+ reviews",
 * "500+ projects", "15+ years") are NOT yet confirmed, so `aggregateRating`,
 * `reviewCount`, and experience counts are deliberately omitted. See the TODO
 * below for exactly where they slot in once the owner confirms the numbers.
 */
export default function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name,
    url: SITE_URL,
    image: OG_IMAGE_URL,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressCountry: site.address.addressCountry,
    },
    areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: site.openingHours.days.map(
          (d) =>
            ({
              Mo: "Monday",
              Tu: "Tuesday",
              We: "Wednesday",
              Th: "Thursday",
              Fr: "Friday",
              Sa: "Saturday",
              Su: "Sunday",
            })[d],
        ),
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
    ],
    // Only emit sameAs when we actually have real profile URLs — never invent.
    ...(site.social.length > 0 ? { sameAs: site.social } : {}),
    // TODO(Q-07): once the owner confirms the numbers, add here:
    //   aggregateRating: { "@type": "AggregateRating", ratingValue, reviewCount }
    //   and any experience/project counts. Do NOT publish them before RC-402.
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; no user input is involved.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
