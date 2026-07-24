# LAUNCH CHECKLIST — RC-402 / RC-403

The ordered list of things that must be true before rapidconstruct.md points at
Vercel. Tick nothing you have not verified in a browser or a test.

---

## 1. 🔴 BLOCKER — the canonical domain is not decided or set

**Nothing else on this list matters until this is done.**

Every absolute SEO URL the site emits — `<link rel="canonical">`, all three
`hreflang` alternates, every `<loc>` in `sitemap.xml`, the `Host:` line in
`robots.txt`, and `og:image` — is built from `NEXT_PUBLIC_SITE_URL`.

**Current state: the Vercel project has ZERO environment variables.** With the
variable unset the build falls back to `https://rapidconstruct-web.vercel.app`.
That fallback is *correct for previews* and *catastrophic in production*: it
would tell Google that the real domain is a duplicate of the staging host, on
the exact day we hand it the real domain.

Since 2026-07-22 a production build **fails loudly** rather than shipping the
staging host (`src/i18n/metadata.ts`). Verified both ways: the build exits 1
without the variable and succeeds with it.

**To do:**
1. Decide apex vs www. This is a real choice, not a formality:
   - `https://rapidconstruct.md` (apex) — matches the current Tilda URLs, so the
     301s from old pages land on the same host with no extra redirect hop.
     **Recommended.**
   - `https://www.rapidconstruct.md` — apex then 301s to www; one extra hop from
     every legacy URL.
2. Set it in Vercel, Production scope:
   ```
   vercel env add NEXT_PUBLIC_SITE_URL production
   ```
3. Redeploy and re-run §2 below. The value must have no trailing slash.

## 2. Verify after the variable is set

Run against the production deployment, not a preview:

- [ ] `curl -s https://<host>/robots.txt` — `Host:` and `Sitemap:` both show the
      real domain.
- [ ] `curl -s https://<host>/sitemap.xml | grep -c "<loc>"` — 30 URLs
      (15 routes × 2 locales, RU on localized slugs), all on the real domain.
      The 15 indexable routes are every page under `src/app/[locale]/` **except
      `/styleguide`**, which is a dev aid and is correctly `noindex` +
      sitemap-excluded. The privacy policy (`/politica-de-confidentialitate`,
      RU `/ru/politika-konfidencialnosti`) is a real public page and belongs in
      the sitemap — it is the pair that took the count from 28 to 30 (see the
      reconciliation note at the bottom of this file).
- [ ] Spot-check three pages: `canonical`, `hrefLang="ro"`, `hrefLang="ru"`,
      `hrefLang="x-default"` all absolute and on the real domain.
- [ ] `og:image` resolves (open it in a browser, expect an image not a 404).

## 3. Redirects from the old Tilda URLs

- [x] Redirect suite passes (`tests/redirects.spec.ts`): the Tilda rules plus
      the 13 RC-201 RU slug moves, all with follow-to-200 guards so a redirect
      can never land on a 404 again. 97 tests total.
- [ ] Re-run the suite **against production** after cutover — the suite currently
      proves the rules, not the live DNS.

## 4. Content and indexing

- [x] `/portofoliu` exists in RO + RU with real project photos (RC-104,
      2026-07-22). It is in the sitemap and the nav link resolves.
- [ ] **Q-07 — the claimed numbers.** Any "15 ani", "30 de ani garanție",
      project counts etc. must be confirmed true by the owner before they are
      published. Publishing an unverified claim is both a trust and a legal risk.
- [ ] **Q-10 — calculator prices.** The roof calculator quotes money; the
      numbers must be the owner's real ones.
- [x] Titles: suffix shortened (§7). 12 of 28 still exceed ~60 chars, but only
      the brand clips — every keyword phrase is inside the visible window.

## 5. Lead capture — the site's actual job

- [ ] **Q-09 — Resend API key.** ⚠️ Without it `deliverLead` console.logs the
      lead and returns SUCCESS — the customer is told "we'll call back" and the
      lead exists only in Vercel's log stream, which the owner will never open.
      The owner adds it himself: `npx vercel env add RESEND_API_KEY production`.
      Note the free tier sends from onboarding@resend.dev until the domain is
      verified, so early leads may land in spam; verify rapidconstruct.md in
      Resend during the DNS cutover.
