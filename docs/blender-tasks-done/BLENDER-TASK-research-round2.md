# BLENDER-TASK — RESEARCH ROUND 2: unblock the budget, then the site

**Type: RESEARCH + PROOF-OF-CONCEPT. Still NO rebuild, still NO ship to main.**
Supersedes `BLENDER-TASK-research-surface-realism.md` (archive that one — it is
complete). Round 1's findings stand; this is the next layer down.

---

## 0. FIRST COMMAND, before you read anything else

`~/HomeRC.blend` was last saved at 15:21. The round-1 board work (stages A–D)
came after that and lives in Blender's memory ONLY. If Blender closes, stage D
is lost and the board becomes unreproducible.

**Save it now**: `HomeRC_backup_surfaceD.blend`, then save `HomeRC.blend` itself.
Confirm both mtimes in your report. Do not start research until this is done.

## 1. What round 1 established (do not re-derive)

- My "13 flat materials, AO-only" hypothesis was **wrong and is now dead**. The
  shipped glb has 24 materials, 13 images, 7 baseColor-textured materials, and
  roof normal+roughness maps. It came from the 2026-07-15 scene dump in
  `BLENDER-NOTES.md`, which is six sessions stale. **Fix that section of the
  notes** so nobody reads it again.
- Ranked fake-tells for OUR model, measured on the board:
  1. **Ground/context** — the flat mint lawn, a third of the frame at the drag angle.
  2. **Coating character** — S-wave profile, 15–20 mm step per 350 mm, metallic
     fleck in matte polyester (Wetterbest Clasic RAL 9005).
  3. **Weathering** — plinth damp band.
  4. Scale cues and camera measured fine. Not our problem. Leave them alone.
- Stages A→D built and shot. D is the biggest jump and busts the raw gate at
  512² scans (1670 KB), fits at 256².

## 2. The central question this round must answer

**We are choosing between "realistic" and "1.5 MB" — and that trade may be fake.**

C and D only bust the gate because textures ship as plain PNG/webp inside a
glTF with `extensionsRequired: none`. That constraint is self-imposed and is now
the single thing standing between us and 512²–1024² scans.

Research and **prove or kill**, with numbers:

1. **KTX2 / Basis Universal (`KHR_texture_basisu`).** GPU-compressed textures,
   typically 4–8× smaller than PNG *and* smaller in VRAM. three.js ships
   `KTX2Loader`. Questions: exact byte delta on OUR texture set
   (`gltf-transform uastc` / `etc1s` — try both, etc1s is much smaller, uastc is
   much better on normal maps); decoder/transcoder payload size added to the
   bundle; does it decode acceptably on a low-end phone; quality loss on the
   plaster scan and the roof normal map specifically.
2. **The `extensionsRequired: none` rule.** That rule exists because stock
   GLTFLoader must open the file unaided. KTX2 breaks it. Is that still worth
   defending, given we control the only loader that ever reads this file?
   Recommend a position.
3. **Meshopt.** `docs/blender-tasks-done/house.meshopt.glb` already exists (−38%,
   needs 2-line decoder wiring + `phaseOf` child-inheritance). Does it stack with
   KTX2? Combined budget?
4. **Texture anisotropy + mipmap filtering in three.js.** Nearly free, and our
   hero is a *grazing* angle across the roof — exactly where anisotropy 1 vs 8
   is most visible. Measure it. If it is a real win it may be the cheapest
   quality gain available anywhere on this project.

Deliverable: a **budget table** — for each combination (current / +anisotropy /
+meshopt / +KTX2-etc1s / +KTX2-uastc / all), the shipped bytes, the texture
resolution it buys, draw calls, and a pass/fail on a real mobile-profile render.
If KTX2 lands, D at 1024² may cost less than D at 256² does today. That reframes
everything.

## 3. Second research track: the site, not the house

Ground ranked #1 and round 1 only textured it. Go deeper:

- **Terrain**: the house currently sits on a flat disc. Research cheap real-time
  site grounding — a subtle graded pad, a gravel/paving apron at the entry, a
  driveway, planting beds, the junction where wall meets earth. What do archviz
  people do at 300 draw calls?
- **Vegetation**: the hedge is a flat green box and *will* become the worst
  offender once the lawn is real (round 1 flagged this). Research cheap
  real-time planting: cross-plane/billboard cards with alpha-test vs low-poly
  meshes — alpha-test has a real fill-rate and sort cost on mobile, so measure,
  don't assume. Same question for the existing tree.
- **Sky/backdrop**: we render against a flat page tone. Is that helping (clean,
  matches the site) or hurting (no horizon = no sense of place)? Test both.

## 4. Third track: verify against the owner's OWN houses, numerically

Round 1 matched *lighting* to a reference photo with a histogram. Do the same at
the **material** level, per region: sample the roof region, wall region, and
ground region from `docs/reference-match/research-2026-07-21/owner_*.jpg` and
from our render, and compare mean/std-dev/hue per region. A wall that is 15%
too saturated or a roof with a third of the photo's tonal spread is a defect you
can measure instead of argue about.

## 5. Questions for the owner — write these to `docs/QUESTIONS.md`

Do not decide these yourself. Recommended defaults in brackets.

- **Q-11 — Pick ONE house.** We have been modelling an average house. Ask the
  owner to point at a single photo from his own 110 and say "build that one."
  Photo-matching one real building beats approximating a genus. [Default: use
  the 041947 master already recovered in the research folder.]
- **Q-12 — Is the 3D hero still the right call?** He has 110 real photos of
  finished work. A real photograph of a real house cannot look fake. The 3D's
  unique value is the *build animation*, which a photo cannot do. Worth putting
  the option in front of him after a week. [Default: keep 3D, but consider
  demoting it below the fold and leading with a photo.]
- **Q-13 — Enable Sketchfab / Hyper3D / Hunyuan3D** in the BlenderMCP N-panel
  (may need a free API key) — would give ready-made planting and props instead
  of modelling them. [Default: enable, they are free tiers.]

## 6. Stop conditions and hygiene

- No rebuild, no new `house.glb` on main. PoC exports go to a scratch path.
- One task file at the repo root — archive round 1 to `docs/blender-tasks-done/`.
- **After a PR merges, never push to that branch again.** Cut fresh from
  `origin/main`, and diff CONTENT (`git diff origin/main <branch> --stat`) before
  opening anything — a squash merge makes every branch commit look missing.
- The laws still hold: verify in the REAL three.js renderer with a dragged angle,
  five-angle + close-in + mobile, dump the exported texCoord table, never
  instance structural pieces, `img.pack()` after pixel edits, `cmd > /tmp/x 2>&1;
  echo $?`. If your check constructs the input it tests for, it proves nothing.
- MUST-NOT-REGRESS: 2.2 s build, ~16 airborne, blueprint-blue to 55% of flight,
  jerkinhead roof, no truss, dark timber on gables + entry, real eaves,
  ~330 draw calls.

## 7. Report back with

1. Both saved .blend mtimes (§0).
2. The budget table (§2) and a straight recommendation on `extensionsRequired`.
3. Site/vegetation findings with measured mobile cost (§3).
4. The per-region numeric gap vs the owner's photos (§4).
5. Confirmation that Q-11/12/13 are in `docs/QUESTIONS.md`.
6. Notes + skill updates, including the correction to the stale scene dump.
