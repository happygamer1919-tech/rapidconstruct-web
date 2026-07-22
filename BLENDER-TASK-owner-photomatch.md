# BLENDER-TASK — PHOTO-MATCH THE OWNER'S REAL HOUSE

**This supersedes every open research thread. Q-06 and Q-11 are ANSWERED.**
Archive `BLENDER-TASK-research-round3.md` to `docs/blender-tasks-done/` before
starting. One task file in the root.

The owner delivered drone photos and video of houses his company actually built.
We have spent a week approximating a house from imagination. That stops now.

---

## 0. The assets

- **Stills (use these first):** `docs/reference-match/owner-drone-2026-07-22/`
  — 8 drone JPGs at 2000 px. `DJI_0018` is the money shot (raised 3/4, whole
  house + site). `DJI_0020/0023/0037` are close roof + wall studies.
  `DJI_0021/0034` are the front elevation with the carport.
  `DJI_0022/0024` are a **different product line** (flat-roof modern townhouses,
  stone-look cladding) — do NOT mix them into the house model.
- **Full-res originals + 5 drone videos (3.5 GB):**
  `~/rc-owner-assets/drone-2026-07-22/` — deliberately OUTSIDE the repo. Never
  commit these.
- **Video**: `DJI_0016/0017/0019` (~1 GB each) and `DJI_0035/0036`. Extract frames
  with ffmpeg (`-vf fps=1/2 -q:v 2`) into a scratch dir, pick the useful angles,
  and add only the chosen frames to the reference folder. Video gives you the
  **orbit** — every angle of the same building, which is exactly what a single
  still cannot give you and exactly what the owner drags on his phone.

## 1. What the photos say, and what it costs us

Compare against the model we shipped. This is not a tweak list; the archetype is
wrong in three places at once, and the owner named all three.

| Feature | Our model today | The real house |
|---|---|---|
| Roof form | jerkinhead (clipped gable), one mass | **full hip**, and **multi-level** |
| Massing | one block + small wing | 2-storey block + lower single-storey wing + **carport** + forward entry bay |
| Tile | shallow modular pantile | **deep wavy S-pantile**, large module, pronounced shadow per course |
| Roof colour | warm near-black, matched to timber | **anthracite grey-green** (~RAL 7016/6020 family) |
| Walls | warm greige + dark vertical timber | **bright white stucco** |
| Accents | dark timber cladding on gables/entry | **mid-grey scored panels** framing the windows, thin white reveal lines |
| Plinth | warm near-black | crisp dark grey band |
| Chimney | matched to roof | **bare red brick** + grey metal cap |
| Ground | green lawn | **grey/white checkerboard pavers** |

**⚠ This kills the approved "Look B" dark timber cladding.** The owner approved
that on renders; the photos show his company does not build it. His instruction
("whiter walls, they look old") overrides the earlier approval — but log the
reversal in `docs/DECISIONS.md` so nobody re-derives it later.

## 2. The three asks, in the owner's words

1. **"Change the main roof, make it better, cooler and not that simple."**
   The answer is in his own photos: the roof is not simple *because it is
   multi-level*. A big hip over the 2-storey block, a lower hip over the wing and
   carport, and a small hip bay projecting over the entry — three roof planes at
   three heights, meeting in real hips and valleys. That reads as "cooler" far
   more than any texture. Add: proper hip ridge caps, snow-guard rows scattered
   across the field (they are in every photo), dark drip edge, half-round gutters
   with round downspouts.
2. **"Change the building itself."** Massing to match: two-storey main block,
   single-storey wing running off it, open carport on square white columns under
   the wing roof, entry recessed under the bay.
3. **"Make the walls whiter, they look old."** Bright white stucco. Take the
   actual value off `DJI_0037` / `DJI_0023` with a pixel sample — do not eyeball
   it. The grey accent panels and the dark plinth are what stop white from going
   flat, so they must land in the same pass.

## 3. Method — options first, build second (this has saved us twice)

**Do NOT build all of this and show it finished.** Per the working model:

**Stage 1 — roof options board (do this first, show it, stop).**
Model 3–4 roof/massing options at block level only (no textures, no detail —
grey clay, correct proportions), each rendered from the owner's own drone angle
so he can hold the render against his photo:
- **R1** — literal match: hip + wing hip + entry bay exactly as photographed.
- **R2** — the same, but with the entry bay enlarged into a real feature.
- **R3** — a slightly bolder composition (e.g. deeper eaves, a stronger
  height difference between block and wing) — "cooler" with more contrast.
- **R4** — your own proposal if the photos suggest something better.

Render each at the hero angle **plus** the matching drone angle from `DJI_0018`.
Put them in `docs/blender-tasks-done/roof-options-2026-07-22/` with a single
side-by-side sheet. **Then stop and report.** The owner picks. Guessing and
shipping cost us a full revert cycle once already.

**Stage 2 (only after he picks)** — build the chosen option, then walls/colour,
then the tile profile, then the site.

## 4. Free wins to fold in while you are there

Round 3 measured these at **zero bytes and zero draw calls**, and they outranked
every texture lever. Apply them to the options board so the owner sees the model
at its best:
- Golden-hour lighting rig + warm window glow.
- Camera: level verticals, fov ~30, polar clamp ≥55°.

Do not spend the session on them; they are one-liners on the site side.

## 5. Deferred — do not do these yet

Levers 3–9 from the round-3 ranking (baked GI lightmap, grass lawn, meshopt
pipeline, S-wave roof texture, hedge, plaster scan, entourage) all still stand,
but every one of them is **applied to a shape that is about to change.** Texturing
the wrong roof is wasted work. Re-plan them after Stage 2 lands.

Exception: the **checkerboard paver ground** now has photographic justification
and replaces the grass-lawn plan (lever 4) — the owner's houses sit on pavers,
not lawn. Note that in the log; build it in Stage 2.

## 6. Laws (unchanged, all bought with pain)

- Verify in the REAL three.js renderer, never the Blender viewport. Dragged angle
  included. Five-angle + close-in + mobile.
- Dump the exported per-material texCoord table — invisible in the viewport,
  has shipped broken three times.
- Never instance structural pieces; an instanced batch animates as one piece and
  destroys the one-by-one build.
- `img.pack()` after pixel edits. Re-orient imports to Z-up, bake scale, verify
  world bbox z-span.
- `| tail` eats exit codes — `cmd > /tmp/x 2>&1; echo $?`.
- Save the .blend before and after every experiment, with a named backup.
- After a PR merges, never push to that branch again. Fresh branch from
  `origin/main`; diff CONTENT before opening anything.
- MUST-NOT-REGRESS: 2.2 s build, ~16 pieces airborne, blueprint-blue until 55% of
  each piece's flight, real eaves, `extensionsRequired: none`, <1.5 MB shipped,
  ~330 draw-call ceiling. **The build animation is the one thing a photograph
  cannot do — it is the whole reason the 3D exists. Do not break it.**

## 7. Report back with

1. The roof options board + the side-by-side sheet against `DJI_0018`.
2. Sampled colour values (white wall, grey accent, roof, plinth) from the photos,
   as hex, with which file each came from.
3. Which video frames you kept and why.
4. The `docs/DECISIONS.md` entry recording that Look B timber cladding is
   reversed by owner instruction + photographic evidence.
5. Notes + skill updates.
6. **Stop there.** Do not build past the board.
