# STATUS — RapidConstruct website

Living board. Background and reasoning live in `docs/PROJECT-MEMORY.md`; this
file is only *what is true now and what happens next*.

**Last updated: 2026-08-05 (homepage freeze)** — verified against git, live
browser checks and the full Playwright suite, not recalled.

> This copy of STATUS lives on **`rc/lane-2026-08`**, the active lane that
> carries every 2026-08 change (video hero, scroll-build story, services
> expansion, FAQ hub, project cards). It is ahead of `main` and unmerged by
> design until the owner signs off on the whole site.

---

## ⚠️ STANDING RULES (owner, 2026-08-06)

1. **NEVER spend Higgsfield credits without explicit approval.** Reveal the
   prompt AND the cost, wait for a yes. Report the balance after.
2. **Update this dashboard on every change.** It is the owner's brain.
3. Keep chat answers SHORT. Detail belongs here, not in chat.

### Scroll-story alignment — the rule that actually works
Cards stay locked when they are generated from the **same PARENT image**.
Group parents: Fundația → stage-1 · Pereții → stage-2 · Acoperișul → stage-3 ·
Ferestre → stage-4 · Ultimele detalii → hero-finished. A card generated from
the wrong parent visibly shifts (termoizolatie was made from stage-4 →
regenerated from stage-2 on 2026-08-06, 2 credits, MAD 6.76 ≈ sibling 6.08).
The 5 MAIN stages still do not align with each other — that needs them
regenerated from one common parent (~8 credits, untested).

**Reverted 2026-08-06:** everything after the freeze was rolled back on owner
direction (site had got worse). Backup branch:
`backup/before-revert-2026-08-06`. Undone: services photo swaps, FAQ hub,
/proiectare-3d rebuild, 3D-rendered stage frames, hero settle/stall rework.
Docs kept. The 40-credit locked-camera video experiment failed (drifted) —
do not repeat.

---

## 🔒 HOMEPAGE FROZEN — 2026-08-05

The owner signed off on the homepage. **Do not change `/` (RO or RU) without
an explicit new instruction from Max**, including "small" tweaks: order,
copy, imagery, motion. Anything discovered while working elsewhere goes to
BACKLOG as a ticket instead of being applied.

Frozen state = `rc/lane-2026-08` @ homepage sections in this order:
hero (build video → dim → real-project reel) · scroll-build story with stage
strips · **6 distinct project cards** · recenzii · badges · stats · servicii
(8 cards) · Cum lucrăm video · lead form · contact.

Open follow-ups that do NOT unfreeze it (queued, owner-gated):
- Q-14 owner photo dump → richer project cards + portfolio.
- Owner confirmation that the 3 Tilda-sourced photos are his own work.
- RC-126 machinery section (needs his machine photos).

---

## Current state

| | |
|---|---|
| **Owner review URL** | **https://rapidconstruct-web.vercel.app** — public, no login, **non-indexable** (verified 2026-08-04, tripwire PASS). Shows the **Higgsfield build-video hero** (`rc/lane-2026-08`). |
| Immutable build behind it | `https://rapidconstruct-49oiejyru-sm33xys-projects.vercel.app` (2026-08-05) |
| **Production site** | `rapidconstruct.md` — **still Tilda** (`x-tilda-server: 22`, A `194.48.203.138`, NS `ns1/ns2.tildadns.com`). **DNS untouched.** |
| **Default branch** | `main` @ `0f6d516` — now carries the Q-08 safeguard (cherry-picked). No 3D work. |
| **Working branch** | **`rc/lane-2026-08`** @ `8ccdf9a` — the active lane (all 2026-08 work). Pushed; unmerged by design. |
| **Configurator 3D** | **SHELVED 2026-08-05** (owner). Route/nav/sitemap entries removed, `/configurator` 404s; engine + components stay dormant in-repo. Revival recipe in BACKLOG RC-505. |
| **Open PRs** | None. |
| **Vercel env** | `RESEND_API_KEY` (Production) only. **`NEXT_PUBLIC_SITE_URL` deliberately absent** — see the cutover box below. |
| **Repo** | `happygamer1919-tech/rapidconstruct-web`, Vercel project `rapidconstruct-web` (org `sm33xys-projects`) |
| **Dev server** | `npm run dev` → port 3800 |
| **Pages** | 18 routes × RO/RU — **36 sitemap locs** (verified live 2026-08-05; RC-402 checklist still says 28/30/32 → recount at audit) |

### 🔴 CUTOVER-DAY REQUIREMENT — do not lose this

`NEXT_PUBLIC_SITE_URL` was **removed** from Vercel Production on 2026-07-23 to
re-engage the staging safeguard. Consequences, all verified live:

- Every non-production host now serves `Disallow: /` + `noindex`. ✅
- **A production build now FAILS without it, by design.** Verified: deployment
  `rapidconstruct-j7rd1m29q` errored with *"NEXT_PUBLIC_SITE_URL is required for
  production builds (RC-403 cutover)"*. That is the guard working, not a break.
- Because of that, the staging alias is served by a **preview build repointed
  with `vercel alias set`** — its `noindex` is baked in at build time.

**At cutover (RC-403) you MUST:**
1. `npx vercel env add NEXT_PUBLIC_SITE_URL production` → `https://rapidconstruct.md`
   (apex — the Q-15 recommendation).
2. Redeploy production. Indexing switches on by itself.
3. Re-run the tripwire against the real domain — it inverts, and now requires the
   site to BE indexable:
   ```bash
   node scripts/check-indexability.mjs https://rapidconstruct.md
   ```

### Regression guard (new)

`scripts/check-indexability.mjs <url>` asserts that any host which is not
`rapidconstruct.md` must be non-indexable, and that the real domain must be.
**Run it after every deploy.** It exists because the build-time protection and
the CI tests both passed while the live site was indexable — the failure was
environmental (an env var set before cutover), which CI structurally cannot see.

---

## 🔴 Done

Shipped and verified. PR numbers in brackets.

- **Homepage hero → Higgsfield build video; 3D stays on /configurator (Q-12
  resolved by owner)** (2026-08-04, `rc/lane-2026-08`). The WebGL hero is
  replaced by `src/components/HeroBuildVideo.tsx`: a 5-second time-lapse of the
  owner's REAL built house assembling itself from a blueprint hologram
  (Higgsfield: DJI_0018 reference → finished frame → blueprint frame →
  MiniMax H3 video; ~42 credits total, masters in
  `~/rc-owner-assets/higgsfield-hero-2026-08-03/`). Assets shipped:
  `public/videos/hero-build.mp4` (3.0 MB, 1080p60, 2x speed, silent) +
  `public/images/hero/hero-blueprint.jpg` / `hero-finished.jpg` posters.
  Same contract as the old hero: H1/CTAs SSR'd instantly; blueprint underlay is
  the LCP image (priority); copy panel slides in on video `ended` with a 6.5s
  safety timer; autoplay-refused (`NotAllowedError`) falls back to the finished
  still (AbortError deliberately ignored — StrictMode); background tabs retry on
  `visibilitychange`; `prefers-reduced-motion` gets the finished still statically;
  `?no3d=1` renders NO video element (Lighthouse budget path, RC-305 reused).
  *Verified:* tsc, eslint, prod build, **106/106 Playwright**, live browser:
  video plays to `ended` and holds, copy hidden during build on fresh load,
  `?no3d=1` shows still+copy, mobile 375px crop + settled state screenshotted,
  zero console errors. ⚠️ `HouseBuild.tsx`/`HeroScene.tsx` are now unmounted on
  the homepage (dead code alongside `HeroBuild3D.tsx`) — delete all three once
  the owner signs off on the live hero; the SCENE ENGINE files stay (the
  configurator uses them).

