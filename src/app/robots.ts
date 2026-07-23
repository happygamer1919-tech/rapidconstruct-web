import type { MetadataRoute } from "next";
import { IS_UNINDEXABLE_STAGING, SITE_URL } from "@/i18n/metadata";

/**
 * robots.txt (RC-006). This is a public marketing site — allow all crawlers and
 * point them at the sitemap. No Disallow rules (unlike the old Tilda site, we
 * want to be indexed and cited). Sitemap URL is absolute https from SITE_URL.
 *
 * EXCEPT on the staging host (Q-08). Deployment Protection used to keep crawlers
 * off `rapidconstruct-web.vercel.app`; now that preview links are public so the
 * owner can review them, robots.txt is what keeps the staging copy out of the
 * index. An indexed staging site would compete with rapidconstruct.md as a
 * duplicate on cutover day. Flips back to "allow all" by itself once
 * NEXT_PUBLIC_SITE_URL names the real domain — see IS_UNINDEXABLE_STAGING.
 */
export default function robots(): MetadataRoute.Robots {
  if (IS_UNINDEXABLE_STAGING) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
