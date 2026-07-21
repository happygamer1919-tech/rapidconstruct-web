# TASK: new tools (downloaded + proven), realistic walls, brick-by-brick build

Paste this whole file into the Blender terminal (Fable 5).
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first, as always. Your last pass
(509 KB, garden, stone base) landed and the owner liked it. His next words:
**"make the house more realistic!!!!!!"**, **"find new skills or something, not
specially on reddit but anywhere, lets download. lets make sure they work in
blender"**, and **"the walls, lets change them, make more details, or whatever"**.

## What changed since your last session (context you need)
- The build animation is now a **conveyor**: all 84 pieces fly in individually,
  one starting every ~22ms, each as blue wireframe first. Piece COUNT is no
  longer a styling constraint — more pieces = a richer build, the site spreads
  them automatically. This unlocks the item below.
- Budget: **509 KB used, ~990 KB free** under the 1.5 MB gate. Still NO Draco.
- Your AgX tone-mapping recommendation was measured in the real renderer and
  was **backwards** (AgX: 24% less saturated, lower contrast — it washed the
  house out; details in `HouseBuildScene.tsx`). No harm done — but it means:
  site-side recommendations get measured, so send them with a testable claim,
  not a belief. Model-side work you verify yourself, as you already do.

## Phase 1 — NEW TOOLS, downloaded and PROVEN (the owner's explicit ask)
Go beyond Reddit: **extensions.blender.org, GitHub, BlenderKit (free tier),
ambientCG, Poly Haven (already verified), Gumroad free tools** — anywhere with
something real. Candidates worth evaluating (verify, don't trust my list):
- **Buildify** (free, Gumroad) — geometry-nodes building generator; even if the
  output is too heavy, its wall/trim node setups are worth stealing from.
- **BlenderKit addon** — free-tier PBR materials/models directly in Blender.
- Anything on extensions.blender.org for **wall/brick generation, archviz
  detailing, texture baking helpers**.
The bar for each tool: **INSTALLED + a screenshotted result inside Blender**
(scratch collection, never the house), plus a one-line verdict in the skill:
✅works / ❌broken / ⚠️works-but-heavy. A tool you didn't run is a rumor —
don't write rumors into the skill. Remember the 5.2 gotchas (`set_texture`
broken; addon installs via the extensions system or
`bpy.ops.preferences.addon_install`).

## Phase 2 — THE WALLS (owner asked directly)
1. **Split the walls into courses** — `main`/`wing`/`entry` are single slabs
   today, so the "lego" build moves three big boxes. Cut each into horizontal
   courses (or course-groups, ~8–14 pieces per wall; use your judgment against
   the byte cost — instancing/shared geometry where possible). This is what
   turns the hero into a true brick-by-brick assembly.
   **Naming contract:** any name is safe (unmatched names fall back to P1 =
   walls on the site), but be explicit: `main_c01…`, `wing_c01…`, `entry_c01…`,
   bottom course = 01. Keep the `*_interior` liners intact and unsplit.
2. **Wall surface realism:** real plaster PBR (albedo + roughness, small, from
   ambientCG/Poly Haven/BlenderKit — atlas it), subtle colour variation between
   courses so the split reads, and keep the white quoins/surrounds crisp.
3. **The deferred baked-AO / contact-grime pass** — you called it "the one
   remaining big realism lever" last time. Walls are being re-cut anyway, so
   bake it now: dirt line at the plinth, shading in window reveals, streaks
   under gutters. In-texture, zero runtime cost.

## Phase 3 — overall realism, judged in the THREE.JS hero render
Whatever Phase 1 tools proved useful, apply them: richer eave/trim detail,
chimney brick, door texture, window depth. Optional if budget allows: the bay
window + dormer you offered last time ("more building" — bytes are there now).
Judge every step from the street-level hero camera; Blender's viewport lies.

## HARD constraints (unchanged)
- Phase contract: P0 `^plinth$|^plinth_lawn$|^plinth_base` · P1 exact
  `main|wing|entry` + `_interior$` (fallback catches new wall names) ·
  P2 `^(roof_|ridge_|entry_roof|chimney)` · P3 `^(w\d+_|sill|door|handle)` ·
  P4 `^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)`.
  Report EVERY new node name + intended bucket.
- **< 1.5 MB**, no Draco/WebP-compressed GLB (loader not wired). If a tool's
  output is heavy, decimate/bake it down or drop it — say what you dropped.
- Export: GLB, `use_selection=True, export_apply=True, export_yup=True` →
  `public/models/house.glb`. Backup first: `HomeRC_backup_walls.blend`.
- Verification law: **if your check constructs the input it's testing for, it
  proves nothing.** Real Blender screenshots, real three.js renders, real byte
  counts from `gltf-transform inspect`.

## Report back
```
MODEL READY: public/models/house.glb (<size>)
```
- Tools tried: name → source → ✅/❌/⚠️ verdict → what it contributed.
- Wall split: piece count per wall, naming, byte delta.
- AO/grime bake: what got it, byte cost.
- three.js hero screenshots (street camera) + honest byte accounting.
- Skill updates: what you promoted to ✅verified.
- Any site-side recommendation as a TESTABLE claim (we will measure it).
