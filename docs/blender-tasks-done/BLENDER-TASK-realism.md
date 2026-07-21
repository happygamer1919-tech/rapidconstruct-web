# TASK: learn the skills first, then make the house REAL — not heavier

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` before anything else. Note the
CORRECTED block in BLENDER-NOTES §"What the site actually shows": the **hero IS
the model**, and Design3D/Model3D are dead code. The homepage hero is the only
thing that matters.

## Owner verdict (2026-07-16)
Archetype A landed and the shapes are right. His words: **"it still looks too
unrealistic"**, he wants **more detail and more building**, and — explicitly —
**"let's make sure that we learn more skills before writing the prompt"**. So this
task is RESEARCH-FIRST. Do not open HomeRC.blend until Phase 1 is done.

## THE CONSTRAINT THAT CHANGED TODAY — read this before you plan anything
The house is **1.15 MB uncompressed** and it is **already too heavy**. Proven, not
guessed: the real hero **crashes Lighthouse** on a throttled 2-core runner
(`PAGE_HUNG`, then `Network.getResponseBody` timeout). The audit cannot even finish
scoring it. That is not a CI defect — it means a low-end phone has a bad time.

So the blocking speed gate now measures the page with the 3D **skipped**
(`?no3d=1`), and a separate manual job measures the real hero. **We are not
pretending the hero is free.** It is on the record as too heavy.

Which means: **realism must not cost geometry.** "More detail" delivered as more
polygons makes a shipped problem worse. The wins we want are the ones that cost
~nothing at runtime:
- baked normal/AO maps instead of modelled relief,
- one small texture atlas instead of many materials,
- bevel + weighted normals (already in your skill — pennies per edge),
- renderer-side lighting/tone-mapping, which costs **zero bytes**.

**If you conclude the hero simply cannot be both realistic and light enough, say
so.** That is a finding, not a failure, and the main session will act on it (DRACO
is measured and ready: 1.04 MB → 36.9 KB). Do NOT quietly blow the budget.

## Phase 1 — LEARN (do this first, report before touching the model)
Your skill (`~/.claude/skills/blender-buildings/SKILL.md`) covers roof tiles,
bevel+weighted normals, standing seam, trim sheets, baked tile normals, glTF
slimming and the three.js verify loop. It has **nothing** on the things that
actually make this read as CG. Research, verify, and write up:

1. **PBR texturing on a web budget.** Every material on the house is a single flat
   RGB — no albedo texture anywhere. That is probably the single biggest tell.
   Cover: atlasing, resolution choices, ORM channel packing, what glTF/three.js
   actually support.
2. **Baked AO + contact grime** (bpy: bake settings, cage, margin, failure modes).
   Dirt where parts meet, streaks under gutters, a grime line at the plinth. Costs
   nothing at runtime — it is in the texture.
3. **Free PBR sources from Blender**: Poly Haven (addon already verified working)
   and ambientCG — plaster/stucco, split-face stone, roof tile, dark timber.
4. **Cheap ground + planting** for glTF: low-poly vs alpha cards, three.js alpha
   sorting traps, what fits in <300 KB. The house currently floats on a flat green
   disc with no context, which reads as a model, not a home.
5. **Renderer-side realism — possibly the biggest win, and it costs ZERO bytes**:
   ACES/AgX tone mapping, colour space, HDR choice and intensity, shadow softness,
   SSAO via @react-three/postprocessing, and their real perf costs. **Report these
   separately and clearly — the main session implements them, not you.**
6. **Existing skills/addons/MCPs worth adding.** Only report what you can evidence
   exists. Poly Haven / Sketchfab / Hyper3D Rodin are already installed + verified.

Use the routes you PROVED last session: claude-in-chrome for Reddit (automated
fetch is blocked), `watch` for video, and the web-render loop. Promote anything you
verify from 🔬researched to ✅verified **with screenshots**, and write it into the
skill. **Verify in Blender before you trust it — and then verify in three.js,
because Blender lies.**

### One hard rule about verification, learned the expensive way today
The main session "proved" a Lighthouse fix worked using a probe with a **fake user
agent it had written itself** — it tested its own regex against its own fake input
and proved nothing, while the real thing had never worked once. **If your
verification constructs the input it is testing for, it is worthless.** Read what
the real tool actually did: the real render, the real network log, the real bytes.

## Phase 2 — APPLY (only after Phase 1 is reported)
In this order, judging each in a **three.js hero screenshot**, not the viewport:
1. Bevel + weighted normals on every hard-surface object (cheapest realism/byte).
2. Real PBR albedo/roughness on plaster, stone, roof, timber — baked to ONE small
   atlas. Watch the byte budget every step.
3. Baked AO + contact grime.
4. Ground and immediate surroundings: path, planting, low fence. Sketchfab and
   Rodin are verified working — but they are how you blow the budget fastest.
5. Glass depth: warm interior, varied reflection.

"More building" is the owner's phrase and it is ambiguous — richer architecture
(dormers, cornices, a porch, chimney detail) vs. more scene around it. **Propose
what you think sells it best in ONE hero shot and say why**; do not guess silently.

## HARD constraints
- **Node-name→phase contract** — a rename breaks the homepage build animation:
  P0 `^plinth` · P1 `^(main|wing|entry)$` + `_interior$` ·
  P2 `^(roof_|ridge_|entry_roof|chimney)` · P3 `^(w\d+_|sill|door|handle)` ·
  P4 `^(gutter_|ds\d)`.
  Unmatched names fall back to **P1 (walls)** — real, confirmed at
  `HouseBuildScene.tsx:53`. New scenery (trees/fence/path) would therefore fly up
  with the walls, which is WRONG. **Tell us what you add and which bucket it needs.**
- **< 1.5 MB** and currently 1.15 MB, so ~340 KB of headroom — textures eat that
  fast. Do NOT ship a Draco/WebP GLB until we confirm the loader is live; it would
  fail to load. If you need the budget, ask and we wire DRACOLoader first.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Back up first (`HomeRC_backup_realism.blend`).
- The build now runs **~2x faster** (0.35s blueprint + 3s build). Pieces are on
  screen briefly, so silhouette and material read beat micro-detail.
- The hero camera is **street-level front**, drag-only. Judge from there first.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- Phase 1 findings: what you verified vs. could not confirm, with sources.
- What you promoted to ✅verified in the skill; any new skill you created.
- What changed per item, with three.js screenshots from the HERO camera.
- Node/material names added + which phase bucket they need.
- **Which wins are site-side, not model-side** (tone mapping, HDR, shadows, SSAO).
- **Honest byte accounting**: before → after, and what you dropped to stay under.
- If realism needs more than 340 KB: say so and stop. We will land DRACO first.
