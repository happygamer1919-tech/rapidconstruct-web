# TASK: kill the "barn" read. New roof reference + vertical timber cladding +
# new wall colour. Deliver 3 COMPLETE LOOKS as renders. NO EXPORT.

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## The owner's new direction (verbatim)
> "i like the model, but it still looks like a barn, mby u can take another
> reference for the roof? as for the building, i want to do more vertical wooden
> palles rather than white stone, again lets change the color of the walls"

Three linked changes: **new roof reference (de-barn)** · **vertical timber
cladding replacing the white stone quoins** · **new wall colour**. They interact
visually, so they must be designed and shown TOGETHER.

## ⚠ THE DIAGNOSIS — read before you design anything
"Barn" is not vague; it has a specific cause. **The exposed king-post truss on
the gable face is the agricultural signature.** Big display trusses on a gable
end are what barns, stables and hay lofts have. Combined with a steep gable and
plain walls, it reads farm building.

**The trap in the new direction:** vertical wooden boards + gable + exposed truss
is the LITERAL definition of a barn (board-and-batten is barn cladding). So if we
add vertical timber while keeping the truss and a rustic treatment, we make the
barn read STRONGER, not weaker.

The way vertical timber works WITHOUT reading barn is the modern/alpine-modern
idiom: crisp battens with even reveals, dark-stained or warm-oiled (not raw
weathered board), used as a deliberate ACCENT panel (gable face, entry volume,
one wall plane) against clean plaster — and the ornamental truss removed or
reduced to a minimal, structural-looking detail. That is contemporary chalet, not
farm.

## Step 1 — find NEW references (this is a research step, do it properly)
The current reference (`photo_2026-01-15_041947`) drove the truss and stone
quoins. It has served its purpose; **the owner has now rejected that direction.**
Find new ones:
- Hunt **modern chalet / alpine-modern / Scandinavian house** references where:
  (a) the roof reads clean and residential, not agricultural — simpler ridge
  detail, no display truss, generous but crisp eaves;
  (b) **vertical timber cladding** is used well against plaster/render;
  (c) the wall colour is something other than our current beige `plaster`
  rgb(0.89,0.87,0.82).
- Also re-scan RapidConstruct's own job photos (`docs/PHOTO-INVENTORY.md`) for
  any house with vertical timber or a non-beige facade — matching their REAL
  work stays the strongest argument, if such a project exists. If it does not,
  say so and use external references.
- Sample real pixel colours from whatever you choose (as you did before) and
  report the sRGB values. Colours must still "associate the roof" (the owner's
  phrase): harmonise with the anthracite roof.

## Step 2 — design THREE complete looks. Render them. Do NOT export.
Same camera, same lighting, same everything — the owner compares looks, not
lighting. Use the owner's close front-left drag angle plus one hero shot each.
Each look = roof treatment + cladding placement + wall colour, as one package.

Suggested set (swap if you have better, and argue for it):
- **A — Modern chalet, warm.** Truss removed; gable face fully clad in warm
  vertical timber; walls a soft warm white/off-white plaster. Clean crisp eaves.
- **B — Modern chalet, dark contrast.** Truss removed; dark-stained vertical
  timber on the gable + entry volume; walls a deeper warm grey/greige. Roof and
  timber tie together, plaster is the light element.
- **C — Minimal-truss compromise.** Keeps a much simpler, thinner structural
  brace (not the ornamental king-post lattice); vertical timber as a narrower
  accent band; a third wall colour. This is the option that changes least — show
  it so he can see whether any truss survives.

For each, state: what happened to the truss, where the timber goes, the wall
colour (sRGB), and roughly what it would cost in nodes/bytes to build.

## Constraints that apply to the eventual BUILD (design within them now)
- **Bytes are the hard limit: raw sits at ~1.5 MB against a 1.5 MB gate.**
  Deleting the 5 quoin stacks and the picket fence frees room, but vertical
  cladding must NOT be per-plank geometry across the house. Use, in order of
  preference: (1) a tiling albedo+normal texture on existing wall segments,
  (2) instanced batten batches (proven recipe, 1 node per batch), (3) real
  geometry only on ONE small accent panel. Say which you would use per option.
- Node ceiling ~330; currently 313.
- The 155 wall segments are the build animation — cladding must ride ON them
  (material/texture) or as instanced batches, never by re-cutting the walls.
- Phase contract unchanged. Any timber pieces → decide bucket deliberately and
  report it (wall-plane cladding should rise WITH the walls = P1).
- MUST NOT REGRESS in the eventual build: eaves/soffit/fascia, porch, windows,
  recessed reveals, AO atlas coverage, course-by-course build, snow guards.

## Report back
```
DE-BARN LOOKS — 3 renders, no export
```
- The new reference(s) you chose, with sampled sRGB values, and WHY each kills
  the barn read.
- The three looks: hero + owner's-drag-angle render each, same camera/light.
- Per look: truss decision · timber placement + technique (texture vs instanced
  vs geometry) · wall colour · node/byte estimate.
- **Your ranked recommendation** — you have looked at their real work more than
  anyone; say which you would build and what you would avoid, and be blunt.
- Confirmation `public/models/house.glb` is untouched (mtime).
