import { defineRouting } from "next-intl/routing";

/**
 * Locale model (RC-004):
 * - `ro` is the default locale, served at `/` with NO `/ro` prefix.
 * - `ru` is the Russian mirror, served under `/ru`.
 *
 * `localePrefix: 'as-needed'` gives us exactly that: the default locale has no
 * prefix, every other locale is prefixed. RO is the source of truth for copy.
 */

/**
 * Localized route slugs (RC-201).
 *
 * The KEY is the internal, RO-shaped path used everywhere in code (`<Link
 * href="/acoperisuri">`, `SERVICES[].slug`, the sitemap ROUTES list). The value
 * maps that to the public URL per locale. `getPathname` and `localeAlternates`
 * both read this, so canonical, hreflang and the sitemap follow automatically —
 * no call site has to change.
 *
 * Why bother: the RU pages sat on Romanian URLs (`/ru/acoperisuri`). A Russian
 * speaker in Moldova searches «ремонт крыши Кишинёв», and the URL is a ranking
 * and click signal. `/ru/kryshi` matches the language of the query; the
 * Romanian slug does not.
 *
 * Slugs are transliterated Russian, chosen to echo the head term of each page's
 * target query rather than to translate the Romanian literally:
 *   kryshi (крыши) · fasady (фасады) · remont-pod-klyuch (ремонт под ключ) ·
 *   otdelka (отделка) · elektrika-santehnika · proekt-3d · o-nas · kontakty ·
 *   kalkulyator-kryshi · portfolio · kishinev · orgeev · kagul
 *
 * ⚠️ Changing a slug here changes a public URL. Any slug that has ever been
 * indexed needs a 301 in `next.config.ts` (see the RC-201 block) and a case in
 * `tests/redirects.spec.ts`. Never edit one without doing both.
 */
export const pathnames = {
  "/": "/",
  "/acoperisuri": { ro: "/acoperisuri", ru: "/kryshi" },
  "/fatade": { ro: "/fatade", ru: "/fasady" },
  "/renovari-la-cheie": { ro: "/renovari-la-cheie", ru: "/remont-pod-klyuch" },
  "/finisaje": { ro: "/finisaje", ru: "/otdelka" },
  "/instalatii": { ro: "/instalatii", ru: "/elektrika-santehnika" },
  "/proiectare-3d": { ro: "/proiectare-3d", ru: "/proekt-3d" },
  "/despre-noi": { ro: "/despre-noi", ru: "/o-nas" },
  "/portofoliu": { ro: "/portofoliu", ru: "/portfolio" },
  "/contact": { ro: "/contact", ru: "/kontakty" },
  "/calculator-acoperis": {
    ro: "/calculator-acoperis",
    ru: "/kalkulyator-kryshi",
  },
  "/politica-de-confidentialitate": {
    ro: "/politica-de-confidentialitate",
    ru: "/politika-konfidencialnosti",
  },
  "/chisinau": { ro: "/chisinau", ru: "/kishinev" },
  "/orhei": { ro: "/orhei", ru: "/orgeev" },
  "/cahul": { ro: "/cahul", ru: "/kagul" },
  // Dev aid, noindex, excluded from the sitemap — no localized slug needed.
  "/styleguide": "/styleguide",
} as const;

export const routing = defineRouting({
  locales: ["ro", "ru"],
  defaultLocale: "ro",
  localePrefix: "as-needed",
  pathnames,
});

export type AppLocale = (typeof routing.locales)[number];

/**
 * Every internal route key. Using this instead of `string` for hrefs means a
 * typo or a link to a non-existent page is a COMPILE error, not a 404 found in
 * production — which is exactly how `/portofoliu` shipped broken in the nav.
 */
export type Pathname = keyof typeof pathnames;
