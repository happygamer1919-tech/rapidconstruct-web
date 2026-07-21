# TASK: there is a HOLE in the roof. Close it. Then spend the banked skills on
# making everything more realistic.

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## JOB 1 — THE HOLE (owner found it, verbatim: "wtf is this? the roof have empty space")

He dragged the model on a NARROW viewport (mobile hero layout frames the house
much closer) and at a raised angle near the jerkinhead clip the roof is OPEN:
you see through a gap between the clip courses and the gable top / rakes, into
the framing and out the other side. There is also a DETACHED BOARD hanging off
the eave corner at an angle (looks like a rake/fascia segment or a rafter-tail
bake plane that is not attached to anything).

Diagnose in Blender, from the same kind of close raised angle:
1. The clip (the small hip that tops the jerkinhead) almost certainly does not
   CLOSE against the tympanum and the rake boards — the shell has no geometry
   there. A roof must read WATERTIGHT: from every reachable angle there must be
   tile, ridge, board, or soffit — never a see-through slot into the interior.
   Close it with whatever is cheapest: extend the clip courses to meet the
   rakes, add a small closing strip under the clip eave, or a dark underside
   panel like the main soffits. Match materials to neighbours.
2. Find the floating board near the eave corner (check `roof_main_rakes`
   segments and the rafter-tail bake strips) — reattach it flush or delete it.
3. While there: sweep the WHOLE roof shell for other see-through slots — both
   clip ends, ridge ends, hip cap junctions, eave returns, where wing roof
   meets main wall. Fix every one. The five-angle shots missed this because
   they were taken at hero distance; up close it is glaring.

### THE LAW GETS STRICTER (add to BLENDER-NOTES)
The five-angle check now includes, before every export:
- a CLOSE-IN pass: camera at ~55–60% of the hero distance, high polar (~40°),
  at 4 azimuths around the ROOF specifically — looking for see-through gaps,
  detached boards, z-fighting;
- one MOBILE-LAYOUT drag check (narrow viewport = `heroMobile` framing, which
  is closer than desktop — this is exactly how the owner keeps finding things).
A shell gap at close range fails the export even if all far shots pass.

## JOB 2 — "MAKE EVERYTHING MORE REALISTIC" (execute the banked recipes)

The skills sprint proved the pipelines; now spend them, in this order:

1. **FULL-HOUSE AO/GRIME ATLAS** — the lever you yourself ranked #1 three
   sessions running, pipeline proven end-to-end in the sprint (atlas UV via
   lightmap_pack → one AO bake → "glTF Material Output" occlusion wiring →
   three.js auto-aoMap). Apply it to the REAL house at 1024²: contact shadow
   where walls meet ground/plinth, under eaves, in window reveals, between
   quoin blocks, where wing meets main. Respect your own gotchas: full-socket
   node group (the minimal one poisons the importer), img.pack(), watch that
   sampling. Target ≤ ~400 KB pre-webp for the atlas.
2. **SCENERY UPGRADE** (the garden is 3 sessions behind the house):
   - Replace the icosphere trees/bushes with the evaluated Sketchfab bush
     (96 tris, CC-BY) + a decent tree — LICENSE CHECK first, CC-BY only,
     record author for the attribution page; strip/downscale textures per the
     byte-trap recipe (scale(256)+pack) — target < 150 KB per asset.
   - **Fence run along the front** using the evaluated CC-BY picket as the unit
     + your GN-scatter → transform-harvest → instanced batch recipe. ONE
     instanced node (`plinth_fence` — ⚠ that name buckets P4 landscaping via
     `^plinth_(path|tree|shrub|hedge)`? NO — check: the P4 regex lists
     path|tree|shrub|hedge only. `plinth_fence` would fall through to P1 walls
     and RISE FROM THE GROUND. Either name it `plinth_hedge_fence` to match, or
     tell me and I add `fence` to the P4 regex — DO NOT ship it bucketed as a
     wall.)
   - Trees/bushes keep `plinth_tree_*`/`plinth_shrub_*` names → P4, correct.
3. **Roof + plaster response polish** if time: the sprint's clearcoat verdict
   (0.25/0.25) is still unapplied and needs an FPS A/B — SKIP it this session
   (still no FPS harness); instead spend the time on per-material roughness
   re-check under the AO atlas (AO multiplying albedo can flatten highlights).

## HARD constraints
- Node budget: 314 individual + batches; ceiling ~330 individual. Fence/trees
  as instanced batches or single joined nodes.
- Bytes: 1.5 MB RAW gate (ship pipeline now applies dedup + webp, so raw can
  run ~1.3 MB and still ship ~850 KB). Report raw size; main session compresses.
- Phase contract as always; report every new node name + bucket. Landscaping
  appears LAST (P4) — a fence rising with the walls is a fail.
- MUST NOT REGRESS: jerkinhead+truss, eaves, quoins/windows (new), porch,
  course build, snow guards, wing hip.
- Export: GLB, use_selection, apply, Y-up, gpu_instances → house.glb. Backup:
  `HomeRC_backup_hole_realism.blend`. No dedup/webp yourself.
- Verification: the STRICTER law above, judged in three.js. If the AO atlas
  visibly improves realism, prove it with a before/after at the same angle.

## Report back
```
MODEL READY: public/models/house.glb (<size> raw)
```
- Hole: cause → fix → the close-in shots showing a watertight shell (all 4
  azimuths + the mobile-layout drag).
- AO atlas: before/after same-angle pair + byte cost.
- Scenery: what was replaced/added, license + author lines for attribution,
  byte cost each, fence batch name + bucket confirmation.
- Node/byte accounting; skill updates; anything deferred.
