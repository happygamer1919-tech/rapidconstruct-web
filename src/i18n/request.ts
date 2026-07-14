import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Per-request configuration for next-intl (v4 App Router).
 *
 * `requestLocale` corresponds to the matched `[locale]` segment. Because that
 * segment effectively acts as a catch-all for unknown routes, we validate it
 * with `hasLocale` and fall back to the default locale on anything unknown
 * (e.g. `/de/...`) instead of throwing a raw 500.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
