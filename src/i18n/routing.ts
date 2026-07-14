import { defineRouting } from "next-intl/routing";

/**
 * Locale model (RC-004):
 * - `ro` is the default locale, served at `/` with NO `/ro` prefix.
 * - `ru` is the Russian mirror, served under `/ru`.
 *
 * `localePrefix: 'as-needed'` gives us exactly that: the default locale has no
 * prefix, every other locale is prefixed. RO is the source of truth for copy.
 *
 * RU slug localization (e.g. `/ru/kryshi`) is a LATER ticket (RC-201); for now
 * RU lives under `/ru/...` with RO-shaped paths.
 */
export const routing = defineRouting({
  locales: ["ro", "ru"],
  defaultLocale: "ro",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
