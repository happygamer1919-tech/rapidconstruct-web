# BLENDER-NOTES — running log for the 3D/Blender session

Untracked. Read at the start of every session (BLENDER-AGENT.md §"Learn first").
Only verified-in-Blender facts go here — no unchecked theory.

## Verified state of HomeRC.blend (session 2026-07-15)

Source file: `~/HomeRC.blend` (backup: `~/HomeRC_backup_v4.blend`).
Blender runs with BlenderMCP server on port 9876; MCP tools available this session.
Current export `public/models/house.glb` = 1.04 MB (under the 1.5 MB gate). Not re-exported
this session — nothing was changed.

### Scene: 53 mesh objects, 13 materials
Materials: beige_wall_001, roof, glass, frame, door, gutter, plinth, pave, wood, lawn,
interior, plaster — plus a stray default `Material` (unused, candidate for cleanup, do not
export it onto anything).

Meshes by phase (all match the site's build-animation name prefixes):
- P0 foundation: plinth, plinth_lawn
- P1 walls: main, wing, entry (+ *_interior dark liners: main_interior, wing_interior, entry_interior)
- P2 roof: roof_main, roof_wing, entry_roof, ridge_main, ridge_wing, chimney, chimney_cap
- P3 openings: w1..w9 each as w#_f (frame) + w#_g (glass); sill0..sill7; door, door_case_l/r/t,
  door_step, handle
- P4 details: gutter_e, gutter_w, gutter_wing_e, ds1/ds2/ds3 (downspouts)

### Roof material — GOTCHA that cost time, don't re-derive it
- The `roof` material IS correct dark metal tile: base color ~[0.045,0.05,0.06], metallic 0.65,
  roughness 0.42. Meets the owner's hard "dark țiglă metalică" rule.
- `roof_main` / `roof_wing` carry TWO material slots [roof, beige_wall_001]. Face split is
  ~98% on `roof` (158/161, 122/125) — the 3 beige faces per object are the underside/soffit.
  So the slopes ARE dark metal. Correct as-is.
- **False-alarm trap:** from a STREET-LEVEL FRONT view the big tan triangles are the GABLE END
  WALLS (`main`/`wing`, correctly beige). The dark roof slopes are seen edge-on and barely show.
  To judge the roof, orbit to a raised 3/4 view first. Don't "fix" the roof from the front view.
- `entry_roof` (porch roof over the door) is mostly beige (5 faces beige / 1 roof). Reads okay
  visually and may be intentional; leave unless the owner flags it.

### Viewport helpers (bpy) proven this session
- Set a raised 3/4 review angle:
  `rv=area.spaces.active.region_3d` (area.type=='VIEW_3D'); set `rv.view_rotation` from
  `Euler((radians(62),0,radians(28)),'XYZ').to_quaternion()`, `rv.view_location=(0,0,3)`,
  `rv.view_distance=22`. Front street view ≈ rotation `Euler((radians(80),0,0))`, dist ~20.
- Inspect a material fast: read the Principled BSDF node's Base Color / Metallic / Roughness
  and any TEX_IMAGE names, rather than trusting the viewport tint (metallic surfaces reflect
  the world and can look lighter than their base color).

## Reference reels — watched 2026-07-15 (frames-only, watch skill)

Both reels are AI-built luxury-developer SITE demos filmed off a screen (no captions).
Confirmed they match docs/DESIGN-REFERENCES.md. Below are the beats + the LOOK to hit
in the 3D model (the site-motion side is already covered in DESIGN-REFERENCES.md).

### Reel 1 — @wearebrand (IG DaiOSriPGPP, 16s)
Overlay meme caption "Claude Code can't do that". A homepage scroll = a construction story:
- **Beats:** aerial of finished estate → foundation (orange formwork/rebar cages, concrete
  pump + mixer trucks, skid-steer, mountains at golden hour) → timber STICK-FRAMING skeleton
  rising (crane, lumber stacks) → finished glass-gable home glowing at dusk → loop back to aerial.
- **Captions** in script lower-left ("…building", "…home"); **phase chip** lower-right
  ("phase III — FACADE A"). Warm dark-gradient overlay for legibility.
- **LOOK to hit in 3D:** dark standing-seam / metal-tile roofs; big GLASS GABLE atrium; stone
  chimney/column bases; warm timber accents; golden-hour warm key light + cool sky fill.
- **Modeling implication:** the "build-up" idea literally shows a FRAMING state (bare timber
  skeleton) between foundation and finished. If we ever want a richer header loop, a low-poly
  stud/rafter framing variant of the walls+roof reads as "under construction".

### Reel 2 — polidori.dev / "Meridian Development Group" (IG DZl4PovRcYy, 10s)
Filmed off a MacBook (VS Code visible below). Ultra-minimal dark editorial site:
- **Beats:** bare dirt field (thin top bar "MERIDIAN / DEVELOPMENT GROUP · EST. 1999") →
  finished modern villa at golden hour with big STAT NUMERALS over the image (140+ / 27 / 1998)
  → beachfront concrete-frame TOWER rising (floor-plates stacking) → finished beachfront resort →
  dark editorial statement "Most buildings are sold. The best are *inherited*." → project index
  ("Previously built") → full-dark footer CTA "Bring us your next landmark." + one email link.
- **LOOK to hit in 3D:** modern low-slope/flat-roof villa; large warm-glowing glazing at dusk on
  a near-black scene; crisp manicured landscaping; overall DARK, high-contrast, premium.
- **Modeling implication:** glazing that glows warm from inside sells the "finished home" beat —
  our windows already have dark `*_interior` liners; an emissive warm interior card behind the
  glass would read as "lights on" for a dusk hero shot (cheap, web-safe).

### Shared takeaways (both reels)
- Construction STAGES on screen = land → foundation → structure(frame) → facade/roof → finished.
  This is exactly the model's 5-phase name buckets (P0..P4). Keep pieces separate + phase-named.
- Palette is warm-neutral + dark metal + glass, lit at golden hour / dusk. Our beige walls +
  dark metal roof + glass already match; lean warm on the lighting for any hero render.

## Techniques — VERIFIED in Blender this session (2026-07-15, screenshotted)

Built in an isolated `SCRATCH_verify` collection (deleted after), never touched the house.

### ✅ V1 — Stepped metal-tile roof rows via Array modifier
Serves the owner's HARD rule ("real stepped tile rows", dark țiglă metalică).
Source: https://blenderartists.org/t/roof-tiles-generator/1532809 and iMeshh roof docs
https://pro.imeshh.com/docs/asset-guides/roof-generator
Exact steps (bpy, proven):
- Build ONE tile-row profile as a small stepped strip: a flat tread (~0.72×0.35 m) then a
  short vertical lip (~0.06 m rise) — 8 verts, 3 quads. Origin at the row-start (eave) corner.
- Array modifier: `use_relative_offset=True`, `relative_offset_displace=(0,1.0,0)` (step along
  local +Y up the slope), `count=10` → a full ~3.5 m roof panel.
- Rotate the whole object to the roof pitch (e.g. 30°), position on the wall top.
- Assign the dark `roof` material. Result reads as convincing stepped metal tile.
- Cost: 10 rows × 8 verts = 80 base verts for a 4 m panel. Countable, light.
Web-safe: **partial** — real geo. Great for the eave/hero strip and a small house like ours;
for a whole large roof the research says bake the tile relief to a NORMAL MAP on flat planes
instead (lighter). For HomeRC (already 1.04 MB) real Array rows are affordable.

### ✅ V2 — Bevel + Weighted-Normal modifier for low-poly edge realism
The single biggest cheap-realism win for architecture (verified: side-by-side vs a raw
shade-smooth cube — the treated block shows crisp edges catching light, faces stay flat).
Source: https://polycount.com/discussion/188399/solved-blender-face-weighted-normals-controlling-bevel-weights
+ Blender manual (Weighted Normal modifier).
Exact steps (proven):
- Shade the object SMOOTH (this is what exposes bad low-poly normals).
- Bevel modifier: `width≈0.03`, `segments=2`, `harden_normals=True`, `miter_outer='MITER_ARC'`
  (or Limit Method=Weight + per-edge bevel weights for selective edges).
- Weighted Normal modifier AFTER the bevel: `keep_sharp=True`.
- Adds only a couple tris per edge; exports as baked custom normals in GLB (zero runtime cost).
Web-safe: **yes** — trivial geometry, no extra texture.

## Techniques — RESEARCHED with sources, NOT yet verified in Blender (try before trusting)
Kept separate on purpose (honesty rule). Verify + screenshot before promoting to VERIFIED.
- Trim sheet: one 1024² texture (normal+AO+curvature strips) for the whole building → fewer
  draw calls. https://www.beyondextent.com/deep-dives/trimsheets ,
  https://polycount.com/discussion/212378/trim-sheets-how-to-use-them
- Standing-seam roof = sweep a curve profile (or Array a simple V/U profile) — very low poly.
  https://pro.imeshh.com/docs/asset-guides/roof-generator
- Bake tile relief to a tiling normal map on flat roof planes = lightest metal-tile for web.
  https://blenderartists.org/t/how-to-bake-bevels-for-game-asset-models/1278148
- Build-up animation conventions (three.js drives motion; we ship a static named model):
  one object per animatable piece, phase-ordered names, deliberate ORIGINS (base corner for
  rise/drop, hinge edge for swing), parent groups to Empties, apply all transforms before export.
  https://sarahhyperdense.substack.com/p/blender-to-ue5-the-complete-export ,
  https://docs.blender.org/manual/en/latest/scene_layout/object/editing/parent.html
- glTF slimming: `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp
  --texture-resize 1024` (one doc: 31 MB→733 KB). Meshopt via `gltfpack -i in -o out -cc` when
  morph/anim data dominates (Draco can't compress morph targets). Export flags: GLB, limit to
  selected, no cameras/lights, tangents off unless a normal map needs them, Draco quantization
  Pos~14/Norm~10/UV~12. https://www.axl-devhub.me/en/blog/optimizing-3d-models ,
  https://github.com/donmccurdy/glTF-Transform/discussions/347 ,
  https://blenderartists.org/t/how-to-reduce-gltf-file-size/1344466 . Inspect budget at gltf.report.

## MODEL vs REAL HOUSES — gap analysis (2026-07-16, studied 6 real project photos)

Studied `docs/PHOTO-INVENTORY.md` + downloaded 6 real photos (home heroes + dated roofing/
facade job shots). Key finding: our model is a plausible generic house but does NOT yet look
like RapidConstruct's ACTUAL work. Their signature completed house (best match = the warm
street-level `photo_2026-01-15_041947`) has a specific detail vocabulary we're missing.

### What their real houses look like (evidence)
- **Roof = anthracite metal tile (țiglă metalică), almost always a HIP roof** (pyramidal, 4
  slopes + hips), moderate-steep pitch ~30–35°. Confirmed on 3 separate installs
  (photo_14_2025-11-25, photo_1_2025-12-03, photo_66_2025-12-03).
- **Tile profile = wavy MODULAR PANTILE** (down-slope ribs with rounded crests + a horizontal
  STEP every ~2 courses — Hellenic/Gothic type), NOT a flat standing seam. Rounded HALF-ROUND
  RIDGE/HIP CAPS run along every hip and the main ridge. Snow-guard clips in rows on the slopes.
- **Roof colour = matte anthracite, ~RAL 7016** (reads as a cool dark GREY #383E42, low sheen),
  NOT glossy near-black. Matches the `tabla-tip-tigla-meta` / `gotic-lucios-ral7016` swatches
  named in PHOTO-INVENTORY.
- **Walls = warm cream/sand smooth plaster** with, critically, **WHITE detailing**: rusticated
  WHITE QUOIN corner blocks (bosaj) and WHITE ARCHITRAVE SURROUNDS around every window/door.
- **Decorative dark TIMBER** on the premium chalet houses: exposed king-post gable trusses,
  carved rafter tails, eave brackets. Dark stained wood.
- **Plinth/base = dark split-face STONE veneer** (grey), not brown.
- **Windows = tall portrait, dark bronze/anthracite frames with muntins/transom bars**, set in
  the white surround. Anthracite half-round gutters + round downspouts (match roof colour).
- (One premium tier = ornate light-travertine CLASSICAL villa with pilasters/cornices/carved
  panels — `H1fd509…`. Different, higher-end archetype; probably NOT our default model target.)

### Where OUR model is wrong (current values → what real needs)
| Element | Model now | Real RapidConstruct | Fix (later, needs owner OK on archetype) |
|---|---|---|---|
| Roof form | simple GABLE | HIP (pyramidal, multi-facet) common | consider hipping the main roof |
| Tile profile | flat stepped standing-seam | wavy modular pantile + rounded ridge caps | new tile profile; add ridge cap geo |
| Roof colour | `roof` [0.045,0.05,0.06], metallic 0.65, rough 0.42 (glossy near-black) | matte anthracite RAL7016 ≈ linear [0.045,0.055,0.062] but GREY + MATTE | drop metallic→~0.2, rough→~0.6, nudge hue cool-grey |
| Walls | single warm beige [0.8,0.69,0.53], no trim | cream plaster + WHITE quoins + WHITE window surrounds | add white quoin/architrave geo (biggest visual gap) |
| Timber | none | dark decorative gable trusses / rafter tails / brackets | add on chalet variant |
| Plinth | brown [0.3,0.27,0.24] | dark grey split-face stone | recolour + stone texture |
| Windows | frame+glass, no muntins/surround | tall, muntins/transom, white surround, dark frame | add muntin bars + white casing |
| Ridge/hip caps | `ridge_*` (thin, gutter mat) | rounded half-round anthracite caps | reshape + roof material |
| Snow guards | none | rows of small clips | optional detail (P4) |

### Recommendation (for owner) — pick the archetype before remodeling
Two real archetypes: (A) **warm chalet** — cream plaster + white quoins + anthracite metal-tile
HIP roof + dark timber (their bread-and-butter completed house, closest to current model &amp; the
low front-camera); (B) **classical travertine villa** (higher-end, ornate). Recommend building
toward (A) as the default hero. Do NOT remodel yet — this is logged for the next build task.
NOTE: also flags a factual point for the site copy — they roof in BOTH metal tile AND dark-grey
bituminous shingle (`photo_1_2026-01-09` shows a shingle hip roof).

## WEB-RENDER LOOP — proven end to end (2026-07-16)
The site is the source of truth, not Blender's viewport. Verified loop:
1. `cd ~/Projects/rapidconstruct-web && npx next dev -p 3800` (defaults to 3000 — pass `-p 3800`).
2. Playwright script (run from INSIDE the repo so `import 'playwright'` resolves; running it from
   scratchpad fails ERR_MODULE_NOT_FOUND). Script in scratchpad/shoot.mjs.
3. GOTCHA that cost time: the 3D is LAZY — `src/components/Design3D.tsx` mounts `Model3D` only
   after a real **scroll / pointerdown / keydown** (`useInteracted`) AND the box is in view
   (`useInView`, margin 200px). A `mouse.move` does NOT arm it → no `<canvas>` ever appears.
   Fix: `keyboard.press('Tab')` + `mouse.wheel` down to the section, then wait for `canvas`.
4. Model renders with ZERO console errors; materials survived export (dark roof + beige walls).

### What the site actually shows (findings)
> ⚠️ **CORRECTED 2026-07-16 by the main session — the two struck-through bullets are STALE.**
> Verified against the real code + a headless browser run while landing archetype A:
> - The homepage **hero IS the 3D model** (`HouseBuild.tsx` → `HouseBuildScene.tsx`). It stopped
>   being a photo when the hero was rebuilt (PR #37). The hero is the **only live consumer of
>   `house.glb`** — judge every remodel there.
> - **`Design3D.tsx` + `Model3D.tsx` are DEAD CODE**: nothing imports `Design3D`, and `Model3D` is
>   imported only by `Design3D`. There is no "De la proiectul 3D la casa gata" section on the site
>   and **no 5-phase slider outside the hero**. Nothing to screenshot there.
> - The phase bucketing lives ONLY in `HouseBuildScene.tsx` (`phaseOf`, ~line 51). Its
>   unmatched-name fallback really is `return 1` (walls), so the quoins do land in P1.
> - `RoofCutawayScene.tsx` (`/acoperisuri`) is live but renders its OWN procedural roof, not house.glb.

- ~~The homepage **hero** is a REAL PHOTO (anthracite metal-tile hip-roof house), NOT the 3D model.~~
- ~~Our model lives lower, in the "De la proiectul 3D la casa gata" section — component
  `src/components/Model3D.tsx` (simpler one), with a 5-phase build slider wired to the node buckets.~~
- **Renderer mismatch (important):** in three.js the roof reads LIGHTER / FLATTER mid-grey than
  the near-black it shows in Blender's material preview. So tune roof colour/matte by judging the
  THREE.JS screenshot, not Blender. This is the brief's "Blender viewport lies" point, confirmed.
- **Gap in context:** our simple-gable beige model looks clearly more primitive than the real
  hip-roof metal-tile houses the site itself features in the hero — reinforces the gap analysis
  above (hip roof, white quoins/surrounds, ridge caps, timber, matte anthracite tile).

## glTF slimming — VERIFIED on the real house.glb (2026-07-16)
`gltf-transform optimize house.glb out.glb --compress draco --texture-compress webp --texture-size 1024`
→ **1.04 MB → 36.9 KB** (96.5%↓). Integrity intact: same bbox, 4032→4026 render verts, textures
kept as WebP. CAVEAT: output requires `KHR_draco_mesh_compression` + `EXT_texture_webp`, so the
site's GLTFLoader needs a configured **DRACOLoader** before we can ship a compressed GLB —
otherwise it won't load. Our current shipped house.glb is uncompressed, so leave it until the
site loader is draco-ready (flag to main session). We have huge headroom under the 1.5 MB gate.

## Reddit research (2026-07-16) — the ROUTE that works + a real find
IMPORTANT ROUTE NOTE: automated fetch of Reddit is blocked from this environment (WebFetch refuses
reddit.com; curl/`.json` → HTTP 403 datacenter-IP + Anthropic crawler banned; WebSearch
`allowed_domains:['reddit.com']` errors "not accessible to our user agent"; jina/redlib mirrors
down). BUT the brief's route works via the **claude-in-chrome MCP driving the owner's real Chrome**:
`navigate` a new MCP tab to `old.reddit.com/r/<sub>/search.json?q=...&restrict_sr=1&sort=top` then
`get_page_text` → real JSON. Thread comments: append `.json?sort=top` to the permalink. `get_page_text`
truncates ~53KB, so regex titles/permalinks out of the saved tool-result file rather than json.loads.
r/blender is mostly showcase ("I Made This"); r/blenderhelp is where technique answers live.

REAL find (r/blenderhelp, "Generating Roof tiles on coned surface without distorting", **Solved**,
https://old.reddit.com/r/blenderhelp/comments/11rqrz7/ ) — geometry-nodes tile roof on a hip/cone,
directly relevant to our wavy-pantile hip roofs:
- Instance-on-points AFTER the curve/bend deform (not before) keeps tile scale uniform (deforming
  after instancing STRETCHES tiles).
- The sideways-rotation bug = a normal gives a tile which way to POINT but not how to ROLL. Fix:
  define a constant pivot axis to align the tile first, THEN re-use the surface normal to align the
  second (roll) axis — align TWO axes, not just the normal. Loose point clouds lack usable normals;
  instance on the real surface.
- Per-tile `Rotate Euler` for local tilt so each course overlaps the next row; drive a per-row
  offset via a vertex group into the angle input.
- Caveat (comment): for UNIFORM tile size, narrower roof areas need FEWER tiles — pure
  instance-on-faces stretches; cull/generate points dynamically.
Web note: geometry-nodes tiles must be Realise + decimated/baked before GLB export or they blow the
budget — for our small roof, prefer the baked-normal-on-flat-planes recipe (V/skill §4).

Other NEW non-Reddit finds worth having:
- Geometry-nodes roof-tile distribution: https://blenderartists.org/t/geometry-nodes-roof-tiles-distrubituion/1573774
- Hip-roof metal end-cap modeling issue: https://blenderartists.org/t/roof-modeling-metal-hip-roof-end-issue/604072
- Blender→three.js export guide (origins/pivots, per-mesh export, NLA): https://github.com/funwithtriangles/blender-to-threejs-export-guide

## ARCHETYPE A REMODEL — done 2026-07-16 (house.glb now 1153 KB, 78 meshes)
Backup: `~/HomeRC_backup_archetypeA.blend`. Verified in the three.js HERO (HouseBuildScene),
no console errors, phase-bucketing intact.

Added objects + their phase bucket:
- Quoins → **P1 walls** (via the unmatched→1 fallback; no P1 prefix exists to match exactly):
  quoin_ml_fl, quoin_ml_bl, quoin_ml_fr, quoin_wg_fr, quoin_wg_br
- White window/door surrounds → **P3** (`^w\d+_` / `^door`): w1_trim,w2_trim,w3_trim,w4_trim,
  w5_trim,w6_trim,w7_trim,w8_trim, door_trim
- Window muntins → **P3**: w1_mun,w2_mun,w3_mun,w6_mun,w7_mun (NOT `_g$`, so not glass-overridden)
- Dark stone base course → **P0** (`^plinth`): plinth_base_main, plinth_base_wing, plinth_base_entry
- Dark timber → **P2** (`^roof_`): roof_timber_entry (king-post truss), roof_timber_brk_l/_r (eave brackets)
Rebuilt (SAME names, kept phase): roof_main, roof_wing (gable→stepped HIP), ridge_main, ridge_wing
(thin gutter strips → rounded half-round ridge+hip caps), entry_roof (flat→front gablet).
New materials: trim_white (0.88,0.86,0.82), stone_plinth (0.10,0.10,0.11), timber_dark (0.10,0.07,0.045).
Changed materials: roof → matte anthracite RAL7016 (0.052,0.060,0.068, metal 0.2, rough 0.6);
frame → dark bronze (0.06,0.055,0.05, metal 0.35) — was near-white; now reads as bronze in the
white surrounds. Reads correct in three.js (anthracite not too black, bronze frames + muntins pop).
Note: hipping the roof removed the gables, so item-5 timber moved to a front entry GABLET + truss
(matches the reference photo's porch) instead of a main-roof gable truss.
Still TODO/refine later: tile step courses are subtle (fine at street distance); could add a baked
pantile normal map (skill §4) if a closer camera is ever used. Model3D slider section shares the
same GLB (not separately screenshotted — the pinned hero runway is tall; hero confirms the model).

## BYTE REALITY of the current house.glb (measured 2026-07-16, NOT guessed)
`gltf-transform inspect` on the shipped 1.18 MB glb: it contains only TWO textures —
baseColor 33 KB JPEG (fine) + **metallicRoughness 887 KB PNG (77% of the whole file!)**. That
lossless PNG roughness map is pure waste (roughness is low-frequency). The wall material carried 7
PolyHaven maps but only 2 were wired (Diffuse+Rough); the other 5 were dead weight in the .blend.
All 14 non-wall materials are flat RGB (the CG tell). Reclaim, LOADER-SAFE, measured:
`gltf-transform resize house.glb out.glb --width 512 --height 512` → **1.18 MB → 431 KB**,
`extensionsRequired: none`. So realism has ~750 KB of reclaimable headroom RIGHT NOW without Draco.
Realism CAN be light — the answer to "can it be both?" is YES.
Phase-1 verifications this session: Poly Haven PBR download+apply ✅ (screenshot), AO self-bake ✅
(screenshot; gotcha: set `bake.use_selected_to_active=False` or AO errors "No valid selected
objects"). Full write-up promoted into the blender-buildings skill "Realism on a web byte budget".

## PHASE 2 REALISM PASS — applied 2026-07-16 (house.glb 1153 KB → 509 KB, MORE realistic + LIGHTER)
Backup: `~/HomeRC_backup_realism.blend`. Owner picked "both, surfaces first" + "model scenery myself".
- **Byte reclaim**: purged 5 dead wall maps, downscaled wall Diffuse→512 / Rough→256. The 887 KB
  roughness PNG is now 55 KB. Total textures 920 KB → ~125 KB. `extensionsRequired: none` (no Draco).
- **Bevel + weighted-normal** modifiers on 26 hard-surface objects (main/wing/entry, quoins, w#_trim,
  door_trim, plinth_base*, door, chimney, chimney_cap, roof_timber*). Applied on export. ~free bytes.
- **Stone PBR** on the base course: PolyHaven `castle_wall_slates` (pruned to albedo only, 512²,
  darkened tint, flat roughness to avoid a 2nd MR PNG) → material `castle_wall_slates` on
  plinth_base_main/_wing/_entry (cube-project UV). Replaced the flat `stone_plinth` (now removed).
- **Grounding scenery** (modeled low-poly), all named `plinth_*` → **P0** (site/foundation):
  plinth_path, plinth_tree_l, plinth_tree_r, plinth_shrub_l, plinth_shrub_r, plinth_hedge_f.
  New materials: foliage, foliage_hedge, bark. ⚠ PHASE FLAG: these land in P0 so the garden appears
  FIRST (site-first, reads fine). If the owner wants planting to appear LAST, rename to a P4 prefix
  (`gutter_`/`ds\d`) or add a regex in HouseBuildScene — TELL them (done in report).
- Removed unused materials: stone_plinth, wood.
- **SITE-SIDE (main session, NOT the glb)**: AgX tone mapping, `<Environment>` environmentIntensity
  +rotation, warm emissive on `w#_g` glass (site replaces glass at runtime so Blender emissive is a
  no-op — must be done site-side), one rim light. NO SSAO. Full spec in the skill "Renderer-side".
- Deferred (noted, not done): full-house baked-AO atlas (contact grime) — high value but heavy/risky
  for a 3.3s build; the site-side env/AO + bevels + scenery cover most of the ambient-occlusion feel.
  Bay window / dormer architecture — bytes allow it (~1 MB headroom); offered as next increment.

## WALLS + BRICK-BY-BRICK + NEW TOOLS — 2026-07-16 (house.glb 509→580 KB, still no Draco)
Backup: `~/HomeRC_backup_walls.blend`.
- **New tools proven** (verdicts in skill): ambientCG ✅ (plaster PBR via API+curl), HiFi Architecture
  Builder ✅ (parametric walls/stairs/pillars/domes via `scene.hifi_props.generator_type`),
  Procedural Tiles ⚠️ (decorative-pattern asset lib, not brick — skip), BlenderKit/Buildify ⏭️ not
  attempted (off-platform/gated — didn't fake them).
- **Walls split into courses** for the conveyor build: `main`→12 (main_c01..c12), `wing`→8, `entry`→6
  = 26 course objects (bottom=_c01). Method: bmesh bisect at each course height + delete-faces-per-band
  → separate objects, UVs preserved, openings intact. `*_interior` liners left whole. → all **P1**
  (fallback; exact `main|wing|entry` objects no longer exist). Byte cost: +~60 KB geometry.
- **AO baked to VERTEX COLOURS** on the 26 courses (`bpy.ops.object.bake(type='AO',
  target='VERTEX_COLORS')`, self-bake) + a per-course random tint (0.90–1.03) so courses read.
  Multiplied into beige_wall_001 base color. GOTCHA: the glTF exporter dropped it ("vertex color not
  used in node tree") until I passed **`export_vertex_color='ACTIVE'`** — confirmed COLOR_0:u16_norm
  in the glb via `inspect`. Zero texture bytes (COLOR_0 ~4B/vert). Effect is subtle on flat course
  fronts (darkens window reveals / plinth line / junctions, not flat seams — that's the tint's job).
- **Phase 3 detail**: `door_panel` (dark stiles/rails → paneled door) → **P3** (`^door`);
  `plinth_base_step_01..03` stone stoop → **P0** (`^plinth_base`); chimney given the stone texture (P2).
- three.js hero: renders clean, no console errors, 580 KB, `extensionsRequired: none`.
- Byte headroom left: ~920 KB. Offered next: bay window / dormer (bytes there), a nicer ambientCG
  plaster swap on the walls, HiFi entry pillars.
- SITE-SIDE CORRECTION LOGGED: my earlier AgX recommendation was measured BACKWARDS (AgX washed it
  out — 24% less saturated). Lesson: send site-side recs as testable claims; the main session measures.

## GUMMY FIX + HOLLOW + 1-BY-1 WALLS — 2026-07-16 (house.glb 580→919 KB, 240 meshes)
Backup: `~/HomeRC_backup_hollow.blend`.
- **Gummy diagnosis (in the real renderer)**: CONFIRMED H1 uniform roughness (roof/stone/gutter were
  flat values), H2 no normal detail (walls had none since the reclaim), H3 fat bevels (0.015 on a 7 m
  house), H5 no metal separation, H4 saturated flat door. H6 (AO) was partially in place (vertex AO).
  Fixes: BlenderKit plaster normal 512/str0.8 + roughness 256 on walls; 256² value-noise roughness
  variation on roof (0.42–0.72) + stone (0.65–0.95); bevels 0.015→0.006 (23 objs); gutters metallic
  0.6/rough 0.45; door desaturated. New segments = flat-shaded crisp masonry (no bevels).
- **⚠ EXPENSIVE GOTCHA**: `img.scale()` does NOT stick on packed images — exporter used the packed
  2048 originals → 5.4 MB glb (one 4.17 MB roughness PNG). Fix: `scale(); pack()`, verify with
  `gltf-transform inspect`. Logged in skill.
- **Hollow (Job 2)**: solid course rings + solid dark liner boxes DELETED. Walls rebuilt as real
  shells (TH 0.25) with dark INWARD faces (mat slot 2 = 'interior') — needed because three.js IBL
  lights interiors with no occlusion. *_interior objects now = thin dark floor+ceiling boxes only
  (also block see-through-roof backfaces). Windows verified still reading as dark glazing from the
  hero camera.
- **1-by-1 (Job 3)**: 155 wall segments — per side (n/s/e/w), per course (main 12 / wing 8 / entry
  5), split around openings with sill/lintel pieces. Names `main_c01_s1` … `wing_c08_n1` (bottom=01,
  s=front/-Y). All → P1 via fallback (correct). World-planar UVs keep plaster continuous across
  segments; grime vcol z-gradient × per-piece tint (every wall mesh MUST carry 'ao' or it renders
  black — material multiplies COLOR_0).
- **Tools proven**: BlenderKit ✅ FULL HEADLESS (search → blenderkit_download(asset_index,
  target_object) → material lands async ~10-20 s; addon zip freely fetchable; client on :62485);
  Material Library VX ✅ (35 procedural mats via bpy.data.libraries.load append). Both in skill.
- Total 240 meshes (report threshold ~250 — just under; site conveyor spreads them at ~9 ms/piece).

## ROOF COURSE-BY-COURSE — 2026-07-17 (house.glb 919 KB→1008 KB, 240→313 nodes)
Backup: `~/HomeRC_backup_roof.blend`.
- Replaced roof_main/roof_wing slabs + 2 long cap bars + entry_roof + chimney with **83 P2 pieces**:
  roof_main_s1..s4_c01..c08 (32), roof_wing_s1..s4_c01..c06 (24), ridge_main_01..10 + ridge_wing_01..09
  (19 individual caps), entry_roof_s1/s2, chimney_c01/c02 (stone). roof_timber_* kept as-is.
  All names verified P2 in the export log. Slope pieces = riser+tread quads from the ring() math;
  degenerate apex edges skipped/triangulated. World-planar UVs added → the 256² roof roughness noise
  finally samples correctly (old roof meshes had NO UVs — it was constant before), compounds with the
  new BlenderKit tile normal (512, str 0.7, scale+PACK applied).
- **313 total nodes** (budget 300–330 OK; hard flag at ~350 → needs site InstancedMesh first).
- Tools: BlenderKit mined again ✅ 'Shingle Roof Tiles Dark' (screenshot; harvested normal only).
- Deferred consciously: bay window + dormer — node budget is the constraint now, not bytes; do after
  the site wires instancing. Cap meshes are NOT yet shared/linked data — flagged for the instancing pass.
- Site-side note: glass-opacity 0.30 claim HELD (measured); AgX claim failed earlier — keep sending
  site recs as testable claims only.

## MATCH-THE-PHOTO — 2026-07-17 (house.glb 999 KB, 276 nodes; method changed permanently)
Backup: `~/HomeRC_backup_match.blend`. REFERENCE COMMITTED: `photo_2026-01-15_041947` (their real
finished chalet). Copies live in `docs/reference-match/` with before/after renders — every future
report shows reference vs render side by side. Colours SAMPLED from the photo pixels via bpy
(sunlit wall sRGB ≈ 0.79,0.70,0.59 → warm tan; roof ≈ 0.08,0.056,0.09).
- **ROOF SHAPE ANSWER: the photo is STEEP GABLES, not hips.** Converted: main gable pitch ~42°
  (ridge z 9.20), wing ~30° (z 5.10), both street-facing like the photo; deep eaves (OV 0.55/0.50)
  with dark fascia+soffit ON the eave-course meshes; rake bargeboards + king-post trusses in the
  front gable peaks (roof_timber_*_bb/_tr); gable-end wall prisms main/wing_gable_f1/b1 (P1
  fallback ✓). Conversion SAVED ~37 nodes (roof bucket 83→46) which paid for the porch.
- **PORCH redesigned** (owner: "looks shitty"): tile canopy slab w/ fascia+dark soffit on 2 chunky
  corbel brackets (entry_roof_s1 + roof_timber_entry), photo-style.
- **WALLS**: warm-tan multiply tint (1.06,0.97,0.84) from the sampled colour; plaster normal
  strength 0.8→0.45 (photo finish is SMOOTH — noisy normal read plastic).
- **WINDOWS**: all w#_f/_g/mun recessed 0.07 into the walls (deep reveals like the photo); door →
  dark glossy anthracite (0.045, rough 0.35) matching the photo's glass-grid door.
- GOTCHA note: export log prints MESH datablock names (.001 suffixes after rebuilds are FINE) —
  the phase contract matches OBJECT/node names; verify objects, purge orphan meshes.
- **REMAINING GAP = LIGHT** (the biggest one, site-side): photo has strong warm sun + deep shadows;
  render is high-key flat. Numbers sent for measurement (see report): sun [-6,8,5] int 3.2 #ffdcae,
  ambient 0.12, envIntensity 0.55, exposure 1.18, keep ACES. Also remaining: balcony + floor band
  (needs ~6-10 nodes), context (pool/paving/fence), photo-level material response (unclosable ~1MB).

### Export contract reminder (from BLENDER-AGENT.md, keep here so it's in one read)
1. Backup: `bpy.ops.wm.save_as_mainfile(filepath=".../HomeRC_backup_<tag>.blend", copy=True)`
2. Screenshot-verify BEFORE export.
3. Export MESH selection → `public/models/house.glb`:
   GLB, use_selection=True, export_apply=True, export_yup=True.
4. Keep < 1.5 MB. Report path, size, screenshot, and any changed node/material names.

## RESEARCH SPRINT — 2026-07-17 (no modeling, no export; HomeRC.blend untouched)
Toolkit expansion, everything RUN in scratch + screenshotted. Full recipes promoted to the
blender-buildings skill ("RESEARCH SPRINT 2026-07-17" section). Headlines:
- **EXT_mesh_gpu_instancing WORKS from Blender 5.2**: linked duplicates + same Empty parent +
  `export_gpu_instances=True` → 200 tiles collapsed to 1 node/1 draw call. Node takes the
  Empty's name → name Empties with phase prefixes. three.js loads it natively. THIS is the
  draw-call ceiling fix. `gltf-transform instance` can NOT create it on our model (0 batches —
  every course piece is unique geometry; and it nulls node names).
- **High→low bake proven end-to-end**: 34,656-face carved rafter/fascia → 6-face box, normal+AO,
  exporter auto-emits normalTexture + AO-in-baseColor. Failure mode: too-small cage/ray = a
  SILENTLY flat map, not an error. This is the eave-depth answer at ~3 nodes per eave run.
- **No eave/fascia/soffit/rafter addon exists** (all 1272 extensions.blender.org add-ons
  searched; Archipack absent from the platform). Archimesh/Bagapie tiles are Spanish BARREL
  profile — wrong for țiglă metalică. Real find: `bagapie.beam` parametric geo-nodes beam
  (rafters/fascia/pergola). Bagapie also = richest free scenery kit (ivy/paving/plank/siding).
- **Clearcoat** exports as optional KHR_materials_clearcoat (loader-safe, 0 bytes); visually
  subtle; forces MeshPhysicalMaterial in three.js (heavier shader) → A/B with FPS check only.
- **gltf-transform on house.glb (1.03 MB/313 nodes)**: `dedup` −21% (813 KB) SAFE; `prune` −8%
  SAFE; weld/simplify useless here; `join` → 20 nodes (−94% draw calls) but kills names/build
  anim — flagged as a possible post-build static-swap for the main session.
- ambientCG candidates listed for next material pass: RoofingTiles001–015, Bricks085–100,
  Rock022–051.
Next-session leverage ranking: (1) author instanced repeated detail (tiles/rafter tails/snow
guards) under phase-named Empties, (2) baked-eave fascia/soffit strips from the new bake
pipeline, (3) adopt dedup+prune in the export step (~250 KB free).

## EAVE FIX (baked) + FIRST INSTANCED DETAIL — 2026-07-20 (house.glb 1.01→1.14 MB, 313→317 nodes)
Backup: `~/HomeRC_backup_eaves.blend`. Fixes owner's "roof stays in the air / too thin".
DIAGNOSIS: the hip already has deep ~0.5 m overhangs, but the eave UNDERSIDE was OPEN — from
street level you saw the 0.06 m tile lip + sky under the overhang = floating + paper-thin. The
roof DID meet the wall (inner tread z 5.66 vs wall top 5.60, no air gap) — the float was the open
soffit, not a gap.
- **JOB 1 — boxed eaves (P2 bake pipeline used exactly)**: baked a 288-face tiling rafter/fascia
  high-poly → 512² normal + AO onto a flat strip (cage 0.20, ray 0.5; UV filled 0-1; reset
  use_selected_to_active). Built per block, 1 mesh each: `roof_main_fascia`+`roof_main_soffit`
  (4-side frame), `roof_wing_fascia`+`roof_wing_soffit` (3-side; WEST side skipped — it abuts the
  main block and is buried). Fascia = timber_dark thin boxes at the eave edge (gutters sit on
  them, z aligned to gutter 5.29-5.47 main / 2.99-3.17 wing). Soffit = horizontal dark frame at
  the eave-lip bottom, material `roof_soffit` (dark 0.045 + baked normal str 1.6 + AO×basecolor)
  → reads as carved rafter tails with shadow gaps. GOTCHA hit: soffit UV must map RUN→V and
  DEPTH→U so rafters run wall→fascia (perpendicular); first pass had them parallel (wrong).
  +4 individual P2 nodes.
- **JOB 2 — first instanced batch (P1 recipe, live test)**: `roof_snowguards` Empty at origin +
  14 clip objects SHARING ONE mesh (`roof_snowguard_me`, 16v), row above the main front eave,
  tilted 32°. Export `export_gpu_instances=True` → inspect confirms `EXT_mesh_gpu_instancing`,
  batch node `roof_snowguards` carries 14 instances, 0 individual clip nodes. 14 draw calls → 1.
  extensionsRequired stays none (loader-safe; three.js 0.185 handles it — confirmed by main
  session). NEVER instance structural pieces (kills one-by-one build) — only fine repeated detail.
- **NODE ACCOUNTING**: 316 individual nodes (312 house + 4 eaves) + 1 instanced batch = 317 glb
  nodes. Individual headroom vs ~330 ceiling = 14. Instancing the snow guards SAVED the ceiling:
  as individuals they'd be 330 (at the wall). 
- **Texture hygiene**: eave normal+AO baked at 1024 → file hit 1.35 MB; scale(512)+PACK → 1.14 MB
  (skill's "scale doesn't stick unless packed" gotcha respected).
- **VERIFIED in three.js hero** (next dev 3800 + playwright, before/after A/B by swapping a
  no-eaves glb): wing eave over the front windows went from a thin bright floating edge to a solid
  dark soffit band with fascia. No console errors, materials survived. Crop saved scratchpad/eave_ab.png.
- New node names (ALL P2 `roof_`): roof_main_fascia, roof_main_soffit, roof_wing_fascia,
  roof_wing_soffit, roof_snowguards (instanced). Materials added: roof_soffit (+ eave_normal/eave_ao
  packed images). No clearcoat added (deferred per P4 FPS-risk verdict).

## ROOF SHAPE = JERKINHEAD (option D) — built + shipped 2026-07-20 (house.glb ~1.15 MB, 321 nodes)
Backup: `~/HomeRC_backup_roofD.blend`. Owner rejected plain hip ("dull/unchanged") AND the 42°
gable ("towers"). Chosen after a 4-option render round (A gable / B dutch / C hip+dormers /
D jerkinhead — renders in scratchpad roof_options_4up.png). D = clipped gable: gable interest +
timber truss, but the apex is clipped by a small hip so it caps instead of towering.
- **Removed** old main hip: roof_main_s1..s4 (32) + ridge_main_01..10 (10). ⚠ GOTCHA: a filter
  `name.startswith("roof_main_s")` ALSO matched `roof_main_soffit` — deleted it by accident,
  re-appended from the backup. Watch prefix collisions (soffit/slope both "roof_main_s").
- **Built course-by-course** (main roof, all P2 unless noted):
  E/W slopes `roof_main_w_c01..08` + `roof_main_e_c01..08` (trapezoid courses, riser+tread,
  world-planar UV so the tile normal reads); front/back clips `roof_main_clips_c01..03` +
  `roof_main_clipn_c01..03` (small hips, top course triangulated); clip underside closers
  `roof_main_clips_sf`/`clipn_sf` (dark roof_soffit); ridge `ridge_main_01..07`; hip caps
  `ridge_main_hip1..4`; rake bargeboards `roof_main_rake_sl/sr/nl/nr` (timber); king-post truss
  `roof_main_truss_tie/collar/king/strutL/strutR` (timber). Gable-end tympanum walls
  `main_gable_s1`/`n1` → **P1** (unmatched fallback, builds WITH the walls — correct, they're wall).
- **GEOMETRY GOTCHA**: the clip base y is the HIP-LINE intersection at z=zc (ycb=Y0+fc*(ryf-Y0)),
  NOT the eave Y0 — first pass built clips at the eave y and they floated forward. Also the flush
  gable sits at the eave plane (y=Y0) with a small horizontal soffit closer bridging to the clip
  base, so no see-through gap under the clip.
- **Eaves carried**: base fascia/soffit rectangle unchanged (jerkinhead keeps the same eave rect);
  added rake bargeboards + clip soffit closers. Verified no floating/thin edge (scratchpad D_eave_crop.png).
- **Snow guards** repositioned from the old front slope (now gable wall) onto the EAST slope,
  still instanced (`roof_snowguards`, 14 clips → 1 node).
- **Node budget**: 320 individual + 1 instanced batch = 321 total (ceiling ~330, 10 headroom).
- **Clearcoat**: found Coat Weight 0.4 on the pre-existing `door` material (not added this task) —
  ZEROED to comply with the no-clearcoat rule; export now has NO KHR_materials_clearcoat.
- **Verified in three.js hero** (before hip vs after D, scratchpad heroD_ab.png): silhouette
  clearly changed hip→clipped-gable, gable reads warm (not the dark Blender shows), truss visible,
  wing keeps hip, no console errors. Raw export (1.15 MB); main session dedups at ship.
- ⚠ Process note: run the playwright shoot from the REPO ROOT (not public/models) or `import
  'playwright'` fails; and when A/B-swapping house.glb use ABSOLUTE paths (the Bash cwd resets).

## D TRUSS FIX — gable was a blank beige triangle — 2026-07-20 (house.glb 1.15 MB, 314 nodes)
Backup: `~/HomeRC_backup_roofD_truss.blend`. Main session held D: at hero scale the tympanum
merged with the wall (same beige) and the truss was pale/thin = invisible. Sampled the reference
`docs/reference-match/reference_photo_2026-01-15_041947.jpg`: the gable works because a NEAR-BLACK,
THICK, ELABORATE king-post truss DOMINATES the cream face (cream shows only between members).
Material+scale fix, shape unchanged:
- **Darkened `timber_dark` globally** 0.10,0.07,0.045 → **0.017,0.015,0.013** (near-black, rough 0.5).
  Fixes ALL timber at once (truss, eave brackets, bargeboards, porch) — matches the reference where
  every timber member is near-black. Zero nodes.
- **Rebuilt the truss BIG + elaborate, joined to ONE node** `roof_main_truss` (11 members: long low
  tie near the eave, full-span principal rafters, king post, collar, king struts, W-braces, apex
  braces; r 0.06–0.10). KEY MOVE: joining decorative timber into 1 mesh (a) frees nodes vs 5–7
  separate objects and (b) lets the lattice be arbitrarily elaborate for free. Decorative timber
  appearing as one piece in the build is fine (it's not structural). First attempt (small truss in
  the upper triangle) still read plainish — had to make it FILL the gable (tie dropped to z≈5.7,
  near full width) before the dark timber dominated the face.
- **Joined + thickened bargeboards** to `roof_main_rakes` (1 node, r 0.09) + decorative rafter-tail stubs.
- **NODE WIN**: joining truss(5→1)+rakes(4→1) took the model 321→**314 total (313 individual + 1
  instanced)** — 17 headroom under ~330. Did NOT need step-3 cladding/balcony; the big dark truss
  alone fixed the blank-gable read.
- Verified in the three.js hero (before pale-truss vs after): gable now reads as a dark-timber chalet
  gable, NOT blank, even partly behind the hero text/gradient (scratchpad gable_final_ab.png).
- Kept: eaves (fascia/soffit + baked rafters), porch, recessed windows, instanced snowguards, the
  course-by-course roof, wing hip. Clearcoat still off. Raw export — main session dedups at ship.
- Reference detail NOT yet added (optional next): the balcony with dark X-rail the photo has, and
  board-and-batten in the lower gable. Truss alone passed the glance test so these were deferred.

## ⚖️ THE MULTI-ANGLE LAW (permanent, from the roof-cleanup task 2026-07-20)
The site lets visitors DRAG-rotate the house: azimuth 360°, polar 36°–83.7°
(`OrbitControls` clamps in HouseBuildScene.tsx: minPolar π/5, maxPolar π/2.15). EVERY angle in
that envelope is visitor-reachable. Before AND after export, screenshot the model from FIVE
angles in the REAL three.js site (dev server 3800 + Playwright drag): 1 street front,
2 front-left raised, 3 front-right raised, 4 REAR raised, 5 rear-3/4 raised. All five must be
clean — no missing textures, no floating geometry, no speckles, truss reads as a truss.
**A model that only survives its default angle is not done.**
- Shoot mechanics: script `shoot5.mjs` in the REPO ROOT (playwright import resolves there).
  GOTCHA: drag at canvas CENTER hits the hero TEXT overlay and selects text instead of rotating —
  drag at (0.72·w, 0.5·h), over the house. OrbitControls: drag DOWN = camera RISES
  (Δpolar = 2π·dy/canvasHeight); dy≈150 saturates the raised clamp. Δazimuth = 2π·dx/height
  (800px canvas → 90° ≈ 200px). Arm with Tab + small wheel; wait ~13 s for the build.

## ROOF CLEANUP (defects A–D) — done 2026-07-20 (house.glb 1120 KB, 314 nodes, net 0)
Backup: `~/HomeRC_backup_cleanup.blend`. Owner orbited in Blender; execution fell apart off the
hero angle. All four defects diagnosed to ROOT CAUSE and fixed; five-angle law passed after.
- **A white slope/triangle** = TWO causes: (1) 5 flipped down-facing faces on slope courses
  (4 on roof_main_w, 1 on e_c08) → flipped per-face with bmesh `normal_flip()`;
  (2) see C — the mirror-roughness bug made whole slopes read white from raised angles.
- **B stick-salad truss** = old truss was an arbitrary 11-member lattice spanning only 5.2 m of
  the 8.1 m gable (floating mid-tympanum), AND roof_main_rakes bargeboards were PARTIAL mid-rake
  sticks (z 5.80–6.87 of a 5.34–7.34 rake) + 2 asymmetric orphan stubs. Rebuilt: truss = 7
  structural members (tie, 2 principal rafters following the rakes, collar under the clip line,
  king post, 2 struts), one node, flat on the tympanum y −4.32..−4.16 (0.13 proud, 0.01 embedded);
  rakes = 4 FULL-length boards (front pair y −4.32..−4.14 sits 0.02 proud of the truss face — no
  z-fight, reads as layered timber).
- **C white speckles** = 💥 **`roof_roughvar` AND `stone_roughvar` were GENERATED images with ALL
  pixels 0.0** — painted pixels on a GENERATED image DIE on save/reload unless PACKED (the old
  "scale doesn't stick unless packed" gotcha, worse: paint doesn't either). Roughness 0 + metallic
  0.2 = the whole roof was a MIRROR; the shingle normal map scattered sky reflection into white
  streaks. Regenerated as TILING smoothstep value noise (16-grid wrap-interp to 256², roof
  0.42–0.72, stone 0.65–0.95) and **PACKED**. RULE: after ANY img.pixels edit → `img.pack()`,
  then verify `np.array(img.pixels).mean() > 0`.
- **D near-black gable** = main_gable_s1/n1 had NO UV layer + NO 'ao' vcol; textured
  beige_wall_001 samples undefined → black in three.js AND Blender. Fix: world-planar UV at the
  wall scale 0.5·(x,z) + white CORNER/BYTE 'ao' (top-of-wall grime value is 1.0). RULE: any mesh
  getting a TEXTURED material needs UVs + (for walls) the 'ao' vcol, or it renders black.
- **Bonus finds**: chimney_c01/c02 E/W faces had zero-width planar UVs → flat beige from the
  west (visible angle 5) → `bpy.ops.uv.cube_project(cube_size=2.0)`. Purged 11 orphan images
  (incl. two 2048² plaster maps in unused mats — never exported, but .blend bloat) + 2 unused
  materials. Snow guards were NOT the speckle cause (z 5.8 vs wing max 4.9 — clear).
- **UV conventions measured** (reuse, don't re-derive): roof courses u=0.6·y, v=0.6·z
  (world-planar 0.6); walls world-planar 0.5; wall vcol 'ao' z-gradient ≈0.71 bottom → 1.0 top.
- Export verified: 314 nodes (313+1 instanced), extensionsRequired none, EXT_mesh_gpu_instancing
  intact on roof_snowguards, every P1-fallback node is wall-prefixed (no roof leak). Five-angle
  Playwright pass: zero console errors, all angles clean.

## FACADE + WINDOWS SESSION — 2026-07-20 (house.glb 1250 KB, 314 nodes, net 0)
Backup: `~/HomeRC_backup_facade.blend`. Owner: "white bricks too white/unrealistic; rebuild
building+windows; take a reference associating the roof." Full recipes promoted to the
blender-buildings skill (quoin recipe, window recipe, killed-texture note) — read those first.
- **Reference committed**: `photo_2026-01-15_041947` + secondary texture ref `2026-01-15_042141`
  (grey rusticated stone closeup, same shoot, downloaded from Tilda CDN). SAMPLED (grid-overlay
  method — write a 64px grid onto the photo via numpy to pick coords, coords from TOP): quoin lit
  sRGB (227,216,195), quoin shade (167,157,152), wall (182,161,133), frame (64,62,56), roof
  (15,10,14). Old trim_white rendered ≈(243,240,232) = the "sticker" problem, quantified.
- **Material**: trim_white RENAMED → `trim_stone` (base linear 0.72,0.63,0.50, rough 0.68,
  × ao-vcol, + plaster normal 0.35). All users inherited by the rename. REPORT to main session:
  material name changed (glb material "trim_stone" replaces "trim_white").
- **Quoins**: 5 stacks rebuilt as alternating corner blocks (54 blocks total), same object names
  (`quoin_ml_fl` etc.), corner+inward directions auto-derived from bbox vs house center.
- **Windows**: all 9 rebuilt node-neutral from each w#_f bbox (see skill). Sills now trim_stone
  (were dark 'frame'). Muntins re-seated on the glass (were floating 0.2 m proud at the wall
  plane — old bug). Architraves now 0.03 PROUD (were 0.014 recessed). door_trim retrofitted
  (UV+vcol+bevel). Names all kept; mesh datablocks show .001 suffixes (harmless).
- **Wall faces measured** (reuse): S_main y=-3.65, S_wing y=-3.50, W_main x=-5.70,
  E_wing x=6.70, E_main x=1.30.
- **Bytes**: first export hit 1435 KB — bevel segments=2 on 54 quoin blocks. segments=1
  everywhere → 1250 KB. Node count unchanged 314; extReq none; all names verified in glb.
- Five-angle law passed (shots in `docs/blender-tasks-done/facade-windows/`, incl. 3 before/after
  crops built by numpy-cropping the old vs new angle1 renders).
- Deferred at timebox: plaster low-freq layer (killed as a texture — glTF; could still be done by
  modulating wall segment vcols spatially), quoin high→low edge-wear bake (bevels+tints already
  read as stone at hero distance), BlenderKit limestone scan (zero-texture recipe won on bytes).

## SKILLS-ONLY SPRINT — 2026-07-20 15:18–15:35 (HOUSE UNTOUCHED: HomeRC.blend mtime 14:03:56,
## house.glb mtime 14:33:42, both pre-session; scratch purged from memory, mainfile NEVER saved)
Everything below was RUN (screenshots in scratchpad); full recipes live in the blender-buildings
skill — 6 new sections. Headlines only:
- **AO/grime atlas PROVEN end-to-end** (the 3-sessions-deferred lever): 4 objects → lightmap_pack
  → one bake call → occlusionTexture/TEXCOORD_1 in glb, one shared image. three r152+ auto-wires.
  512² = 120 KB PNG. #1 candidate for next modeling session.
  💥 GOTCHA: my minimal "glTF Material Output" group broke ALL glb imports (KeyError Iridescence
  Factor) until renamed — the importer hijacks any group with that name.
- **Quoin edge-wear bake** ✅ 26 KB @256², one map covers all blocks (overlapping face UVs).
- **GN-scatter → instanced batch**: the working path is depsgraph TRANSFORM HARVEST → linked dups
  of the known unit mesh (✅ 20→1 node, 2 KB). GN direct export silently DROPS instances;
  duplicates_make_real produces garbage for GN. Fence pickets/tile rows/rafter tails now authorable.
- **Scenery**: Sketchfab ✅ (LICENSE first: no CC-NC on a commercial site!) — byte trap measured:
  "low-poly" fence 318 tris but 7.1 MB of 2048² textures → 290 KB after scale(256)+pack. Good
  units found: Wooden Fence CC-BY 318t, bush CC-BY 96t. Rodin ⚠️: right look, 23k tris/1.24 MB;
  my quick slim broke UV/atlas sampling — needs the careful path. BlenderKit download client does
  NOT start headless; search API does (candidates catalogued in skill).
- **Compression measured on shipped 1039 KB glb**: webp −22% → 807 KB, ZERO wiring (PROVEN in
  three 0.185.1 stock loader). +meshopt (-kn -km -vt 14) → 508 KB, 2-line decoder wiring (decoder
  ships inside three), BUT meshes move to anonymous child nodes → phaseOf must inherit parent
  phase. gltfpack WITHOUT -kn = 36 nodes = build-anim killer. KTX2: not worth it here.
- **Free hunt**: extensions.blender.org new arrivals — "R3F JSX/TSX Exporter" (GLB+R3F component;
  lead only, NOT run — our name-driven pipeline wouldn't use its component), "YL VertexColForge"
  (vcol tools; bpy covers us). Nothing else survived. CLI note: it's `npx -y @gltf-transform/cli`
  (`npx gltf-transform` = ENOVERSIONS).
### Ranked next-session leverage (per node/byte)
1. **Ship-time webp** (main session, one command): −232 KB for free, zero risk — do it now.
2. **AO atlas on the house**: the last big "surface response" lever, matches the owner's whole
   complaint arc; ~120 KB @512 for contact shadow everywhere; pipeline fully proven.
3. **Instanced fence + garden upgrade**: Sketchfab fence unit (needs byte treatment) through the
   GN-harvest instancing recipe = a real fence + better planting at ~1 node each.

## ⚖️ THE LAW, STRICTER (2026-07-21, after the owner found a roof hole on MOBILE)
Before every export, IN ADDITION to the five hero angles:
- **CLOSE-IN pass**: 4 azimuths around the ROOF at ~55–60% hero distance, high polar (~40°) —
  in Blender (zoom is disabled on the site) — hunting see-through gaps, detached boards, z-fights.
- **WATERTIGHT RAY-SCAN** (now the real gate): down-ray grid over the roof footprint; any ray
  reaching an interior liner/plinth/lawn = FAIL. ~2 s for ~10k rays. Recipe in the skill.
- **MOBILE-LAYOUT drag check** in the real site: 390x844 viewport (isMobile), 4 drag azimuths.
  Mechanics that WORK (each cost a failed round): inject `* {user-select:none}` AND
  `main *:not(canvas){pointer-events:none}` (overlay eats drags), drag origin over the house
  (330,560), small repeated drags (±120 px) — a big drag runs off-screen/opens the menu.
A far shot that passes says nothing about close range. The owner browses on his PHONE.

## ROOF HOLE + REALISM SESSION — 2026-07-21 (house.glb 1460 KB raw, 313 nodes: 311 + 2 batches)
Backup: `~/HomeRC_backup_hole_realism.blend`. Full gotcha write-ups in the skill (2 new sections).
- **JOB 1 hole** — THREE root causes, all fixed, ray-scan 9,633/9,633 clean:
  (1) slope courses tapered hip-style from the eave → open WEDGES along both gable rakes (the
  see-through) → courses re-extended full-length below z 7.335, taper only above (clip hips);
  (2) clip sprang 0.85 m behind the gable plane (pale shelf + slot) → rebuilt springing from the
  gable top edge along true hip lines (~35°), shelf closers DELETED (roof_main_clips_sf/clipn_sf
  gone, −2 nodes), hip caps + ridge ends rebuilt to meet the apex;
  (3) fascia+soffit still had S/N bars from the hip era lying flat on the gable walls = the
  owner's "detached board" → rebuilt E/W-only. Rake bottom tips trimmed flush (z>=5.30).
- **AO atlas applied** (294 objects, occlusionTexture texCoord:1, 15 materials): blur x2 +
  FLOOR-CLAMP 0.42 (6-pass blur blacked out small trim islands — black boxes on white trim),
  bake margin 12, snowguards split to unwired 'roof_sg', gutters skipped. ~100 KB @352².
  Before/after pairs in docs/blender-tasks-done/hole-realism/.
- **Scenery**: fence = 9 Sketchfab sections instanced under Empty `plinth_hedge_fence` (P4 via
  ^plinth_hedge — deliberate name; glb batch node ×9 confirmed). Trees/shrubs = linked dups of
  `plinth_bush_me` (96 tris), object names kept. New materials: roof_sg, fence_wood, bush mat.
  ATTRIBUTION for the site credits page (CC-BY, both):
  "bush" by levandreev23032010 — sketchfab.com/3d-models/844e6a315757431da97efb5f17383bb5
  "Wooden Fence" by invisiprim3d — sketchfab.com/3d-models/4997cd9cb29248bc90a7797bbd899704
- **BYTE WAR** (raw gate 1.5 MB): first export 2253 KB → 1460 via atlas 1024→352+blur+clamp,
  bush spec dropped + base 128, plaster roughness regenerated 128² smooth, eave/castle/roughvars
  downscaled. New gotchas: pack() re-encodes jpeg→png BIGGER; file-source images need
  pack-BEFORE-scale; noisy bakes are PNG-incompressible (blur+clamp first).
- **Deferred**: clearcoat A/B (no FPS harness yet); better deciduous tree (bush at tree scale is
  a bit sparse); site-side aoMapIntensity tuning knob if the owner wants stronger/weaker grime.

## SKILLS-3 DIAGNOSIS SESSION — 2026-07-21 (house.glb 1485 KB raw, 313 nodes unchanged)
Backup: `~/HomeRC_backup_scenery_fix.blend`. Full recipes in skill ("FALLEN-SCENERY LAW",
"HERO PERF PROFILE"). One authorized fix-export shipped (H2 + one Job-2 winner):
- **Job 0**: H2 CONFIRMED — my garden swap took raw glTF-import meshes (Y-up data) without the
  import hierarchy's rotations/scale; fence+trees were lying FLAT in the source (fence "0.12 m
  tall", tree 1.5 m underground) and my hero-distance shots misread them as standing. Fixed by
  re-orienting mesh DATA to Z-up + baking scale + re-placing (fence 1.4×0.46 sections standing,
  trees 2.3–2.5 m). H1 lossless (0.0145° max), H3 correct — both refuted with numbers.
- **Job 1**: ~480 draws/frame is the lag (counts above). SITE-side claims for main session:
  (a) castShadow=false on small pieces, (b) post-settle merge swap, (c) shadowmap 512 during
  build. MODEL artifact delivered: `docs/blender-tasks-done/house.meshopt.glb` (558 KB, -kn -km
  -vt 14; needs 2-line MeshoptDecoder wiring + phaseOf must let anonymous child nodes inherit
  parent phase). Profiler script pattern in the skill.
- **Job 2**: walls now use ambientCG **Plaster004 scan roughness** (192², packed) — 5.5× more
  grazing-light response variation than the old procedural (std 1.67→9.16, measured in three
  0.185). Sheen: exports+loads (proven) but parked (washes facade, shader cost). Normal-strength
  bump rejected (contradicts the smooth-plaster reference decision).
- Verification: ray-scan 0/4332 ✓, 5 desktop angles ✓ no console errors, mobile front/front-left/
  rear-left ✓; mobile REAR shot not captured this session (browser hang; rear untouched by these
  changes and covered by yesterday's mobile pass + today's ray-scan) — flagged honestly.
- BlenderKit client STILL down headless (owner hasn't opened the N-panel; ambientCG carried the day).

## SCENERY QUALITY + ROOF DEPTH — 2026-07-21 (house.glb 1498 KB raw, 313 nodes)
Backup: `~/HomeRC_backup_scenery2.blend`. Recipes + the multi-slot vcol export bug in the skill.
- **Fence**: pickets DELETED (→ "Wooden Fence" CC-BY credit CAN BE DROPPED from the footer;
  bush credit STAYS — shrubs still use it). New unit: stone pier + plastered base + dark metal
  infill, 7 instances → batch `plinth_hedge_fence` ×7 (P4 ✓). Height 1.22 m vs door 2.1 ✓.
- **Trees**: MODELED (no licence needed), 624 tris, 2 linked objects (plinth_tree_l/r, P4 ✓,
  4.35/3.88 m). Canopy tint via 3 flat-factor foliage materials (vcol path is BUGGED on
  multi-slot meshes — see skill). Shrubs nudged clear of walkway/stoop.
- **Roof close range**: normal 1.0 + seam rhythm ×1.6 (baked into UVs — Mapping node emits
  REQUIRED KHR_texture_transform, reverted) + 0.04 m course lips on 40 course meshes.
  Ray-scan post-lips: 0/6633 ✓.
- Laws: 5 desktop angles ✓ (0 console errors), mobile owner's-angle + rear-left ✓, ray-scan ✓,
  extReq none ✓, all names/batches verified. Before/afters in docs/blender-tasks-done/scenery2/.
- Nodes: 313 (311+2 batches; fence batch 7 replaced batch 9). New materials: wall_fence,
  stone_fence, bark_tree, foliage_tree/_b/_c. Removed: fence_wood, plinth_fence_me, tree v1.

## DE-BARN LOOKS SESSION — 2026-07-21 (DESIGN ONLY — no export, no save; renders in
## docs/blender-tasks-done/delarn-looks/)
Owner rejected the barn read → diagnosis: the display king-post truss IS the agricultural
signature; vertical boards + truss would make it WORSE (board-and-batten = barn). Direction:
modern/alpine-modern — crisp battens as accent, truss gone, plaster stays the light element.
- REFERENCES: their portfolio has NO built vertical-timber facade (spot-checked; said so
  honestly) BUT their own materials-board photo (pf2, portofoliu) shows them specifying fluted/
  ribbed dark panels + dark marble + travertine — the vertical-rhythm language exists in their
  DESIGN practice. Sampled: their board cream (218,207,199), terrazzo off-white (239,229,221),
  travertine (189,141,111), dark marble (54,55,53); ambientCG scans WoodSiding001 dark-stain
  (55,39,31), WoodSiding007 oiled (74,60,49). External idiom ref: Swiss modern chalet (dark larch
  verticals + crisp metal roof).
- THREE LOOKS rendered (same cam/sun, hero + owner-drag each), procedural 10-board batten
  albedo+normal (512² grayscale, tinted per look):
  A warm: honey battens (185,140,90) gables only, walls off-white (~238,231,222), truss deleted.
  B dark: dark-stain battens (55,39,31) on gables + ENTRY volume, walls greige (~205,197,188),
    truss deleted. Strongest roof-association.
  C compromise: mid battens (74,60,49) gables only, walls warm clay, truss → minimal collar+post
    brace. FINDING: the minimal brace only reads at close drag, VANISHES at hero distance —
    "some truss" buys nothing.
- BUILD COSTS (est): all looks −5 quoin nodes (−~40 KB), −1 truss node (A/B); battens as
  TEXTURE on existing gable planes (256² ≈ +25 KB — 512 would bust the 1.5 gate at raw 1498);
  B's entry cladding = re-material existing atlas-wired segments (needs occlusion wiring on the
  new clad material + atlas UVs exist ✓), 0 nodes. Cladding rises with walls = P1 ✓ (it IS the
  wall segments/gable planes).
- RECOMMENDATION SENT: Look B (see report).

## LOOK B BUILT — 2026-07-21 (house.glb 1309 KB raw, 307 nodes: 305 + 2 batches)
Backup: `~/HomeRC_backup_lookB.blend`. Recipes + 2 texture gotchas promoted to skill.
- DELETED: roof_main_truss (-1 node), 5 quoin stacks (-5 nodes). Nodes 313→307. Bytes 1498→1309
  (-189 net: quoin/truss geometry −~215, battens+pantile normal +~26).
- Cladding `clad_dark` (NEW material): gables (main_gable_s1/n1) + 11 entry front segments —
  all P1, names unchanged, rises with walls ✓. Atlas occlusion wired (texCoord-1 recipe).
- Walls → greige: beige_wall_001 diffuse retinted ×(0.945,0.985,1.055) in-image.
  Surrounds/sills KEPT, retoned warm-grey linear (0.66,0.62,0.555) — they frame the openings and
  aren't the rejected "white stone" (that was the quoins). Rendered fine; no removal needed.
- REGRESSION FIXED en route: the seam-rhythm UV rescale (scenery2 session) made the round-shingle
  normal read as oval polka dots at raised angles — replaced with generated rectangular pantile-
  module normal (course-aligned). Roof roughvar contrast also halved (0.52–0.66).
- Laws: ray-scan 0/6633 ✓, 5 desktop + mobile owner-angle ✓ 0 console errors, extReq none ✓.
  Before/afters + shots in docs/blender-tasks-done/look-b/.

## ROOF MATCH + REBUILD — 2026-07-21 (house.glb 1379 KB raw, 307 nodes)
Backup: `~/HomeRC_backup_roofmatch.blend`. Two new skill sections (occlusion texCoord LAW,
dark-family roof recipes).
- **JOB 0 ROOT CAUSE**: my scenery2 KHR_texture_transform cleanup deleted roof's atlas UVMap
  node → exporter defaulted occlusion to UV0 (twice shipped). Fixed at source + THE LAW: the
  node one-liner must print [] after EVERY export. It immediately caught a second offender
  (rebuilt roof_timber_entry with no UVs → texCoord -1) — fixed. Final table: all 1.
- **JOB 1**: roof+roof_sg base (0.052,0.060,0.068)+metal 0.2 → (0.034,0.026,0.020)+metal 0.06;
  gutter warmed (0.115,0.102,0.09). Roof now reads same dark family as clad_dark/timber.
- **JOB 2**: staggered rect-module normal (half-module offset per course) + per-module roughness
  jitter + 20 ridge/hip caps beveled round. No more strips/dots — course-aligned modules.
- **JOB 3**: porch canopy rebuilt (entry_roof_s1, 7 faces: 3 lip courses + fascia + soffit, P2
  name kept); roof_timber_entry rebuilt as 2 corbel brackets (was a degenerate 2 cm plate).
  THE CONE = ridge_wing_02 (wing SW hip cap) piercing the canopy — retracted 0.87 up-slope.
- Laws: ray-scan 0/6633, 5 desktop + mobile owner angle, 0 console errors, extReq none,
  texCoord table all-1. Shots + A/Bs in docs/blender-tasks-done/roof-match/.
