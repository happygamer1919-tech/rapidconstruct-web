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

  /**
   * Short brand used for the document `<title>` suffix ONLY.
   *
   * The full trading name costs 30 characters (" · Rapid Construct & 3D Design")
   * on every page. Google renders roughly 60, so the suffix alone was eating
   * half the budget: measured across all 26 page titles, 22 exceeded 60
   * characters purely because of it — the titles themselves are 33–49 chars and
   * keyword-led. Shortening the suffix buys 13 characters everywhere without
   * touching a single deliberate title decision (e.g. the price-first
   * /acoperisuri titles from PR #45).
   *
   * JSON-LD `name`, `og:siteName` and the share image keep the full trading
   * name — those are identity, not search snippets.
   */
  shortName: "Rapid Construct",

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

  /**
   * Click-to-chat channels for the floating ChatButtons widget (RC-106). A
   * channel that is `true` renders a button; `null` means "wired but not live
   * yet", so Telegram can be switched on later once the owner confirms a
   * destination (see docs/QUESTIONS.md) without touching the component.
   */
  chat: {
    whatsapp: true,
    viber: true,
    telegram: null,
  },
} as const;
