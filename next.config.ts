import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

// Wires next-intl to the per-request config at src/i18n/request.ts so the
// `next-intl/config` alias resolves during build/prerender (RC-004).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
