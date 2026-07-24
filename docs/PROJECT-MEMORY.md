# PROJECT MEMORY — RapidConstruct website

Permanent memory for this project. Written 2026-07-23, **re-verified 2026-07-24**
against the repo (git log, working tree, live HTTP checks, Vercel API) rather than
recalled. A fresh session should be able to read this alone and pick up cold.

Where this file and `docs/STATUS.md` disagree, **STATUS wins** — it is updated
more often. Current state is stated plainly; superseded facts are kept as dated
history rather than deleted, so the reasoning survives.

Companion docs: `docs/STATUS.md` (living board — what to do next),
`AGENTS.md` (rules), `docs/BACKLOG.md` (tickets), `docs/QUESTIONS.md` (blockers),
`docs/DECISIONS.md` (append-only log), `HANDOFF-2026-07-22.md` (previous handoff,
now partly superseded — see §9).

---

## 1. What this is and who the client is

**Rapid Construct & 3D Design** — a construction and renovation company in
Chișinău, Moldova. Services: roofs, facades, turnkey renovations, finishes, 3D
design, installations. Serves Chișinău plus regions (Orhei, Cahul, Costești).

Identity facts live in exactly one place, `src/config/site.ts`, because the Tilda
site had drifted:

| | |
|---|---|
| Trading name | Rapid Construct & 3D Design (short form "Rapid Construct" for `<title>` suffix) |
| Address | Nicolae Zelinski St 24, Chișinău, MD |
| Phone | +373 76 837 180 |
| Email | rapidconstructmd@gmail.com |
| Hours | Mon–Sat 08:00–17:00, Sun closed |

**Claims used as SEO/GEO facts** (15+ years, 500+ houses, 30-year written
warranty, 4.9/5 from 250+ reviews, from 160 lei/m²) are published as quotable
text — which is exactly why **Q-07 must be answered before launch**. They are
currently unverified. `LocalBusinessJsonLd.tsx` deliberately omits
`aggregateRating`/`reviewCount` for this reason.

**The project:** a ground-up replacement for their Tilda site — Next.js on
Vercel, bilingual RO (default, at `/`) and RU (at `/ru`), no EN. Goals: rank
(SEO), get cited by AI assistants (GEO), and convert (calls, chat, quote forms).