- **Hero reel + stage-by-stage scroll story** (2026-08-04, `rc/lane-2026-08`).
  Two owner-directed follow-ups to the video hero:
  1. *Hero post-build reel:* 1.8s after the build video ends, the hero darkens
     (`bg-ink-950/45`) and a slow crossfade of 4 REAL drone photos starts
     (`public/images/slideshow/`, from `~/rc-owner-assets/drone-2026-07-22/`:
     DJI_0018/0021/0037/0022) with a transform-only Ken Burns drift
     (`animate-slow-drift`, neutralised by the global reduced-motion block).
     Reel mounts only after `ended` — never in reduced-motion/`?no3d`/
     autoplay-blocked paths; interval skips ticks while the tab is hidden.
  2. *HouseTour rebuilt:* the low-poly 3D box is replaced by 5 photoreal stage
     frames of the SAME house as the hero (Higgsfield i2i from the finished
     frame, 10 credits incl. one duplicate from a hung job): slab → block walls
     → roof → windows/base plaster → finished. Stage images crossfade with the
     existing scroll-runway segment logic (untouched); `HouseBuildScene` no
     longer imported there (three.js chunk gone from the homepage);
     `hint` prop dropped ("drag to rotate" no longer applies).
  *Verified:* tsc, eslint, prod build, **106/106 Playwright**, DOM-level QA of
  reel + stage stack + sticky runway in the embedded pane. ⚠️ The pane cannot
  fire scroll events/rAF, so the scroll-stepping itself (pre-existing logic)
  needs the owner's real-browser click-through on the review URL — noted in
  the owner checklist. Known non-blockers: Next dev LCP warning on the reel
  (mounts post-load by design), pre-existing PromoBar hydration mismatch
  (spawned as its own task).

- **FAQ consolidated into one hub** (2026-08-05, owner). Every service FAQ
  moved to `/intrebari-frecvente`: **9 groups, 58 questions**, sorted
  alphabetically by localised label, each with a stable #anchor and a
  jump-list. Service pages lost their accordion AND their FAQPage JSON-LD
  (markup without visible FAQs is a penalty) and gained a signpost card to
  their group. Copy still lives in each service namespace — the hub reads it
  from there, so nothing forked. City FAQs deliberately stayed put
  (location-specific = the GEO point of those pages).

- **"House must stay in place" — INVESTIGATED, not solved by generation**
  (2026-08-06, owner: the stage frames jump). Evidence and dead ends, so this
  is not re-attempted blindly:
  1. **Separate stills cannot be aligned.** The generator redrew the whole
     scene per frame — the same top-left corner shows a neighbour's chimney in
     stage 2, empty sky in stage 3, a different skyline in stage 4. There is no
     common scene to register.
  2. **Feature alignment made it worse.** ORB + RANSAC similarity fit on the
     background: background MAD got 9% and 11% WORSE on two pairs. Script kept
     at `scratchpad/align_stages.py`; repo images were never modified.
  3. **A dedicated "locked camera" video does not hold either** (MiniMax H3,
     10s, **40 credits**, balance **328.5**). The model added a slow zoom: the
     neighbouring house leaves frame, and after two-pass `vidstab`
     stabilisation the horizon still drifts **73 px / 720** with 83% of the
     frame changing end-to-end. Clip archived at
     `~/rc-owner-assets/higgsfield-hero-2026-08-03/build-scrub{,-stab}.mp4`
     — usable as a future hero/process clip, NOT as a registered build.
  4. `BuildScrubVideo.tsx` (scroll-scrub component, written and working) was
     removed rather than shipped on top of unstable footage.
  **The only approach that guarantees registration is a 3D render** — a
  virtual camera cannot drift. The scene still exists in-repo (shelved with
  RC-505). Proposal: render the 5 stages offline from ONE camera to static
  PNGs; pixel-perfect lock, no WebGL on the page, 0 credits, stylised-3D look
  instead of photoreal. Awaiting owner's call; current stills stay live.

- **HERO PHONE BUG FIXED — dim + slideshow no longer need the video**
  (2026-08-05, owner report). Reproduced live at 375px: video fully loaded
  (readyState 4) but PAUSED at 0.13s after 9s, dim 0, zero reel images —
  because `dimmed`/`showReel` were set ONLY in the video's `onEnded`, and the
  autoplay guard only caught `NotAllowedError` while power-saving pauses
  reject with `AbortError` (deliberately ignored). Fixes: (1) one `settled`
  signal drives copy+dim+reel — fires on `ended`, a 9s ceiling, or ~0.4s in
  still mode; (2) **stall detector** judges behaviour not error names (no
  progress 1.6s after `play()` → fall back to the finished still);
  (3) data-saver / 2G-3G skips the 3 MB video entirely; (4) dim and reel
  fades moved from JS animation to **CSS transitions** — phones throttle rAF
  and froze the JS fade at opacity 0.038. Verified on the live alias at
  375px: still-mode engaged, dim 1, reel 1, one slide visible, copy 1, zero
  overflow. ⚠️ Note for future work: the homepage freeze still stands; this
  was a defect fix, not a redesign.

