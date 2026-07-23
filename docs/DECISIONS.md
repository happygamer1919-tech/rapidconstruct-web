# Decision Log (append-only)

- **2026-07-13 — Rebuild from scratch, not fix Tilda.** Custom Next.js App Router site,
  deployed on Vercel; Tilda stays live until DNS cutover (RC-403). Rationale: Tilda caps
  SEO control, JS-rendering hides facts from crawlers, slow LCP; business is investing in
  the web channel.
- **2026-07-13 — Bilingual RO (default at `/`) + RU (at `/ru`).** No EN at launch (Q-05).
  Rationale: Moldova search market splits RO/RU; RU roughly doubles addressable queries.
- **2026-07-13 — SEO/GEO is a build requirement, not a phase.** Every page ships with full
  metadata, JSON-LD, hreflang, and server-rendered facts from day one (see CLAUDE.md).
- **2026-07-13 — Redirect map confirmed from Tilda admin (Q-02 closed).** Owner logged into
  Tilda in the shared browser pane; Claude read the page list. /1–/6 map by nav order exactly
  as guessed; legacy "Bara de meniu" pages are 404 and need no redirects; /page53648667.html → /.
  Tilda-access pattern for future needs: owner logs in, Claude reads (no credentials shared).
- **2026-07-13 — Same working model as A&I site.** Feature branches + PRs with plain-language
  owner checklists, blocked-question protocol, browser-verified QA. Owner (Max) reviews
  preview URLs only, never code.
- **2026-07-20 — /acoperisuri titles now lead with price (KEYWORD-MAP quick wins applied).**
  RO `Acoperiș la cheie Chișinău, preț de la 160 lei/m²`, RU `Ремонт и монтаж крыши в
  Кишинёве, цена от 160 лей`. Rationale: KEYWORD-MAP flagged high-intent `preț`/`ремонт`/
  `цена` queries the old titles missed; 160 lei/m² is already published site-wide, so this
  publishes no new claim. Only `roofPage.seo.title` changed — page copy untouched.

## 2026-07-22 — Look B dark timber cladding REVERSED (owner instruction + photographic evidence)
Look B (dark vertical timber on gables + entry, greige walls) was approved on renders 2026-07-21
and built. The owner's drone photos of houses his company ACTUALLY builds
(docs/reference-match/owner-drone-2026-07-22/, esp. DJI_0018/0021/0037) show the real product:
full multi-level HIP roofs, BRIGHT WHITE stucco, mid-grey scored accent panels, no timber
cladding anywhere. Owner instruction "make the walls whiter, they look old" + "change the
building" overrides the Look B approval. Direction from 2026-07-22: photo-match the drone house.
Do not re-derive or re-propose dark timber cladding.

## 2026-07-22 — /portofoliu ships without project metadata (Q-14)
RC-104 is live in RO + RU with 8 real photos from the owner's 2026-07-22 drone
set. The page publishes no locality, floor area or completion year: none of those
were confirmed, and a proof page that invents its own proof is worse than no page.
Copy describes only what is visible in each frame. Q-14 asks the owner for the
real metadata; add it (and extend the ItemList JSON-LD) when it arrives.

## 2026-07-22 — Production builds fail without NEXT_PUBLIC_SITE_URL
The Vercel project has zero environment variables, so a production deploy would
have emitted canonical/hreflang/sitemap/og:image URLs pointing at the staging
host — telling Google the real domain duplicates staging on cutover day.
`src/i18n/metadata.ts` now throws when `VERCEL_ENV=production` and the variable
is missing. Verified: build exits 1 without it, exits 0 with it. Apex vs www is
still undecided (Q-15).

