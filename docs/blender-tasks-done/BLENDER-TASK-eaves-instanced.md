# TASK: fix the floating/thin roof with BAKED eaves + one instanced detail (test)

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first — including your own
"RESEARCH SPRINT 2026-07-17" section, which is the toolkit for this task.

## State (verified by the main session)
- `HomeRC.blend` = the canonical HIP version, with the donor porch + recessed
  windows merged in. 314 objects. **This is the correct base — work here.**
- `public/models/house.glb` on the site is STALE (313 nodes, the OLD two-piece
  porch). So your next export ships the porch + windows + this task's work all at
  once. Main session will verify the whole lot in three.js.
- ✅ **Instancing is confirmed shippable on our side.** Main session checked
  three.js 0.185's GLTFLoader: `EXT_mesh_gpu_instancing` and
  `KHR_materials_clearcoat` handlers are both built in. Your P1 recipe will render.

## JOB 1 — the eave fix. This is what the owner is waiting to see.
His words on the current roof: it **"stays in the air"** and is **"too thin."**
Both come from the roof having no eave depth. Use YOUR OWN proven recipes:

1. **Stop it floating:** close the eave underside with a **soffit** (horizontal
   panel, wall top → fascia edge), dark/matte so it reads as shadow. Confirm the
   roof actually meets the wall top — no literal air gap at the junction.
2. **Stop it being paper-thin:** a **fascia board** (~0.15 m, vertical) at every
   eave and rake, with visible **tile-edge thickness** where tiles overhang it.
   The existing gutters must sit ON the fascia, not float beside it.
3. **Rafter tails — BAKED, not modelled.** This is exactly what your P2 pipeline
   proved: you baked a 34,656-face carved rafter/fascia assembly onto a **6-face
   box** and it read as carved tails with shadowed gaps. Use it. That is how we
   get photo-grade eave detail without spending nodes.

Your own skill entry says the hand recipe is **fascia box + soffit plane + baked
rafter-tail strip ≈ 3 nodes per eave run**. Follow it. Watch the bake failure
modes you documented (cage/ray distance → silently flat map; UV islands must fill
0–1; image node must be active; reset `use_selected_to_active=False` after).

## JOB 2 — ONE instanced detail, as a live integration test
Do **not** convert the house to instancing yet. Author **one small repeated
detail** as an instanced batch so the main session can verify our animation code
handles an `InstancedMesh` node correctly before we commit to more.

- **Suggested subject: snow-guard clips** — small, repeated, non-structural,
  genuinely present in the reference photos, and safe to appear as a group.
- Use your P1 recipe exactly: linked duplicates sharing one mesh datablock, all
  parented to **one Empty**, exported with `export_gpu_instances=True`.
- **Name the Empty with a roof phase prefix** (e.g. `roof_snowguards`) — the
  surviving node takes the Empty's name, so that is what decides its build phase.
- Confirm with `gltf-transform inspect` that the export really carries
  `EXT_mesh_gpu_instancing` and report the node/draw-call numbers.

## ⚠ THE ANIMATION TRADE-OFF — read before instancing anything
Your P1 finding: **per-instance animation is impossible** — an instanced batch
animates as ONE piece. The owner explicitly asked for the house to build **one
piece at a time**, and that is the effect he likes most. Therefore:

- **NEVER instance structural pieces** — walls, roof slopes/courses, porch, ridge
  caps. Those must stay individual so they keep building one-by-one.
- **Only instance fine repeated detail** where "they all appear together" looks
  correct rather than broken (snow guards, small clips, fixings, repeated greebles).
- If you are unsure whether something may be instanced: **leave it individual and
  ask.** Losing the one-by-one build is a bigger regression than saving nodes.

## HARD constraints
- **Node budget:** 314 individual nodes now, ceiling ~330. Baked eaves should cost
  roughly 3 nodes per eave run — stay inside. An instanced batch counts as **1
  node** no matter how many copies, which is the whole point of Job 2. If you would
  cross ~330 individual nodes, stop and report.
- **Phase contract** (wrong prefix ⇒ the piece flies up out of the ground as a
  wall): P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact `main|wing|entry` +
  `_interior$` + unmatched · P2 `^(roof_|ridge_|entry_roof|chimney)` ·
  P3 `^(w\d+_|sill|door|handle)` · P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
  Fascia/soffit/rafter/snow-guard all belong to the ROOF → name them `roof_*`.
  **Report every new node name.**
- **< 1.5 MB.** ~1 MB now. Do NOT run dedup/prune yourself — the main session
  applies dedup at ship time and verifies it, so send the raw export.
- **Do not add clearcoat yet.** Your own P4 verdict was that it forces the heavier
  MeshPhysicalMaterial shader on every roof pixel. It needs an FPS A/B in the hero
  first, and the owner has already complained about lag once. Separate task.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True,
  export_gpu_instances=True` → `public/models/house.glb`.
  Backup first: `HomeRC_backup_eaves.blend`.
- **Verification law:** if your check constructs the input it is testing for, it
  proves nothing. Judge from the **street-level hero camera in three.js**, zoomed
  into the eave — that is exactly where the owner is looking.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- **Zoomed hero render of the eave, before/after** — the roof no longer floating
  and no longer paper-thin. This is the headline; lead with it.
- Node count: **individual nodes** vs **instanced batches**, listed separately.
- Which pieces you instanced, and why a group appearance is correct for them.
- Instancing test: the `gltf-transform inspect` output proving
  `EXT_mesh_gpu_instancing` is present, plus the draw-call saving.
- New node names + their phase bucket.
- Honest byte + node accounting.
- Anything you left individual because you were unsure — with your recommendation.
