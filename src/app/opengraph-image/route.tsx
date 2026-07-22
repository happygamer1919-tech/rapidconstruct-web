import { ImageResponse } from "next/og";
import { site } from "@/config/site";

/**
 * Sitewide branded share image, served at `/opengraph-image` (RC-006).
 *
 * Generated with next/og's ImageResponse — a real 1200×630 branded template, NOT
 * the favicon (the Tilda OG defect, SPEC §7). It is referenced by ABSOLUTE URL
 * from buildMetadata / the layout (og:image + twitter:image), so this is a plain
 * Route Handler rather than the `opengraph-image` file convention: the file
 * convention would auto-inject a *relative* image into pages that have no
 * metadataBase in scope (e.g. /_not-found), producing a localhost URL. Serving
 * it explicitly keeps every emitted image URL absolute and https.
 *
 * NOTE: because this lives OUTSIDE the `[locale]` tree and has no file
 * extension, the next-intl middleware would rewrite `/opengraph-image` →
 * `/ro/opengraph-image` (a 404). It is therefore excluded from the middleware
 * matcher (see src/middleware.ts) so this handler is reached directly.
 *
 * Colors mirror the RC-003 design tokens (globals.css); they are repeated here
 * as literals because next/og / Satori renders in isolation and cannot read the
 * Tailwind CSS variables. Text is Latin/RO only (the default Geist font has no
 * Cyrillic) — RO is the source of truth and this is a brand-forward image.
 */
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 };

// --- Brand tokens (see src/app/globals.css) ---
const BRAND = "#f26419"; // --color-brand-500 (orange accent)
const INK = "#1c1c1c"; // --color-ink-900 (charcoal base)
const PAPER = "#faf8f5"; // --color-neutral-50 (light text on charcoal)
const MUTED = "#d6ccbe"; // --color-neutral-300 (muted text on charcoal)

export function GET() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: INK,
        padding: 80,
      }}
    >
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 56,
            height: 56,
            background: BRAND,
            borderRadius: 12,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            color: PAPER,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          {site.name}
        </div>
      </div>

      {/* Headline slot + accent rule */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            color: PAPER,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 960,
          }}
        >
          Construcții & Renovări la cheie
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{ display: "flex", width: 72, height: 8, background: BRAND }}
          />
          <div style={{ display: "flex", color: MUTED, fontSize: 32 }}>
            {site.address.addressLocality} · Moldova
          </div>
        </div>
      </div>
    </div>,
    { ...SIZE },
  );
}
