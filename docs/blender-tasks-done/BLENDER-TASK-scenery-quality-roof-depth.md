# TASK: the scenery is BELOW the house's quality bar. Rebuild it to match.
# Plus: the roof reads flat and thin at close drag range.

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first. All laws apply (five-angle +
close-in + mobile drag + ray-scan; fallen-scenery law; img.pack; UV+vcol).

## The owner's verdict (with a close drag screenshot)
> "still shit, especially the roof, fence and trees"

He is right, and the honest diagnosis is a PATTERN, not three bugs:
**the house has had seven quality passes; the scenery came from free libraries
and never got one.** A 96-tri bush stretched into a "tree" and a 0.46 m toy
picket fence sit next to a house with baked AO and rusticated stone quoins. The
gap is glaring, and patching the same freebies again will not close it. This
task REBUILDS the scenery to the house's own bar, and fixes the roof's
close-range flatness.

## JOB 1 — THE FENCE: redesign, not rescale
The white picket fence is wrong twice: toy-scale (0.46 m against a two-storey
house) AND off-brand — check the reference photos: Moldovan chalet yards use
**low masonry walls with metal or timber infill**, not American white pickets.
Build what their real houses have:
- Low stone/plastered base wall (~0.4 m) reusing the EXISTING stone/plaster
  materials → instant material harmony with the house.
- Piers/posts (~1.1–1.2 m) at intervals, stone-capped.
- Between piers: dark metal or dark timber infill (thin verticals or horizontal
  rails) reusing `timber_dark`/gutter-metal tones → "associates the roof", the
  owner's own phrase for what works.
- Continuous run along the front with a gap for the path. Sized against the
  house (check against door height 2.1 m).
- Instanced: ONE pier+panel unit, transform-harvest, one batch node named to
  bucket P4 (`plinth_hedge_*` prefix or ask me to extend the regex). Apply all
  transforms (the fallen-scenery law). Byte target: < 60 KB.
- Attribution note: if the CC-BY picket unit is fully removed, TELL ME so I can
  drop that credit from the footer (the bush credit stays if the bush stays).

## JOB 2 — THE TREES: one good tree, built or sourced, to the house's bar
The stretched bush reads as a weed. Replace the two "trees" with ONE quality
tree used twice (vary rotation/scale ±10%):
- Either MODEL it: low-poly deciduous — trunk with 2–3 branches, clustered
  canopy of 5–8 deformed icospheres with the leaf-tone vertex variation trick,
  ~600–1200 tris. At the house's stylization level this reads better than a
  photoreal asset.
- Or SOURCE a CC-BY one that genuinely passes at drag distance (byte-recipe:
  strip/scale textures; verify licence; give me the attribution line).
- Bushes: keep the existing ones ONLY if they read as bushes at close drag;
  the one sitting ON the walkway near the door steps must move onto the lawn.
- Upright verification by world bbox (the law), P4 names (`plinth_tree_*`).

## JOB 3 — THE ROOF at close drag range: depth, not more darkness
At the owner's drag distance the slopes read as FLAT DARK SHEETS and the rake
edge goes paper-thin again. Fix surface + edge, not colour:
1. **Tile relief that survives close range**: the baked tile normal is too
   subtle. A/B in three.js at the owner's drag distance: stronger normal
   (0.6→1.0) vs adding real course-step lips (a small extruded lip per course
   edge — you built these once for the hip; the jerkinhead courses may have
   lost them). Pick by render, watch node budget (lips = faces on existing
   course meshes, NOT new nodes).
2. **Rake/edge thickness**: from the close front-left drag the main roof's
   left rake reads thin. Verify the rake board + tile edge overhang read as
   ~0.15 m of built-up edge from THAT angle specifically, both gables.
3. **Panel seam rhythm**: the reference pantile has a visible module rhythm;
   ours reads as long smooth panels. If the seam texture scale is off at drag
   distance, retune the UV repeat (cheap) before adding geometry (expensive).

## HARD constraints
- Node budget: 313 individual+batches now, ceiling ~330. Fence batch replaces
  fence batch (net ~0); tree adds ≤ 2 nodes; roof work = faces on existing
  meshes only.
- Raw < 1.5 MB (keep a raw copy; main session compresses). Current raw 1.49 —
  you have ~0 slack, so the fence/tree byte budgets above are real. Reclaim:
  deleting the old picket mesh + any orphan textures from the freebies.
- MUST NOT REGRESS: everything on the standing list, incl. AO atlas coverage
  (287 nodes) and the standing scenery fix.
- Export: usual flags + gpu_instances → house.glb. Backup:
  `HomeRC_backup_scenery2.blend`.
- Verify with the FULL law set, and judge Jobs 1–3 at the OWNER'S drag
  distance (close front-left, the screenshot's angle) — that is where he keeps
  looking. Include that exact framing in the before/afters.

## Report back
```
MODEL READY: public/models/house.glb (<size> raw)
```
- Fence: before/after at the owner's angle; unit design; batch name; bytes;
  whether the CC-BY picket credit can be dropped.
- Tree: before/after; built vs sourced (+ licence line if sourced); bytes.
- Roof: the A/B (normal vs course lips) with your pick and why; rake-edge
  close-ups both gables; seam-rhythm verdict.
- Node/byte accounting; laws passed; anything deferred.
