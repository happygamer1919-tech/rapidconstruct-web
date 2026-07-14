/**
 * Single source of truth for the company's NAP (Name / Address / Phone) and
 * other identity facts. RC-005 was slated to own this file; it had not landed
 * when RC-006 (SEO plumbing) needed it, so it is created here from SPEC §2 and a
 * later merge reuses it. Everything that renders contact/business data — the
 * LocalBusiness JSON-LD, metadata, llms.txt, and (later) the footer — imports
 * from here so the values stay identical everywhere (the Tilda site drifted).
 *
 * Values are confirmed in docs/SPEC.md §2 (captured 2026-07-13).
 */
export const site = {
  /** Trading name, used as the JSON-LD `name` and OG `siteName`. */
  name: "Rapid Construct & 3D Design",

  /** Postal address (schema.org PostalAddress fields). */
  address: {
    streetAddress: "Nicolae Zelinski St 24",
    addressLocality: "Chișinău",
    addressCountry: "MD", // ISO 3166-1 alpha-2 (Moldova)
  },

  /** E.164 phone for `tel:` links and JSON-LD `telephone`. */
  phone: "+37376837180",
  /** Human-formatted phone for display. */
  phoneDisplay: "+373 76 837 180",

  email: "rapidconstructmd@gmail.com",

  /** Mon–Sat 08:00–17:00, Sun closed (SPEC §2). Days use schema.org day codes. */
  openingHours: {
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"] as const,
    opens: "08:00",
    closes: "17:00",
  },

  /**
   * Places served, for JSON-LD `areaServed` and GEO surface. Chișinău plus the
   * regional towns named in SPEC §1/§2.
   */
  areaServed: ["Chișinău", "Orhei", "Cahul", "Costești"] as const,

  /**
   * Social profile URLs for JSON-LD `sameAs`. SPEC §2 lists the PLATFORMS
   * (Instagram, Facebook, TikTok, YouTube) but not the actual profile URLs, and
   * we must not invent them — so this is intentionally empty for now.
   * TODO(social): fill in the real profile URLs once the owner confirms them,
   * then they flow automatically into `sameAs`.
   */
  social: [] as readonly string[],
} as const;