- [ ] **Q-03 — where leads go** (email / Telegram / both).
- [ ] Submit the real form on production and confirm the lead arrives.

## 6. Analytics (RC-404)

- [ ] GA4 or Plausible installed.
- [ ] Events: call-click, form submit, chat open, calculator completion.
- [ ] Google Search Console verified, sitemap submitted.
- [ ] Google Business Profile updated to the new URL (`docs/GBP-REVIEWS.md`).

## 7. Nice-to-have before launch

- [x] Title suffix shortened to "Rapid Construct" — titles over 60 chars went
      from 22/26 to 12/28, and the remainder clip only the brand, never the
      keyword phrase.
- [x] RU slugs (RC-201) — done 2026-07-22. `/ru/kryshi`, `/ru/fasady` etc.,
      13 permanent redirects from the old RO-shaped RU URLs, all with
      follow-to-200 guards.
- [ ] Q-08 — disable Vercel deployment protection so the owner can open preview
      links without logging in.

## 8. Cutover day

1. Set `NEXT_PUBLIC_SITE_URL`, redeploy, re-verify §2.
2. Add the domain in Vercel; update DNS.
3. Watch for https, correct canonical, and old URLs 301-ing.
4. Submit the sitemap in Search Console.
5. Keep Tilda reachable until the new site is confirmed serving.

---

## Verified state as of 2026-07-22

Audited all 28 routes (14 × 2 locales) on a local production-equivalent render:

- All 28 return 200, zero defects (`/portofoliu` was the only 404; RU now on
  localized slugs).
- canonical present on every page ✓
- hreflang ro/ru/x-default present on every page ✓ (rendered as `hrefLang`,
  which is valid — HTML attributes are case-insensitive)
- JSON-LD parses on every page, zero broken blocks ✓
- exactly one `<h1>` per page ✓
- og:title + og:image present on every page ✓
- sitemap 200, robots 200, llms.txt 200 ✓
- **every absolute URL still points at the staging host** — §1

> ⚠️ This dated snapshot says **28 routes (14 × 2)** — see the reconciliation
> below. It undercounts by one route: the privacy policy page landed in the same
> PR (#50) that wrote this audit, but the count here was never bumped.

---

## Sitemap count reconciliation — 2026-07-24 (RC-402)

**Resolved: the sitemap is correct at 30; this checklist's "28" was stale.**

`src/app/sitemap.ts` emits **30** `<loc>` entries — verified by `npm run build`
(exit 0) and counting the generated `.next/server/app/sitemap.xml.body`. That is
**15 indexable routes × 2 locales**, RU on its localized slugs:

    /  /acoperisuri  /calculator-acoperis  /fatade  /renovari-la-cheie
    /finisaje  /proiectare-3d  /instalatii  /despre-noi  /portofoliu  /contact
    /politica-de-confidentialitate  /chisinau  /orhei  /cahul

These are every page under `src/app/[locale]/` **except `/styleguide`**, which is
a dev aid — already `robots: { index: false, follow: false }` and already
excluded from the sitemap, so no change was needed there (the `noindex` +
sitemap-exclusion are consistent).

**The two URLs that make it 30, not 28**, are the privacy policy in both locales:

- `/politica-de-confidentialitate` (RO)
- `/ru/politika-konfidencialnosti` (RU)

**Decision — keep them; update the checklist to 30.** A privacy policy is a real,
public, 200-returning page that a site legitimately wants indexed; it is nothing
like the `/styleguide` dev aid. Route history confirms the checklist simply fell
behind: the route list grew 13 → 14 (`/portofoliu`, PR #48) → 15
(`/politica-de-confidentialitate`, PR #50), and PR #50 added the page but never
bumped this document's count. No `src/app/sitemap.ts` change was made; the code
was already right.

Not in scope / untouched: the canonical host stays the staging fallback by design
(Q-15 is the owner's call, and `NEXT_PUBLIC_SITE_URL` must stay absent until
RC-403) — this reconciliation is only about the route **count**. The separate
title-length metric elsewhere in this file ("12 of 28") counts titles over ~60
chars, not sitemap routes, and was left alone — it needs its own re-measure, not
a find-and-replace.