**The owner, Max**, is non-technical. He reviews **preview links only**, never
reads code, merges every PR himself, and writes short blunt feedback ("still
looks like a barn"). He is also the best QA on the project — he finds defects
nobody else does by dragging the 3D model around on his phone. Working model,
non-negotiable: feature branches only, never commit to main; every PR carries a
plain-language summary plus a click-through checklist; blocked questions go to
`docs/QUESTIONS.md` with a recommended default and you move to the next
unblocked ticket rather than guessing a product decision.

---

## 2. Timeline — what was built, week by week

60 commits, 2026-07-13 → 2026-07-23. PR numbers are GitHub PRs on
`happygamer1919-tech/rapidconstruct-web`.

### 2026-07-13 — bootstrap (2 commits)
- `80488e7` project guide, phased backlog, spec, setup script.
- `dc813e8` Tilda admin audit → confirmed the `/1`–`/6` redirect map, **Q-02
  resolved**. Pattern established: the owner logs into Tilda in a shared browser
  pane and Claude reads the admin — no credentials are ever shared.

### 2026-07-14 — foundation and the first homepage (13 commits)
- `9010be5` RC-001 scaffold (App Router, TS, Tailwind) · PR #2.
- `8ca1dea` RC-002 Vercel wiring + staging URL + deploy routine · PR #3.
- `92e7bf8` design-reference briefs from owner-supplied Instagram reels.
- `d81c449` / `0f6cf31` photo inventory: 74 live-site URLs, plus a hidden Tilda
  page named "img" holding a 110-image stash.
- `8c4a7fb` **P0 foundation** — design tokens, RO/RU routing, layout shell, CI ·
  PR #6 (RC-003/004/005/007 shipped together).
- `d022225` **RC-006 SEO plumbing** — metadata helper, LocalBusiness JSON-LD,
  sitemap/robots/llms.txt, OG image · PR #8.
- `dda78e6` RC-101 real homepage + header/footer shell · PR #10.
- `f0283aa` RC-101b cinematic homepage — real photos, full-bleed hero,
  construction-story, motion · PR #11.
- `b47f5e2` + `240d143` interactive 3D model section, softened motion, RU
  rewrite, 3D perf gating · PR #12.
- `407fd13` roof page with 3D cutaway · PR #13.

### 2026-07-15 — the biggest single day (20 commits)
Product surface mostly completed: RC-301 keyword map (#14), RC-305 Lighthouse
budget in CI (#16), P1 feature bundle — contact, chat buttons, promo bar, about,
testimonials (#21), RC-103 the five remaining service pages (#23), RC-107a
pricing engine from the owner's live calculator (#24), RC-107 roof calculator
with lead capture (#27), RC-302 20 GEO FAQs (#29), RC-401 Tilda redirects with
per-row Playwright tests (#31), RC-304 GBP playbook (#38), RC-303 city landing
pages for Chișinău/Orhei/Cahul (#39).

In parallel the 3D churn began: house v4 real window reveals (#25) → v4.1
removing floating fascia rails on owner feedback (#26) → cutaway v3 scroll
disassembly (#28) → roof opening layer-by-layer (#33) → lighting and recolor
passes → roof detail (#34) → the lego-style build on scroll (#35/#36) → hero
moved to the very top with text sliding over it (#37).

### 2026-07-16 — model rebuild and CI repair (4 commits)
- `8a924c8` new house model "like real houses" · PR #40.
- `153dc66` an old Tilda link was 301-ing into a 404 · PR #41.
- `3ef5168` speed test repaired — it had been red since overnight, **not** caused
  by the recent PRs · PR #42.
- `d558b65` house more realistic and 2× lighter, with garden · PR #43.

### 2026-07-20 — v2 and the SEO quick win (2 commits)
- `7083f0a` Casa 3D v2 — visible lego construction, hollow house with real eaves,
  new roof · PR #44.
- `044654c` `/acoperisuri` titles now lead with price · PR #45.

### 2026-07-22 — launch preparation, the pivot, and a new branch (5 commits)
- `bc1edaa` **PR #48** — `/portofoliu` page (8 real drone photos), launch
  protection, mobile menu fixed.
- `be7a5bc` **PR #50** — RU localized slugs (RC-201), shortened title suffix,
  privacy policy, redirect repoints (RC-402 prep).
- `b21734d` scaffolded `feature/3d-hero` as a separate lane so 3D churn cannot
  touch the launch work.
- `abca778` + `e7fe1fd` **Q-08 resolved** — deployment protection disabled, with
  an `IS_UNINDEXABLE_STAGING` safeguard shipped in the same change. ⚠️ **These two
  commits are on `feature/3d-hero`, not on `main`** — see §9.
- Same day: the owner sent drone photography of houses his company actually
  builds. This invalidated a week of modelling — see §4.

### 2026-07-23 — the procedural rebuild (`feature/3d-hero`)
- `df53e9d` use `HeroBuild3D` as the homepage intro.
- `3e1009b` real hip roofs instead of pyramids.
- `e6766b5` rebuild `HeroBuild3D` from the full `3D-HERO-SPEC` — 1,337 lines.
- **Later the same day, superseded:** the owner's approved scene was ported
  verbatim as `src/scenes/rapidconstruct-scene.js` (485 lines, md5
  `68a4fb72172b7695a0f067ec261f7c25`), mounted by `src/components/HeroScene.tsx`
  (375 lines). `HouseBuild.tsx` imports **`HeroScene`** — so `HeroBuild3D.tsx` is
  no longer wired to anything and is dead code pending deletion.
- Then a framing/reveal/legibility pass: full-bleed edge-to-edge build, copy
  revealed only after settle on a local blurred panel, hero text contrast
  1.53:1 → **4.61:1** (all AA), constant horizontal fov for portrait.

### 2026-07-23 → 07-24 — documentation and state repair (`main`)
- `docs/PROJECT-MEMORY.md` + `docs/STATUS.md` written as the source of truth.
- The indexing near-miss detected and reverted (§9.2).
- `1cc24d0` resolved a STATUS.md merge conflict that had been left in the working
  tree with literal markers; `702e3c8` added `CLAUDE.md` as a pointer file.

---

## 3. Architecture and stack (as built, verified)

**Framework:** Next.js `16.2.10` App Router, React `19.2.4`, TypeScript strict,
Tailwind v4. Note `AGENTS.md` carries an explicit warning that this Next.js
version has breaking changes versus training data — read
`node_modules/next/dist/docs/` before writing framework code.

**i18n:** `next-intl` `^4.13.2`, path-based. RO at `/`, RU at `/ru`. Since
RC-201, RU has **its own localized slugs** via next-intl `pathnames`
(`/ru/kryshi`, `/ru/fasady`, `/ru/remont-pod-klyuch`, …). Internal `<Link href>`
values stay RO-shaped; `pathnames` is the single place a public RU URL is
decided, so canonical, hreflang and sitemap all follow automatically.

A deliberate side effect worth protecting: `pathnames` makes route keys a
TypeScript union, so `Pathname` types every href in config and helpers. **A link
to a page that does not exist is now a compile error** — which is precisely how
the `/portofoliu` nav 404 shipped unnoticed before.

**Routes:** 16 page files under `src/app/[locale]/`, ×2 locales. Home,
acoperisuri, fatade, renovari-la-cheie, finisaje, instalatii, proiectare-3d,
despre-noi, contact, portofoliu, calculator-acoperis, politica-de-confidentialitate,
chisinau, orhei, cahul, styleguide. Plus `robots.ts`, `sitemap.ts`,
`llms.txt/route.ts`, `opengraph-image/route.tsx`.

**3D:** `three` `^0.185.1`, `@react-three/fiber` `^9.6.1`, `@react-three/drei`
`^10.7.7`, and — added on `feature/3d-hero` — `@react-three/postprocessing`
`^3.0.4` (SSAO + depth of field).

**Motion:** `motion` `^12.42.2` (framer-motion successor). Transform/opacity
only; `prefers-reduced-motion` mandatory; hero renders instantly, never gated
behind a loader.

**Forms/leads:** server action → `src/lib/lead.ts`, a single delivery seam. If
`RESEND_API_KEY` is set the lead is emailed; otherwise it is logged as JSON and
**success is still reported to the customer** so no message is lost. Telegram is
planned at the same seam (Q-03).

**Key components by size:** `RoofCalculator.tsx` (605), `HouseBuildScene.tsx`
(592), `HeroScene.tsx` (375, `feature/3d-hero`), `RoofCutawayScene.tsx` (335),
`CityPage.tsx` (314), plus `src/scenes/rapidconstruct-scene.js` (485,
`feature/3d-hero`). The 3D scene files are heavily commented with the reasoning
behind every magic number — read the comments before changing values.

⚠️ `HeroBuild3D.tsx` (1,337) also sits on `feature/3d-hero` but is **not wired to
anything** — superseded by the scene port on 2026-07-23. Do not treat its size as
a sign it is the hero.

**CI** (`.github/workflows/ci.yml`), three jobs:
1. `typecheck · lint · build · smoke` — Playwright, **blocking**.
2. `lighthouse (perf budget)` — **blocking**, measures `?no3d=1` (3D deliberately
   excluded from the budget).
3. `lighthouse (3D hero, report only)` — manual-only, non-blocking, and it **still
   crashes on the real hero**. That crash is the honest signal that the 3D hero is
   heavy for low-end phones. Do not "fix" it by hiding it.

**Tests:** 7 Playwright specs — `redirects` (the big one, 97 tests with
follow-to-200 guards), `smoke`, `contact`, `calculator`, `pricing`, `promo-bar`,
`chat-buttons`.

---

## 4. The 3D house — the full story, including what was abandoned

This is where most of the project's time and nearly all of its frustration went.
It is recorded in detail because it is expensive knowledge.

### 4.1 Why 3D exists at all
The homepage hero is a house that **builds itself** — pieces fly in and assemble,
mapped to the company's real service phases (foundation → walls → roof →
openings → finishes). It is the one thing a photograph can never do, and it is
the entire justification for the 3D. The company also trades as "& 3D Design", so
an animated 3D intro demonstrates a service rather than decorating the page.
**Protect the build animation above all else.**

### 4.2 Era 1 — the Blender pipeline (2026-07-14 → 07-22)

A separate Claude Code terminal ran a Blender agent (model: Fable 5) against
`~/HomeRC.blend` via BlenderMCP on port 9876, exporting `public/models/house.glb`
for the site. Its memory was **files, not chat**.

Conventions that converged over ~10 sessions and are worth keeping if Blender is
ever resumed:
- **Exactly one task file** in the repo root named `BLENDER-TASK-*.md`. Two files
  once made the agent re-run a stale task.
- **Options-as-renders before building** any aesthetic change — the owner picks
  from pictures, then we build. This saved the project twice (4 roof options; 3
  de-barn looks). Guessing and shipping cost a full revert cycle.
- **The main session verifies every export independently.** The agent's report is
  a claim, not proof.

**The laws, all bought with pain** (from `BLENDER-NOTES.md`, 843 lines):
- **Verify in the real renderer.** Blender's viewport lies — run the site and
  screenshot it headless.
- **Five-angle + close-in + mobile-drag + ray-scan** before every export. Born
  from a see-through roof hole the owner found on his phone, and scenery lying
  flat.
- **Verification law:** if your check constructs the input it tests for, it proves
  nothing. Born from a fake-UA probe that "proved" a Lighthouse fix that had never
  once fired.
- **Exported-JSON law:** occlusion/texCoord wiring is invisible in Blender's
  viewport — always dump the per-material texCoord table from the exported glb.
  This bug shipped three times and was hand-patched twice.
- **Never instance structural pieces** — an instanced batch animates as ONE piece,
  destroying the one-by-one build.
- **Draw calls (~330 node ceiling), not bytes, are the limit.** Profiled at ~480
  draws/frame; the hero was draw-call-bound at only ~24k triangles.
- **Save the .blend before and after every experiment.** One sprint ended with
  hours of work living only in Blender's RAM.

Reusable recipes were promoted into `~/.claude/skills/blender-buildings/SKILL.md`
(719 lines) so they are never re-researched.

### 4.3 What three research sprints proved (2026-07-21 → 07-22)

**Killed hypotheses — do not revisit:**
- *"The materials are flat colours with no textures."* **False.** The shipped glb
  had 24 materials, 13 images, 7 baseColor-textured materials, roof normal +
  roughness maps. The claim came from a stale 2026-07-15 scene dump now marked
  `⛔ STALE — DO NOT USE` at the top of `BLENDER-NOTES.md`.
- **Anisotropy 8** — measured indistinguishable. Refuted.
- **AgX tone mapping** — measured 24% *less* saturated. Backwards.
- **KTX2 / Basis** — **parked.** The transcoder payload is 570 KB (56 KB JS +
  514 KB wasm), larger than the 109 KB it saves at our scale. Its real win is
  VRAM (~6–8× less GPU memory); revisit only if textures exceed ~2 MB.

**Established facts:**
- The "realistic vs 1.5 MB" trade is **fake**. Measured budget table on stage_D:
  raw 1670 KB → gltf-transform meshopt+webp **861 KB**, projecting to ≈1.2–1.35 MB
  at 1024² textures — under the gate. **Geometry was the fat, not textures**
  (1194 → 486 KB, −59%).
  ⚠️ Tooling gotcha: gltf-transform *decompresses* gltfpack meshopt — keep the
  pipeline gltf-transform-only, or run gltfpack last. npm gltfpack has no BasisU.
- **Teardown of sites that look great:** lusion.co ships 6.6 MB of textures;
  bruno-simon.com ships ~1 MB of draco+basis glbs with **zero realtime lights**
  (all baked). Nobody realtime-lights 300 nodes at 1 MB. **We were the outlier.**
- **Ranked levers by realism-per-hour:** (1) golden-hour lighting rig + warm
  window glow — 0 bytes, 0 draws; (2) camera: level verticals, fov ≈30, polar
  clamp ≥55° — 0 bytes, 0 draws; (3) baked GI lightmap crossfaded on `rested` —
  +53 KB, −165 draws at rest; (4) real ground/context — the single worst region by
  measurement; (5) meshopt+webp — −455 KB; (6–9) roof tile profile, hedge/tree,
  plaster scan, entourage.

**`scripts/realism-score.mjs`** is the harness behind those claims. It compares a
render against an owner photo per region (roof / wall / ground), computing mean
luminance, standard deviation, hue and saturation per region and emitting a
0–100 score. Baselines recorded: current 50, A 50, B 50, C 50, D 52 (roof 73 /
wall 39 / ground 37→45).

> **Three consecutive stages of pure material work moved the score by zero.**

That single measurement is the empirical case for the pivot below, and the reason
texture work was deferred. It is also the most valuable thing the Blender era
produced.

### 4.4 The pivot — 2026-07-22

After a week of the owner saying the model still looked bad, he supplied drone
photos and video of houses his company **actually builds**
(`docs/reference-match/owner-drone-2026-07-22/`, 8 stills committed; ~3.3 GB of
full-res stills and 5 videos live outside git in `~/rc-owner-assets/`).

They showed we had been modelling the wrong house:

| | Our model | His real houses |
|---|---|---|
| Roof form | jerkinhead, one mass | **full hip, multi-level** |
| Massing | block + small wing | 2-storey block + single-storey wing + **open carport** |
| Tile | shallow modular pantile | **deep wavy S-pantile**, anthracite grey-green |
| Walls | warm greige + dark timber cladding | **bright white stucco** |
| Accents | dark timber | **mid-grey scored panels**, thin white reveal lines |
| Chimney | matched to roof | **bare red brick** + grey metal cap |
| Ground | green lawn | **grey/white checkerboard pavers** |

Consequences, all logged in `docs/DECISIONS.md`:
- **Look B dark timber cladding is REVERSED.** The owner approved it on renders;
  the photos prove his company does not build it. **Do not re-propose it.**
- **PR #47 shipped the now-obsolete Look B and was CLOSED, not merged.** Correct
  outcome.
- The grass-lawn plan is **dead** — his houses sit on checkerboard pavers.

### 4.5 Era 2 — procedural three.js (2026-07-23, current)

The Blender GLB pipeline has been **superseded**. The hero is now **procedural
three.js** — parametric geometry and procedural canvas textures, no GLB, no
Blender in the loop.

**The current hero (on `feature/3d-hero`) is
`src/scenes/rapidconstruct-scene.js`** — 485 lines, a byte-identical port of the
scene the owner approved (md5 `68a4fb72172b7695a0f067ec261f7c25`), mounted by
`src/components/HeroScene.tsx` (375 lines). `HouseBuild.tsx` imports `HeroScene`.

*History, 2026-07-23:* the first procedural attempt was
`src/components/HeroBuild3D.tsx`, 1,337 lines built from `docs/3D-HERO-SPEC.md`.
It was replaced the same day by the approved scene port above and is now unwired
dead code. The spec remains the reference for **why** the geometry is shaped as it
is; the scene file is what actually ships.

**The stated design position: stylized-realistic, not photoreal.** Quoting the
spec directly: *"Photoreal realtime archviz at web weight is a losing fight — it
was attempted and abandoned."* And: *"Crisp stylized geometry reads as
intentional. A slightly-melted scan reads as a mistake."*

Hard-won implementation rules now recorded in the spec:
- **A window frame must be a RING of four bars, never a solid box.** Got wrong
  three times. A solid box, however thin, sits in front of the glass and hides it.
- **Rotate geometry *before* translating it.** Translating then rotating spins the
  piece around the world origin and flings it across the scene — this produced the
  "stray sticks" on the roof.
- **The wing roof is one continuous plane** extending past the wall to cover the
  carport and entrance. Treating the porch as a separate roof was "the single
  largest early error".
- **The white soffit is essential** — hip geometry has no underside, so without it
  you see through the roof.
- **Elements on a slope** are placed by fraction along the slope, accounting for
  taper. Ignoring the taper pushed snow guards off the roof edge.
- **Guard the render loop:** `requestAnimationFrame` first, then the update in
  try/catch. An uncaught throw kills the loop permanently and leaves a black
  canvas with no explanation.

Animation contract: `BUILD_END` 4.3 s, `HOLD` 2.1 s, blueprint wireframe
(`#1F4FD6`) draws first and fades as each piece lands; Romanian phase captions
(Proiect → Fundație → Pereți → Acoperiș → Finisaje → RapidConstruct); camera
pulls from radius 20→35 into a drone three-quarter view. Brand accent `#E08039`
eyedropped from the logo.

### 4.6 What the Blender era cost, honestly

- **~9 days of the ~10-day project** had 3D work in flight; the site's entire
  content and SEO surface was built in roughly two of those days.
- **~30 of 60 commits** touch the 3D model or its scene.
- **21 `.blend` backup files** in `~/` (`HomeRC.blend` itself is 9.0 MB).
- Model weight wandered: 1153 KB → 509 KB → 580 KB → 919 KB → 1008 KB → 1.15 MB →
  1250 KB → 1460 KB → 1498 KB → 1309 KB → 1379 KB. Current
  `public/models/house.glb` is **869,692 bytes (850 KB)**.
- Three full research sprints produced **zero realism-score improvement** from
  material work — the finding that redirected the project.
- Two PRs (#43, #44) had to be recovered from the squash-merge orphan trap (§6),
  and one (#47) was built and then closed unmerged when the photos landed.

**The honest lesson, in one line:** the gap was never texture detail — it was
shape, ground, light and camera, and nobody knew that until it was measured. The
measurement harness cost an afternoon; the assumption cost a week.

---

## 5. External services — verified state (2026-07-23)

| Service | State |
|---|---|
| **Vercel** | Project `rapidconstruct-web`, org `sm33xys-projects`, id `prj_WIp1lNai3i0C2RzJWK3kN2rF21yd`. Deployment protection **off** (Q-08). Env: `RESEND_API_KEY` only — see below. The owner review host is served by a **preview build repointed with `vercel alias set`**, because a production build cannot succeed until cutover (by design). |
| **Resend** | `RESEND_API_KEY` **is set** in Vercel Production scope (added ~10 h before this writing). Delivery seam already wired in `src/lib/lead.ts`. Free tier sends from `onboarding@resend.dev` until the domain is verified — early leads may land in spam. |
| **Meshy** | Used once, for a photogrammetry scan of the real house (multi-view, Private licence). Source file is `~/Downloads/Meshy_AI_Blue_Roofed_Modern_Ho_0723131932_generate.glb`, **19.4 MB**, *not* in the repo. Spec records 157 KB after Draco. **Not used for the hero** — dimensionally accurate but wobbly surfaces and scan artifacts in the yard. Kept as a **measurement reference only**. |
| **Higgsfield** | **Evaluated 2026-07-23 in a chat session, never in the repo** — which is why the repo search finds nothing. MCP connected and read calls worked. Cost preflights were obtained: **Meshy multi-image 30 credits**, **Tripo H3.1 multiview 18 credits**. Generation was then **blocked by HTTP 403 `only_website_usage_on_trial_is_available`** — the unlimited passes expired **2026-07-22**. Separately: Higgsfield's public-site "3D" features are **image/video effects, not mesh export** — they cannot produce a model for the web. **Produced no assets.** Nothing to integrate; do not re-attempt without a paid plan and a mesh-export path. |
| **Sketchfab** | Used for scenery assets during the Blender era. **Licence discipline mattered** — no CC-NC on a commercial site. Two assets are credited in `src/components/SiteFooter.tsx` ("bush" by levandreev23032010, "Wooden Fence" by invisiprim3d). Enabling it plus Hyper3D/Hunyuan3D in the BlenderMCP N-panel is **Q-13, still open**. |
| **Tilda** | Still hosts the **live production site and the DNS zone** (`ns1/ns2.tildadns.com`, A → `194.48.203.138`). Owner can log in; Claude reads the admin in a shared browser pane. |
| **GitHub** | `happygamer1919-tech/rapidconstruct-web`, `gh` authenticated as `sm33xy`. |

**Vercel environment variables — verified live (re-checked 2026-07-24):**

```
RESEND_API_KEY         Encrypted   Production
```

🔴 **`NEXT_PUBLIC_SITE_URL` is deliberately ABSENT from Production, and must stay
that way until the RC-403 cutover.** Its absence is load-bearing, not an oversight:

- `IS_UNINDEXABLE_STAGING` keys off the variable being unset. While it is absent,
  every non-production host serves `Disallow: /` plus a `noindex, nofollow` meta.
  Verified live on `https://rapidconstruct-web.vercel.app`.
- **A production build FAILS without it, by design** (`src/i18n/metadata.ts`
  throws). That is the guard working, not a break — it exists so cutover day
  cannot silently publish staging URLs as canonical.
- Consequence: the owner review host is a **preview build repointed with
  `vercel alias set`**, because its `noindex` is baked in at build time.

Restoring the variable is a **cutover-day step (RC-403)** — see the cutover box
in `docs/STATUS.md`, and the near-miss recorded in §9.2 for why this is guarded.
`docs/LAUNCH-CHECKLIST.md` §1 and Q-15 describe the pre-cutover state correctly.

**Domain facts (verified by `dig`/`whois` 2026-07-22, re-checked today):**
`rapidconstruct.md` registered 2025-02-09, expires 2027-02-09, nameservers at
Tilda, **no MX records** — the company runs on Gmail, so a DNS cutover cannot
break their email. Tilda hosts the zone but is *not* the registrar; `.md` domains
go through a NIC.MD-accredited registrar, and NIC.MD hides it in whois. The only
way to find it is to ask the owner **who he paid for the domain**. That registrar
login is the last missing piece for RC-403.

---

## 6. Recurring traps — read before you touch git

### 6.1 The squash-merge orphan trap (has bitten TWICE)

> **Rule: after a PR merges, NEVER push to that branch again. Cut a fresh branch
> from `origin/main`.**

- Round 1: PR #43 merged, work continued on `rc/RC-3d-realism-land` → recovered as #44.
- Round 2: PR #44 merged, work continued on the same branch again → recovered as #47.
  That stale branch predated PR #45, and merging it would have **silently
  reverted** the `/acoperisuri` SEO titles in both locales.

It was caught by diffing **content**, not commit counts — a squash merge makes
every branch commit look "missing" even when its content is already on main.
**Always** run `git diff origin/main <branch> --stat` before opening a PR.

### 6.2 Redirects that 301 into a 404

Three separate instances of the same defect class:
- `/1` → `/reparatii-la-cheie`, a slug never built (301'd into a 404 for weeks).
- `/2` → `/case-constructii`, never built → repointed to `/portofoliu`.
- `/calcul-gard` → `/calculator-gard` (RC-108, not built) → repointed to `/contact`.
  Sending fence traffic to the *roof* calculator would answer the wrong question.

The fix is structural: `tests/redirects.spec.ts` now carries **follow-to-200
guards**, and `PENDING_PAGES` is empty. **Keep it empty.**

### 6.3 Review markers leaking into user-visible strings
`TODO(ru-review)` suffixes once shipped into live titles and UI (2026-07-14). The
rule now: never put review markers in user-visible strings — track machine-drafted
RU in `docs/RU-REVIEW.md` instead.

### 6.4 backdrop-filter creates a containing block
The header carries `backdrop-blur`, which makes it a containing block for
`position: fixed` descendants. The mobile drawer was therefore clipped to the
81 px header height (its nav links unreachable on a phone) and the floating call
button anchored to the header instead of the viewport. Both are now **siblings**
of the header. The closed drawer is also `overflow-hidden`, which removed a 694 px
document on a 375 px viewport.

### 6.5 Shell and tooling gotchas
- `| tail` eats exit codes — use `cmd > /tmp/x 2>&1; echo $?`.
- gltf-transform silently decompresses gltfpack meshopt (§4.3).

---

## 7. Design decisions and their rationale

- **Rebuild rather than fix Tilda** (2026-07-13). Tilda caps SEO control,
  JS-rendering hides facts from crawlers, LCP is slow, and the business is
  investing in the web channel.
- **RO default at `/`, RU at `/ru`, no EN** (2026-07-13). Moldova's search market
  splits RO/RU; RU roughly doubles addressable queries. EN only matters for
  foreign commercial clients (Q-05, default no).
- **SEO/GEO is a build requirement, not a phase** (2026-07-13). Every page ships
  with full metadata, JSON-LD, hreflang and **server-rendered facts** from day
  one. Concrete quotable numbers stay in crawlable text because that is what AI
  engines cite — never client-rendered placeholders like "0+".
- **RU gets its own slugs, before launch** (2026-07-22, RC-201). A Russian speaker
  searches «ремонт крыши Кишинёв» and the URL is both a ranking and a click
  signal. Doing it *before* launch was deliberate — afterwards it would have meant
  a second redirect generation layered on the Tilda ones.
- **Title suffix shortened to "Rapid Construct"** (2026-07-22). The full trading
  name cost 30 characters on every page; 22 of 26 titles exceeded Google's ~60-char
  render purely because of it. Now 12 of 28, and those clip only the brand, never
  the keyword phrase. JSON-LD `name`, `og:siteName` and the share image keep the
  full name — identity, not snippets.
- **`/portofoliu` ships without project metadata** (2026-07-22, Q-14). No
  locality, floor area or completion year, because none were confirmed. *A proof
  page that invents its own proof is worse than no page.*
- **Production builds fail without `NEXT_PUBLIC_SITE_URL`** (2026-07-22). Rather
  than silently emitting staging URLs as canonical on cutover day,
  `src/i18n/metadata.ts` throws. Verified both ways: exits 1 without, 0 with.
- **The privacy policy states only what the code does** — verified before writing:
  no analytics, no tag manager, no tracking cookies (localStorage holds only the
  promo-bar dismissal), `next/font` self-hosts Google fonts so a visit sends
  nothing to Google at runtime, and the sole runtime outbound call is Resend.
  ⚠️ **If RC-404 adds GA4, this page must change in the same PR** — a policy
  describing a site you no longer run is a written false statement.
- **Perf budget measures `?no3d=1`** — the 3D is deliberately excluded from the
  blocking gate, and the separate 3D report job is allowed to fail loudly rather
  than be silenced.

---

## 8. Open questions — full status

From `docs/QUESTIONS.md`, with verified corrections.

| # | Question | Status |
|---|---|---|
| Q-01 | Brand: keep or refresh? | **OPEN** — default: keep logo, modernize palette |
| Q-02 | What are Tilda `/1`–`/6`? | **RESOLVED** 2026-07-13 |
| Q-03 | Where should leads go (email/Telegram/both)? | **OPEN** — blocks RC-404, Telegram half of the seam |
| Q-04 | Domain/DNS + Tilda access | **PARTIAL** — Tilda access works; **registrar login still missing**, blocks RC-403 |
| Q-05 | EN version ever needed? | **OPEN** — default no |
| Q-06 | Real photos | **Effectively ANSWERED** by the 2026-07-22 drone drop; doc still says OPEN |
| Q-07 | Are the claimed numbers accurate? | **OPEN — blocks launch.** Publishing unverified claims is a trust and legal risk |
| Q-08 | Disable Vercel deployment protection | **RESOLVED** 2026-07-22 |
| Q-09 | Resend credentials | **Doc says OPEN — but `RESEND_API_KEY` IS SET in Vercel.** Needs an end-to-end submit to confirm, then close |
| Q-10 | Calculator prices | **OPEN** — 2 ceramic entries withheld; other 11 ship |
| Q-11 | Pick ONE house to photo-match | **ANSWERED** by the drone house; doc still says OPEN |
| Q-12 | Is the 3D hero still the right call? | **GENUINELY OPEN** — see below |
| Q-13 | Enable Sketchfab / Hyper3D / Hunyuan3D | **OPEN** — moot while Blender is out of the loop |
| Q-14 | Portfolio project metadata | **OPEN** — ship as-is, enrich when supplied |
| Q-15 | Canonical domain: apex or www? | **OPEN — needs the owner's confirmation.** Apex `https://rapidconstruct.md` is the recommendation (it matches the Tilda URLs, so legacy 301s land with no extra hop). The value is **not** set in Vercel and must not be until RC-403 (§5, §9.2) — confirm the choice now, apply it on cutover day |
| Q-16 | Privacy policy: legal entity + retention period | **OPEN** — page is accurate as written |
| Q-17 | Pre-existing homepage a11y audits | **OPEN, not blocking** — `aria-hidden-focus` on the closed drawer; two `<dl>` stat blocks lacking `<dt>`/`<dd>` |

**Q-12 deserves a real conversation.** The owner has hundreds of photos of
finished houses, and a photograph cannot look fake. The 3D's unique value is the
build animation. It is worth asking whether the hero should be a photo with the
3D build living further down the page. That is his call, and a week of evidence
now supports asking it properly.

---

## 9. Corrections to earlier documents (verified 2026-07-24)

`HANDOFF-2026-07-22.md` and several docs are partly stale. Trust this file and
`docs/STATUS.md` where they differ; where **this file** and STATUS differ, STATUS
wins — it is updated more often.

1. **Vercel env: `RESEND_API_KEY` only.** `LAUNCH-CHECKLIST.md` §1 and Q-09 say
   the project has zero environment variables — that is stale, the Resend key is
   set. `NEXT_PUBLIC_SITE_URL` is deliberately absent and must stay absent until
   RC-403 (§5).

2. **📋 NEAR-MISS, 2026-07-23 — resolved the same day. Recorded so it is not
   repeated.**

   **What happened.** `NEXT_PUBLIC_SITE_URL` was added to Vercel Production and a
   production deploy was run. `IS_UNINDEXABLE_STAGING` keys off that variable
   being *unset*, so setting it silently disabled the safeguard across every
   non-production host.

   **The exposure, measured live at the time:** `robots.txt` flipped to `Allow: /`
   with `Host:`/`Sitemap:` pointing at `https://rapidconstruct.md`; the `noindex`
   meta disappeared; `sitemap.xml` advertised **30 URLs** on a domain that still
   serves Tilda (`x-tilda-server: 22`). Most of those URLs 404 there —
   `/acoperisuri`, `/ru/kryshi`, `/politica-de-confidentialitate` all 404, while
   `/portofoliu` returned 200 only because Tilda happens to have that page. A
   crawlable staging host was publishing a sitemap of mostly-dead URLs: the exact
   mirror image of the risk `docs/DECISIONS.md` was written to prevent.

   **Root cause.** The safeguard's trigger is the *absence* of a variable, so
   setting that variable for an unrelated reason disabled it silently. Nothing
   failed loudly, because a passing production build is the normal outcome.

   **What caught it.** A live HTTP re-check of `robots.txt` and the `noindex` meta
   during a state audit — not CI, and not the build. CI cannot see this: the
   blocking Lighthouse job measures `?no3d=1` on a preview, where the safeguard
   was still engaged.

   **Fix applied the same day.** The variable was removed from Production, which
   re-engaged the safeguard, and the owner review host was repointed to a
   **preview build** via `vercel alias set` so its `noindex` is baked in at build
   time. Verified after the fix, and again 2026-07-24: `Disallow: /` plus
   `noindex, nofollow` on the staging host.

   **Standing lesson.** Do not set `NEXT_PUBLIC_SITE_URL` before cutover, and
   treat any absence-triggered safeguard as fragile — after touching Vercel env or
   running a production deploy, re-check `robots.txt` and the `noindex` meta on
   the live host rather than trusting the build.

3. **A Production deployment was run on 2026-07-23**, contrary to `AGENTS.md`,
   which reserves `vercel deploy --prod` for the RC-403 cutover. It was the
   mechanism that activated the near-miss above. It is now impossible to repeat by
   accident: with `NEXT_PUBLIC_SITE_URL` absent, a production build **fails by
   design**, so `--prod` cannot succeed until cutover.

4. **`docs/blender-tasks-done/` holds 4 entries, not 23** as the handoff states
   (3 research task files + a `surface-research` folder). The other archived tasks
   referenced throughout `BLENDER-NOTES.md` are not in the repo.

5. **`public/models/house.glb` is 850 KB**, not the 1.04 MB in the handoff. It is
   also no longer loaded by the current hero.

6. **The handoff's "three live hazards" are resolved.** The uncommitted research
   is committed (working tree is clean), PR #47 was closed rather than merged, and
   the scratch `*.mjs` files are gone from the repo root.

7. **`BLENDER-AGENT.md` does not exist** in the repo, though `HANDOFF-2026-07-22.md`
   and `BLENDER-NOTES.md` both reference it. `BLENDER-TASK-owner-photomatch.md`
   (the "active" 3D task) still sits in the root but has been overtaken by the
   procedural rebuild.

8. **The sitemap has 30 URLs**, not the 28 the launch checklist expects. Worth
   reconciling before cutover.

---

## 10. If you are picking this up cold

Read in this order: this file → `docs/STATUS.md` → `AGENTS.md` → the open
questions. Then:

- **The site is nearly launch-ready and is blocked on owner answers, not
  engineering.** Q-07 (are the numbers true) and Q-04 (registrar login) are the
  real blockers; Q-10 gates two calculator entries.
- **The indexing near-miss of 2026-07-23 is fixed** (§9.2) — re-verified
  2026-07-24. Nothing to do; just never set `NEXT_PUBLIC_SITE_URL` before cutover.
- **Do not restart Blender work** without a decision on Q-12. The current hero is
  procedural three.js and the Blender pipeline is dormant. If it is resumed, read
  `BLENDER-NOTES.md` and the skill file first — nearly every obvious idea in that
  space has already been tried and measured.
- **Do not re-propose dark timber cladding.** It is photographically settled.
- **Do not regress the build animation.** It is why the 3D exists.
