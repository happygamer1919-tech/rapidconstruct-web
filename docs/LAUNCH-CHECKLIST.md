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

> ⏸️ **DEFERRED to Q-15 / RC-403 (RC-402 remaining item a).** Every check in this
> section asserts facts about the *canonical host* — the `Host:`/`Sitemap:` lines,
> the absolute domain on every `canonical`/`hreflang`/`<loc>`/`og:image`. The host
> is deliberately **not chosen (apex vs www, Q-15) and not set** (`NEXT_PUBLIC_SITE_URL`
> stays absent until cutover). In the current build every absolute URL resolves to
> the staging host `https://rapidconstruct-web.vercel.app` **by design** — that is
> correct for pre-launch and cannot be re-verified against the real domain until the
> host value is set on cutover day. Do NOT tick these before RC-403. The 2026-07-24
> RC-402 audit (below) verified the host-*independent* structure of exactly these
> fields; only the absolute host remains to confirm at cutover.

Run against the production deployment, not a preview:

- [ ] `curl -s https://<host>/robots.txt` — `Host:` and `Sitemap:` both show the
      real domain.
- [ ] `curl -s https://<host>/sitemap.xml | grep -c "<loc>"` — 28 URLs
      (14 routes × 2 locales, RU on localized slugs), all on the real domain.
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
- [ ] **Owner action at cutover — run the ONLINE validators.** The offline
      structural validation is done (2026-07-24 audit below); the public
      [Google Rich Results Test](https://search.google.com/test/rich-results) and
      [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) are
      external tools that cannot be hit headlessly. Run them on the live cutover
      URLs once the real host is serving: `/`, `/ru`, `/acoperisuri`, `/ru/kryshi`,
      `/portofoliu`, `/contact`.
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

---

## Verified state as of 2026-07-24 — RC-402 non-host audit (LANE B, RC-402-audit-finish)

Finishes the RC-402 items that do **not** depend on the canonical host. Method: a
full production build (`npm run build`, exit 0) followed by an offline structural
audit of the prerendered output (`.next/server/app/**/*.html`) — for these SSG
routes the prerendered HTML **is** the served response, so it is authoritative for
structure. The dev server and outbound HTTP were unavailable in this automated run
(sandboxed), which does not affect the host-independent checks; the host-dependent
re-verify is deferred regardless (see below).

Route set: **30 URLs = 15 indexable routes × 2 locales** (RU on localized slugs;
`/styleguide` excluded, it is `noindex`). This matches the RC-402 sitemap
reconcile (task 410: the sitemap already emitted 30; the checklist's "28" was the
stale figure). All results below are host-independent.

**1. Route liveness — PASS (RO + RU, no 301→404).**
- All **30/30** routes prerendered to a real page (bytes ≫ not-found shell, a
  non-empty `<title>`, and **exactly one `<h1>`** each). Build exited 0, so no
  route fell through to `_error`/`_not-found`.
- **No redirect 301s into a 404:** all **24** `next.config.ts` redirect
  destinations (11 Tilda/legacy + 13 RC-201 RU slug moves) resolve to a built,
  served route. `PENDING_PAGES` in `tests/redirects.spec.ts` is **empty** and
  documented to stay empty. Matches PROJECT-MEMORY §6.2 (`/2`→`/portofoliu`,
  `/calcul-gard`→`/contact` repointed; privacy policy built).
- RU localized slugs confirmed live via each RU page's canonical
  (`/ru/kryshi`, `/ru/fasady`, `/ru/remont-pod-klyuch`, `/ru/otdelka`,
  `/ru/proekt-3d`, `/ru/elektrika-santehnika`, `/ru/o-nas`, `/ru/portfolio`,
  `/ru/kontakty`, `/ru/kalkulyator-kryshi`, `/ru/kishinev`, `/ru/orgeev`,
  `/ru/kagul`).

**2. Structured data — PASS (offline Rich-Results-equivalent).** Every JSON-LD
block on all 30 pages parsed as valid JSON, and the required properties for each
declared `@type` are present and non-empty:
- `HomeAndConstructionBusiness` (LocalBusiness subtype), sitewide on all 30:
  `name`, `address` (streetAddress + addressLocality), `telephone`, `url`,
  `openingHoursSpecification` all present.
- `Service` (14, on the service + calculator pages): `name`, `provider`,
  `areaServed` present.
- `FAQPage` (20): every `mainEntity[]` has a non-empty `name` **and**
  `acceptedAnswer.text`.
- `ItemList` (`/portofoliu` ×2): non-empty `itemListElement`.
- Also present and valid: `AboutPage` (2), `ContactPage` (2).
- ✅ **`aggregateRating` / `reviewCount` are correctly ABSENT** on every page —
  this is the deliberate Q-07 guard in `LocalBusinessJsonLd.tsx`, not a defect.
- Reminder: the public Google Rich Results Test + Facebook OG debugger are online
  tools; run them at cutover on the live host (owner item added to §4).

**3. Open Graph completeness — PASS.** All six required tags —
`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:locale` —
present on all 30 pages. `og:type=website`, `og:locale` per locale
(`ro_RO` / `ru_RU`). The `og:image` target route `/opengraph-image` built
successfully (offline resolve). Its **absolute host** is the deferred item — see
below.

### ⏸️ DEFERRED to Q-15 → RC-403 (RC-402 remaining item a)
The **canonical-host re-verify** is not done here and must not be: the host is
unchosen (Q-15: apex vs www, owner) and unset (`NEXT_PUBLIC_SITE_URL` absent until
cutover, by design). Every absolute `canonical`/`hreflang`/`og:url`/`og:image`
and the `og:image` target currently resolve to `https://rapidconstruct-web.vercel.app`
(the staging fallback) — correct for pre-launch. Re-run §2 against the real domain
on cutover day once the host is set.

### 🚩 FLAGGED — owner product decisions, NOT changed by this audit
- **Q-07 — unverified marketing-claim numbers.** Published as quotable
  SEO/GEO text and left exactly as-is: "de la 160 lei/m²" (in `/acoperisuri`
  titles RO+RU), plus "15+ ani", "500+ case", "30 ani garanție", "4.9/5 din 250+
  recenzii" elsewhere in copy. FLAGGED for owner confirmation; the JSON-LD rating
  fields stay omitted until then. Do not change.
- **Q-10 — calculator price entries** (roof calculator). Owner-owned; unchanged.
- **Q-15 — canonical host** (apex vs www). Owner-owned; blocks item a above.
