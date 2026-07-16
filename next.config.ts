import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /**
   * RC-401: permanent (301/308) redirects from the old Tilda URLs to the new
   * site paths. Source of truth is docs/SPEC.md section 5. These fire only on
   * the new site; the real domain still points at Tilda, so shipping them now
   * is safe. `permanent: true` makes Next emit a 308 permanent redirect.
   *
   * Destinations stay locale-agnostic: `ro` is the default locale, served with
   * no prefix (src/i18n/routing.ts), so we do NOT hardcode `/ro/...`. Several
   * destinations (/case-constructii, /calculator-gard,
   * /politica-de-confidentialitate) are pages delivered by later tickets; each
   * redirect is still correct and starts working the moment its page lands.
   *
   * RC-301: `/1` follows docs/KEYWORD-MAP.md, NOT SPEC §5. SPEC sends it to
   * `/reparatii-la-cheie`, but that slug was never built and never will be:
   * KEYWORD-MAP settled on `renovari-la-cheie` (per RC-103) and told us to
   * "repoint the 301", which nobody did. So `/1` — a real Tilda URL — was
   * permanently redirecting into a 404 and throwing away its link equity.
   *
   * NOTE: SPEC section 5 also lists /despre-noi and /portofoliu mapping to the
   * SAME slug. A path that redirects to itself is an infinite loop in Next
   * (with localePrefix 'as-needed' those paths are served directly), so those
   * two rows are intentionally NOT emitted here. Their old Tilda slug already
   * equals the new slug, so the links resolve directly once each page exists.
   * Flagged for owner confirmation in mailbox/questions/q014.
   */
  async redirects() {
    return [
      { source: "/1", destination: "/renovari-la-cheie", permanent: true },
      { source: "/2", destination: "/case-constructii", permanent: true },
      { source: "/3", destination: "/fatade", permanent: true },
      { source: "/4", destination: "/finisaje", permanent: true },
      { source: "/5", destination: "/proiectare-3d", permanent: true },
      { source: "/6", destination: "/instalatii", permanent: true },
      { source: "/contacte", destination: "/contact", permanent: true },
      {
        source: "/calcul-acoperis",
        destination: "/calculator-acoperis",
        permanent: true,
      },
      {
        source: "/calcul-gard",
        destination: "/calculator-gard",
        permanent: true,
      },
      { source: "/page53648667.html", destination: "/", permanent: true },
      {
        source: "/privacypolicy",
        destination: "/politica-de-confidentialitate",
        permanent: true,
      },
    ];
  },
};

// Wires next-intl to the per-request config at src/i18n/request.ts so the
// `next-intl/config` alias resolves during build/prerender (RC-004).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
