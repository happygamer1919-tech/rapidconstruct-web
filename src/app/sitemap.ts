import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

/**
 * Generated sitemap (RC-006).
 *
 * SITEMAP OPTION: **only currently-resolving routes** (the safer option offered
 * in the RC-006 brief). Right now that is just the home route, emitted for both
 * locales. As the nav pages from SPEC §5 land (RC-1xx/RC-2xx), each page ticket
 * adds its route here. We deliberately do NOT list the 9 intended nav slugs yet,
 * because listing URLs that 404 would be a defect of its own.
 *
 * The temporary `/styleguide` dev aid is intentionally excluded (it is noindex).
 *
 * Every URL is an absolute https URL from SITE_URL (never http — Tilda defect,
 * SPEC §7). Each entry carries reciprocal `alternates.languages` (ro, ru,
 * x-default) so the sitemap itself declares hreflang.
 */

/** Un-prefixed route paths that currently resolve and should be indexed. */
const ROUTES = [
  "/",
  "/acoperisuri",
  "/calculator-acoperis",
  "/fatade",
  "/renovari-la-cheie",
  "/finisaje",
  "/proiectare-3d",
  "/instalatii",
  "/despre-noi",
  "/portofoliu",
  "/contact",
  "/chisinau",
  "/orhei",
  "/cahul",
];

function absolute(locale: (typeof routing.locales)[number], path: string) {
  // Strip the trailing slash on the root so the sitemap <loc> exactly matches
  // the page's canonical/hreflang URLs (Next normalizes those without a slash).
  return `${SITE_URL}${getPathname({ href: path, locale })}`.replace(/\/$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const languagesFor = (path: string) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = absolute(locale, path);
    }
    languages["x-default"] = absolute(routing.defaultLocale, path);
    return languages;
  };

  return ROUTES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absolute(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
      alternates: { languages: languagesFor(path) },
    })),
  );
}
