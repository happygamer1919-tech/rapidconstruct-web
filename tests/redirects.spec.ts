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
  { from: "/2", to: "/case-constructii" },
  { from: "/3", to: "/fatade" },
  { from: "/4", to: "/finisaje" },
  { from: "/5", to: "/proiectare-3d" },
  { from: "/6", to: "/instalatii" },
  { from: "/contacte", to: "/contact" },
  { from: "/calcul-acoperis", to: "/calculator-acoperis" },
  { from: "/calcul-gard", to: "/calculator-gard" },
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
  "/case-constructii", // RC-103
  "/calculator-gard", // RC-108
  "/politica-de-confidentialitate", // RC-402 launch prep
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
