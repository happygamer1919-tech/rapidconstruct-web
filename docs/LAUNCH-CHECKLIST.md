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

## 1b. ✅ NOT A LAUNCH GATE — configurator PARKED post-launch (2026-07-26)

**PARKED 2026-07-26 (owner scope decision).** The 3D configurator (`feature/configurator`, unmerged) is deferred to a post-launch update — too complex for this launch. `/configurator` + `/ru/konfigurator` are **out of launch scope**, so this section is **no longer a launch gate**; it is kept only as the record of what the parked lane already builds. Launch roof prices already ship on `/acoperisuri` ("de la 1100 lei/m²"). The outstanding per-type fence prices matter only for the parked configurator. See DECISIONS.md 2026-07-26.

**Roofs: ✅ cleared 2026-07-25** (owner's real bands shipped, `feature/configurator`
`a32caeb`). **Fences: still blocked** (only jaluzele, in lei/`ml`). History below.

The configurator's roofing bands **450 / 550 / 800 lei/m²** were seeded from
**Imperlux's LIVE PUBLISHED prices** — a named competitor
(`imperlux.md/acoperisuri/preturi`: țiglă metalică 450–900, shingle 550–1100, rocă
vulcanică 800–1450). Shipping a competitor's real prices as our own is a trust/legal
problem, not a neutral placeholder. Background: `docs/QUESTIONS.md` Q-10.

**GATE — all must pass before the configurator launches (2026-07-25):**
- [ ] The Imperlux-derived bands **450 / 550 / 800** are **absent** from
  `src/config/configurator.ts` (and anywhere the configurator reads price bands).
  Spot-check: `grep -nE '450|550|800' src/config/configurator.ts` returns **no
  surviving price-band values**.
- [ ] Every published band is a number the **owner supplied for his own business**
  (Q-10), or the entry shows **"preț la cerere"** (like the ceramic entry) — never a
  competitor's.
- [ ] The "160 lei/m² înghețat 2026" figure is **NOT** used as a band until the owner
  clarifies its scope (it is below the market labour-only rate 180–280 lei/m²).
- [ ] No invented fence prices (none exist publicly).

**✅ ROOF GATE CLEARED 2026-07-25.** The configurator now uses the owner's real bands
(montaj inclus, "de la"): metalică **1100**, șindrilă **1200**, rocă vulcanică **1400**,
țiglă ceramică **1600** lei/m² — shipped on `feature/configurator` (`a32caeb`). The
Imperlux 450/550/800 numbers are **gone**, ceramică now has a band + is in the JSON-LD
AggregateOffers, and the estimate reads "de la {total}". `grep '450\|550\|800'
src/config/configurator.ts` → no surviving bands. **Fences STILL open** (this half of
the gate stands): only `jaluzele = 2900 lei/METRU LINIAR` (per-`ml`, not m² — the schema
has no fence price field yet); șipcă/plin/combinat = "preț la cerere". **Owner 2026-07-26 approved a CATEGORY-level "Garduri — de la 2900 lei/m liniar" (fundație inclusă), shown once with a contact-sales CTA. The fence code has now **LANDED on `feature/configurator` (`560b005`, unmerged):** category "de la 2900 lei/m liniar" + length estimate (lei/m liniar) + JSON-LD lowPrice 2900. **Per-type prices (șipcă/plin/combinat) still outstanding, so this half stays PARTIAL.**

## 1c. ✅ CLEARED 2026-07-26 — the "160 lei/m²" claim removed

