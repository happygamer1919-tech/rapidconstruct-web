import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Run the middleware on every request EXCEPT:
   * - `/_next` internals and framework data routes
   * - `/api` route handlers
   * - anything with a file extension (favicon, images, robots.txt,
   *   sitemap.xml, llms.txt, fonts, etc.)
   *
   * Matching `/` explicitly ensures the default locale (RO) is resolved for the
   * homepage without a `/ro` prefix.
   */
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
