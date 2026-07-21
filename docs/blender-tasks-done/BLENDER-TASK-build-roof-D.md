# TASK: build option D — the jerkinhead (clipped gable). Then export.

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## The decision
**Option D — jerkinhead / clipped gable — is chosen.** Build it properly.

The owner genuinely couldn't pick between C, D and B, so the main session made the
call on his behalf, on your recommendation plus its own read of the 2×2 render.
The reasoning, so you build toward it:
- it is **visibly different** from the current hip (he must not feel nothing changed),
- the **clipped apex** is the specific fix for why the 42° gable failed — the roof
  caps the house instead of towering over it,
- the **dark timber king-post truss** in the clipped face is the detail that shows
  up across their premium chalet job photos, so it is on-brand.

Your own words for how to build it: "course-built for the phase animation, real
eaves carried around the new shape, timber named `roof_*`, instanced where it
repeats." Do exactly that.

## MUST NOT REGRESS — everything below already shipped and the owner approved it
- **The eaves.** `roof_main_fascia`, `roof_main_soffit`, `roof_wing_fascia`,
  `roof_wing_soffit` — soffit closing the underside (this is what stopped the
  "floating"), fascia giving the edge thickness, gutters sitting on the fascia,
  baked rafter-tail normal + AO. **Carry this treatment around the new roof shape**,
  including the clipped face and the new gable end.
- **The porch** (rebuilt awning + timber soffit), **recessed windows**, and the
  **instanced snow guards** (`roof_snowguards`, 14 clips in 1 node).
- **The wing keeps its hip** — only the main block changes, as in your render.

## Build requirements
1. **Course-built.** The roof must still assemble course by course, eave upward,
   like the walls — that build is the owner's favourite thing on the site. Do NOT
   deliver the new roof as a few big slabs.
2. **Naming.** Every roof piece must match `^(roof_|ridge_|entry_roof|chimney)` or
   it silently falls back to the WALLS phase and flies up out of the ground
   mid-build. Truss members included → `roof_*`. Report every new node name.
3. **Instance what repeats.** Snow guards stay instanced. If the new shape gives
   you repeated identical pieces (tile courses of equal size, truss members,
   fixings), batch them with the P1 recipe — linked duplicates sharing one mesh,
   parented to one Empty named with a `roof_` prefix.
   ⚠ **Never instance anything structural** (courses that should land individually,
   ridge caps, walls, porch) — an instanced batch animates as ONE piece, which
   would destroy the one-by-one build.

## HARD constraints
- **Node budget: 317 now, ceiling ~330 individual nodes.** The new roof replaces
  the old one, so you have the old main-roof pieces back to spend. An instanced
  batch counts as 1 node regardless of copies. If you would cross ~330 individual
  nodes, stop and report rather than shipping a laggy model.
- **< 1.5 MB.** 860 KB shipped (after the main session's dedup); your raw export
  will be larger — that is fine and expected, do NOT run dedup yourself. Send the
  raw export; dedup + verification happen at ship time.
- **No clearcoat** (your own P4 FPS-risk verdict stands).
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True,
  export_gpu_instances=True` → `public/models/house.glb`.
  Backup first: `HomeRC_backup_roofD.blend`. Save `HomeRC.blend` as the canonical
  file when done.
- **Judge from the street-level hero camera in three.js**, not the Blender
  viewport. That angle is the only one the owner ever sees, and it is exactly how
  the failed gable slipped through.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- **Hero render, before (current hip) vs after (D)** from the identical camera —
  the headline.
- Confirmation the eaves/soffit/fascia are carried around the new shape, with a
  zoomed eave crop.
- Node accounting: individual vs instanced, and the total against ~330.
- Every new node name + its phase bucket.
- Confirmation the roof still builds course-by-course (list the course pieces).
- Honest byte accounting.
