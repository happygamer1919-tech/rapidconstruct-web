# STATUS — RapidConstruct website

Living board. Background and reasoning live in `docs/PROJECT-MEMORY.md`; this
file is only *what is true now and what happens next*.

**Last updated: 2026-07-24** — verified against git, the Vercel API, the
indexability tripwire and live HTTP checks, not recalled.

## Current state

| | |
|---|---|
| **Owner review URL** | **https://rapidconstruct-web.vercel.app** — public, no login, **non-indexable** (verified). Shows the new 3D hero. |
| Immutable build behind it | `https://rapidconstruct-n5c1575vn-sm33xys-projects.vercel.app` |
| **Production site** | `rapidconstruct.md` — **still Tilda** (`x-tilda-server: 22`, A `194.48.203.138`, NS `ns1/ns2.tildadns.com`). **DNS untouched.** |
| **Default branch** | `main` @ `c0f3f5b` — carries the Q-08 safeguard (cherry-picked) plus the corrected memory docs and `CLAUDE.md`. No 3D work. |
| **Working branch** | `feature/3d-hero` @ `6008dee` — the approved scene port. Ahead of `main`; unmerged by design. |
| **Open PRs** | None. |
| **Vercel env** | `RESEND_API_KEY` (Production) only. **`NEXT_PUBLIC_SITE_URL` deliberately absent** — see the cutover box below. |
| **Repo** | `happygamer1919-tech/rapidconstruct-web`, Vercel project `rapidconstruct-web` (org `sm33xys-projects`) |
| **Dev server** | `npm run dev` → port 3800 |
| **Pages** | 16 routes × RO/RU |

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

### Regression guard

`scripts/check-indexability.mjs <url>` asserts that any host which is not
`rapidconstruct.md` must be non-indexable, and that the real domain must be.
**Run it after every deploy.** It exists because the build-time protection and
the CI tests both passed while the live site was indexable — the failure was
environmental (an env var set before cutover), which CI structurally cannot see.

Last run **2026-07-24** against `https://rapidconstruct-web.vercel.app` →
**PASS** (`Disallow: /`, no sitemap advertised, `/`, `/ru` and `/acoperisuri` all
200 + `noindex`).

**LANE B — 2026-07-24:** the guard has been brought onto a `main`-based branch.
The standalone script was copied from `feature/3d-hero` (byte-identical, commit
`aac0e01`) onto `rc/RC-guard-indexability` off `main` — no 3D files touched.
Re-verified before landing: PASS against `https://rapidconstruct-web.vercel.app`
(exit 0), and `npm run build` exits 0.