## 2026-07-22 — Viewport-level overlays moved out of <header>
The header carries `backdrop-blur`; a backdrop-filter creates a containing block
for `position: fixed` descendants. The mobile drawer and the floating call button
lived inside it, so the drawer was clipped to the 81px header height (its nav
links were unreachable on a phone) and the call button anchored to the header
rather than the viewport. Both are now siblings of the header. The closed drawer
is also clipped with `overflow-hidden`, which removed a 694px-wide document on a
375px viewport across every page (Google mobile-usability "content wider than
screen").

## 2026-07-22 — RU slugs localized (RC-201)
The RU mirror served Romanian paths (`/ru/acoperisuri`). A Russian speaker in
Moldova searches «ремонт крыши Кишинёв», and the URL is a ranking and click
signal, so RU now has its own slugs via next-intl `pathnames`:
kryshi · fasady · remont-pod-klyuch · otdelka · elektrika-santehnika · proekt-3d ·
o-nas · portfolio · kontakty · kalkulyator-kryshi · kishinev · orgeev · kagul.
All 13 old URLs 301 to the new ones (next.config.ts) with follow-to-200 guards in
tests/redirects.spec.ts. RO URLs are untouched, and there are RO-side tests
asserting that. Internal `<Link href>` values stay RO-shaped — `pathnames` is the
single place the public RU URL is decided, so canonical, hreflang and the sitemap
follow automatically.

Side effect worth keeping: `pathnames` makes route keys a TypeScript union, so
`Pathname` now types every href in config and helpers. A link to a page that does
not exist is a compile error — which is exactly how the `/portofoliu` nav 404
shipped unnoticed.

Doing this BEFORE launch was deliberate: post-launch it would have meant a second
redirect generation layered on the Tilda ones.

## 2026-07-22 — Title suffix shortened to "Rapid Construct"
The `<title>` suffix was the full trading name, costing 30 characters on every
page. 22 of 26 titles exceeded Google's ~60-character render purely because of
it; the titles themselves are 33–49 chars and keyword-led. The suffix is now
`site.shortName` ("Rapid Construct"), which brought it to 12 of 28 and those only
clip the brand, never the keyword phrase. JSON-LD `name`, `og:siteName` and the
share image keep the full trading name — identity, not snippets. No individual
title was rewritten, so deliberate decisions (the price-first /acoperisuri titles
from PR #45) are untouched.

## 2026-07-22 — Privacy policy published; two dead redirects repointed (RC-402)
The contact form has been collecting a name and a phone number while
`/politica-de-confidentialitate` did not exist — and the legacy Tilda URL
`/privacypolicy` redirected straight into that 404. The policy now exists in
RO + RU, is linked from the footer on every page, and is in the sitemap.

The copy states only what the code does, verified before writing: no analytics or
tag manager anywhere in src/, no cookies (localStorage holds just the promo-bar
dismissal id), `next/font` self-hosts the Google fonts so a visit sends nothing to
Google at runtime, the only runtime outbound call is Resend. **If RC-404 adds
GA4, this page must change in the same PR** — a policy describing a site you no
longer run is a written false statement.

Two other redirects pointed at pages nobody built, so they 301'd into 404s — the
same defect class as `/1` under RC-401:
- `/2` → `/case-constructii` (never built) → now `/portofoliu`, which shows the
  real built houses the old page was about.
- `/calcul-gard` → `/calculator-gard` (RC-108, not built) → now `/contact`.
  Sending fence traffic to the ROOF calculator would answer the wrong question.
  Repoint when RC-108 ships.

`PENDING_PAGES` in tests/redirects.spec.ts is now EMPTY: every redirect
destination on the site resolves 200. Keep it that way.

## 2026-07-22 — Deployment Protection off (Q-08) + staging made un-indexable
Vercel Authentication disabled so the owner can open preview links without a
login (`ssoProtection: null`, set via the API and verified).

That removed the only barrier keeping search engines off
rapidconstruct-web.vercel.app, where robots.txt said `allow: /`, the canonicals
point at the vercel.app host and sitemap.xml lists all 30 staging URLs. Shipped
in the same change: `IS_UNINDEXABLE_STAGING` drives `Disallow: /` (no sitemap
line) plus `noindex, nofollow` on every page whenever `NEXT_PUBLIC_SITE_URL` is
unset. It can never be true in production — the RC-402 guard throws there — so
indexing switches on by itself at cutover with nothing to remember.

Rule going forward: **never re-enable indexing on a host that is not the real
domain**, and if RC-404 adds analytics, keep it off the staging host too.