- **RC-127 process block removed** (2026-08-05, owner: "too big and not
  really needed") — the four numbered cards restated what each offer card
  already lists. Final page: hero → promise strip → four image-led offers →
  FAQ signpost → CTA. Copy kept in the catalog for a possible compact revival.

- **RC-127 final pass: image-led, mobile-first** (2026-08-05). Owner rejected
  BOTH interactive attempts and called out the text density. Checked their own
  live page at 375px: it alternates **image → card → image → card**, every
  offer with a full-width visual, nothing hover-dependent. Mirrored exactly.
  `PlanViewer` and `FacadeCompare` both DELETED. Two new page-specific
  visuals (4 credits, balance **368.5**): `design-interior-3d.jpg` (photoreal
  interior render — we had none) and `autorizatii-dosar.jpg` (rolled drawings
  + stamp, no legible text by design). `design-blueprint.jpg` (stock AMERICAN
  plan: "KITCHEN", "2 CAR GARAGE") deleted for good.
  **LAYOUT RULE for service pages, recorded in the page header:** images
  carry the page, text stays short, and no interaction may depend on hover —
  most visitors are on phones. Verified at 375px: 4 cards each with its own
  image, zero hover-dependent elements, no overflow, tripwire PASS.

- **RC-127 /proiectare-3d rebuilt around the owner's REAL offer**
  (2026-08-05). Their live Tilda page sells four things under Proiectare &
  Design — arhitectură, design interior/exterior, fațade 3D, autorizații —
  each with deliverables; ours had flattened it to one generic process list.
  Now a bespoke page (first to leave the ServicePage template) with the four
  offers as cards (real bullets + badges, mirrored into Service JSON-LD as an
  OfferCatalog), their own promise strip (consultare gratuită · deviz 24–48h ·
  garanție în contract), and a sharper CTA.
  **Centrepiece = `PlanViewer`**: an interactive architectural floor plan in
  SVG (thick walls, hatched terrace/carport, room program with areas,
  dimension line, built-area figure) that flips via tabs to the same project
  in 3D. Hover or keyboard-focus a room → it highlights and the readout names
  it. SVG on purpose: image models write gibberish on technical sheets, and
  this keeps real RO/RU labels, stays crisp, costs nothing, and is
  keyboard/screen-reader navigable. Geometry in code, names/areas in the
  catalog.
  ⚠️ **REJECTED and removed the same day: a FacadeCompare A/B wipe** of two
  finished facade schemes (2 renders, 4 credits, balance **372.5**). Owner:
  *"it's not about the building, it's about the projecting."* Rule for this
  page: it sells DESIGN OUTPUT (plans, room programs, areas, documentation),
  not finished-house beauty shots. The two renders survive at
  `public/images/projects/fatada-varianta-{a,b}.jpg` — reuse candidates for
  `/fatade`, not here.
  **Also found:** their mega-menu lists ~40 sub-services vs our 8 — a
  services-taxonomy gap worth its own plan (SEO + completeness).

- **SERVICII PASS — step 1: real photography on all 8 pages** (2026-08-05).
  First page group after the homepage freeze. Audit found imagery was the
  weak point, including two embarrassments: `/proiectare-3d` shipped a STOCK
  AMERICAN blueprint (labels "KITCHEN", "2 CAR GARAGE") and `/finisaje` an
  abstract grey texture swatch; `/instalatii` had NO photo; `/acoperisuri`
  and `/renovari-la-cheie` shared one. Now each page shows its own service:
  acoperișuri → drone shingle roof · fațade → mineral-wool insulation
  mid-application · renovări → brick house with new roof · finisaje →
  travertine terrace · proiectare 3D → our blueprint-hologram frame ·
  instalații → real heating manifold · terasamente → formed-up foundation
  with their JCB in frame. Sources: the 70-image crawl of rapidconstruct.md,
  hand-picked as genuine site photography.
  ⚠️ `/constructii-industriale` STAYS INTERIM (residential townhouse photo):
  the crawl found **zero** real hall/warehouse photography — every industrial
  image on their site is stock. Needs an owner photo (Q-18).
  Verified: tsc, eslint, prod build, 115/115, all 8 routes 200 with exactly
  one H1 and the expected hero, tripwire PASS.
  **Next in this lane:** copy/price honesty per page (Q-10), process-step and
  FAQ quality, RU parity, internal linking between services.

- **6 distinct cards — full rapidconstruct.md crawl** (2026-08-05). Crawled
  the WHOLE live site (70 unique images: home, /portofoliu, /despre-noi and
  the six service subpages — the first two had never been scraped). The
  library is mostly STOCK (renders, foreign interiors, texture swatches);
  two images are unmistakably genuine Moldovan site photography and now ship
  as cards: `acoperis-sindrila.jpg` (drone, bituminous-shingle hip roof on a
  new suburban house) and `acoperis-renovare.jpg` (drone, full metal-tile
  re-roof on an older village house). Homepage now shows SIX distinct
  subjects across five categories. Rejected on purpose: the painters-on-
  ladders shot (matching uniforms + Mediterranean villa = stock) and every
  interior/render. ⚠️ **Owner must confirm the three Tilda-sourced photos
  (terrace + these two) are his company's own works before launch** —
  logged in code, RU-REVIEW and Q-14. Verified: 115/115, browser 6/6 unique
  images decoding, no overflow, tripwire PASS.

- **Projects: one card per DISTINCT building (owner corrected me 3x)**
  (2026-08-05). Frame-by-frame verification settles it: `p-0018/0020/0021/
  0022/0023/0024` are ALL the same white house (identical grey vertical
  bands, stucco, dark hip roof) — including the two "detail" cards I argued
  were separate works. **Detail crops of one building still read as that
  building again**; do not try this again. Honest inventory = FOUR distinct
  subjects: white house (0018), duplex (0034), brick complex (0037),
  travertine terrace (Tilda — ⚠️ provenance unconfirmed, much of that site
  is stock; flagged in code). Grid 4-up on desktop, cards stay small.
  **Six cards needs six BUILDINGS → owner photo dump is now the #1 blocker
  (Q-14/Q-06).** Candidate sheet of 3 more Tilda real-looking photos
  (fundație+JCB, structură cărămidă, termoizolație) sent to Max for owner
  confirmation — if confirmed as their work, that reaches 6 with zero
  generation. Verified: 115/115, browser 4 cards/4 unique, tripwire PASS.

- **Projects: 6 smaller cards, 5 categories** (2026-08-05, owner). 3-col
  desktop grid, 3:2 images, tighter padding/smaller serif title. Six unique
  images: casă parter+etaj (0018), terasă travertin (Tilda), duplex (0034),
  ansamblu la roșu (0037) + two close-up DETAIL shots — pompă de căldură
  (0024, actually a different house: green roof, gravel yard) and detaliu de
  acoperiș (0023) — so no card reads as a repeat. Tags span Case la cheie /
  Finisaje / Structură / Instalații / Acoperișuri. Verified: 115/115,
  browser (6 cards / 6 unique imgs / no overflow), tripwire PASS.

- **Fast-scroll desync FIXED + card consistency** (2026-08-05, owner reports).
  (1) `AnimatePresence mode="wait"` in HouseTour queued an exit animation
  before every entry, so a fast wheel sweep backed the queue up and the
  heading fell behind image+dots (owner screenshot: Fundația photo under a
  "3 Acoperișul" title). Now a keyed `motion.div` (mount animation only, no
  exit queue); verified in sync at 5 runway positions AND after a 6-jump
  fast sweep. (2) "Fundație în cofraj" regenerated (2 credits, balance
  **376.5**) — the real Tilda photo's flat cloudy light + different house
  stood out from every other card; the original survives in git history and
  the Tilda scrape (background JCB = RC-126 machinery reference).
  (3) 4th distinct project card recovered from the owner's OWN Tilda site:
  travertine summer-kitchen terrace (`public/images/projects/
  terasa-travertin.jpg`, new RO+RU portfolio item), replacing the solar-roof
  shot that was the same building as card 1. Verified: 115/115, browser
  sync + asset checks, tripwire PASS.

- **4 project cards, 4 distinct works** (2026-08-05, owner insisted on four).
  The cards now reuse the owner-safe PORTFOLIO captions (tag/title/desc,
  RO+RU, no invented metadata): casă parter+etaj (0018), acoperiș cu panouri
  solare (0020), duplex modern (0034), ansamblu rezidențial la roșu (0037).
  The old Orhei/Costești/Cahul/Chișinău rows (m²/year from Tilda) come back
  when Q-14 lands per-project photos + metadata. Verified: 115/115, browser
  card check, no overflow, tripwire PASS.

- **Distinct project cards + Configurator 3D shelved** (2026-08-05, owner).
  (1) Owner flagged that 3 of 4 project cards showed the same house — true:
  the drone set holds only THREE distinct buildings (0018/0020/0021/0022/
  0023/0024 = the white house; 0034 = flat-roof duplex; 0037 = brick complex
  in construction). Cards now: Costești → duplex 0034, Cahul (țiglă
  metalică) → white house 0018, Chișinău (renovare) → courtyard 0024;
  the Orhei/șindrilă card is hidden until its real photo arrives (Q-14 —
  need owner photos to grow past 3 distinct projects). (2) Configurator 3D
  removed sitewide (owner: "save it for future"): route deleted, nav/
  sitemap/pathnames entries dropped, /configurator 404s, sitemap 38 → 36
  locs (RC-402 recount), engine + components dormant in repo; RC-505 holds
  the revival recipe. Verified: fresh build, 115/115 Playwright, browser
  checks, tripwire PASS.

- **Mobile sideways-scroll bug FIXED** (2026-08-05, owner report from
  iPhone). The stage-type strip's grid column kept `min-width:auto`, so the
  strip's intrinsic width widened the document to 498px on a 375px viewport
  (page dragged left/right). Fix: `min-w-0` on the column; strip stays
  internally swipeable. TWO new regression tests pin
  `document.scrollWidth === viewport` at 375px on `/` and
  `/intrebari-frecvente` — this bug class shipped twice (drawer 2026-07,
  strip now), so it is now machine-guarded. Verified on the live alias:
  scrollWidth 375/375, strip swipeable. 115/115 Playwright, tripwire PASS.

- **Stage cards made label-true; blueprint card retired** (2026-08-05, owner
  feedback). Fundația: "Săpătură și trasare" is now a realistic excavated-
  trenches shot (hologram removed), "Fundație finisată" a cured raised
  plinth (was near-duplicating the cofraj photo). Acoperișul: "Montaj
  învelitoare" now shows exposed battens + partial tile (was a dark texture
  reading as a gate). 3 i2i images, 6 credits, balance **378.5**. Verified:
  113/113, strips browser-checked, assets 200 on alias, tripwire PASS.

