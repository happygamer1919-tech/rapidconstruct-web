# TASK: stop "making it realistic". MATCH ONE PHOTO.

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## Why this task exists — read it, it changes the method

Five sessions running, the owner has looked at the house and said the same thing:
"not realistic", "too gummy", "still looks shitty". Each session we shipped real
improvements (hip roof, quoins, hollow shell, 155 wall segments, 83 roof tiles,
PBR, baked AO, bevels). Each time it was **still not realistic enough**.

The problem is the brief, not the work. **"More realistic" has no finish line.**
Nobody can tell you when it is done, so it is never done.

The owner has no photos of his own to give us. His decision: **pick a real house
and build ours to match it.** So this task has ONE goal, and it is measurable:

> **Put the reference photo and our three.js hero render side by side.
> Make them look like the same house.**

That is the whole job. Not "add detail". Not "improve materials". Close the gap
between two specific images, and show me both.

## Step 1 — pick the reference (and commit to it)

Use **RapidConstruct's own real work** — matching a house they actually built is
worth more than any generic villa:
- `docs/PHOTO-INVENTORY.md` lists their real job photos on the Tilda CDN, publicly
  downloadable (you already pulled 6 of these in the archetype-A session).
- `BLENDER-NOTES.md` already nominates the best one: the warm street-level
  finished chalet, **`photo_2026-01-15_041947`**. Default to it unless you find a
  clearly better street-level shot of a FINISHED house (needs: whole house
  visible, daylight, roof + walls + surroundings readable).
- If nothing usable downloads, say so and pick one real reference house photo from
  anywhere (a real house, not a render) — and tell me exactly which.

**Save the reference next to your renders. Every report from now on shows both.**

## Step 1b — the owner's OWN hit-list (2026-07-17). These are named targets.

He has stopped saying "make it realistic" and started pointing at specific things.
That is gold — do not lose it in a general realism pass. **Each of these gets its
own before/after against the reference photo.** His words:

1. **"the front door roof model, it looks shitty"** — the entry gablet /
   porch roof over the door. Currently `entry_roof_s1/s2` + `roof_timber_entry`.
   Redesign it. Look at how the reference photo (and their other job photos)
   actually detail a porch: bracket, overhang depth, fascia, rafter tails.
2. **"the roof model maybe we can come up with a better shape?"** — he is
   questioning the SHAPE, not the tiles. Our stepped-hip may be too plain or
   wrongly proportioned (pitch, overhang, eave line, ridge length). Compare the
   silhouette to the photo directly. If a different form serves them better
   (steeper pitch, a dormer, deeper eaves), propose it with a render.
3. **"the walls — maybe to try with another color or font, it still looks plastic
   with no details"** — "font" means the texture/finish. Two separable things:
   the COLOUR (our cream may be wrong vs the photo) and the FINISH (still reads
   plastic despite the plaster normal). Sample the actual colour out of the
   reference photo instead of guessing, and push the plaster relief until it
   reads at hero distance.
4. **"window models as well, they look too unrealistic"** — `w#_f` frames,
   `w#_g` glass, sills, muntins. Compare directly against the photo: frame depth,
   reveal/recess into the wall, muntin proportion, glass tint and reflection.
   Windows are small and repeated, so errors read as "toy" instantly.

## Step 2 — measure the gap, then close it, in priority order

Compare reference vs our hero render and list the differences BEFORE modelling.
Work his four items first, then the list below. Expect the big wins to be light
and material, not geometry — that is what five sessions of geometry taught us.

Likely gap sources, in the order they usually matter:
1. **Light**: direction, hardness, colour temperature, sky vs sun balance,
   shadow softness and length. A render reads fake mostly because the light is
   wrong. Match the reference's time of day and sun angle.
2. **Value range**: real photos have deep shadows and bright highlights. Ours may
   sit in a narrow mid-grey band — that alone reads as "CG".
3. **Material response**: how the tile catches sky, how plaster scatters, how much
   the surfaces actually vary texel to texel.
4. **Imperfection**: nothing real is uniform. Dirt, streaks, slight colour
   variation between courses, weathering at ground contact.
5. **Context**: what surrounds the house in the photo vs our empty lawn.
6. Geometry/proportion: only if the silhouette genuinely differs.

## Step 3 — report the comparison, honestly

For each round: reference image, our render, and a plain list of what still
differs. **If you think we have hit the ceiling of what a ~1MB web model can do,
say so plainly** — that is a legitimate and useful answer, and far more valuable
than another round of "improved the materials". I will take that to the owner.

## HARD constraints (unchanged, and one is now binding)

- ⚠ **DRAW CALLS ARE THE LIMIT NOW, not bytes.** We are at **313 nodes** and the
  owner already reported the site "super laggy" once. Ceiling ~330 nodes. Bytes:
  1008 KB of 1.5 MB, ~490 KB free. **Do not solve realism by adding pieces.**
  If a fix needs more nodes, say so and stop — going past ~330 means wiring
  InstancedMesh site-side first.
- Phase contract (a wrong prefix silently makes a piece fly up out of the ground
  as a "wall"): P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact
  `main|wing|entry` + `_interior$` + everything unmatched · P2
  `^(roof_|ridge_|entry_roof|chimney)` · P3 `^(w\d+_|sill|door|handle)` ·
  P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Backup: `HomeRC_backup_match.blend`.
- **The build is now 4s** and every piece is individually visible (owner chose
  seeing it over speed). The resting house is what people stare at — optimise for
  the still, not the motion.
- `img.scale()` does not stick on packed images — your own gotcha, it once shipped
  a 4.17 MB PNG. Keep respecting it.
- **Verification law:** if your check constructs the input it is testing for, it
  proves nothing. Real renders, real byte counts, real side-by-side.

## Site-side is fair game — send them as testable claims

Lighting lives in `HouseBuildScene.tsx`, not the .blend, and light is probably the
biggest gap. We measure every claim you send:
- your **glass opacity 0.30** claim: measured, HELD, shipped ✅
- your **AgX tone-mapping** claim: measured, came out 24% LESS saturated — backwards ❌
- your **caps-before-slopes** claim: right problem, wrong cause (we sort by height,
  never by name) — fixed ✅
So: tell me sun angle, intensity, colour, shadow softness, environment intensity,
exposure. Give numbers. I will test them against the reference photo.

## Report back
```
MODEL READY: public/models/house.glb (<size>)   [or: NO EXPORT — findings only]
```
- **The reference photo you chose**, and why.
- **Side by side**: reference vs our hero render.
- **The owner's four items**, each with its own before/after: front door roof,
  roof shape, wall colour + finish, windows. Answer each one — if you think one of
  them is already right and the problem is elsewhere, say that and show why.
- The gap list: what you closed, what remains, what you believe is unclosable.
- Node count (flag at 330) + honest byte accounting.
- Site-side lighting recommendations as numbers we can test.
- Tools: name → source → ✅/❌/⚠️ → contribution. What you promoted to ✅verified.

## A note on trading nodes, since you are at the ceiling
You are at 313 of ~330. If the front-door roof or the windows need more pieces to
look right, **take them from somewhere that is not paying for itself** — e.g. the
main roof is 32 course-pieces and the wing 24, which mattered for the build
animation but may be more than the STILL needs now that each is textured. Merging
a few upper courses nobody watches individually is a fair trade for a porch that
reads. Tell me what you traded and why.
