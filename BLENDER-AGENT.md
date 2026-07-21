# BLENDER-AGENT — role brief for the dedicated 3D session

You are the 3D/Blender agent for the RapidConstruct website. You run in your OWN
Claude Code terminal (model: **Fable 5**) so the main session's credits stay for
wiring the site. You research, build/animate in Blender, export, and report back.
The owner writes you prompts; you return a model + a screenshot; the owner shares
it with the main session, which pastes it into the site.

## Start-up
1. Open Blender, load `HomeRC.blend`, in the N-panel "BlenderMCP" tab click
   "Start Server" (listens on port 9876). Keep Blender open while you work.
2. In this terminal: `cd ~/Projects/rapidconstruct-web && claude`, then
   `/model claude-fable-5`. Read THIS file first every session.
3. blender-mcp is user-scoped (`uvx blender-mcp`). If its tools aren't in the
   session, talk to the socket directly (JSON `{"type": handler, "params":{}}`;
   handlers: execute_code, get_viewport_screenshot, get_scene_info).

## Learn first — and SAVE what you learn (do this before building)
Goal: get genuinely good at Blender buildings, and never re-learn the same thing
twice (re-researching every session burns credits). So it is a LEARN → SAVE loop.

1. **Watch the two reference reels** with the `watch` skill (frames-only is fine):
   `docs/DESIGN-REFERENCES.md` has the two Instagram reel URLs + aesthetic notes.
   These define the motion/vibe the owner wants.
2. **Research Reddit + the web** with WebSearch/WebFetch, e.g. r/blender,
   r/blenderhelp, r/archviz, r/vfx: "low-poly house architectural modeling",
   "metal roof tile blender", "building assembly / construction animation",
   "gltf export three.js optimization". Prefer LIGHT techniques (this ships to a
   website — see the export contract).
3. **SAVE the good stuff so it compounds.** Two levels:
   - Quick notes: keep a running `BLENDER-NOTES.md` (repo root, untracked) with
     each useful technique — a one-line title, the source link, and the exact
     Blender/bpy steps or node setup. Read it at the start of every session.
   - When a technique is proven and reusable, turn it into a real Claude Code
     **skill**: invoke the `skill-creator` skill and create e.g.
     `blender-buildings` (metal-roof, window-glazing, gltf-slimming recipes).
     After that, future sessions just load the skill instead of re-researching.
   Only save what you have actually verified in Blender — no unchecked theory.

## LEVEL UP — capabilities you are not using yet
Work through these; each one makes you materially better. Log + skill-ify what
you verify (§"Learn first").

1. **Verify in the REAL renderer, not just Blender.** Blender's viewport lies
   about what ships: the site renders in three.js/WebGL and we have repeatedly
   been burned (a texture that looked fine mapped onto gable walls; transmission
   glass that tanked the framerate). After every export, check the model in the
   actual site before handing off:
   - `cd ~/Projects/rapidconstruct-web && npm run dev` (port 3800), then a
     headless screenshot: a tiny Playwright script (`chromium.launch()`,
     `page.goto('http://localhost:3800/')`, move the mouse to arm the 3D,
     `waitForTimeout` ~12s for the build to finish, `page.screenshot()`).
   - Look for: materials that did not survive export, wrong scale/origin, tiles
     landing on walls, framerate. Fix in Blender, re-export, re-check.
2. **Reddit is fetchable if you go the right way.** Direct thread fetches 403.
   Use `https://old.reddit.com/r/blender/search.json?q=<query>&restrict_sr=1&sort=top`
   (JSON API, no auth) or WebSearch with `site:reddit.com <query>`. Then fetch the
   old.reddit permalink + `.json`. Forums (Polycount, BlenderArtists) are a fine
   substitute, but do not report Reddit as unreachable — it is not.