- **RC-125 COMPLETE + projects as big cards** (2026-08-05). All five stage
  strips filled: 4/4/3/3/4 labeled cards. 9 new type images generated (18
  credits, balance 384.5): caramida / beton-cofraj / termoizolatie /
  sindrila / usa-intrare / ferestre-panoramice / jgheaburi / pavaj /
  gard-poarta, i2i from the existing stage frames (masters archived).
  ⚠️ A zsh 1-based-array bug shifted every filename on first commit
  (`c6262f0`) — fixed in `8c55866` with explicit pairs, caramida verified
  visually, all assets 200 on the alias. "Proiecte recente" moved directly
  after the build story and rebuilt as LARGE 2-col photo cards using the
  REAL /portofoliu drone webps (owner: "more real projects, bigger");
  pairing interim until Q-14. Homepage order now: hero → build → proiecte →
  recenzii → badges → stats → servicii → video → formular → contact.
  Verified: 113/113 Playwright, browser order/card checks, tripwire PASS.

- **Homepage order tweak** (2026-08-05): lead form moved BELOW "Cum lucrăm"
  and "Proiecte recente" (owner direction) — see what we build, how we work,
  the finished projects, then the ask. Final order: hero → build → recenzii →
  badges → stats → servicii → video → proiecte → formular → contact.
  Verified: 113/113 Playwright, order browser-checked, tripwire PASS.

- **negabarit restructure round** (2026-08-04, late). Configurator promo
  REMOVED same day on owner direction (idea saved as RC-505; JSX in git
  history `47d0b7b`, asset kept). Lead form (shared ContactForm) now sits
  directly after the services grid — the negabarit.md pattern. Stage-type
  strips now on ALL five stages, honest labels only from owned images
  (Pereții/Ferestre sparse at 1 card until Q-19 photos or approved fills);
  generation proposal (~9 images ≈ 18 credits) presented to Max, prompts
  revealed, awaiting go. *Verified:* tsc, eslint, prod build, 113/113
  Playwright, order+form browser-checked, tripwire PASS, alias repointed.

- **RC-124 DONE (V2 refined) + configurator promo + FAQ hub** (2026-08-04
  evening). (1) Guarantee badge final: owner picked V2; refined so only the
  guarantee text sits in the orange rounded-md label (one row always, not
  button-like); `home.hero.trust` split into trustGuarantee/trustMaterials.
  (2) New configurator promo section after the build story (real WebGL
  screenshot `public/images/configurator-preview.jpg`, links /configurator) —
  the owner's read that a type strip without prices duplicates the
  configurator. (3) FAQ moved off the homepage to `/intrebari-frecvente` +
  `/ru/voprosy` with the FAQPage JSON-LD (all 20 GEO FAQs, same catalog
  source so content can't fork); nav+footer link "Întrebări"; sitemap now
  **38 locs** (RC-402 recount pending). SEO/GEO rationale recorded: FAQ
  structured data must sit with visible FAQs; a dedicated crawlable hub
  linked sitewide keeps the GEO surface. (4) negabarit.md reference reviewed:
  simple structure, REAL fleet photos, lead form right after services —
  pattern noted for RC-126 ("Flota noastră" ≈ machinery section with owner
  photos) and a possible mid-page lead form later. *Verified:* tsc, eslint,
  prod build, **113/113 Playwright** (3 new FAQ-hub tests incl. a
  homepage-has-no-FAQPage-LD guard), badge/promo/nav browser-checked,
  tripwire PASS, FAQ pages 200 on the review alias.

- **RC-125 DEMO live (0 credits)** (2026-08-04). Stage-type strip shipped on
  the Fundația stage only, as the owner-requested mechanics preview:
  swipeable labeled cards under the stage box, tap swaps into the box,
  stage change restores the story. Card images are PLACEHOLDERS from owned
  assets, incl. the real formwork photo scraped from the owner's own Tilda
  /2 page (`public/images/stages/types/fundatie-cofraj.jpg` — their JCB is
  visible in it, relevant to RC-126). Real lists/images per stage = Q-19;
  Max says the owner will share which pictures to use. RC-124 full-page
  screenshots re-sent to Max (the ?g links confused him).

- **RC-123 SHIPPED; RC-124 in owner review; RC-126 recon done** (2026-08-04).
  RC-123: Construcții industriale + Terasamente live end to end (cards, icons,
  RU slugs + 301s, sitemap +4 → RC-402 recount needed, full RO/RU pages with
  honest no-numbers copy, interim photos flagged; 110/110 tests). Proiectare
  renamed to "Proiectare și vizualizare 3D". RC-124: four guarantee
  treatments live behind `?g=1..4` on the review URL (default = current
  look); comparison sheet sent to Max; awaiting the owner's pick. RC-126
  recon: all 47 images on the Tilda service pages are generic STOCK (renders,
  warehouses, blueprints) — NO machinery photos exist anywhere on the current
  site; only ~6 look like real site photos (notably a real foundation-formwork
  shot on /2). Sourcing decision still open (Q-19). RC-125 implementation plan
  delivered to Max in chat; no generation run.

- **Owner content round LOGGED, not built** (2026-08-04 evening, via Max —
  plan awaiting approval, nothing implemented). New tickets **RC-123..126**
  in BACKLOG P2.5: services grid expansion (industrial + terasament +
  "Proiectare și vizualizare 3D" rename), hero guarantee highlight,
  stage-type galleries (4-5 labeled photos per stage, scroll-right strip),
  machinery section. New questions **Q-18** (service copy/prices) and
  **Q-19** (image sourcing — owner archive vs Higgsfield; NO Google image
  lifting; machinery must be logo-free if generated). Hero reel zooms
  already replaced with constant-scale drifts on owner feedback (shipped,
  `a122b88`).

- **RC-120 "Cum lucrăm" video section + hero dim/motion fixes** (2026-08-04,
  `rc/lane-2026-08`). (1) New `ProcessVideo` component between services and
  projects: the owner's real 0:30 site-work promo (YT `O7BeibkaoMw`, 255K
  views) as a lite click-to-play embed — self-hosted poster
  (`public/images/video/cum-lucram-poster.jpg`, cropped from the YT thumb),
  brand play chip, youtube-nocookie iframe created ONLY on click. RO+RU
  strings under `home.processVideo` (logged in RU-REVIEW.md). New `play`
  icon. (2) Hero fixes from owner review: the dark wash is now its OWN layer
  above video+reel and fades in ~0.7s after the build ends — the scene
  visibly dims BEFORE the first slide (was: dark arrived glued to the reel);
  the reel got real Ken Burns motion — per-slide camera moves (`.ken-0..3`:
  zoom in / pan left / zoom out / pan right, 6.5s, transform-only) and a
  slower 1.5s crossfade, replacing the too-subtle single drift that read as
  static. *Verified:* tsc, eslint, prod build, 106/106 Playwright; browser:
  dim reaches opacity 1 independently, ken classes cycle per slide,
  click-to-play swaps in the iframe, section screenshotted. Still waiting on
  owner footage picks for RC-121 video recenzii + RC-122 portfolio clips.

