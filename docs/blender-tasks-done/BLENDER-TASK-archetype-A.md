# TASK: Remodel HomeRC.blend to ARCHETYPE A (warm chalet)

Owner picked **A** (2026-07-16). B (travertine villa) is dropped for now.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first, as always.

## Target (from your own gap analysis — BLENDER-NOTES §"MODEL vs REAL HOUSES")
Their bread-and-butter completed house: cream plaster + white rusticated quoins +
white window/door surrounds + matte anthracite metal-tile HIP roof + dark timber
gable detail. Best real reference: `photo_2026-01-15_041947`.

Work in priority order, and STOP after each numbered item long enough to judge it
in a three.js screenshot (not the Blender viewport — see gotcha below):

1. **White quoins + white window/door architrave surrounds.** You called this the
   biggest visual gap. Do it first, it's the highest ratio of read to effort.
2. **Hip the main roof** (pyramidal, 4 slopes + hips, pitch ~30-35°). 3 of 3 real
   metal-tile installs are hips.
3. **Roof colour → matte anthracite RAL 7016.** Drop metallic 0.65 → ~0.2,
   roughness 0.42 → ~0.6, nudge the hue to cool grey. Judge the THREE.JS render:
   your notes proved three.js reads the roof lighter/flatter than Blender does.
4. **Wavy modular pantile profile + rounded half-round ridge/hip caps** replacing
   the flat stepped seam. Your Array-modifier recipe (skill V1) is the affordable
   route at our size; the r/blenderhelp geometry-nodes find covers tiles on the hip
   if you need it — but realise + decimate before export.
5. **Dark timber gable detail** (king-post truss / rafter tails / eave brackets).
6. **Plinth → dark grey split-face stone** (currently brown [0.3,0.27,0.24]).
7. **Window muntins / transom bars**, dark bronze frames set in the white surround.
8. Optional if budget allows: snow-guard clip rows (P4).

## HARD constraints
- **Do not break the node-name→phase contract.** The site buckets nodes by name
  prefix into 5 phases; a rename breaks the build animation on the homepage hero.
  P0 `^plinth` · P1 `^(main|wing|entry)$` + `_interior$` · P2 `^(roof_|ridge_|entry_roof|chimney)` ·
  P3 `^(w\d+_|sill|door|handle)` · P4 `^(gutter_|ds\d)`.
  New pieces must adopt an existing prefix. Quoins and surrounds are wall trim → give
  them P1 or P3 prefixes deliberately and TELL US which you chose.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` → `public/models/house.glb`.
- **Keep < 1.5 MB** (Lighthouse CI gate). Current is 1.16 MB, so headroom is ~340 KB.
  Do NOT ship a Draco-compressed GLB: the site has no DRACOLoader yet, it would fail
  to load. Main session is wiring that separately; ship uncompressed until told otherwise.
- Backup first: `HomeRC_backup_archetypeA.blend`.

## Context you should know (changed since your last session)
- `house.glb` now renders in TWO places on the homepage, not one: the **hero**
  (`HouseBuildScene.tsx`, front street-level camera, drag-only, plays once) and the
  older **`Model3D.tsx`** slider section. Your BLENDER-NOTES line "the hero is a real
  photo" is now stale. Judge the remodel from the hero's low front camera FIRST,
  since that is the money shot, but check both.
- Gotcha still live: `Model3D.tsx` and `RoofCutawayScene.tsx` still use drei's CDN
  `<Environment preset="sunset">`, which rate-limits and can blank the scene with zero
  errors. If a screenshot comes back blank there, that's why — it is not your model.

## Report back in this format
MODEL READY: public/models/house.glb (<size>)
- what changed, per numbered item above
- any node/material names added or changed (and which phase bucket they land in)
- three.js screenshots (hero camera + the Model3D section)
