# TASK: D's gable face is a blank beige triangle. Make the truss READ.

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## What happened — do not rebuild, this is a targeted fix
You built option D (jerkinhead) correctly. The main session verified it, and
**did not ship it**, because in the three.js hero at the owner's real camera it
reproduces the exact failure he rejected last time:

- the **tympanum** (gable face) is the SAME beige as the walls, so it merges with
  the wall below into one tall blank slab — a big plain triangle;
- the **king-post truss is effectively invisible** — pale, thin lines rather than
  the bold dark timber you intended. It does not break the triangle up at all.

You flagged this risk yourself ("if the owner still finds the gable face too
plain..."). Your instinct was right — it is too plain, and the truss is the reason.

**The silhouette is good. Keep the shape.** This is a material + scale fix.

## The reference tells you exactly what is missing
In `photo_2026-01-15_041947`, the gable face is cream plaster — same idea as ours —
but it works because the **dark timber truss is the dominant feature of that face**:
near-black, thick members, high contrast against the cream. It reads instantly from
the street. Ours has the geometry but none of the visual weight.

## Fix, in priority order
1. **Make the truss actually dark.** Near-black stained timber (sample the colour
   from the reference photo rather than guessing). It must contrast hard against the
   beige tympanum. This is the single change most likely to fix the whole problem.
2. **Make the truss thick enough to read at hero distance.** Judge it in the
   three.js hero at the real camera distance, not a Blender close-up. Members that
   look chunky up close vanish at hero scale — that is what happened here.
3. **If 1 + 2 still leave it plain**, add contrast to the tympanum itself. Options,
   in order of how common they are on their real chalets:
   - dark timber **board-and-batten / vertical cladding** in the gable face (very
     common on this house type, and instantly reads as "chalet"),
   - or a small **balcony** with a dark timber rail across the face, which the
     reference photo actually has,
   - or simply a **darker/warmer tone** for the tympanum so it separates from the
     wall plane instead of merging with it.
4. **Add the rafter tails / bargeboard weight** around the gable rake if it is thin
   there — the eave treatment elsewhere works well and the gable rake should match it.

## MUST NOT REGRESS
Everything already approved stays: the eaves (`roof_main_fascia`, `roof_main_soffit`,
`roof_wing_fascia`, `roof_wing_soffit` with the baked rafter-tail normal + AO), the
porch, the recessed windows, the instanced `roof_snowguards`, the course-by-course
roof build, and the wing's hip.

## HARD constraints
- **Node budget: 321 now, ceiling ~330.** Only ~9 individual nodes free. Cladding
  boards or a balcony rail MUST be instanced (linked duplicates, one Empty, `roof_`
  prefix) or baked — do not spend 20 nodes on battens.
- Phase contract: roof pieces must match `^(roof_|ridge_|entry_roof|chimney)` or they
  fly up out of the ground as walls. Truss and any gable cladding → `roof_*`.
  The tympanum infill walls (`main_gable_s1/n1`) correctly stay in the walls phase.
- **No clearcoat** (your P4 verdict). Do not run dedup — the main session does it at
  ship time.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True,
  export_gpu_instances=True` → `public/models/house.glb`. Backup as
  `HomeRC_backup_roofD_truss.blend`.

## The one thing that matters
**Judge it from the street-level hero camera in three.js, at real size, and compare
against the previous hip render.** The question is not "is the truss there" — it is
**"does the gable face still look blank at a glance?"** If yes, keep going. That
glance is the only test the owner applies.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- Hero render at the owner's camera: **before (blank beige triangle) vs after**.
- What you changed (truss colour/thickness, and whether you needed step 3).
- Node accounting vs the ~330 ceiling; what you instanced or baked.
- Confirmation the eaves/porch/windows/snowguards/course-build all survived.
- Your honest call: does the gable face still read blank? If you think it does,
  say so rather than shipping it.
