import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/metadata";
import { routing, type Pathname } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

/**
 * Generated sitemap (RC-006).
 *
 * SITEMAP OPTION: **only currently-resolving routes** (the safer option offered
 * in the RC-006 brief). Each page ticket adds its route to `ROUTES` below as it
 * lands; we never list a URL that would 404, since that is a defect of its own.
 *
 * The `/styleguide` dev aid is intentionally excluded (it is
 * `robots: { index: false, follow: false }` in `styleguide/page.tsx`).
 *
 * EXPECTED `<loc>` COUNT (self-check for RC-402 — count = ROUTES.length × locales):
 *   - `main` today: 15 routes × 2 locales = **30** `<loc>` entries.
 *   - After `feature/configurator` merges: it adds `/configurator` (RO) and
 *     `/ru/konfigurator` (RU) → 17 routes × 2 = **32**. When you merge that lane,
 *     re-run the build and confirm the sitemap emits 32, then bump the count in
 *     `docs/LAUNCH-CHECKLIST.md` §2. If you edit `ROUTES`, update both numbers.
 * Verify with: `npm run build` then
 *   `grep -c "<loc>" .next/server/app/sitemap.xml.body`.
 *
 * Every URL is an absolute https URL from SITE_URL (never http — Tilda defect,
 * SPEC §7). Each entry carries reciprocal `alternates.languages` (ro, ru,
 * x-default) so the sitemap itself declares hreflang.
 */

/** Un-prefixed route paths that currently resolve and should be indexed. */
const ROUTES: Pathname[] = [
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
  "/politica-de-confidentialitate",
  "/chisinau",
  "/orhei",
  "/cahul",
];

function absolute(locale: (typeof routing.locales)[number], path: Pathname) {
  // Strip the trailing slash on the root so the sitemap <loc> exactly matches
  // the page's canonical/hreflang URLs (Next normalizes those without a slash).
  return `${SITE_URL}${getPathname({ href: path, locale })}`.replace(/\/$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const languagesFor = (path: Pathname) => {
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
