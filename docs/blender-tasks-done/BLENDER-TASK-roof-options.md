# TASK: 4 ROOF SHAPE OPTIONS as renders. Owner picks. Do NOT export or ship.

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## Why this task exists — read it, it changes the method
The owner asked for a **better roof shape**. You built a gable matching the
reference photo. He said "it became worse" and the main session reverted to the
original hip. But reverting was only a safety floor — **his actual request was
never delivered.** His words now:

> "it looks good but you returned the roofs as they were initially,
>  I said to CHANGE the model man"

So: the hip is NOT the answer, and the gable you built was NOT the answer. We need
a genuinely better shape. And we are not going to guess-and-ship again.

**This task produces PICTURES, not a shipped model.** Do not export. Do not
overwrite `public/models/house.glb`. The owner picks from renders, then a follow-up
task builds the winner properly.

## Why the gable failed — diagnose before you rebuild
It was not the roof TYPE. The reference photo genuinely is a gable. It failed on
**proportion and mass**:
- the main gable was too tall and too steep, so the roof dominated the house
  instead of capping it;
- it produced a big blank triangular end wall with nothing on it;
- the two gables (main + wing) sat at different heights and read as disjointed.

Whatever you propose, judge it on: does the roof **cap** the house or **swallow**
it? Is the end wall interesting or blank? Do the two volumes agree?

## Produce FOUR options
Each as the SAME street-level hero camera render, same lighting, same everything —
so the owner is comparing roofs, not lighting. Label them clearly A/B/C/D.

Suggested set (swap one if you have a better idea — say why):
- **A — better-proportioned gable.** The reference's look, done right: lower
  pitch (~35°, not 42°), ridge not towering, and the blank end wall SOLVED with the
  photo's own signature — dark timber king-post truss, and consider the balcony the
  reference actually has.
- **B — Dutch gable / hip-with-gablet.** Hip roof with a small gable at the ridge.
  Gives the gable's interest and timber detail WITHOUT the top-heavy triangle.
  Very common on this class of house and a natural middle ground.
- **C — hip with dormers.** Keep the current balanced hip, add 1–2 dormers to break
  the plain slope and add interest where the owner says it looks dull.
- **D — your own pick.** Whatever you believe genuinely suits their real work best,
  based on their job photos. Argue for it.

For every option state: pitch, ridge height vs wall height, and what solves the
end wall.

## Keep what already works
The new eave work just shipped and the owner likes it ("it looks good") — the
**soffit + fascia + baked rafter tails** stopped the roof floating and looking
paper-thin. **Every option must keep that eave depth.** Do not regress it.
Also keep: the porch, the recessed windows, the instanced snow guards.

## HARD constraints
- **NO EXPORT this session.** Renders only. `public/models/house.glb` must not
  change. Work in a copy/scratch or undo cleanly — back up as
  `HomeRC_backup_roofopts.blend` first.
- Node budget for the eventual winner: ~330 individual nodes, we are at 317. So a
  shape that needs lots of new pieces must use **instancing** (proven: 1 node per
  batch) or baked detail. Note the likely node cost of each option.
- Phase contract for the eventual build: roof pieces must be named
  `^(roof_|ridge_|entry_roof|chimney)` or they fly up out of the ground as walls.
- Judge from the **street-level hero camera in three.js** where possible, or a
  matched Blender camera — the owner looks at one specific angle, and a roof that
  reads well from above can read badly from the street. That is exactly how the
  gable slipped through.

## Report back
```
ROOF OPTIONS — 4 renders, no export
```
- The four labelled renders, same camera/lighting.
- One line per option: pitch, ridge-to-wall ratio, what solves the end wall,
  rough node cost.
- **Your ranked recommendation and why** — you have looked at their real job
  photos more than anyone; say which you would build and what you would avoid.
- Explicit confirmation that `public/models/house.glb` is untouched.