**Owner decision 2026-07-26: retire the "160 lei/m²" claim.** It contradicted the
configurator's real "de la 1100 lei/m²". Removed everywhere it appeared — promo banner,
`/acoperisuri` title + meta, home meta, roof FAQ answers, price chip, the roofing Service
JSON-LD `price: 160`, `llms.txt`, AGENTS.md — on `rc/RC-402-drop-160-claim`. The two
legitimate offers stay in the banner ("−10% la programări anticipate", "Rate 0% la
acoperiș"). Where a roof price is needed the copy now shows the real **"de la 1100 lei/m²"**;
nothing invented. Verify: `grep -rn "160 lei\|160 лей\|înghețat" src/ messages/` → no price hits.

`/configurator` stays a preview/unmerged shell now only because the **per-type fence prices**
(§1b) and the homepage-flow/hero decision are still open — not the "160" claim.

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
- [ ] `curl -s https://<host>/sitemap.xml | grep -c "<loc>"` — **30 URLs**
      (15 routes × 2 locales, RU on localized slugs), all on the real domain.
      The 15 indexable routes are every page under `src/app/[locale]/` **except
      `/styleguide`**, which is a dev aid (`robots: { index: false, follow: false }`
      in `styleguide/page.tsx`) and is correctly `noindex` + sitemap-excluded. The
      privacy policy (`/politica-de-confidentialitate`, RU
      `/ru/politika-konfidencialnosti`) is a real public page and belongs in the
      sitemap — it is the pair that took the count from 28 to 30. See the
      reconciliation note at the bottom of this file.
      **Launch stays at 30.** The configurator lane (`feature/configurator`) is
      **PARKED post-launch** (2026-07-26) — `/configurator` + `/ru/konfigurator` are
      NOT in launch scope. If that lane is ever revived and merged the count would
      become 32; for this launch the target is **30**. See DECISIONS.md.
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

> ⚠️ This dated snapshot says **28 routes (14 × 2)** — it undercounts by one
> route. The privacy policy page landed in the same PR (#50) that wrote this
> audit, but the count here was never bumped. See the reconciliation below; the
> real figure is **30**.

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
  SEO/GEO text: the "160 lei/m²" figure was RETIRED 2026-07-26 (RC-402) and is no longer
  published; still as-is are "15+ ani", "500+ case", "30 ani garanție", "4.9/5 din 250+
  recenzii" elsewhere in copy. FLAGGED for owner confirmation; the JSON-LD rating
  fields stay omitted until then. Do not change.
- **Q-10 — calculator price entries** (roof calculator). Owner-owned; unchanged.
- **Q-15 — canonical host** (apex vs www). Owner-owned; blocks item a above.
## Sitemap count reconciliation — 2026-07-24 (RC-402, merge-aware)

**Resolved: `main`'s sitemap is correct at 30; this checklist's "28" was stale.
The configurator lane is PARKED post-launch (2026-07-26), so the launch target stays **30** — the +2 configurator routes are a deferred post-launch addition, not a launch item.**

Re-verified on `main` (worktree off `06fdb88`, not trusting the earlier
`rc/RC-402-sitemap-reconcile` branch blindly): `npm run build` exits 0 and the
generated `.next/server/app/sitemap.xml.body` contains **30** `<loc>` entries.
That is **15 indexable routes × 2 locales**, RU on its localized slugs:

    /  /acoperisuri  /calculator-acoperis  /fatade  /renovari-la-cheie
    /finisaje  /proiectare-3d  /instalatii  /despre-noi  /portofoliu  /contact
    /politica-de-confidentialitate  /chisinau  /orhei  /cahul

These are every page under `src/app/[locale]/` **except `/styleguide`**, which is
a dev aid — verified `robots: { index: false, follow: false }` in
`src/app/[locale]/styleguide/page.tsx` and already excluded from
`src/app/sitemap.ts`, so the `noindex` and the sitemap exclusion are consistent
and no change was needed there.

**The two URLs that make it 30, not 28**, are the privacy policy in both locales:

- `/politica-de-confidentialitate` (RO)
- `/ru/politika-konfidencialnosti` (RU)

**Decision — keep them; the checklist is now 30.** A privacy policy is a real,
public, 200-returning page a site legitimately wants indexed; it is nothing like
the `/styleguide` dev aid. Route history confirms the checklist simply fell
behind: the route list grew 13 → 14 (`/portofoliu`, PR #48) → 15
(`/politica-de-confidentialitate`, PR #50), and PR #50 added the page but never
bumped this document. No `src/app/sitemap.ts` change was made — the code was
already right.

### Merge-aware target (the new part)

The **configurator lane** (`feature/configurator`) is **PARKED post-launch** (2026-07-26). If it is ever revived it would add **2** indexable routes to `src/app/sitemap.ts`:

- `/configurator` (RO)
- `/ru/konfigurator` (RU)

| State | Indexable routes | `<loc>` count |
|---|---|---|
| **Launch scope** (`main`, configurator parked) | 15 | **30** |
| If the parked lane is ever revived + merged | 17 | 32 (post-launch) |

The configurator lane is parked (post-launch); nobody merges it for this launch, so
**the launch sitemap must emit 30**. If the lane is ever revived, re-run the build
and confirm 32 then. A
matching self-documenting note lives at the top of `src/app/sitemap.ts` so the
expected counts are visible right where the `ROUTES` array is edited.

Not in scope / untouched: the canonical host stays the staging fallback by
design (Q-15 is the owner's call; `NEXT_PUBLIC_SITE_URL` must stay absent until
RC-403) — this reconciliation is only about the route **count** and **which
routes**. The separate title-length metric elsewhere in this file ("12 of 28")
counts titles over ~60 chars, not sitemap routes, and was left alone — it needs
its own re-measure, not a find-and-replace.
