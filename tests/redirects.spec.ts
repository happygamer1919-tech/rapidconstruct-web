import { test, expect } from "@playwright/test";

/**
 * RC-401: Tilda -> new permanent redirects.
 *
 * Source of truth is docs/SPEC.md section 5. Each old Tilda path must issue a
 * permanent redirect to its new path. `permanent: true` in next.config.ts makes
 * Next emit a 308 (older clients may see 301); both are accepted here.
 *
 * We assert the FIRST hop only (maxRedirects: 0) by reading the Location header,
 * so the check is exact and does not depend on whether the destination page
 * exists yet: several destinations are delivered by later tickets and would 404
 * if followed, but the redirect itself is still correct.
 *
 * NOTE: SPEC section 5 also lists /despre-noi and /portofoliu mapping to the
 * same slug. A path that redirects to itself is an infinite loop, so those two
 * rows are intentionally not emitted (see next.config.ts + mailbox q014) and are
 * therefore not asserted here.
 */

const REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/1", to: "/reparatii-la-cheie" },
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
