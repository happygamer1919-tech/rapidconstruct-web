# BLENDER-TASK — RESEARCH SPRINT: why it still looks fake, and what to steal

**Type: RESEARCH + OPTIONS-AS-RENDERS. Do NOT rebuild the house in this task.**
Deliverable is knowledge + a decision board, not a new house.glb.

Read first: `BLENDER-AGENT.md`, `BLENDER-NOTES.md`, the `blender-buildings` skill,
`HANDOFF-2026-07-21.md` §3/§4/§5, `docs/PHOTO-INVENTORY.md`.

---

## 0. Why this task exists (read it, it's the whole point)

The owner has spent a week on this model and his verdict is still "it looks
shitty". We keep answering that with **more geometry** — roof shape, eaves,
porch, reveals, snow guards. The geometry is now genuinely fine. The verdict has
not moved. So the geometry is not the problem.

Main-session diagnosis before you start (treat it as a hypothesis to confirm or
kill, not as truth):

- The three.js lighting rig is already good — ACES tone mapping, exposure 1.18,
  a warm key sun at [-6,8,5] i:3.2 with shadows, a cool fill, a back rim, an HDRI
  (`venice_sunset_1k`) at environmentIntensity 0.55, and ContactShadows. See
  `src/components/HouseBuildScene.tsx:470-552`. Lighting is not the gap.
- **Every material in the model is a flat base colour.** 13 materials, no albedo
  map, no roughness map, no normal map, no variation. Plaster is a solid greige
  fill. The roof is a solid near-black with metallic 0.06. Wood cladding has no
  grain. The only texture in the whole model is the baked AO atlas.
- A real house at hero distance is ~70% *surface* — plaster tooth, tile sheen
  breakup, weathering at the plinth, grain, colour drift between courses. Flat
  fills read as plastic under ANY lighting. That is the toy tell.

**So: this sprint researches surface, material authoring, and the last-10%
realism moves that archviz people use — and only then proposes what to build.**

Kill the hypothesis if the evidence says otherwise. If your research says the
real problem is proportions, or the camera lens, or the ground plane, say so
loudly. Being right beats confirming me.

---

## 1. Research (go wide, go deep, this is the point of the task)

Budget real effort here. Do not shortcut to building.

### 1a. Reference photos — get MANY, real ones
- Pull the owner's own project photos from `docs/PHOTO-INVENTORY.md` (74 live-site
  URLs + the 110-image stash). Download a working set locally. These are the
  houses the company ACTUALLY builds — the model should look like their work,
  not like a generic house.
- Then go wide on the web for houses of this archetype: Moldovan / Romanian /
  Eastern-European single-family houses, dark metal-tile roof, plastered walls.
  Search terms worth trying: `casă cu acoperiș din țiglă metalică`, `дом с
  металлочерепицей`, plus English `dark metal tile roof house exterior`.
- Collect at least **20 reference images**, saved to
  `docs/reference-match/research-2026-07-21/`, with a short `SOURCES.md` (URL +
  one line on what each one is good for). Cover: roof at close range, roof at
  distance, wall plaster close-up, eaves/soffit, plinth/ground junction,
  window reveal, entry/porch, and the whole house from a raised 3/4 (our hero
  angle).
- For roofs specifically: get the actual **profiles** — Monterrey/Modern/Kvinta
  metal-tile profiles are what's sold in MD/RO. Manufacturer sites have clean
  product photography and cross-section drawings. Note the real module size,
  the step height, the matte-vs-gloss polyester coating look.

### 1b. Technique research — the web, Reddit, forums
Per BLENDER-AGENT.md §2, Reddit IS fetchable:
`https://old.reddit.com/r/blender/search.json?q=<query>&restrict_sr=1&sort=top`.
Also r/archviz, r/blenderhelp, BlenderArtists, Polycount.

Questions to actually answer, with sources:
1. **"Why do my renders look fake / like plastic / like a toy?"** This is one of
   the most-answered questions in archviz. Collect the recurring answers and rank
   them by how much they'd move OUR case. (Expect: no texture variation, no
   imperfection/roughness breakup, perfectly sharp edges, no bevels, uniform
   colour, no grunge, wrong scale cues, no context.)
2. **Cheap texture realism that survives glTF at <1.5 MB.** Trim sheets, tiling
   atlases, a single shared 1K–2K PBR set across many materials, detail-normal
   tricks, vertex-colour breakup, roughness-map-only realism (a roughness map is
   often the single highest-value channel). What is the byte cost of each?
3. **Metal-tile roof material specifically.** How do people get the matte-coated,
   slightly-uneven, panel-seamed look? Normal map baked from a high-poly tile
   module vs. real geometry (we currently have real geometry). What does a real
   coated steel tile do to specular at grazing angles?
4. **Plaster / decorative render walls.** Tooth, subtle large-scale colour drift,
   the darker damp band at the plinth. What's the minimum map set?
5. **Scale cues and context.** What makes a house read as house-sized rather than
   dollhouse-sized: gutter diameter, window mullion thickness, brick/tile module,
   door height, a person-height object, ground texture frequency.
