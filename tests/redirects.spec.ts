import { test, expect } from "@playwright/test";

/**
 * RC-401: Tilda -> new permanent redirects.
 *
 * Slug source of truth is docs/KEYWORD-MAP.md. (SPEC §5 is stale on the `/1`
 * row — see RC-301 below.) Each old Tilda path must issue a permanent redirect
 * to its new path. `permanent: true` in next.config.ts makes Next emit a 308
 * (older clients may see 301); both are accepted here.
 *
 * The per-row check asserts the FIRST hop only (maxRedirects: 0) via the
 * Location header, because several destinations are delivered by later tickets
 * and would 404 if followed — the redirect itself is still correct.
 *
 * RC-301 (2026-07-16): that first-hop-only design is precisely why a real bug
 * survived this suite. `/1` pointed at `/reparatii-la-cheie`, a slug that was
 * never built and is not planned, so a live Tilda URL 301'd into a 404 and threw
 * its link equity away — and this test passed the whole time, because the header
 * matched SPEC. Asserting the header alone cannot catch a redirect to nowhere.
 * Hence `destination resolves` below: rows whose target is supposed to be live
 * are now FOLLOWED and must return 200. Rows still awaiting their page are
 * listed in PENDING_PAGES, so when one lands, its guard turns on by deletion.
 *
 * NOTE: SPEC section 5 also lists /despre-noi and /portofoliu mapping to the
 * same slug. A path that redirects to itself is an infinite loop, so those two
 * rows are intentionally not emitted (see next.config.ts + mailbox q014) and are
 * therefore not asserted here.
 */

const REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/1", to: "/renovari-la-cheie" },
  { from: "/2", to: "/portofoliu" },
  { from: "/3", to: "/fatade" },
  { from: "/4", to: "/finisaje" },
  { from: "/5", to: "/proiectare-3d" },
  { from: "/6", to: "/instalatii" },
  { from: "/contacte", to: "/contact" },
  { from: "/calcul-acoperis", to: "/calculator-acoperis" },
  { from: "/calcul-gard", to: "/contact" },
  { from: "/page53648667.html", to: "/" },
  { from: "/privacypolicy", to: "/politica-de-confidentialitate" },
];

/**
 * Destinations that do not have a page YET. Each is a real backlog ticket, not
 * an excuse: delete the entry when the page lands and the guard starts enforcing
 * it. Anything NOT in this list must resolve 200 — that is what catches a
 * redirect aimed at a slug nobody ever built.
 */
const PENDING_PAGES: ReadonlySet<string> = new Set([
  // Emptied 2026-07-22 (RC-402 launch prep). Every redirect destination now
  // resolves 200: /2 and /calcul-gard were repointed at real pages, and the
  // privacy policy was built. Keep this set EMPTY unless a genuinely-pending
  // page forces an entry — each one is a redirect we knowingly aim at a 404.
]);