- **Owner feedback round 3: homepage restructure** (2026-08-04,
  `rc/lane-2026-08`). Owner verdict: hero video + scroll build approved.
  Changes: (1) testimonials moved directly under the build story;
  (2) `ConstructionStory` (old scroll narrative — duplicated the new build
  story AND is the prime suspect for the reported below-fold mobile scroll
  jank) and the unapproved editorial-statement dark band REMOVED; page
  height ~13.8k → ~11.4k px. New order: hero → build → recenzii → badges →
  stats → services → proiecte → FAQ → contact. *Verified:* tsc, eslint,
  prod build, 106/106 Playwright, section order + height checked in
  browser, tripwire PASS, review alias repointed.
  ⚠️ Owner reports mobile scroll bugs "below the first 2 sections" — the
  ConstructionStory removal likely fixes it, but needs his re-test; if jank
  persists, next suspects are the Reveal wrappers and the h-svh runway tail.

- **VIDEO RESEARCH (owner request: more process/review/product videos)**
  (2026-08-04). Findings: current rapidconstruct.md (Tilda) has ZERO video
  anywhere; but the company has live social channels — instagram/tiktok
  @rapid.construct, youtube @RapidConstruct (3 videos, incl. a 0:30 promo
  "Renovare & Construcții Chișinău… Lucrări la Cheie", 255K views,
  youtube.com/watch?v=O7BeibkaoMw). References: strong-group.md =
  click-to-open video popups + results gallery; fatade3d.md = video
  testimonials section ("Vezi ce spun clienții") + YT channel + big real
  drone galleries; imperlux.md = the cleanest pattern: lite click-to-play
  YouTube embed with poster ("producție & montaj"), zero page weight until
  click. **Proposed tickets** (need owner to pick footage; the 5 DJI drone
  videos were never synced to this machine): RC-120 "Cum lucrăm" process
  video section (lite-embed pattern); RC-121 video recenzii; RC-122
  per-project clips on /portofoliu.

- **Owner feedback round 2: snap transitions, polished slideshow, PromoBar fix**
  (2026-08-04, `rc/lane-2026-08`). Three items from the owner's live review:
  1. *Stage transitions:* the continuous blend read as "blurry" mid-scroll —
     replaced with a 300ms snap + scale settle (`animate-stage-snap`); stages
     now click into place like a model kit. Long overlaps gone.
  2. *Slideshow polished via Higgsfield* (8 credits): all 4 real drone photos
     re-graded to golden hour, power lines / people / cars / debris removed,
     structures untouched (QA'd against originals — note `DJI_0037` is the
     brick townhouse development, the old doc description was wrong). Masters
     in `~/rc-owner-assets/higgsfield-hero-2026-08-03/polished-*.png`.
     ⚠️ These are AI-cleaned versions of real photos — fine for the site, but
     don't label them "unedited drone shots" anywhere.
  3. *PromoBar hydration mismatch FIXED* (was pre-existing): the pre-paint
     dismiss script now marks `<html data-promo-dismissed>` + a constant CSS
     rule instead of mutating the bar's inline style; `suppressHydrationWarning`
     added to `<html>` only (next-themes pattern). Verified: dismissed-visitor
     reload produces zero new hydration errors; bar still hidden pre-paint.
  *Verified:* tsc, eslint, prod build, 106/106 Playwright. Balance after this
  round: 402.5 credits.

- **Scroll story: continuous between-stage blend + duplicate list removed**
  (2026-08-04, `rc/lane-2026-08`, owner feedback on the live review build —
  "the scrollable section looks fire"). The stage frames now blend
  CONTINUOUSLY from the scroll position (`StageFrame` + `useTransform`:
  crisp plateau per stage, half-segment crossfade window, opacity-only,
  zero re-renders) so scrolling morphs the construction forward and back.
  The duplicate 5-item phase list under the runway was removed on owner
  direction; `PhaseList` remains as the reduced-motion fallback. Slideshow
  loop confirmed as already-correct (cycles forever, build never replays).
  *Verified:* tsc, eslint, prod build, 106/106 Playwright, DOM QA (stage 1
  opaque at runway start, list gone). Blend math hand-checked (neighbour
  opacities sum to 1 at the midpoint). Scroll-driven visuals still need the
  owner's real-browser pass (embedded pane fires no scroll/rAF events).

- **Q-17 a11y fixes** (2026-08-03, `rc/lane-2026-08` — the new lane branch that
  carries everything from `rc/RC-115-hero-verify-manifest`). The two pre-existing
  homepage audits are fixed: (1) the closed mobile drawer now also gets
  `inert={!menuOpen}` in `SiteHeader.tsx`, so its 12 links leave the tab order
  (aria-hidden-focus); (2) both `ContactRow` copies (`[locale]/page.tsx` and
  `[locale]/contact/page.tsx`) restructured — the `<dl>`'s div children now
  contain only `<dt>`/`<dd>`, with the icon inside the `<dt>` and the value
  aligned via `pl-8` (definition-list / dlitem). *Verified:* tsc, eslint, prod
  build, **106/106 Playwright**, drawer checked live in both states, and
  Lighthouse accessibility **1.0 on `/` and `/contact`** (was 0.89) with all
  three audits passing. Layout visually unchanged (mobile screenshots taken).