6. **The last-10% list for real-time (three.js), not offline.** What of the above
   is affordable when the budget is ~330 draw calls and 1.5 MB.

### 1c. Assets — you have superpowers, use them
- **PolyHaven is enabled.** `search_polyhaven_assets` / `download_polyhaven_asset`.
  Pull candidate plaster, concrete, roof-metal, wood-cladding, grass/gravel
  textures and HDRIs. GOTCHA already in the notes: the addon's `set_texture` is
  broken on Blender 5.2 — download, assign the material, then
  `bpy.ops.uv.cube_project` manually.
- Sketchfab / Hyper3D-Rodin / Hunyuan3D are **OFF** in the BlenderMCP N-panel.
  If you want them, put the ask in `docs/QUESTIONS.md` with what you'd use them
  for — the owner can tick the box (may need a free API key).
- Check whether any Blender add-ons genuinely help here and are installable
  offline. Do NOT install anything that needs a paid licence or an account
  without asking the owner first — write it to QUESTIONS.md instead.

### 1d. Save what you learn — this is not optional
Everything verified goes into `BLENDER-NOTES.md` (title, source link, exact bpy
steps). Anything proven and reusable gets promoted into the `blender-buildings`
skill via `skill-creator`. **Only verified-in-Blender facts.** We have been
burned by unchecked theory (AgX tone-mapping "improvement" that measured 24%
worse). If you did not run it and look at it, it is a 🔬claim, not a ✅fact.

---

## 2. Deliverable: an OPTIONS BOARD, not a rebuild

Per the working model (HANDOFF §3.2) that has saved us twice: **the owner picks
from pictures, then we build.**

Produce **3–4 material/surface directions** applied to the EXISTING house — do
not change the silhouette, the roof shape, or the build animation. Same model,
different skin. For each direction render the identical five angles used in
every previous board (front, front-left raised, front-right raised, rear raised,
rear 3/4 raised) **plus one close-in** on the roof+eaves+wall junction, since
that's where the owner's phone-dragging finds defects.

Suggested directions (adjust after research):
- **A — Roughness-only.** Zero new textures; a roughness/variation map per major
  material, plus edge bevels. The cheapest possible fix. Establishes the floor.
- **B — Shared PBR trim set.** One 2K albedo+roughness+normal atlas shared across
  plaster, roof, wood, plinth. The realistic mid.
- **C — Full surface pass.** Per-material PBR from PolyHaven, weathering at the
  plinth, colour drift, dirt in the eave shadow. The ceiling.
- **D — whatever your research says we're actually missing.** If the answer is
  proportions or context, show that instead.

For each direction report the **honest cost**: file size delta, draw calls,
texture memory, and whether it survives the `gltf-transform dedup → webp`
pipeline.

Put the board in `docs/blender-tasks-done/surface-research/` and also produce one
**side-by-side sheet** (current vs A vs B vs C at the hero angle) — that single
image is what the owner will actually judge from.

---

## 3. Verification (the laws — do not skip, they were all bought with pain)

- **Verify in the REAL renderer.** Blender's viewport lies. `npm run dev`
  (port 3800), headless Playwright screenshot, arm the 3D with a mouse move, wait
  ~12s for the build, screenshot — **including a dragged angle**. The agent's
  report is a claim; the browser render is the proof.
- **Five-angle + close-in + mobile-drag + ray-scan** before any export.
- **Exported-JSON law.** occlusion/texCoord wiring is invisible in the viewport.
  Dump the per-material texCoord table from the exported glb. This bug has
  shipped three times.
- **Verification law.** If your check constructs the input it tests for, it
  proves nothing.
- **Never instance structural pieces** — an instanced batch animates as one
  piece and would destroy the one-by-one build the owner values most.
- `img.pack()` after any pixel edit. UVs + ao vertex-colour on any textured mesh.
- `| tail` eats exit codes — use `cmd > /tmp/x 2>&1; echo $?`.
- MUST-NOT-REGRESS: 2.2s build, ~16 pieces airborne, blueprint-blue until 55% of
  flight, jerkinhead roof, no truss, dark timber cladding on gables + entry,
  real eaves, `extensionsRequired: none`, <1.5 MB shipped, ~330 draw-call ceiling.

## 4. Git hygiene — the trap that has bitten TWICE
After a PR merges, **NEVER push to that branch again.** Cut a fresh branch from
`origin/main`. Before opening any PR, diff CONTENT against main
(`git diff origin/main <branch> --stat`) — a squash merge makes every branch
commit look "missing" even when its content is already on main, and a stale
branch nearly reverted the factory's SEO work.

## 5. Stop conditions
- Do not rebuild the house in this task.
- Do not ship a new `house.glb` to main.
- If a product decision is needed (spend money, enable a paid service, change
  something the owner approved), write it to `docs/QUESTIONS.md` with a
  recommended default and keep moving. Never idle, never guess.

## 6. When you're done, report back with
1. The ranked answer to "why does it still look fake" — with sources, and say
   plainly if you killed my hypothesis.
2. The options board + the one side-by-side sheet for the owner.
3. What you added to `BLENDER-NOTES.md` and to the `blender-buildings` skill.
4. Your recommended next build task, in one paragraph, with the cost.
