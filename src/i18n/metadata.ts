import type { Metadata } from "next";
import { routing, type AppLocale, type Pathname } from "./routing";
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
const STAGING_HOST = "https://rapidconstruct-web.vercel.app";

// RC-402 launch guard. The staging fallback is right for previews, but shipping
// it to PRODUCTION would publish canonical + hreflang + sitemap + og:image URLs
// that all point at the vercel.app host — telling Google the real domain is a
// duplicate of staging on the very day we cut over. Nothing used to catch that:
// the Vercel project currently has ZERO environment variables, so a production
// deploy today would silently do exactly this. Fail the build instead.
if (
  process.env.VERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required for production builds (RC-403 cutover).\n" +
      `Without it every canonical/hreflang/sitemap URL points at ${STAGING_HOST}.\n` +
      "Set it in the Vercel project, Production scope:\n" +
      "  vercel env add NEXT_PUBLIC_SITE_URL production\n" +
      "See docs/LAUNCH-CHECKLIST.md.",
  );
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? STAGING_HOST
).replace(/\/+$/, "");

/**
 * True when this build serves the throwaway staging host rather than the real
 * domain — i.e. `NEXT_PUBLIC_SITE_URL` is unset, so every canonical, hreflang
 * and sitemap URL points at `rapidconstruct-web.vercel.app`.
 *
 * Such a build MUST NOT be indexed. Until Q-08 was turned off, the Vercel login
 * wall was the only thing keeping Google out; with previews public, an indexed
 * staging copy would compete with rapidconstruct.md as a duplicate the moment we
 * cut over — the same damage the production guard above prevents, via a
 * different door. `robots.ts` and the root layout both read this.
 *
 * Self-clearing: it can never be true in production, because the guard above
 * throws if `NEXT_PUBLIC_SITE_URL` is missing there. Set the real domain and
 * indexing switches on by itself — nothing to remember to undo.
 */
export const IS_UNINDEXABLE_STAGING = SITE_URL === STAGING_HOST;

/** Open Graph locale codes (`og:locale`) for each app locale. */
export const OG_LOCALE: Record<AppLocale, string> = {
  ro: "ro_RO",
  ru: "ru_RU",
};

/** Build an absolute canonical-host URL for a locale + un-prefixed pathname. */
function absoluteUrl(locale: AppLocale, pathname: Pathname): string {
  // `getPathname` applies the `as-needed` rule: no prefix for RO, `/ru` for RU.
  const localized = getPathname({ href: pathname, locale });
  return `${SITE_URL}${localized}`;
}

/**
 * Reciprocal hreflang alternates (ro ⇄ ru, plus `x-default` → ro) plus a
 * locale-correct canonical, for a given route.
 *
 * @param locale   the current locale (drives the canonical URL)
 * @param pathname the INTERNAL route key (RO-shaped), e.g. "/" for the home
 *                 page or "/despre-noi" for a subpage. The public RU URL is
 *                 resolved from routing `pathnames` (RC-201), so callers never
 *                 pass a localized slug.
 *
 * This prevents the old Tilda defect of missing hreflang (SPEC §7): every route
 * emits absolute, canonical-host alternates for all locales.
 */
export function localeAlternates(
  locale: AppLocale,
  pathname: Pathname = "/",
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
