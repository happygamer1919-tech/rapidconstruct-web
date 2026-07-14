import type { Metadata } from "next";
import { OG_LOCALE, SITE_URL, localeAlternates } from "@/i18n/metadata";
import type { AppLocale } from "@/i18n/routing";
import { site } from "@/config/site";

/**
 * Absolute URL of the sitewide branded share image (the `/opengraph-image`
 * route — see src/app/opengraph-image/route.tsx). Absolute so og:image /
 * twitter:image never depend on metadataBase resolution.
 */
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

/** Default share image with dimensions + alt, for openGraph/twitter `images`. */
export const DEFAULT_OG_IMAGE = {
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: "Rapid Construct & 3D Design — construcții și renovări în Chișinău",
};

/**
 * Central per-page metadata builder (RC-006).
 *
 * Every page's `generateMetadata` calls this so no page ever ships without a
 * unique title + description, an absolute https canonical, reciprocal hreflang,
 * and matching Open Graph / Twitter cards — the exact set of SEO fields the old
 * Tilda site was missing (SPEC §7).
 *
 * Canonical + hreflang are delegated to `localeAlternates` (the RC-004 helper)
 * so there is a single implementation of the `as-needed` locale URL rules.
 *
 * The document `<title>` gets the site name appended here (e.g. "About · Rapid
 * Construct & 3D Design") rather than via Next's `title.template`, because the
 * home page shares the root `[locale]` segment with its layout and Next does not
 * apply a same-segment layout template to a page. Baking it here makes the
 * suffix uniform across the home page and every child page. og:title /
 * twitter:title stay as the bare headline (cleaner social preview).
 *
 * og:image / twitter:image are set to an ABSOLUTE URL (SITE_URL/opengraph-image
 * by default, or the `ogImage` override) so every page carries a real branded
 * share image — the Tilda site used its favicon (SPEC §7).
 */
export type BuildMetadataArgs = {
  /** Page title WITHOUT the site-name suffix — the layout template appends it. */
  title: string;
  /** Meta description (unique per page). */
  description: string;
  /** Route path WITHOUT locale prefix, e.g. "/" or "/despre-noi". Default "/". */
  path?: string;
  /** Current locale — drives canonical, og:locale, and hreflang. */
  locale: AppLocale;
  /** Optional absolute URL to override the default branded share image. */
  ogImage?: string;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  locale,
  ogImage,
}: BuildMetadataArgs): Metadata {
  const alternates = localeAlternates(locale, path);
  const canonical = String(alternates.canonical);
  const images = ogImage ? [ogImage] : [DEFAULT_OG_IMAGE];

  return {
    title: `${title} · ${site.name}`,
    description,
    alternates,
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: site.name,
      locale: OG_LOCALE[locale],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
