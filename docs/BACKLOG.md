# Backlog — RapidConstruct Website

Ticket IDs: RC-xxx. Branch: `rc/<ticket-id>-<slug>`. Work phases in order; within a phase,
tickets are roughly priority-ordered. Mark BLOCKED tickets per the protocol in CLAUDE.md.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[B]` blocked (see QUESTIONS.md)

---

## P0 — Foundation (repo, scaffold, pipeline)

_RC-003/004/005/007 shipped together in PR #6 (squash). RC-006 next._

- [x] **RC-001** Scaffold Next.js app (App Router, TS, Tailwind) via `scripts/setup.sh`;
      commit lockfile; `npm run dev` works. (PR #2)
- [x] **RC-002** Vercel project + GitHub repo wired: every PR gets a preview URL; main deploys
      to a staging domain (production DNS stays on Tilda until launch). Done via CLI-deploy
      routine (see AGENTS.md "Deploys & preview URLs"); staging live at
      rapidconstruct-web.vercel.app. Full per-PR automation pending owner toggle (Q-08).
- [x] **RC-003** Design tokens: colors (keep orange/charcoal brand direction — confirm in SPEC §3),
      type scale, spacing, dark-on-light base. One tokens file, no ad-hoc values.
- [x] **RC-004** i18n routing with next-intl: `/` RO default, `/ru` mirror; locale switcher;
      hreflang pairs emitted on every route; RO/RU message catalogs scaffolded.
- [x] **RC-005** Layout shell: header (logo, nav, phone CTA), footer (NAP, hours, socials,
      services links). Mobile nav. Sticky "Sună acum / Позвонить" on mobile.
- [ ] **RC-006** SEO plumbing: metadata helper (title/description/canonical/OG per page),
      LocalBusiness JSON-LD sitewide, generated sitemap.xml + robots.txt + llms.txt,
      OG share image template.
- [x] **RC-007** CI quality gates: typecheck, lint, build, Playwright smoke test (home renders,
      nav works, both locales respond 200) on every PR.

## P1 — Core pages & motion

- [ ] **RC-101** Home page: hero (instant render, headline + trust badges + dual CTA
      call/request-quote), services grid, stats counters (real numbers server-rendered,
      count-up on scroll as enhancement), recent projects strip, testimonials, FAQ, contact block.
- [ ] **RC-102** Motion system pass on home: scroll-linked reveals demonstrating the craft
      (before/after wipe on projects, layered roof/facade build-up illustration in hero or
      services). prefers-reduced-motion verified.
- [ ] **RC-103** Service pages ×6 (acoperisuri, fatade, renovari-la-cheie, finisaje,
      proiectare-3d, instalatii): template with H1, benefit copy, process steps, gallery,
      price-from, FAQ, CTA. Service + FAQPage JSON-LD.
- [~] **RC-104** Portfolio: filterable project grid (city, type, m²), project detail pages with
      before/after slider and specs (Orhei 100m², Costești 320m², Cahul 180m², Chișinău 280m² as seed).
      PARTIAL (2026-07-22): `/portofoliu` ships RO+RU with 8 real drone photos, tags, ItemList
      JSON-LD and a sitemap entry — the nav 404 is gone. NOT done: filters, per-project detail
      pages, before/after sliders. All three need per-project metadata nobody has confirmed
      (Q-14); the seed figures above were never verified either, so do not publish them as-is.
- [ ] **RC-105** Contact page + lead form: name/phone/message, server action, spam honeypot,
      "răspundem în 2 ore lucrătoare" promise, success state. Delivery per QUESTIONS Q-03.
- [ ] **RC-106** WhatsApp/Viber/Telegram click-to-chat buttons (floating on mobile).
- [ ] **RC-107** Roof price calculator (port + improve `/calcul-acoperis`): live estimate with
      animated feedback, lead capture step ("primește calculul pe WhatsApp"). 
- [ ] **RC-108** Fence calculator (port `/calcul-gard`), sharing calculator infrastructure with RC-107.
- [ ] **RC-109** About page: team, 15+ ani experience story, guarantees, certifications.
- [ ] **RC-110** Promo/offer system: dismissible top bar or hero slot for seasonal offers
      (-10% early booking, rate 0%, price-freeze 160 lei/m²), editable in one config file.
- [ ] **RC-111** "Construction story" scroll section (from design references): 5-6 phase
      stills (teren → fundație → structură → fațadă → casă finită) with crossfade/parallax
      on scroll, fixed caption slot + phase chips, reduced-motion static fallback.
      See docs/DESIGN-REFERENCES.md. Real progress photos pending Q-06 (placeholders OK).

- [ ] **RC-112** 3D configurator + lead magnet (owner idea 2026-07-15): from the homepage
      3D model, "Configurează casa ta" opens /configurator — pick house type, floors,
      roof type, facade finish, approximate m²; a live 3D model updates with each choice
      and a price range (from the RC-107 calculator logic) recalculates. CTA sends the
      draft: name+phone required, config JSON + estimate emailed to the business
      (Q-03 email; Telegram later) so sales can call with full context. Include a
      lightweight "configurator started/completed" event so we can see drop-off (RC-404
      analytics). GDPR note: price shown on-page; contact details only on submit.

- [x] **RC-115** (2026-07-24) Hero verification Tier 1 — `npm run verify:hero`. Replaces the
      per-ticket md5 of `rapidconstruct-scene.js`, which the configurator refactor killed
      (the file was split across `house-kit.js` and `houses/*.js`, so the hash could never
      match again) and which lived in disposable ticket prose that could never be updated
      when code landed. The file list is derived by walking the import graph from
      `HeroScene.tsx` + `rapidconstruct-scene.js`, resolving the `@/` alias, so refactors are
      picked up automatically; unresolvable imports are a hard error, never a silent skip.
      Baseline in `tests/hero-manifest.json`, re-approved with `npm run verify:hero:update`
      in the same commit as the change that justifies it. Coverage 1 file → 7.
- [ ] **RC-116** Hero verification Tier 2 — rendered-output baselines. The real gate: Tier 1
      only detects that source moved, not that the hero still LOOKS approved. Playwright
      screenshots of the canvas element (not the page, so copy/fonts cannot cause false
      diffs) at fixed animation timestamps, driven through the scene API's existing
      `update(t)` / `cameraAt(t)` / `BUILD_END` / `HOLD` so frames are deterministic rather
      than racing wall-clock rAF. Three frames: mid-build, `BUILD_END`, settled — the two
      build frames enforce "never regress the build animation", which nothing automated
      covers today. Also capture a reduced-motion baseline, which turns "SSAO is
      demonstrably OFF on the fallback path" from an agent eyeballing a code branch into a
      pixel assertion. **Sequencing: land AFTER the SSAO work (ticket 340)** — SSAO changes
      the hero's pixels by design, so baselines taken before it are stale on arrival.
      **Local-only to start** (owner decision 2026-07-24): WebGL is not bit-stable across
      GPUs/drivers, so run it on one pinned machine and get a feel for the noise floor
      before it gates CI; promote it if `--use-gl=swiftshader` proves stable across
      machines.

## P2 — Russian version

- [x] **RC-201** (2026-07-22) RU information architecture: RU slugs map (`/ru/kryshi`, `/ru/fasady`, ...),
      redirect-safe, hreflang verified both directions.
- [ ] **RC-202** RU translations: home + services (owner review pass required — flag with
      TODO(ru-review) until Max approves).
- [ ] **RC-203** RU translations: portfolio, about, contact, calculators, FAQ, promo strings.
- [ ] **RC-204** RU-specific SEO: titles/descriptions targeting "ремонт крыши кишинёв"-class
      queries (keyword list in SPEC §4), OG images with RU text.

## P3 — Content, SEO/GEO program

- [ ] **RC-301** Keyword → page map for RO and RU (SPEC §4); adjust titles/H1s accordingly.
- [x] **RC-302** FAQ expansion done (PR #29): 20 answer-shaped GEO FAQs, RO+RU, FAQPage JSON-LD.
- [x] **RC-303** City landing pages done (PR #39): `/chisinau` `/orhei` `/cahul`, RO+RU,
      LocalBusiness + FAQPage JSON-LD, in the sitemap. Slugs reconciled with KEYWORD-MAP in
      RC-301 (the map had said `/acoperis-chisinau`).
- [x] **RC-304** Review strategy done (docs/GBP-REVIEWS.md): plain-RO GBP setup + NAP + reviews
      playbook for the owner; respects Q-07 (no unverified 500+/250+ numbers).
- [ ] **RC-305** Performance budget enforced in CI: LCP < 2.0s mobile, CLS < 0.05, images
      AVIF/WebP with explicit dimensions, fonts self-hosted.

## P4 — Launch

- [x] **RC-401** 301 redirect map done (PR #31), corrected in RC-301: `/1` pointed at
      `/reparatii-la-cheie`, a slug that was never built, so it 301'd into a 404. Repointed to
      `/renovari-la-cheie` and verified 308 → 200. `/2` → `/case-constructii` still 404s on
      purpose until that page lands. SPEC §5 is stale on the `/1` row; KEYWORD-MAP wins.
- [ ] **RC-402** Pre-launch audit: Lighthouse ≥ 95 SEO/a11y, both locales, all JSON-LD valid
      (Rich Results test), OG previews checked in FB/Viber/Telegram debuggers.
- [ ] **RC-403** DNS cutover rapidconstruct.md → Vercel; verify https canonical, old URLs 301,
      Search Console property + sitemap submitted (RO+RU), Tilda kept as fallback 2 weeks.
- [ ] **RC-404** Analytics + lead tracking: GA4 or Plausible, call-click / form / chat events,
      weekly plain-language report for Max.

## P2.5 — Owner content round (2026-08-04 feedback, via Max)

_Video lane (researched 2026-08-04, see STATUS):_

- [x] **RC-120** "Cum lucrăm" process-video section — lite click-to-play embed of the
      owner's 0:30 YT promo (255K views). Shipped on `rc/lane-2026-08`.
- [B] **RC-121** Video recenzii — client clips beside the text quotes (fatade3d pattern).
      BLOCKED: owner must pick footage (TikTok/IG @rapid.construct) or supply clips.
- [B] **RC-122** Per-project clips on /portofoliu. BLOCKED: same footage dependency.

_Services + galleries lane (owner voice notes, 2026-08-04):_

- [ ] **RC-123** Services grid expansion: add **Construcții industriale** and **Lucrări de
      terasament** cards + service pages (RO/RU slugs, redirects, sitemap + RC-402 count
      reconcile, nav, JSON-LD); rename "Proiectare 3D" → "Proiectare și vizualizare 3D".
      Terasament card/page needs machinery imagery (see RC-126 sourcing decision).
      OPEN: service-page copy + prices for both (owner input, logged as Q-18).
- [ ] **RC-124** Hero: make "Garanție scrisă până la 30 de ani" visibly highlighted after
      the build settles (accent chip/larger type, AA contrast kept).
- [ ] **RC-125** Stage-type galleries in the scroll-build section: each stage gets a
      right-scrolling strip of 4-5 labeled type photos (foundation types: radier, fundație
      continuă, piloni, soclu…; same A-to-Z treatment for walls/roof/windows/finishes).
      OPEN: image sourcing (Q-19) — owner archive first, Higgsfield for gaps; NO Google
      image lifting (copyright).
- [ ] **RC-126** Machinery section ("Terasament în lucru"): excavators/bulldozers working —
      because the company executes these works. OPEN: does the owner have photos/video of
      HIS machines? Otherwise Higgsfield-generate logo-free machinery (JCB/CAT/Bobcat are
      trademarks — no brand marks in generated images).

## P5 — Post-launch (nice-to-have pool)

- [ ] **RC-501** Blog/article system for seasonal content ("pregătirea acoperișului pentru iarnă").
- [ ] **RC-502** Project case studies with cost breakdowns (strong GEO material).
- [ ] **RC-503** Instagram feed integration on portfolio page.
- [ ] **RC-504** EN locale if commercial clients ask for it (decision Q-05).
- [ ] **RC-505** Configurator promo section on the homepage (built 2026-08-04,
      removed same day on owner direction — "save the idea for future projects").
      The section JSX lives in git history (`47d0b7b`), the WebGL preview asset
      remains at `public/images/configurator-preview.jpg`. Revisit post-launch.