- **3D configurator — steps 0–3** (2026-07-24, `feature/configurator`, commits
  `d0579f5`…). The house is now DATA-driven:
  - *Refactor (step 0):* `rapidconstruct-scene.js` split into an engine +
    `src/scenes/house-kit.js` (textures/geometry vocabulary, roof-tile painter
    parameterised) + `src/scenes/houses/cu-fronton.js` (the approved house as a
    per-category recipe: site/walls/roof/fence) + `src/config/configurator.ts`
    (schema, materials, price bands). `buildScene(...)` with no config renders
    the approved hero unchanged (screenshot-verified); `api.setConfig(patch)`
    rebuilds ONLY affected categories with a compressed fly-in — no scene
    reload. New house models = new recipe files, no engine changes.
  - *Step 1 roof switcher:* `/configurator` + `/ru/konfigurator` (nav, sitemap,
    JSON-LD AggregateOffers). 4 roof types (2 ape / 4 ape / mansardă /
    combinat) × 4 materials with owner bands — metalică de la 450, shingle de
    la 550, rocă vulcanică de la 800 lei/m²; **țiglă ceramică = "preț la
    cerere"** (Q-10 — no invented number, excluded from JSON-LD). Spec panel
    (durabilitate/garanție/greutate). OrbitControls after the signature build;
    render-on-demand (idle = zero GPU frames); reduced-motion snaps; no-WebGL
    fallback keeps the UI working.
  - *Step 2 estimate:* presets 100/120/150/200/250 m² + free input (30–2000
    valid); total = band × area shown as an orientative range with disclaimer;
    ceramic shows the on-request note; CTA → /contact.
  - *Step 3 fences:* jaluzele (approved default) / șipcă / plin / combinat cu
    piatră swap on the same site model.
  - *Verified:* tsc, eslint, prod build, **all 106 Playwright tests pass**,
    live-browser tours screenshotted per type/material/fence, estimate math
    hand-checked. RU strings logged in `docs/RU-REVIEW.md` (крыша register, no
    banned кровля).
  - *Note:* sitemap grew by 2 URLs (RO+RU configurator) — the RC-402 count
    reconciliation must account for it when this lane merges.