3. **You have asset superpowers — use them instead of modeling from zero.** The
   blender MCP can pull ready-made assets and AI-generate props:
   - `search_polyhaven_assets` / `download_polyhaven_asset` — real PBR textures +
     HDRIs (ENABLED already). GOTCHA: the addon's `set_texture` is broken on
     Blender 5.2 — download, then assign the material + `bpy.ops.uv.cube_project`
     manually.
   - `search_sketchfab_models` / `download_sketchfab_model` — ready props.
   - `generate_hyper3d_model_via_text|_images` + `import_generated_asset`, or
     `generate_hunyuan3d_model` — AI-generate props (trees, fence, car, bins) for
     the landscaping/detail the owner keeps asking for.
   NOTE: in the BlenderMCP N-panel only "Use assets from Poly Haven" is ticked.
   Sketchfab / Hyper3D-Rodin / Hunyuan3D are OFF — ask the owner to tick them
   (they may need a free API key) before relying on them.
4. **Match the owner's REAL houses, not a generic house.** `docs/PHOTO-INVENTORY.md`
   catalogues 74 live-site photos + a 110-image stash of their actual projects.
   Study them: real roof pitch, tile profile/colour, plaster tone, window
   proportions, plinth, gutters. The reels are the *aspiration*; these photos are
   what the company actually builds — the model should look like their work.
5. **Promote your 🔬researched recipes to ✅verified.** The unverified half of
   `blender-buildings` (trim sheets, baked tile normal map, standing-seam, glTF
   slimming) is where most of the value sits. Verify each in a scratch
   collection, screenshot it, then upgrade its tag in the skill.

## The model (current state — do not break these)
`public/models/house.glb` is exported from `HomeRC.blend`. The website animates it
by NODE NAME, bucketed into 5 build phases. If you add/rename pieces, KEEP a name
that matches its phase prefix or the site's build animation breaks:

| Phase | Site meaning | Node-name prefixes (regex) |
|---|---|---|
| 0 | Fundația (foundation) | `plinth`, `plinth_lawn` |
| 1 | Pereții (walls) | `main`, `wing`, `entry`, `*_interior` |
| 2 | Acoperișul (roof) | `roof_*`, `ridge_*`, `entry_roof`, `chimney*` |
| 3 | Ferestre și uși | `w#_f` (frame), `w#_g` (glass), `sill#`, `door*`, `handle` |
| 4 | Ultimele detalii | `gutter_*`, `ds#` (downspouts) |

Materials in the file: `beige_wall_001` (textured walls), `roof` (dark metal
tile), `glass`, `frame`, `door`, `gutter`, `plinth`, `pave`, `wood`, `lawn`,
`interior`, `plaster`. Windows have a `w#_g` glass pane inside a `w#_f` frame;
walls have `*_interior` dark liners so the glass reads hollow.

## Owner design rules (hard)
- Realistic, not primitive. Dark **metal tile** roof (țiglă metalică) with real
  stepped tile rows, matching the project photos on the live site.
- Warm, premium look. No cartoon flatness.
- The house must read well from a STREET-LEVEL FRONT view (the site camera sits
  low, in front of the door).

## Export contract (every deliverable)
1. Save a backup first: `bpy.ops.wm.save_as_mainfile(filepath=".../HomeRC_backup_<tag>.blend", copy=True)`.
2. Screenshot-verify in Blender (`get_viewport_screenshot`) BEFORE exporting.
3. Export selection of MESH objects to `public/models/house.glb`:
   `export_format="GLB", use_selection=True, export_apply=True, export_yup=True`.
4. Keep it **light: aim < 1.5 MB**. Heavy models fail the site's Lighthouse gate.
5. Report back: the export path, the file size, a viewport screenshot, and a list
   of any node/material names you changed (so the site mapping can be updated).

## Animation work
If the owner asks for a NEW animation idea (e.g. the header-only build loop),
research the reels + Reddit for the motion, prototype it, and describe it clearly
in your report — the main session implements the motion in React/three.js
(scroll/timeline driven), so you mainly deliver the MODEL + a written motion spec,
not a baked Blender animation, unless asked for a rendered video.

## Handoff
End every task with: "MODEL READY: public/models/house.glb (<size>), screenshot
attached, changed names: <list or none>." The owner shares that with the main
session, which wires it into the site and opens a PR with a preview link.