**Merged to `main` [#57]** (`c1cea7d`) — `scripts/check-indexability.mjs` is on `main`.

---

## 🔴 Done

Shipped and verified. PR numbers in brackets.

- **three.js dedupe (RC-113) + shadow-emitter location (RC-114)** (2026-07-24,
  `rc/RC-113-three-dedupe`, off `main`). Investigation-first, non-blocking, **no
  3D behavior changed**. Diagnosis: the tree carried two `three` copies —
  `three@0.185.1` (direct, r185) and `three@0.170.0` (r170) nested under
  `stats-gl@2.4.2`, a `@react-three/drei` dep whose `three@^0.170.0` caret (a
  `0.x` caret = `>=0.170.0 <0.171.0`) r185 can't satisfy. **Dedupe APPLIED** —
  `overrides: { "three": "$three" }` collapses the tree to one `three@0.185.1`
  (nested copy gone from `package-lock.json` + `node_modules`); `npm run build`
  exits 0; all **106 Playwright tests pass**. The dup lives on `main` itself (all
  4 packages declared there), not only under a 3D lane, so it was safe to fix
  here. **RC-114:** `PCFSoftShadowMap` is emitted in `applyRenderer` at
  `src/scenes/rapidconstruct-scene.js:659` on `feature/3d-hero` and `:250` on
  `feature/configurator` (`r.shadowMap.type = THREE.PCFSoftShadowMap;`); **not on
  `main`**. Located only — shadow type UNCHANGED. Prior STATUS line ref `487–494`
  was stale; anchor on the `applyRenderer` name / `shadowMap.type` grep, not the
  line number. Full findings: `docs/RC-113-three-dedupe.md`.
  **Merged to `main` [#53]** (`bbd4176`) — the overrides dedupe + `docs/RC-113-three-dedupe.md` are on `main`; shadow type located only, unchanged.
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
- **3D hero — framing, reveal + legibility** (2026-07-23 evening,
  `feature/3d-hero`). Canvas is full-bleed and the build animation plays
  edge-to-edge with nothing over it; the copy and its backdrop fade in only once
  the build settles. The full-screen scrim was replaced by a local translucent,
  blurred panel behind the copy (34% of the hero on desktop, 58% Pixel 7, 77%
  iPhone) rather than a full-screen wash. Hero text contrast measured on the live
  build: lowest 4.61:1, every element clearing WCAG AA on desktop and mobile —
  was 1.53:1 worst case before this work. Portrait framing holds a constant
  HORIZONTAL fov plus a small `setViewOffset` lift (1.06), so the site is never
  cropped through the building. Shader warm-up runs before the clock starts, or
  the 4.3 s build was ~80% over by the second drawn frame.
- **3D hero — approved scene ported** (2026-07-23, `feature/3d-hero`).
  `src/scenes/rapidconstruct-scene.js` is a byte-identical copy of the supplied
  source (md5 `68a4fb72172b7695a0f067ec261f7c25`); `src/components/HeroScene.tsx`
  mounts it. Build animation, phase captions, reduced-motion and low-end
  fallbacks all verified on the live deployment. Replaces the older
  `HeroBuild3D.tsx`, which is now unused.
- **Memory docs repaired** (2026-07-24, `main`). `docs/STATUS.md` had been left in
  the working tree with **literal merge-conflict markers** and an unmerged index
  entry; resolved by keeping both sides' facts rather than dropping either
  [`1cc24d0`]. `CLAUDE.md` added as a pointer to PROJECT-MEMORY + STATUS so a
  fresh session stops re-deriving settled decisions [`702e3c8`].
  `docs/PROJECT-MEMORY.md` corrected [`c0f3f5b`]: §5 now states that
  `NEXT_PUBLIC_SITE_URL` is deliberately absent; §9.2 rewritten from "a live
  defect" into a **dated near-miss** with root cause, what caught it and the
  standing lesson; and four further stale claims fixed — §2/§3/§4.5 had all
  called `HeroBuild3D.tsx` "the current hero" long after the scene port
  superseded it, plus Q-15 and §10.
- **SEO/GEO route-by-route sweep** [#58] (2026-07-24, `rc/RC-seo-geo-sweep`, LANE B, merged to `main`).
  All **32 route+locale URLs** (16 routes × RO/RU) audited against the real
  rendered HTML for title / meta description / canonical / hreflang+x-default
  reciprocity / OG / JSON-LD validity / single H1 / `<html lang>`. **30/32 rows
  pass all 8 checks; no broken defect on any public route.** Full scorecard in
  `docs/SEO-AUDIT-2026-07-24.md`; repeatable via `scripts/seo-audit.mjs` +
  `seo-eval.mjs`. **2 mechanical fixes:** shared `@id` on the sitewide + city
  LocalBusiness JSON-LD so the city pages' second LocalBusiness node merges into
  one entity (Q-15-safe, keyed off `SITE_URL`); locale-distinct `/styleguide`
  title+description (was a duplicate RO/RU pair). **2 items FLAGGED for Q-07** —
  the `home` (176ch) and `despre-noi` (169ch) RO meta descriptions run just over
  160 chars but are built around the unverified claim numbers ("30 de ani",
  "160 lei/m²", "15 ani"), so the copy is left for Max's Q-07 pass, not trimmed.
  **0 Q-15 changes** — canonical tags are structurally correct on all 32 pages;
  the host value (apex vs www) stays owner-owned, set at cutover. Staging
  `noindex` confirmed present sitewide (expected). `npm run build` exit 0.
- **RC-402 pre-launch audit — non-host items** [#54] (2026-07-25, merged to `main`).
  Route liveness on the 30-URL set (RO+RU, no 301→404), offline structured-data
  validation, OG completeness; `docs/LAUNCH-CHECKLIST.md` updated. Canonical-host
  re-verify **deferred to Q-15 → RC-403** (host unset until cutover, by design).
- **RC-402 sitemap reconcile (merge-aware)** [#55; **#56 closed — superseded**]
  (2026-07-25, merged to `main`). Sitemap is **30** `<loc>` on `main` (15 routes ×
  2); the stale "28" in the checklist was corrected. **Target 32** after
  `feature/configurator` merges (+`/configurator` RO + `/ru/konfigurator`).
- **Indexability tripwire** [#57] (2026-07-25, merged to `main`).
  `scripts/check-indexability.mjs` asserts every non-`rapidconstruct.md` host is
  non-indexable and the real domain must be — the guard CI structurally can't see.
- **CI green — lint fix** [#59] (`4334021`, merged to `main`). ESLint flat-config
  override allows CommonJS `require()` in `tools/**` (the `board-server.js` from
  #51 tripped `no-require-imports` and reddened `typecheck·lint·build·smoke` on
  `main` and every PR). Override, not rewrite — the script needs `__dirname`.
- **3D hero — glass + perimeter fence** (2026-07-25, `feature/3d-hero`). Glass now
  reads as dark reflective glazing, not a see-through pane (`fe0442d`); the plot is
  enclosed with left/right/back fence runs (`7b42033`). On `feature/3d-hero`, not
  merged to `main` — the hero lives on its branch by design.

> **CI note:** `lighthouse (perf budget)` stays red on `main` and every PR **by
> design** — the noindex staging safeguard fails Lighthouse's `is-crawlable` SEO
> audit below the 0.9 gate. Self-clears at RC-403 when `NEXT_PUBLIC_SITE_URL` is
> set. Not a regression; do not "fix" it, and never add the env var.

---

## 🟡 In Progress

| Item | Where | State |
|---|---|---|
| **3D hero — owner review** | `feature/3d-hero`, `src/components/HeroScene.tsx` | Ported and live at the owner review URL. Awaiting the owner's verdict. Not merged to `main` by design. `HeroBuild3D.tsx` is now dead code — delete it once the owner signs off on the new scene. |
| **3D hero direction (Q-12) — internal** | homepage flow | **Internal decision, not owner-blocked** (reclassified from B9, 2026-07-25). Whether the hero leads with the 3D build, a real photo, or a Higgsfield restyle. **Gated on the homepage flow being settled** (Higgsfield hero pass + slideshow placement); then it goes to the owner. Do not ask him yet. |
| **RC-104 Portfolio** | `/portofoliu` | **Partial.** Page ships with 8 real photos, tags, ItemList JSON-LD, sitemap entry — the nav 404 is gone. Not done: filters, per-project detail pages, before/after sliders. **Q-14 (2026-07-25): photos in hand; 4 projects now have locality + area + work type harvested from the client's live site** (Orhei 100m² / Costești 320m² / Cahul 180m² / Chișinău 280m² — see QUESTIONS.md Q-14). **YEAR still missing for all; metadata must NOT be invented.** Others caption by visibly-true facts only. |
| **Homepage project slideshow — shell (LANE B)** | `feature/project-slideshow` @ `521cfca`; preview `/slideshow-preview` (RO + `/ru/slideshow-preview`) | **Shell built + pushed, placeholder content only.** Full-bleed data-driven slideshow (auto-advance/crossfade/pause-on-hover/reduced-motion), scrim + RO/RU headline, data from one array (`src/data/slideshow.ts`), 5 labelled PLACEHOLDER images. **Q-14 partial (2026-07-25): photos in hand** — may swap placeholders for real photos with **visibly-true captions only, no invented location/year/m²**. Still pending: the **Higgsfield hero decision** (placement decided after that). Not wired into the live hero; noindex; no PR yet by design. |

---

## 🔴 Blocked

Each row names **exactly what unblocks it** and **who owns it**.

| # | Blocked item | What unblocks it | Owner |
|---|---|---|---|
| ~~B1~~ | ~~Staging host crawlable~~ — **FIXED 2026-07-23.** Env var removed, both hosts verified `Disallow: /` + `noindex`, tripwire added. | — | done |
| ~~B2~~ | ~~RC-403 DNS cutover — registrar login missing~~ — **RESOLVED 2026-07-25 (Q-04):** the owner **has** the domain/registrar credentials. No longer owner-blocked. RC-403 is now a **sequencing / owner-timing** step, NOT blocked on access — **DNS stays untouched, `NEXT_PUBLIC_SITE_URL` is NOT added, and the cutover stays the owner's call.** | — | done |
| **B3** | **Q-07 — unverified claims (ESCALATED 2026-07-25)** | **The client's OWN live site contradicts itself:** "15000+ Proiecte" vs "Peste 500 de case"; "5/5" vs "4.9/5 din 250+ recenzii"; "garanție 30 ani" vs FAQ "3–50 ani". **Do NOT copy any of them.** Owner must pick ONE consistent set before publishing. | **Max** |
| **B4 🟡 (fences only)** | **Q-10 — configurator prices** | **ROOFS SHIPPED 2026-07-25** → `feature/configurator` (`a32caeb`): metalică 1100 · șindrilă 1200 · rocă vulcanică 1400 · **ceramică 1600** lei/m² (montaj inclus, "de la") — Imperlux 450/550/800 removed, ceramică in JSON-LD, estimate "de la {total}", disclaimer "nu o ofertă contractuală". **§1b roof gate CLEARED.** **Still blocked:** **fences** — only jaluzele = **2900 lei/METRU LINIAR** (unit ≠ m² — schema needs a per-`ml` field); șipcă/plin/combinat unanswered. **"160 lei/m²" DOWNGRADED** to a normal open question (banner vs configurator disagree on-page; owner decides keep/remove/qualify — not blocking). Roof-calc ceramic (Creaton 57/58) still pending. | **Max** |
| **B5** | **Q-03 — Telegram lead channel** | Owner picks the destination (email only, or email + Telegram, and which chat). Email already works; the Telegram notifier hangs off the same seam in `src/lib/lead.ts`. | **Max** |
| **B6** | **RC-404 analytics** | Q-03 (above), plus a GA4-vs-Plausible choice. ⚠️ **If GA4 lands, `/politica-de-confidentialitate` must change in the same PR** — the policy currently states there is no analytics. | **Max** decides; Claude implements |
| ~~B7~~ | ~~Q-15 — canonical host confirmation~~ — **RESOLVED 2026-07-25: APEX `rapidconstruct.md` (no www)**, matching the client's existing canonical. Fixes only the VALUE to use at cutover; `NEXT_PUBLIC_SITE_URL` stays absent and DNS untouched until RC-403 (owner's call). | — | done |
| **B8** | **Q-16 — privacy policy completeness** | Owner supplies the registered legal entity + IDNO, and a concrete retention period. The page is accurate as written without them. | **Max** |
| ~~B9~~ | ~~Q-12 — is the 3D hero still the right call?~~ — **RECLASSIFIED 2026-07-25 → In Progress (internal), not owner-blocked.** We are deliberately **not** asking the owner yet; the decision is gated on the **homepage flow** (Higgsfield hero restyle + slideshow placement) being settled, then it goes to him. See the In Progress row. | — | internal |
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

## 🟢 Next

In order. Items 1–3 need no owner input.

1. ~~Fix B1~~ — **done** (2026-07-23).
2. ~~Cherry-pick the Q-08 safeguard onto `main`~~ — **done** (`249e9ad`, `0f6d516`).
3. **Cherry-pick `scripts/check-indexability.mjs` onto `main`.** It is the guard
   STATUS tells you to run after every deploy, and it currently exists only on
   `feature/3d-hero` — unavailable from the default branch exactly when it is
   needed. Standalone script, no dependency on the 3D work.
4. **Owner reviews the new 3D hero** at the review URL. On sign-off: delete the
   unused `HeroBuild3D.tsx` and decide whether the hero merges to `main`.
5. ~~**Reconcile the sitemap count**~~ — **done 2026-07-24** (`rc/RC-402-sitemap-merge`,
   off `main`). Re-verified on `main`: the sitemap emits **30** `<loc>` (15 routes
   × 2 locales; `/styleguide` correctly `noindex` + excluded), and the checklist's
   "28" was one route stale (the privacy-policy pair from PR #50 was never counted).
   Checklist §2 updated to 30 and made **merge-aware**: after
   `feature/configurator` merges the target is **32** (+`/configurator`,
   +`/ru/konfigurator`). A self-check note with both counts now sits at the top of
   `src/app/sitemap.ts`. `npm run build` exits 0. No code logic, host or canonical
   changed. (Supersedes the earlier unmerged `rc/RC-402-sitemap-reconcile`, which
   reached the same 30 but was not merge-aware.)
   **Merged to `main` [#55]** (`883da9e`, `8f80f36`); `rc/RC-402-sitemap-reconcile`
   (#56) closed as superseded.
6. **Close the questions the repo has already answered:** Q-06 and Q-11 (drone
   photos landed), Q-09 (Resend key is set — verify with one real form submit
   end-to-end, then close). **Q-15 needs the owner's decision, not just
   confirmation** — apex vs www is still unanswered, and the value is deliberately
   *not* set in Vercel until cutover.
7. **Chase the owner on B3 / B4 / B2**, in that order — Q-07 and Q-10 gate
   published claims and money figures; the registrar login gates the whole launch.
8. **Unblocked engineering while waiting:** RC-301 (apply the keyword map to
   remaining titles/H1s), RC-202/203 (RU translations for owner review),
   Q-17 a11y fixes (`inert` on the closed drawer, `<dt>`/`<dd>` in the two stat
   blocks), RC-111 construction-story section.
9. **Housekeeping:** remove the stray `rapidconstruct.md` domain attached to the
   Vercel project on 2026-07-23. It does not affect DNS or serving (DNS still
   points at Tilda) but it is undocumented state.
10. **Launch chain** once B2/B3 clear: RC-402 final audit → RC-403 cutover →
    RC-404 analytics.

---

## Housekeeping

- **~18 stale local branches** and several remote ones whose PRs are merged or
  closed. Safe to prune everything except `main` and `feature/3d-hero` — but
  **diff content, not commit counts, before deleting** (see the squash-merge trap
  in `PROJECT-MEMORY.md` §6.1).
- **Lane-label correction (2026-07-25).** The `feature/3d-hero` realism commits
  `dca2603` / `ac046b9` / `8054c44` / `ea3bff4` are labeled "LANE B step 1-4" but
  are actually **LANE A** (serial 3D-hero visual work). Pushed history is **left
  as-is** (not rewritten); commits from here use the correct `LANE A` label, and
  every commit subject states its lane + ticket. Lanes: A = `feature/3d-hero`,
  B = main-line non-hero, C = `feature/configurator`. See
  `claude-toolkit/CLAUDE.md` → Standing rules (BOARD DISCIPLINE + NAMING).
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