test.describe("RC-401 Tilda -> new permanent redirects", () => {
  for (const { from, to } of REDIRECTS) {
    test(`${from} permanently redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      const status = res.status();
      expect(
        status === 308 || status === 301,
        `${from} returned ${status}, expected a permanent redirect (308 or 301)`,
      ).toBeTruthy();
      expect(res.headers()["location"], `${from} Location header`).toBe(to);
    });
  }

  // The guard that would have caught RC-301: a redirect is only worth anything
  // if its destination actually exists. Following each live-by-now target keeps
  // us from ever again 301-ing a real Tilda URL into a 404.
  for (const { from, to } of REDIRECTS) {
    if (PENDING_PAGES.has(to)) continue;
    test(`${from} lands on a real page, not a 404 (${to})`, async ({
      request,
    }) => {
      const res = await request.get(from); // follow the hop this time
      expect(
        res.status(),
        `${from} -> ${to} resolved ${res.status()}. The redirect points at a page that does not exist. Either the destination slug is wrong, or the page is genuinely still to come — in which case add "${to}" to PENDING_PAGES with its ticket.`,
      ).toBe(200);
    });
  }

  // Belt-and-braces: /contact is a real page today, so following the redirect
  // must actually leave the old /contacte path and land on /contact.
  test("following /contacte lands on the /contact path", async ({ page }) => {
    const res = await page.goto("/contacte");
    expect(res, "no response for /contacte").not.toBeNull();
    expect(new URL(page.url()).pathname).toBe("/contact");
  });

  // Identity rows from SPEC section 5 must NOT be self-redirects (that loops).
  // Guard that the two unchanged slugs still resolve as normal pages rather than
  // redirecting to themselves; /despre-noi is live today (RC-109).
  test("/despre-noi is not a self-redirect (no loop)", async ({ request }) => {
    const res = await request.get("/despre-noi", { maxRedirects: 0 });
    const loc = res.headers()["location"];
    expect(
      loc,
      "/despre-noi must not redirect to itself (infinite loop)",
    ).not.toBe("/despre-noi");
  });
});

/**
 * RC-201 — the RU mirror moved from Romanian paths (`/ru/acoperisuri`) to
 * localized Russian slugs (`/ru/kryshi`).
 *
 * These are the highest-risk redirects on the site: they cover EVERY RU page at
 * once, so a broken row does not degrade one page, it 404s a whole locale. Each
 * old URL must 301/308 to its new slug AND the new slug must actually be a live
 * 200 — the follow-through assertion is the one that matters, because a redirect
 * into a 404 is worse than no redirect at all (that is how `/1` was broken for
 * weeks before RC-401 caught it).
 *
 * Keep this table in lockstep with `pathnames` in src/i18n/routing.ts and the
 * RC-201 block in next.config.ts. Three places, one fact.
 */
const RU_SLUG_MOVES: ReadonlyArray<readonly [string, string]> = [
  ["/ru/acoperisuri", "/ru/kryshi"],
  ["/ru/fatade", "/ru/fasady"],
  ["/ru/renovari-la-cheie", "/ru/remont-pod-klyuch"],
  ["/ru/finisaje", "/ru/otdelka"],
  ["/ru/instalatii", "/ru/elektrika-santehnika"],
  ["/ru/proiectare-3d", "/ru/proekt-3d"],
  ["/ru/despre-noi", "/ru/o-nas"],
  ["/ru/portofoliu", "/ru/portfolio"],
  ["/ru/contact", "/ru/kontakty"],
  ["/ru/calculator-acoperis", "/ru/kalkulyator-kryshi"],
  ["/ru/chisinau", "/ru/kishinev"],
  ["/ru/orhei", "/ru/orgeev"],
  ["/ru/cahul", "/ru/kagul"],
];

test.describe("RC-201 RU localized slugs", () => {
  for (const [from, to] of RU_SLUG_MOVES) {
    test(`${from} redirects permanently to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(
        [301, 308],
        `${from} returned ${res.status()} instead of a permanent redirect. Every old RU URL may already be indexed; a 404 here loses the page's ranking outright.`,
      ).toContain(res.status());
      expect(res.headers()["location"]).toBe(to);
    });

    test(`${to} is a live page (following ${from} lands on 200)`, async ({
      request,
    }) => {
      const res = await request.get(from);
      expect(
        res.status(),
        `${from} -> ${to} resolved ${res.status()}. The redirect points at a page that does not exist — check the slug in src/i18n/routing.ts matches next.config.ts exactly.`,
      ).toBe(200);
    });
  }

  // The RO side must be untouched by the RU rename. If a rule leaked without a
  // locale prefix it would silently move the default-locale URLs too.
  for (const ro of [
    "/acoperisuri",
    "/fatade",
    "/despre-noi",
    "/portofoliu",
    "/contact",
    "/chisinau",
  ]) {
    test(`${ro} (RO) still resolves directly, not redirected`, async ({
      request,
    }) => {
      const res = await request.get(ro, { maxRedirects: 0 });
      expect(
        res.status(),
        `${ro} returned ${res.status()}; the RC-201 RU rules must never touch RO URLs.`,
      ).toBe(200);
    });
  }
});

/**
 * RC-402 — redirects that used to point at pages nobody ever built, so they
 * 301'd straight into a 404. Same defect class as `/1` (RC-401): the rule looked
 * correct in the config and was broken in production for weeks.
 *
 * `/privacypolicy` is the important one — the contact form collects a name and a
 * phone number, so the policy has to exist and be reachable.
 */
const REPOINTED = [
  { from: "/2", to: "/portofoliu" },
  { from: "/calcul-gard", to: "/contact" },
  { from: "/privacypolicy", to: "/politica-de-confidentialitate" },
] as const;

test.describe("RC-402 repointed dead redirects", () => {
  for (const { from, to } of REPOINTED) {
    test(`${from} redirects to ${to} and lands on a real page`, async ({
      request,
    }) => {
      const hop = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(hop.status());
      expect(hop.headers()["location"]).toBe(to);

      const followed = await request.get(from);
      expect(
        followed.status(),
        `${from} -> ${to} resolved ${followed.status()}. This redirect points at a page that does not exist — the exact bug this suite exists to catch.`,
      ).toBe(200);
    });
  }

  test("the privacy policy is reachable from the footer in both locales", async ({
    page,
  }) => {
    for (const [start, expected] of [
      ["/", "/politica-de-confidentialitate"],
      ["/ru", "/ru/politika-konfidencialnosti"],
    ] as const) {
      await page.goto(start);
      const link = page.locator(`footer a[href="${expected}"]`);
      await expect(
        link,
        `no footer privacy link on ${start}; a policy that exists but is unlinked is no better than none`,
      ).toHaveCount(1);
    }
  });
});
