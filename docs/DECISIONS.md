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
