# TASK: the roof, tile by tile — and keep pushing realism

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

Your hollow + de-gum + 155-segment wall pass landed and the owner liked it. Two
notes from the site side before the new work:
- Your **glass opacity 0.30** claim was measured and **HELD** — window mean
  luminance 146.7 → 137.6, deeper glazing, contrast unchanged. Shipped. That is
  the first site-side recommendation of yours to survive measurement (the AgX one
  measured out backwards). Keep sending them as testable claims.
- Your COLOR_0 warning was checked against the rendered house: 0% near-black
  pixels. The 85 meshes without COLOR_0 use materials that don't read vertex
  colours, so they were never at risk. No action needed — just so you know.

## JOB 1 — THE ROOF, SAME TREATMENT AS THE WALLS

Owner: **"make the roof, the same"**.

The walls now assemble from 155 individual segments — and then the roof lands as
**two big slabs**. That is the "full square" problem all over again, just upstairs:

| | pieces today |
|---|---|
| walls | 155 segments |
| roof | `roof_main` (176 tris) + `roof_wing` (144 tris) + `ridge_main` + `ridge_wing` + `entry_roof` + `chimney` + `chimney_cap` + 3 × `roof_timber_*` = **10 nodes** |

Split it so the roof BUILDS:
- **Each hip slope, course by course**, from eave up — the same bottom-up read the
  walls have. Every slope of every volume (main + wing + entry porch).
- **Ridge and hip caps as individual caps**, not one long bar. They should click
  on one at a time along each hip.
- **Chimney**: worth a few courses of its own if it's cheap.
- Keep `roof_timber_*` as they are unless splitting is trivially cheap.

**Naming — must keep the phase-2 prefixes or the build breaks:**
`roof_main_s1_c01…` (slope 1, course 01 = eave), `roof_wing_s2_c03…`,
`ridge_main_01…`, `entry_roof_c01…`. Anything starting `roof_`/`ridge_`/`chimney`
lands in phase 2 (Acoperișul). Anything that does NOT will silently fall back to
**phase 1 (walls)** and fly up out of the ground mid-build — that is the failure
mode to avoid, so check your names.

### ⚠ HARD BUDGET — this one is new and it is real
The owner reported the site as **"super laggy"** yesterday and I fixed it
site-side (the canvas was re-rendering a static house forever — 140ms → 16.6ms
per idle frame). But the underlying cost is still there: **every node is a draw
call**. We are at **240 nodes**. During the 1.2s build we draw all of them each
frame, plus a shadow pass — that is what a cheap phone chokes on.

So: **do NOT give me 150 roof pieces.** Target **60–90 roof pieces**, ~300–330
nodes total, and **report the final count**. If you believe the roof genuinely
needs more to read well, say so and STOP — going past ~350 means we need
InstancedMesh on the site first (a real change to how the build animates), and I
would rather wire that deliberately than discover it from a lag complaint.

Prefer **shared/linked geometry** for repeated tiles and caps (same mesh data,
different transforms) — it keeps the file small and sets us up for instancing later.

## JOB 2 — KEEP PUSHING THE HOUSE ITSELF

Owner: "once the animation is done we need to **work more on the house**". The
resting state is what visitors actually stare at — the build is over in 1.2s, the
finished house is on screen forever. Judge everything from the street-level hero
camera in **three.js**, not the Blender viewport.

Your own deferred list, still open — pick what buys the most realism per byte:
- **Bay window + dormer** ("more building") — you offered this twice; bytes allow it.
- Roof surface: does the new tile geometry make the 256² roughness noise
  redundant, or do they compound? Measure the bytes both ways.
- Eave/soffit depth, rafter tails, door and chimney detail.
- Anything from Job 3 that proves out.

## JOB 3 — MORE SKILLS (the owner keeps asking, in capitals)

Hunt beyond what you have. **Download, install, RUN, screenshot** in a scratch
collection — never on the house:
- **extensions.blender.org**: roof/tile generators, greebles, bake helpers.
- **BlenderKit** (✅ already proven headless — mine it harder for roof tile,
  brick and timber PBR).
- **Material Library VX** (✅ proven), **ambientCG**, **Poly Haven** (✅ proven),
  Gumroad free (Buildify node setups), GitHub bake/ORM pipelines.
Verdict per tool: `✅works / ❌broken / ⚠️works-but-heavy` + one line on what it
contributed + a screenshot. **A tool you did not run is a rumor.** Promote what
survives into `~/.claude/skills/blender-buildings/SKILL.md`.

Remember your own hard-won gotchas: `img.scale()` does not stick on packed images
(that one shipped a 4.17 MB PNG and blew the file to 5.4 MB before `inspect`
caught it) — it is in the skill, keep it there.

## HARD constraints
- Phase contract: P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact
  `main|wing|entry` + `_interior$` + **everything unmatched (fallback)** ·
  P2 `^(roof_|ridge_|entry_roof|chimney)` · P3 `^(w\d+_|sill|door|handle)` ·
  P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
  Report every new node name + intended bucket.
- **< 1.5 MB.** Currently **919 KB**, so ~580 KB free. No Draco/WebP GLB — the
  loader is not wired. If something is heavy: decimate, bake down, or drop it, and
  say what you dropped.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Backup first: `HomeRC_backup_roof.blend`.
- Build is **1.2s**, a piece every ~9ms, each flying in as blue wireframe and
  landing bottom-up. More pieces = a richer build, but see the draw-call budget.
- **Verification law:** if your check constructs the input it is testing for, it
  proves nothing. Real Blender screenshots, real three.js hero renders, real byte
  counts from `gltf-transform inspect`. Blender's viewport lies.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- **Roof:** piece count (per slope/volume), naming, how it reads in the hero render.
- **Node total** — flag immediately if it goes past ~330.
- House work: what you added and the before/after hero render.
- Tools: name → source → ✅/❌/⚠️ → contribution. What you promoted to ✅verified.
- Honest byte accounting + what you dropped.
- Any site-side recommendation as a **testable claim** — we measure them.
