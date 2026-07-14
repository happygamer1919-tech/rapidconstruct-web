import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/metadata";

/**
 * robots.txt (RC-006). This is a public marketing site — allow all crawlers and
 * point them at the sitemap. No Disallow rules (unlike the old Tilda site, we
 * want to be indexed and cited). Sitemap URL is absolute https from SITE_URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
