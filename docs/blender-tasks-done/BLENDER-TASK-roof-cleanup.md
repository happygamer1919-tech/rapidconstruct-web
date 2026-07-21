# TASK: the roof is a MESS from every angle except the hero camera. Clean it up.

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## What happened
The owner orbited the model in Blender and saw it from a raised 3/4 angle. His
verdict, verbatim:

> "u can keep the shape but cmon bro wtf is this shit"

**The jerkinhead silhouette is APPROVED and stays.** This task is cleanup of the
execution, which falls apart from every angle except the street-level hero camera
— the only angle we ever verified. That was OUR shared blind spot, and it matters
because **the site lets visitors DRAG-rotate the house**: horizontally 360°, and
vertically from street level (~84° polar) up to a quite raised view (~36° polar,
`OrbitControls` clamps in `HouseBuildScene.tsx`). Every angle inside that range is
VISITOR-REACHABLE. From now on we verify all of them.

## The defects he saw (screenshot analysed; diagnose each in Blender before fixing)

### A. WHITE UNTEXTURED TRIANGLE on the rear clip/upper slope
A large bright white patch where a roof face has no proper material — reads as a
hole in the roof. Likely a missing material slot or broken UV on one of the rear
clip courses (`roof_main_clipn_*`) or an upper course. Find it, assign the roof
material with correct UVs, and CHECK EVERY OTHER FACE while you are there —
`gltf-transform inspect` + a Blender pass over material slots per roof object.

### B. THE TRUSS READS AS RANDOM STICKS LYING ON THE ROOF
From the raised angle the 11 members look like scattered planks glued onto the
slope — an X here, a diagonal there — NOT a structural king-post truss. Likely
causes to check: members not coplanar with the VERTICAL tympanum (some appear to
sit in/over the sloped clip face); members floating proud of the wall with no
attachment; the "elaborate lattice" being structurally arbitrary.
Rebuild it as a REAL truss a builder would recognise, attached flat to the
vertical gable face with believable depth (~0.1 m proud of the plaster):
tie beam across the base, king post centre, two principal rafters following the
gable edges, two struts. Symmetric, structural, simple. The reference photo
(`photo_2026-01-15_041947`) shows exactly this — copy its logic, not an ornament.
It must stay ONE joined node (`roof_main_truss`) and stay clear of the clip face.

### C. WHITE SPECKLES on the wing roof slope
Scattered bright dots across the wing slope. Suspects: the instanced snow guards
z-fighting with the roof surface (clips intersecting the tile geometry), bake
artifacts in the roughness/normal, or duplicated overlapping faces. Diagnose
(move one snow guard in isolation; toggle the textures) — then fix the CAUSE. If
it is the snow guards, seat them properly ON the tile surface with clearance.

### D. THE GABLE FACE RENDERS NEAR-BLACK, NOT PLASTER
The tympanum should be beige plaster (`main_gable_s1/n1`) with the dark truss ON
it. In the owner's viewport the whole triangle reads near-black. Verify the
material assignment on both gable infill walls and on the clip faces — if the
dark roof material bled onto wall faces during the rebuild, restore plaster.
Check BOTH ends (street side and rear).

## THE NEW LAW — multi-angle verification (this is now permanent)
Before export AND after export, screenshot the model from the full
visitor-reachable envelope, in the REAL three.js site (dev server + headless
Playwright, drag or camera-set to each angle):
1. street front (the hero default),
2. front-left 3/4 raised,
3. front-right 3/4 raised,
4. REAR raised (where the white triangle lives),
5. rear-left or rear-right 3/4.
All five must look clean — no missing textures, no floating geometry, no
speckles, truss reading as a truss. **A model that only survives its default
angle is not done.** Add this law to BLENDER-NOTES so it outlives this task.
(Blender viewport ≠ truth, as always: judge the three.js screenshots.)

## MUST NOT REGRESS
Jerkinhead silhouette (approved) · near-black timber colour (approved — the fix
is placement/structure, not colour) · eaves (soffit/fascia/rafter-tail bake) ·
porch · recessed windows · instanced snow guards (unless C demands re-seating) ·
course-by-course build · wing hip.

## HARD constraints
- Node budget: 314 individual now, ceiling ~330. This is cleanup — net node
  change should be ~0. Truss stays 1 joined node.
- Phase contract unchanged: roof pieces `^(roof_|ridge_|entry_roof|chimney)`;
  unmatched → walls (they fly up out of the ground — never acceptable for roof
  parts). Report any renames.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True,
  export_gpu_instances=True` → `public/models/house.glb`. Backup first:
  `HomeRC_backup_cleanup.blend`. No dedup (main session does it at ship).
- Verification law stands: real renders, real inspect output, never your own
  constructed input.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- Per defect A–D: root cause found → fix applied → proof.
- THE FIVE ANGLE SCREENSHOTS from the real three.js site, after the fix.
- Node/byte accounting + confirmation of every MUST-NOT-REGRESS item.
- What you added to BLENDER-NOTES under the multi-angle law.