- **Foundation** — Next.js 16 App Router + TS + Tailwind scaffold [#2]; Vercel
  wiring and staging URL [#3]; design tokens, RO/RU routing, layout shell, CI [#6].
- **SEO plumbing** — metadata helper, LocalBusiness JSON-LD, sitemap, robots,
  llms.txt, OG image [#8].
- **All content pages** — homepage [#10, #11], six service pages [#23], about,
  contact, chat buttons, promo bar, testimonials [#21], city landing pages for
  Chișinău/Orhei/Cahul [#39], `/portofoliu` with 8 real drone photos [#48].
- **Roof calculator** — pricing engine from the owner's live prices [#24] plus the
  calculator page with lead capture [#27].
- **GEO/SEO program** — keyword map [#14], 20 answer-shaped FAQs [#29], GBP +
  reviews playbook [#38], price-first `/acoperisuri` titles [#45].
- **RU localization (RC-201)** — RU now has its own slugs (`/ru/kryshi`,
  `/ru/fasady`, …) with 13 permanent redirects [#50].
- **Launch prep** — privacy policy in RO+RU, shortened title suffix, two dead
  redirects repointed [#50]; mobile menu fixed (backdrop-filter containing-block
  bug) [#48].
- **Redirects** — 21-case Tilda suite plus the RU moves, 97 tests total, all with
  follow-to-200 guards. `PENDING_PAGES` is **empty** [#31, corrected in #41].
- **Q-08** — Vercel deployment protection disabled; owner can open previews
  without logging in.
- **Perf budget in CI** [#16] — blocking Lighthouse job on `?no3d=1`.
- **3D hero — reveal + legibility (2026-07-23 evening).** Build animation now
  plays edge-to-edge with nothing over it; the copy and its backdrop fade in
  only once the build settles. The full-screen scrim was replaced by a local
  translucent, blurred panel behind the copy (34% of the hero on desktop, 58%
  Pixel 7, 77% iPhone). Hero text contrast measured on the live build: lowest
  4.61:1, all AA — was 1.53:1 before this work. Portrait framing uses a small
  setViewOffset lift (1.06) and a constant horizontal FOV so the site is never
  cropped through the building.
- **3D hero — approved scene ported** (2026-07-23, `feature/3d-hero`).
  `src/scenes/rapidconstruct-scene.js` is a byte-identical copy of the supplied
  source (md5 `68a4fb72172b7695a0f067ec261f7c25`); `src/components/HeroScene.tsx`
  mounts it. Build animation, phase captions, reduced-motion and low-end
  fallbacks all verified on the live deployment. Replaces the older
  `HeroBuild3D.tsx`, which is now unused.
- **3D hero — LANE A polish: frames + quoins** (2026-07-24, `feature/3d-hero`).
  Owner feedback on the review build: window frames "read too thin", corner
  quoins "read too pale". In `src/scenes/rapidconstruct-scene.js`: window-frame
  bars thickened (`winZ`/`winX`) — face `.09 → .13`, depth `.15 → .19` (half-bar
  offset `.045 → .065`, top/bottom span widened to keep the corners closed);
  still a RING of four bars, inner edges unchanged so the glass is never covered.
  Quoins now tint stone with a new `QUOIN` constant (`0xbcae98`, warmer + ~9%
  darker than the shared `STN 0xc6bfb1`) so the corners read against the white
  stucco; `STN` is untouched for the wall bases and columns that also use it.
  `npm run build` exits 0 in the worktree. Note: the scene is no longer
  byte-identical to the ported source above — this is a deliberate owner-driven
  polish pass on top of it. Awaiting the owner's visual verdict; iterate if needed.
  ~~Pending push~~ — **resolved 2026-07-24**: `feature/3d-hero` pushed to origin
  (`6008dee..470359c`), verified 0 commits ahead after push.
- **3D hero — LANE A: reduced-motion + low-end fallbacks AUDITED (no code change)**
  (2026-07-24, `feature/3d-hero`). Audit-first task: both fallback paths already
  exist in the live hero and are correct, so this is a verification, not a rewrite.
  Findings, with file:line —
  1. **Reduced-motion static path.** `src/components/HeroScene.tsx` detects
     `(prefers-reduced-motion: reduce)` via `matchMedia` with a live `change`
     listener (lazy init L80–90). When it matches, `beginLoop` renders the settled
     house **once** — `applyFrame(api.BUILD_END)`, no `requestAnimationFrame`, no
     build/camera loop (L280–288); the pre-warm draw is also posed at `BUILD_END`
     (L294). No camera motion (a single static `cameraAt(BUILD_END)` pose) and no
     glow pulse: the window glow is a **static** emissive material
     (`src/scenes/rapidconstruct-scene.js:254`, `emissiveIntensity` set once), not
     a time-driven pulse, so a fixed-`t` frame does not animate.
  2. **Low-end fallback.** `useSkipCanvas` (`HeroScene.tsx` L47–63) skips WebGL
     **entirely** — before any context is created — on: no WebGL, `?no3d`
     (`skipHeavy3d()`, `src/lib/audit.ts` — the same flag task 320 / RC-305 gate
     on, reused not reinvented), `hardwareConcurrency ≤ 2`, or `deviceMemory ≤ 2`.
     On skip it returns an `aria-hidden` div so the hero's own gradient shows
     through — **never a black canvas** — and fires `onRested` immediately (L103)
     so the copy/CTAs never wait on WebGL — **first paint is not blocked**.
  3. **Render-loop guard** (PROJECT-MEMORY §4.5): `tick()` schedules
     `requestAnimationFrame` FIRST (L234) then runs the update in `try/catch` — a
     thrown frame can never leave a permanent black canvas. Present and correct.
  4. **Task 320 SSAO/DoF are OFF in both paths by construction.** The live hero
     uses **no postprocessing at all**: the scene's `applyRenderer`
     (`rapidconstruct-scene.js:487–494`) sets only ACES tone mapping + PCF soft
     shadows. SSAO + DepthOfField exist ONLY in `src/components/HeroBuild3D.tsx`,
     which is **unwired dead code** (superseded by the scene port; not mounted),
     so there are no effects to disable on the fallback paths.
  `npm run build` exits **0** in the worktree; both branches compile and are
  reachable by reading the code paths. ⚠️ Headless cannot emulate a real low-end
  GPU or the OS reduced-motion setting, so this is reasoned from code + build —
  **owner should spot-check on a phone**: toggle OS "Reduce Motion" (expect the
  finished house, no build, no camera drift) and load on a low-end/2-core device
  or with `?no3d=1` (expect the gradient hero + copy, no black canvas). No non-3D
  file touched; no `HeroScene.tsx` / scene change made.
  **Pending push: `git push origin feature/3d-hero`** — see the note above; this
  STATUS commit rides the same push.

- **CI green again — lint fix** [#59] (`4334021`). ESLint flat-config override
  allows CommonJS `require()` in `tools/**` (the `board-server.js` from #51 tripped
  `@typescript-eslint/no-require-imports` and reddened `typecheck·lint·build·smoke`
  on main and every open PR). Override, not rewrite — the script needs `__dirname`.
- **RC-113/114 — three.js dedupe + shadow-emitter investigation** [#53]. Deduped
  duplicate `three` copies (`package.json`/lock); located the `PCFSoftShadowMap`
  emitter. **Shadow type unchanged by design** (changing it alters the hero look).
- **RC-402 pre-launch audit — non-host items** [#54]. Route liveness on the 30-URL
  set (RO+RU, no 301→404), offline structured-data validation, OG completeness.
  Canonical-host re-verify **deferred to Q-15 → RC-403** (host unset until cutover).
- **RC-402 sitemap reconcile (merge-aware)** [#55; **#56 closed — superseded**].
  Sitemap is **30** `<loc>` on main (15 routes × 2); the checklist's stale "28" was
  corrected. **Target 32** after `feature/configurator` merges (+`/configurator` RO
  + `/ru/konfigurator`). `rc/RC-402-sitemap-reconcile` (#56) closed in favour of #55.
- **Indexability tripwire** [#57] — `scripts/check-indexability.mjs` on main: asserts
  every non-`rapidconstruct.md` host is non-indexable and the real domain must be.
- **SEO/GEO sweep** [#58] — route-by-route audit (16×2) + mechanical fixes
  (styleguide / CityPage / LocalBusinessJsonLd); 2 Q-07 claim items flagged (owner).
- **3D hero — glass + perimeter fence** (2026-07-25, `feature/3d-hero`). Glass now
  reads as dark reflective glazing, not a see-through pane (`fe0442d`); the plot is
  enclosed with left/right/back fence runs (`7b42033`).
- **3D preview terminal freed** (2026-07-25). The `:3801` configurator preview
  worktree was checked out **detached**, freeing the `feature/configurator` branch
  ref for the LANE C terminal; the preview keeps serving (fast-forward to refresh).

> **CI note:** `lighthouse (perf budget)` stays red on main and every PR **by
> design** — the noindex staging safeguard fails Lighthouse's `is-crawlable` SEO
> audit below the 0.9 gate. Self-clears at RC-403 when `NEXT_PUBLIC_SITE_URL` is
> set. Not a regression; do not "fix" it, and never add the env var.

---

## 🟡 In Progress

| Item | Where | State |
|---|---|---|
| **3D hero — owner review** | `feature/3d-hero`, `src/components/HeroScene.tsx` | Ported and live at the owner review URL. Awaiting the owner's verdict. Not merged to `main` by design. `HeroBuild3D.tsx` is now dead code — delete it once the owner signs off on the new scene. |
| **RC-104 Portfolio** | `/portofoliu` | **Partial.** Page ships with 8 real photos, tags, ItemList JSON-LD, sitemap entry — the nav 404 is gone. Not done: filters, per-project detail pages, before/after sliders. All three need metadata nobody has confirmed (Q-14). |

---

## 🔴 Blocked

Each row names **exactly what unblocks it** and **who owns it**.

| # | Blocked item | What unblocks it | Owner |
|---|---|---|---|
| ~~B1~~ | ~~Staging host crawlable~~ — **FIXED 2026-07-23.** Env var removed, both hosts verified `Disallow: /` + `noindex`, tripwire added. | — | done |
| **B2** | **RC-403 DNS cutover** | The **registrar login** for `rapidconstruct.md`. Tilda hosts the zone but is not the registrar; NIC.MD hides it in whois. The only way to find it: ask the owner **who he paid for the domain** (not Tilda). | **Max** |
| **B3** | **Q-07 — publishing unverified claims** | Owner confirms "15+ ani", "500+ case", "30 ani garanție", "4.9/5 din 250+ recenzii" are true and defensible. These are published as quotable SEO/GEO facts. | **Max** |
| **B4** | **Q-10 — two calculator entries** | Owner answers: (1) Creaton ceramică 57/58 lei — per bucată or per m²? (2) what exactly is "160 lei/m² înghețat"? (3) do prices include jgheaburi/burlane și demontare? The other 11 materials ship already. | **Max** |
| **B5** | **Q-03 — Telegram lead channel** | Owner picks the destination (email only, or email + Telegram, and which chat). Email already works; the Telegram notifier hangs off the same seam in `src/lib/lead.ts`. | **Max** |
| **B6** | **RC-404 analytics** | Q-03 (above), plus a GA4-vs-Plausible choice. ⚠️ **If GA4 lands, `/politica-de-confidentialitate` must change in the same PR** — the policy currently states there is no analytics. | **Max** decides; Claude implements |
| **B7** | **Q-15 — canonical host confirmation** | Owner confirms apex vs www. The var is now UNSET (removed 2026-07-23); the confirmed value gets set at cutover, not before. Recommendation: apex `https://rapidconstruct.md`. | **Max** (one-word answer) |
| **B8** | **Q-16 — privacy policy completeness** | Owner supplies the registered legal entity + IDNO, and a concrete retention period. The page is accurate as written without them. | **Max** |
| **B9** | **Q-12 — is the 3D hero still the right call?** | A real conversation with the owner. He has hundreds of real photos; a photo cannot look fake. The 3D's unique value is the build animation. Worth asking whether the hero should be a photo with the 3D below the fold. | **Max** |
| **B10** | **Q-13 — Sketchfab / Hyper3D / Hunyuan3D in BlenderMCP** | Owner ticks them in the N-panel. Currently **moot** — the Blender pipeline is dormant since the procedural rebuild. | **Max**, low priority |

### B1 — how it was fixed (2026-07-23)

`IS_UNINDEXABLE_STAGING` keys off `NEXT_PUBLIC_SITE_URL` being **unset**. The
variable had been set to `https://rapidconstruct.md` in Vercel Production ~12 h
before, which silently switched indexing on: the staging host served `Allow: /`,
no `noindex`, and a 30-URL sitemap pointing at a domain that still serves Tilda
(`/acoperisuri`, `/ru/kryshi`, `/politica-de-confidentialitate` all 404 there).

Fix applied, in order:
1. Removed `NEXT_PUBLIC_SITE_URL` from Vercel Production.
2. Deployed a fresh preview → verified `Disallow: /` + `noindex` on `/`, `/ru`,
   `/acoperisuri`.
3. `vercel promote` was tried first and **correctly failed** — it rebuilds, and
   the RC-402 guard throws on a production build with no site URL. Repointed the
   staging alias with `vercel alias set` instead, so the already-built
   non-indexable output serves that host.
4. Added `scripts/check-indexability.mjs` and verified both hosts PASS.

DNS was not touched at any point.

## 🟢 Next — PAGE-BY-PAGE PASS (started 2026-08-05)

Homepage is frozen; work moves through the remaining pages ONE AT A TIME,
each with the same loop: audit live → propose → build → verify (tsc, eslint,
build, Playwright, browser at 375px + desktop) → deploy → tripwire → update
this board.

| # | Page | RO / RU route | State | First thing to check |
|---|---|---|---|---|
| 1 | Servicii (**8 pages**) | `/acoperisuri` … `/terasamente` | IN REVIEW 2026-08-05 | copy quality, real photos, price honesty (Q-10) |
| 2 | Portofoliu | `/portofoliu` · `/ru/portfolio` | 8 photos, no filters | the same-house duplication problem lives here too |
| 3 | Despre noi | `/despre-noi` · `/ru/o-nas` | shipped, unreviewed | Q-07 unverified claims (15+ ani, 500+ case) |
| 4 | Contact | `/contact` · `/ru/kontakty` | form works | lead delivery (Q-03/Q-09), map, hours |
| 5 | Întrebări frecvente | `/intrebari-frecvente` · `/ru/voprosy` | new hub | is 20 FAQs the right set post-freeze |
| 6 | Calculator acoperiș | `/calculator-acoperis` | live | blocked on Q-10 prices |
| 7 | City pages ×3 | `/chisinau`, `/orhei`, `/cahul` | live | thin content, GEO opportunity |
| 8 | Politica de confidențialitate | `/politica-de-confidentialitate` | live | Q-16 legal entity + retention |

**Order recommendation:** Servicii first (highest commercial value, most
traffic intent), then Portofoliu (proof), then Despre noi (trust), then the
rest. Awaiting Max's pick.

## 🟢 Next (launch chain, unchanged)

In order. Items 1–3 need no owner input.

1. ~~Fix B1~~ — **done** (2026-07-23).
2. ~~Cherry-pick the Q-08 safeguard onto `main`~~ — **done** (`249e9ad`, `0f6d516`).
3. **Owner reviews the new 3D hero** at the review URL. On sign-off: delete the
   unused `HeroBuild3D.tsx` and decide whether the hero merges to `main`.
4. **Reconcile the sitemap count** — the launch checklist expects 28 URLs, the
   sitemap emits 30. Confirm which is right before cutover.
4. **Close the questions the repo has already answered:** Q-06 and Q-11
   (drone photos landed), Q-09 (Resend key is set — verify with one real form
   submit end-to-end, then close), Q-15 (value is set; needs only confirmation).
5. **Chase the owner on B3 / B4 / B2**, in that order — Q-07 and Q-10 gate
   published claims and money figures; the registrar login gates the whole launch.
6. **Unblocked engineering while waiting:** RC-301 (apply the keyword map to
   remaining titles/H1s), RC-202/203 (RU translations for owner review),
   Q-17 a11y fixes (`inert` on the closed drawer, `<dt>`/`<dd>` in the two stat
   blocks), RC-111 construction-story section.
7. **Launch chain** once B2/B3 clear: RC-402 final audit → RC-403 cutover →
   RC-404 analytics.

---

## Housekeeping

- **~18 stale local branches** and several remote ones whose PRs are merged or
  closed. Safe to prune everything except `main` and `feature/3d-hero` — but
  **diff content, not commit counts, before deleting** (see the squash-merge trap
  in `PROJECT-MEMORY.md` §6.1).
- **Prune candidates (2026-07-24) — DO NOT PRUNE YET, note only.** These local-only
  branches are already-shipped/stale (their content is on `main` via squash-merged
  PRs; leaving them unpushed on purpose to avoid re-publishing the orphan trap).
  Verify content-diff vs `origin/main` before any future prune:
  `rc/RC-301-slug-reconcile`, `rc/RC-302-faq-expansion`, `rc/RC-303-city-pages`,
  `rc/RC-304-gbp-reviews`, `rc/RC-305-lighthouse-audit-skip`,
  `rc/RC-3d-archetype-a-land`, `rc/RC-401-redirects`, `rc/RC-seo-roof-title`,
  `rc/board-upgrade-hero-console-items`, `rc/hero-build`, `rc/house-lego-build`,
  `rc/house-polish`, `rc/roof-scroll-build`. Note: `rc/RC-401-redirects` and
  `rc/RC-seo-roof-title` are checked out in worktrees under `~/Projects/rapid-worktrees/`
  — remove the worktree before deleting the branch.
- The genuinely-stranded worker branches were pushed 2026-07-24 with draft PRs
  (owner merges): RC-113 (#53), RC-402 audit-finish (#54), RC-402 sitemap-merge
  (#55), RC-402 sitemap-reconcile (#56), indexability tripwire (#57), SEO/GEO
  sweep (#58). `rc/RC-115-hero-verify-manifest` pushed (live, not stale).
- `BLENDER-TASK-owner-photomatch.md` still sits in the repo root as "the active 3D
  task" but has been overtaken by the procedural rebuild. Archive it to
  `docs/blender-tasks-done/` or delete it.
- `BLENDER-AGENT.md` is referenced by the handoff and notes but **does not exist**.
- `~/rc-owner-assets/` holds 3.3 GB of owner drone footage, outside git. **Never
  commit it.**

---

## Rule

> **Update this file at the end of every working session.**
>
> Move what shipped into **Done** with its PR number, refresh **Current state**
> (branch, deployment, open PRs), and re-check every **Blocked** row — a blocker
> is only real until the thing that unblocks it happens, and stale blockers are
> how a project stops moving. If a document elsewhere contradicts what you
> verified, fix the document or record the correction in
> `docs/PROJECT-MEMORY.md` §9. Verify against the repo and live checks; never
> update this file from memory.
