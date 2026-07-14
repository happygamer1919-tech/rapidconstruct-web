import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Run the middleware on every request EXCEPT:
   * - `/_next` internals and framework data routes
   * - `/api` route handlers
   * - `/opengraph-image` — the sitewide branded share image is a locale-agnostic
   *   route handler (src/app/opengraph-image/route.tsx). Without this exclusion,
   *   next-intl rewrites `/opengraph-image` → `/ro/opengraph-image`, which has no
   *   route, so the OG image (referenced by absolute URL in every page's metadata)
   *   404s for social scrapers. Extension-less, so the dot rule below can't catch it.
   * - anything with a file extension (favicon, images, robots.txt,
   *   sitemap.xml, llms.txt, fonts, etc.)
   *
   * Matching `/` explicitly ensures the default locale (RO) is resolved for the
   * homepage without a `/ro` prefix.
   */
  matcher: ["/", "/((?!api|_next|_vercel|opengraph-image|.*\\..*).*)"],
};
