# SESSION: 1–2 hour RESEARCH SPRINT — find, download, PROVE new skills

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

This is NOT a modeling task. **Do not touch HomeRC.blend. Do not export a house.**
This session's only job is to expand and PROVE the toolkit, so the next modeling
sessions are faster and better. The deliverable is a bigger `blender-buildings`
skill with new ✅verified entries — plus an honest verdict on what does NOT exist.

## Ground truth you are working against
- Model: 313 nodes, ~1 MB. **DRAW CALLS are the binding limit** (~330 node
  ceiling); bytes have ~500 KB free. Every node is a draw call during the build.
- The owner has said "not realistic / gummy / shitty" for ~7 rounds. Geometry
  passes barely move it. Current concrete need: eave depth (fascia/soffit/rafter
  tails), and overall photoreal material response.
- `gltf-transform optimize --compress draco` measured 1.04 MB → 36.9 KB, but the
  SITE has no DRACOLoader, so we ship uncompressed. (Main session may wire it.)

## THE HONEST FRAME
Two of the last sessions correctly reported "the catalog had nothing new" instead
of inventing a tool. Keep that honesty. But this time you have 1–2 hours, so go
DEEP, not wide — and note that the two highest-leverage items below are not
"plugins", they are PIPELINES you build and prove once. Those matter more than any
single asset pack.

## Verification bar (unchanged, and the whole point)
For EVERY tool/asset/technique: **downloaded → installed → RUN in a scratch
collection → screenshotted**, then a one-line verdict `✅works / ❌broken /
⚠️works-but-heavy` + what it contributes. **A tool you did not run is a rumor.**
Promote survivors into `~/.claude/skills/blender-buildings/SKILL.md`. Respect the
5.2 gotchas (`set_texture` broken; `img.scale()` doesn't stick on packed images;
install via the extensions system / `bpy.ops.preferences.addon_install`).

## Priority order — leverage first (roughly timeboxed, ~1–2h total)

### P1 — INSTANCING EXPORT (~30 min). The single biggest unlock. Do this FIRST.
The node/draw-call ceiling is what blocks everything — more detail = more nodes =
lag. If Blender can export **`EXT_mesh_gpu_instancing`** (repeated tiles/bricks as
instances of ONE mesh, drawn in one call), the ceiling largely disappears.
- Build a scratch scene: one tile mesh, instanced 200× (linked-duplicate /
  collection-instance / geometry-nodes instances — try each).
- Export GLB and inspect with `gltf-transform inspect`: does it carry
  `EXT_mesh_gpu_instancing`? How many draw calls does 200 tiles collapse to?
- Report the EXACT Blender setup that produces instanced output (this is the
  recipe main session needs), and whether `gltf-transform instance` can create it
  as a post-process instead.
- Deliverable: a one-paragraph recipe + the inspect output. If it works, the next
  modeling session can add 5× the detail at no runtime cost.

### P2 — HIGH→LOW NORMAL BAKE PIPELINE (~30 min). Detail at ZERO node/poly cost.
Photoreal detail (rafter-tail carving, tile relief, plaster depth, wood grain)
baked from a high-poly sculpt onto the low-poly game mesh as a normal map. You
have baked AO/tile normals before; prove the FULL high→low pipeline end to end:
- scratch: a detailed high-poly eave/rafter block + a low-poly version, cage,
  bake normal (+ AO + curvature), assign, verify in a three.js-style render.
- Nail the failure modes (cage distance, ray miss, UV packing → black bake) and
  write them down. This is how we answer "too thin / gummy" without adding nodes.

### P3 — EAVE / FASCIA / SOFFIT / RAFTER TOOLS (~20 min). Today's visual need.
Hunt extensions.blender.org, BlenderKit, Gumroad free, GitHub for anything that
generates or speeds up eave/fascia/soffit/rafter-tail detailing or roof edges.
Run each; verdict + screenshot. If nothing beats modeling it by hand, say so and
write the hand recipe into the skill instead.

### P4 — DEEPER PBR + MATERIAL RESPONSE (~15 min). The "plastic" fight.
Mine BlenderKit / ambientCG / Poly Haven harder for: matte anthracite metal tile,
warm cream plaster with real subsurface/roughness variation, split-face stone,
dark stained timber. Also research: does a subtle **clearcoat / specular tint**
help the tile read as metal vs plastic? Prove one material swap in scratch and
screenshot it next to the current flat one.

### P5 — glTF OPTIMISATION TOOLING (~15 min). Buy back budget.
`gltf-transform` beyond draco: `weld`, `dedup`, `instance`, `join`, `simplify`,
`prune`. Which safely cut node/draw-call count on OUR kind of model without visible
loss? Run them on a COPY of house.glb (never the live one) and report node/byte
deltas. `weld`/`join` may be the cheapest lag win we have while a loader change is
pending.

## Rules
- Scratch collections only. HomeRC.blend is untouched; no house export this session.
- Cite real sources (URLs) you actually opened. Reddit is fine but not required —
  extensions.blender.org, docs.blender.org, github, gltf-transform docs,
  BlenderKit are better for this.
- If a whole category turns up nothing usable, that is a VALID and useful result —
  write "researched, nothing beats X, here is why" so we never re-hunt it.

## Report back (no MODEL READY this session)
```
RESEARCH SPRINT COMPLETE
```
- **P1 instancing:** works? the recipe, the inspect output, draw-call collapse.
- **P2 bake pipeline:** proven end-to-end? the failure modes you nailed.
- **P3–P5:** per item — tool/technique → source → ✅/❌/⚠️ → screenshot → verdict.
- Everything promoted to ✅verified in the skill (list the new entries).
- The honest "does not exist / not worth it" list, with reasons.
- Your ranked recommendation: given all of it, what are the 2–3 things that will
  most improve the house per node/byte in the NEXT modeling session?
