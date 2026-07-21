# TASK: the roof floats and is paper-thin — give it real eaves. Rebuild the porch.

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## What happened since your last export
You shipped the GABLE conversion. The owner looked and said "it became worse" —
the gable was top-heavy, a big blank triangle. The main session **reverted the
model to the HIP roof** you had before (`public/models/house.glb` is the 313-node
hip version again). Your gable render was right that the photo is a gable, but the
execution read worse at our camera, so we are back on the hip and iterating there.

**Consequence you must know:** the revert also undid the porch, recessed windows
and re-coloured door you had bundled into the gable .glb — because it was all one
file. So the porch is back to the old flimsy version (item 3 below). This is why
one .glb per change is risky; nothing to fix now, just context.

## The owner's exact words on the current (hip) render
> "the roof became more interesting but looks shitty, it **stays in the air**, and
> it's **like too thin** or something, and the **front door roof is the same**."

I zoomed into the roof-to-wall junction in the real render and he is right on all
three. **All three are the same root cause: the roof has NO EAVE DEPTH.**

### Issue 1 — the roof FLOATS ("stays in the air")
The eave overhangs the wall, but the underside is open to the sky and there is no
soffit closing it — so the overhang reads as a flat sheet hovering above the
house, not a roof sitting on it. Fix:
- Close the eave underside with a **soffit** (a horizontal panel from the wall top
  out to the fascia), dark/matte so it reads as shadow underneath — exactly what
  the reference photo shows.
- Make sure the roof actually MEETS the wall top (a wall plate / top course), so
  there is no literal air gap at the junction.

### Issue 2 — the roof is PAPER-THIN ("too thin")
Every roof edge is a single plane with a razor edge. Real roof edges have depth.
Fix at every eave and rake:
- a **fascia board** (vertical, at the eave edge) with real thickness (~0.15 m),
- visible **tile edge thickness** where the tiles overhang the fascia,
- the existing gutters should sit ON the fascia, not float.
This is the single biggest "it looks like paper / CG" tell on the current model.

### Issue 3 — the FRONT DOOR ROOF (porch) is flimsy
The little canopy over the door is a thin flat triangle. Rebuild it as a real
little pitched roof: fascia + soffit + tile thickness like the main roof, sitting
on the two timber brackets. This is the SAME rebuild you did in the gable export —
re-apply it to the hip model. Keep it modest; it is a porch, not a second house.

### The reference (unchanged): `photo_2026-01-15_041947`
Its signature is DEEP eaves with **exposed dark timber rafter tails** and a dark
soffit. That is precisely the depth ours lacks. If rafter tails are cheap in
nodes, add them — they are the detail that sells "real roof" in the photo. Sample
the soffit/timber colour from the photo, do not guess.

## Learn more skills (owner asked again, explicitly)
Hunt for something that helps with **eaves / fascia / soffit / rafter-tail
detailing** specifically — that is today's actual need, not generic realism:
- extensions.blender.org (roof/eave/trim generators, greeble/detail tools),
- BlenderKit (✅ proven — timber + fascia PBR),
- Gumroad free roof kits, GitHub eave/soffit node setups.
Bar per tool: **downloaded, installed, RUN, screenshotted** in a scratch
collection, then a one-line `✅/❌/⚠️` verdict + what it contributed, promoted into
`~/.claude/skills/blender-buildings/SKILL.md`. **A tool you did not run is a
rumor** — last two sessions you correctly reported "catalog had nothing new"
rather than inventing one; keep that honesty. If nothing new helps, say so and use
the proven pipeline.

## HARD constraints
- ⚠ **DRAW CALLS ARE THE BINDING LIMIT.** 313 nodes now, ceiling ~330. Eaves +
  soffits + fascia across the whole roof could add a lot of pieces. **Prefer
  adding geometry to EXISTING roof meshes (more faces on the same object) over new
  nodes.** A fascia is an extrusion of the roof edge, not a new object per tile. If
  you would cross ~330 nodes, stop and tell me — that means InstancedMesh
  site-side first.
- Phase contract (wrong prefix → the piece flies up out of the ground as a wall):
  P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact `main|wing|entry` +
  `_interior$` + unmatched · P2 `^(roof_|ridge_|entry_roof|chimney)` ·
  P3 `^(w\d+_|sill|door|handle)` · P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
  Fascia/soffit/rafter-tails belong to the ROOF → name them `roof_*` /
  `entry_roof_*` so they bucket to P2. Report every new node name.
- **< 1.5 MB.** Currently ~1 MB, ~500 KB free — bytes are fine; nodes are the risk.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Backup first: `HomeRC_backup_eaves.blend`.
- Judge from the **street-level hero camera in three.js**, zoomed into the
  eave/junction — that is where the owner is looking. Blender's viewport lies.
- **Verification law:** if your check constructs the input it is testing for, it
  proves nothing. Real renders, real byte/node counts from `gltf-transform inspect`.

## Report back
```
MODEL READY: public/models/house.glb (<size>)   [or: NO EXPORT — findings only]
```
- **Zoomed hero render of the eave junction**, before/after — this is the whole
  point; show the roof no longer floating and no longer paper-thin.
- Porch: before/after.
- Node count (flag at 330), and how you added depth WITHOUT blowing the node
  budget (faces-on-existing vs new nodes).
- New node names + phase bucket.
- Tools: name → source → ✅/❌/⚠️ → contribution. What you promoted to ✅verified.
- Honest byte + node accounting.
