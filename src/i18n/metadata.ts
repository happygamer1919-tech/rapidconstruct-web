import type { Metadata } from "next";
import { routing, type AppLocale } from "./routing";
import { getPathname } from "./navigation";

/**
 * Canonical public host for absolute SEO URLs (canonical + hreflang).
 *
 * Configured via `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Defaults to the
 * final production domain — the SEO source of truth — so hreflang/canonical are
 * stable regardless of which preview host serves the build. Trailing slash is
 * stripped so we can safely concatenate pathnames.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rapidconstruct.md"
).replace(/\/+$/, "");

/** Build an absolute canonical-host URL for a locale + un-prefixed pathname. */
function absoluteUrl(locale: AppLocale, pathname: string): string {
  // `getPathname` applies the `as-needed` rule: no prefix for RO, `/ru` for RU.
  const localized = getPathname({ href: pathname || "/", locale });
  return `${SITE_URL}${localized}`;
}

/**
 * Reciprocal hreflang alternates (ro ⇄ ru, plus `x-default` → ro) plus a
 * locale-correct canonical, for a given route.
 *
 * @param locale   the current locale (drives the canonical URL)
 * @param pathname the route WITHOUT locale prefix, e.g. "" / "/" for the home
 *                 page, "/despre-noi" for a subpage. RU still uses RO-shaped
 *                 paths until RC-201 localizes the slugs.
 *
 * This prevents the old Tilda defect of missing hreflang (SPEC §7): every route
 * emits absolute, canonical-host alternates for all locales.
 */
export function localeAlternates(
  locale: AppLocale,
  pathname = "/",
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(l, pathname);
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, pathname);

  return {
    canonical: absoluteUrl(locale, pathname),
    languages,
  };
}
