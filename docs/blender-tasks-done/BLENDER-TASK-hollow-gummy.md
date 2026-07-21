# TASK: kill the "gummy" look, hollow the house, build walls ONE BY ONE

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

Your 26-course wall pass landed (111 nodes, 580 KB). The owner looked at it and
said, verbatim:

> "still not realistic, it really looks **too gummy** idk, **more SKILLS???????**"
> "i want for the **building to be empty inside**"
> "the **walls to be built 1 by 1, not the full square**"

Three concrete jobs. Job 1 is the one that matters most.

---

## JOB 1 — "TOO GUMMY". This is the whole task.

"Gummy" = it reads like moulded plastic / a toy, not brick, plaster and metal.
He has now said "not realistic" **three sessions in a row**, and each time we
answered with geometry (hip roof, quoins, courses) and it did not fix it. So the
problem is almost certainly NOT more shapes. **Do not solve this with more
geometry.** Diagnose it properly before you touch anything.

Hypotheses worth testing — verify or kill each with a real three.js render, and
say which ones you actually confirmed:
1. **Uniform roughness across everything.** Real surfaces vary per-texel. One
   flat roughness value on plaster, stone and metal is the classic plastic tell.
   You already deleted the roughness map to save bytes — the fix is a *small*
   per-material roughness/variation map, not the 887 KB monster.
2. **No normal-map micro-detail.** Plaster grain, tile ripple, timber. Flat
   normals = injection-moulded look, no matter how good the silhouette is.
3. **Bevels too fat / too uniform.** A 0.03 bevel on every edge of a small house
   rounds everything into soft blobs — literally gummy. Check the real widths
   against the object scale; vary or shrink them.
4. **Albedo too clean and too saturated-uniform.** Real plaster is blotchy and
   slightly desaturated; a single RGB reads as coloured plastic.
5. **Everything at the same reflectivity/specular.** Nothing dielectric-vs-metal
   separation.
6. **No AO / contact grime** — still deferred from two sessions ago. Nothing
   grounds the parts into each other, so they look snapped-together toy parts.

### MORE SKILLS — the owner asked for this in capitals. Go get them.
Hunt hard, anywhere except Reddit-only. Download, **install, and PROVE in
Blender** with a screenshot in a scratch collection (never the house):
- **extensions.blender.org** — search: brick/wall generators, texture-bake
  helpers, archviz detailing, material managers.
- **BlenderKit** free tier (addon, in-Blender browse + import of real PBR).
- **ambientCG** (CC0 PBR, has plaster/brick/stone/roof), **Poly Haven** (verified
  working already), **Gumroad free** (e.g. Buildify — even if too heavy, steal
  its node setups), **GitHub** (bake pipelines, ORM packers, decimators).
- Anything for **baking AO + curvature + grime masks** cheaply.
Bar per tool: `✅works / ❌broken / ⚠️works-but-heavy` + one line on what it
contributed + a screenshot. **A tool you did not run is a rumor — do not write
rumors into the skill.** Watch the 5.2 gotchas (`set_texture` broken; install via
the extensions system or `bpy.ops.preferences.addon_install`).

Whatever survives, write it into `~/.claude/skills/blender-buildings/SKILL.md`
promoted to ✅verified.

---

## JOB 2 — EMPTY INSIDE
`main_interior`, `wing_interior`, `entry_interior` are solid dark boxes filling
the house. The owner wants it **hollow**.

- Delete/replace those liners so the interior is genuinely empty.
- **Consequence to solve, not ignore:** those liners exist because they made the
  glass read as real glazing (BLENDER-NOTES gotcha). Remove them and you may see
  straight through the house, or see the inside of the far wall lit like an
  exterior. Fix it properly: walls as real shells with thickness, correct inward
  normals, and interior faces dark/matte. Check it in the three.js hero render
  from the street camera — the windows must still read as windows.
- The site puts a warm emissive on the glass at runtime (`w#_g`), so do NOT
  author an emissive in the .blend for that — it gets thrown away.

This also matters for Job 3: when walls build one by one, a hollow shell is what
makes the assembly read as construction rather than a solid block splitting.

---

## JOB 3 — WALLS BUILT 1 BY 1, NOT THE FULL SQUARE
Right now each `*_c01…c14` course is a **full ring around the whole floor**, so
the build stacks complete squares. The owner wants pieces going in **one by one**.

- Split every course into **individual wall segments per side** (front / back /
  left / right, and around openings), so each piece is a real wall section, not a
  closed loop. Bricks/blocks are even better if the byte cost allows — the site
  animates every node individually and a piece starts every ~9ms, so MORE pieces
  = a richer build. Piece count is not a constraint; bytes are.
- **Naming:** anything unmatched falls back to P1 (walls) on the site, which is
  correct for wall segments — but be explicit and ordered:
  `main_c01_n / _e / _s / _w` (or `_b01, _b02…` for blocks), bottom course = 01.
  Keep openings intact — do not wall over the windows/door.
- Report the final piece count. Tell me if it goes over ~250 nodes so I can check
  the draw-call cost in the real renderer.

---

## HARD constraints
- Phase contract: P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact
  `main|wing|entry` + `_interior$` **+ everything unmatched (fallback)** ·
  P2 `^(roof_|ridge_|entry_roof|chimney)` · P3 `^(w\d+_|sill|door|handle)` ·
  P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
  ⚠ If you DELETE the `_interior` liners, nothing breaks — but report every new
  node name and its intended bucket.
- **< 1.5 MB**; currently 580 KB, so ~920 KB free. No Draco/WebP GLB (loader not
  wired). If a tool's output is heavy: decimate, bake down, or drop it — and say
  what you dropped.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Backup first: `HomeRC_backup_hollow.blend`.
- The build now runs in **1.2s** with a piece starting every ~9ms, each flying in
  as blue wireframe. Pieces are on screen briefly — material read and silhouette
  beat micro-detail nobody can see.
- **Verification law:** if your check constructs the input it is testing for, it
  proves nothing. Real Blender screenshots, real three.js hero renders, real byte
  counts from `gltf-transform inspect`. Blender's viewport lies — the site is the
  source of truth.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- **Gummy:** which hypotheses you CONFIRMED vs killed, and the before/after hero
  render that proves the fix. This is the headline — lead with it.
- **Tools:** name → source → ✅/❌/⚠️ → what it contributed. What you promoted to
  ✅verified in the skill.
- **Hollow:** what you did about the liners, and how the glass still reads.
- **Walls:** final piece count + naming + byte delta.
- Honest byte accounting, and anything you dropped to stay under.
- Any site-side recommendation as a **testable claim** — we measure them now (the
  AgX one measured out backwards: 24% LESS saturation, it was washing the house).
