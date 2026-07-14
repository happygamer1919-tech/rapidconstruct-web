import type { Metadata } from "next";
import { routing, type AppLocale } from "./routing";
import { getPathname } from "./navigation";

/**
 * Canonical public host for absolute SEO URLs (canonical + hreflang + sitemap).
 *
 * Configured via `NEXT_PUBLIC_SITE_URL` (see `.env.example`). The fallback is the
 * public staging host, because the real domain (rapidconstruct.md) still serves
 * the old Tilda site until the launch cutover (RC-403). Emitting canonical/sitemap
 * URLs that resolve to the *current* content keeps the owner's pre-launch review
 * coherent; at RC-403 the env var is flipped to `https://rapidconstruct.md` and
 * every emitted URL follows. Always https (never http — Tilda defect, SPEC §7).
 * Trailing slash is stripped so we can safely concatenate pathnames.
 *
 * NOTE (RC-006): RC-004 originally defaulted this to the final production domain;
 * RC-006 changed the fallback to the staging host per its brief. The value is
 * env-driven either way — this only affects builds with no env set.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rapidconstruct-web.vercel.app"
).replace(/\/+$/, "");

/** Open Graph locale codes (`og:locale`) for each app locale. */
export const OG_LOCALE: Record<AppLocale, string> = {
  ro: "ro_RO",
  ru: "ru_RU",
};

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
