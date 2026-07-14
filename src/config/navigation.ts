import type { IconName } from "@/components/icons";

/**
 * Shared navigation + service taxonomy for RC-101 (home + header + footer).
 *
 * hrefs and icon keys live in CODE (never translated); the visible labels and
 * descriptions live in the message catalog (`services.*`, `header.*`) so RO stays
 * the source of truth and RU carries TODO(ru-review). Header, footer and the
 * homepage services grid all read from THIS list so the six services can never
 * drift out of sync.
 *
 * The service pages themselves land in RC-103 — these links may 404 until then,
 * which is acceptable per the RC-101 brief.
 */
export type ServiceItem = {
  /** Route slug (RO). RU reuses the RO-shaped path until RC-201. */
  slug: string;
  /** Message key under the `services` namespace (title + desc). */
  key: string;
  /** Icon rendered on the service card. */
  icon: IconName;
};

export const SERVICES: readonly ServiceItem[] = [
  { slug: "/acoperisuri", key: "acoperisuri", icon: "roof" },
  { slug: "/fatade", key: "fatade", icon: "facade" },
  { slug: "/renovari-la-cheie", key: "renovari", icon: "hammer" },
  { slug: "/finisaje", key: "finisaje", icon: "brush" },
  { slug: "/proiectare-3d", key: "proiectare", icon: "cube" },
  { slug: "/instalatii", key: "instalatii", icon: "plug" },
] as const;

/** Primary content nav (excludes Home, which is the wordmark link). */
export type NavItem = { href: string; key: string };

export const PRIMARY_NAV: readonly NavItem[] = [
  { href: "/despre-noi", key: "despre" },
  { href: "/portofoliu", key: "portofoliu" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * Social platforms (SPEC §2 lists the platforms, not the profile URLs — those
 * are intentionally empty in site.ts, so these link to "#" with a TODO until the
 * owner supplies real URLs). Text links per the RC-101 brief.
 */
export const SOCIALS: readonly { label: string; href: string }[] = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
];
