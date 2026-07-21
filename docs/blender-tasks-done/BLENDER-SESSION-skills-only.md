# SESSION: 2–3 hours of SKILLS RESEARCH. NOTHING ELSE. Export is FORBIDDEN.

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## Why this session exists — read this, it is a correction
The owner asked for 2–3 hours of skills research last session. He got **~65
minutes** — your own report's number — because the brief bundled an apply phase
into the same session and you (reasonably) compressed the open-ended part to
reach the deliverable. He noticed, and he is right to be annoyed.

So this session removes the temptation entirely:
- **HomeRC.blend stays closed. No export. No house edits. Scratch collections
  only.** There is no deliverable to rush toward — the research IS the
  deliverable.
- Spend the FULL 2–3 hours. Log your time per block in the report. Going deep on
  fewer things beats skimming everything.
- The bar is unchanged and non-negotiable: **downloaded → installed → RUN →
  screenshot → ✅/❌/⚠️ verdict → promoted to the skill.** A tool you did not run
  is a rumor. "Researched X, nothing beats what we have, here is why" is a
  valid, valuable result — record it so we never re-hunt it.

## Where the house actually stands (so you research what matters next)
314 nodes / ~330 ceiling · 1.06 MB shipped / 1.5 MB gate · jerkinhead + truss,
real eaves, stone quoins, profiled windows, instanced snow guards all landed.
The owner's arc of complaints has been: "gummy/plastic" → "floating/thin" →
"white stickers." Each time the fix was surface response + reference matching,
never more geometry. Assume the next complaint follows the same pattern.

## Research blocks, in priority order

### Block 1 (~45 min) — YOUR OWN DEFERRED LIST. Clear it.
Everything parked "at the timebox" across past sessions, oldest first:
- **Full-house baked AO / contact-grime atlas** — you called it "the one
  remaining big realism lever" three sessions ago and it has been deferred ever
  since. Prove the workflow on a scratch two-wall corner: bake AO+grime for
  multiple objects into ONE atlas, measure bytes at 512²/1024², note the
  export wiring. This is the #1 candidate for the next modeling session.
- **Quoin edge-wear bake** (deferred last session).
- **BlenderKit deep-mine** (deferred last session): stone/plaster/timber/metal
  beyond what we grabbed — catalogue what exists at what quality, pull 2–3 and
  A/B them against our current materials in scratch.

### Block 2 (~40 min) — INSTANCED DETAIL AT SCALE
The instancing recipe is proven but only ever used once (14 snow guards). The
ceiling-breaking promise was "5× detail at no draw-call cost" — research the
AUTHORING workflow to actually do it: per-course tile rows, rafter-tail runs,
fence pickets. Geometry-nodes → realize → linked-duplicate conversion, or array
+ make-instances-real + relink? Find the least-painful path, prove it on a
20-instance scratch row, verify the export still collapses to 1 node with
`export_gpu_instances=True` + inspect. Document the exact click/bpy path.

### Block 3 (~30 min) — SCENERY QUALITY
The garden is low-poly blobs from three sessions ago and now lags behind the
house. Mine Sketchfab (✅ enabled) and Hyper3D Rodin (✅ enabled, free-trial key)
for: a better tree (<80 KB), hedge/shrub, a fence run (instancing candidate!),
driveway/paving material. Verdict + byte cost per candidate. Do NOT import into
the house — scratch evaluation only.

### Block 4 (~25 min) — TEXTURE COMPRESSION FRONTIER
We ship raw PNG/JPEG textures inside the glb. Research and PROVE on a copy of
house.glb (never the live file): `gltf-transform` texture options — webp
conversion, resize policies — and what three.js 0.185 loads WITHOUT extra
loader wiring (EXT_texture_webp support?). Measure real byte deltas. KTX2/basis:
research only — note what site-side wiring it would need, do not recommend
blindly.

### Block 5 (~20 min) — FREE HUNT
Anything you find promising for THIS project that the blocks above missed:
extensions.blender.org new arrivals, GitHub tools, node setups worth stealing.
Same bar. If nothing survives, say so with the search terms you used.

## Report back (no MODEL READY — there must be no export)
```
SKILLS SPRINT COMPLETE — <total time>, house untouched (verify: mtime unchanged)
```
- Per block: time spent · what you ran · verdicts with screenshots · what got
  promoted to the skill (list the new section names).
- The does-not-exist / not-worth-it list with reasons.
- **Ranked: the 3 things from this research that will most improve the house
  per node/byte in the next modeling session** — with a one-line plan each.
- Confirmation: HomeRC.blend and public/models/house.glb untouched (mtimes).
