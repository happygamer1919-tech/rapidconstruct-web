# Round 3 live log — 2026-07-21 (started 19:35)
Plan: A(35-40m, priority) → F(20m) → B(20m) → D(15m) → E(20m) → C(15m) → ranked list.
Blend state at start: HomeRC.blend = stage-D surface experiments, saved 19:16:19.

## TRACK A — Baked lighting (~30 min) ✅ PoC PROVEN end-to-end
- Cycles DIFFUSE(direct+indirect) baked for 288 objects into the EXISTING atlas UV channel
  (no new UV set needed!) with a site-matched rig: 106 s CPU @48 samples, 1024².
- **Bytes: 53 KB webp @1024, 28 KB @512.** Trivially affordable under round-2 findings.
- three.js application proven headless: material.lightMap + channel=1 (uv1 exists in the glb
  already), ~6 lines site-side. Three modes shot (lmAB_*.png): rt / rt+lm (subtle GI fill in
  eaves, warm bounce — real improvement) / **lm-only (NO sun, NO shadow pass) — presentable!**
- Integration path CONFIRMED in code: `rested` flag already flips frameloop + shadow-autoUpdate
  (HouseBuildScene.tsx:456-518). Recommendation: realtime during the 2.2 s build → on rested,
  crossfade lightMapIntensity 0→1.1 and drop castShadow (≈ −165 draws at rest). Build-time
  wrongness: none — lightmap only fades in at settle.
- To make lm the hero look: rebake with harder sun (lower angle, 128 samples, no blur) for crisp
  baked shadows. 🔬claim: would beat the realtime rig visually at zero runtime cost.
- Observation: per-course wall tint stripes band noticeably under flat exposure — retune vcol
  tint range when the surface build happens.
- Blend saved before AND after. Bake nodes cleaned out of materials.

## TRACK F — Realism scoring harness (~15 min) ✅ BUILT + BASELINED
- `scripts/realism-score.mjs` (pngjs + sips): per-region mean/std/hue/sat vs a reference photo,
  0-100 score per region + TOTAL. Run: `node scripts/realism-score.mjs render.png photo.jpg`.
- BASELINE vs owner_01 (041947), hero-angle board shots:
  cur 50 · A 50 · B 50 · C 50 · **D 52** (roof 73 / wall 39 / ground 37→45 with D).
- FINDINGS the numbers already prove: (1) ground is the worst region and ONLY D moves it;
  (2) A-C surface work barely registers at hero distance+overlay — consistent with the owner's
  "still shitty" after surface passes; (3) roof tonal spread is 54 vs photo's 68 (too flat),
  wall is worst on spread (render ~flat vs photo texture).
- v1 CAVEATS (honest): regions are hand-placed fractions; the hero shot includes the page
  overlay wash on part of the wall region; refine with close-in shots when wiring into CI.

## TRACK B — Teardowns (~20 min) ✅ 3 sites captured (network-level, measured)
| site | 3D payload | lighting approach | notes |
|---|---|---|---|
| lusion.co | ~6.6 MB textures (5 MB webp, 450 KB PER normal map, 589 KB EXR matcap) | matcap/baked-style | ships 4-6× our whole budget in textures alone |
| bruno-simon.com | 973 KB glbs (draco+basis) + 794 KB wasm decoders | **fully baked lightmaps, no realtime lights** | the canonical "web 3D that looks great"; pays the wasm tax we refused |
| coastalworld.com | ~6.5 MB mostly 2D images | n/a (custom) | not a glTF pipeline |
- CONVERGENT FINDING: the sites that read as "real" either ship several-MB texture budgets or
  BAKE THE LIGHTING and compress hard. None do 300-node realtime-lit at 1 MB. This triangulates
  Track A (baked lighting) as the class-defining move, and round-2's verdict that our gate is
  about *how* we spend bytes, not the ceiling itself.

## TRACK D — Camera & composition (~15 min) ✅ MEASURED, one-line fixes found
- Hero camera looks DOWN 7.8° (target y 0.3 vs cam y 1.35) → converging verticals — the classic
  render tell. A/B shot (cam_tilted vs cam_level.png): level camera + fov 28 (≈35-50mm equiv)
  reads like an architectural photo. Today's fov 40 vertical ≈ 24mm-equiv horizontal = wide-angle
  dollhouse pressure.
- Fixes are SITE-side one-liners: target.y = camera.y (keep verticals parallel; reframe with
  position, not tilt) + fov 40→~30 + pull back. Mobile layout needs its own check (13.5 dist).
- Drag clamp allows 54° elevation (min polar 36°) — no photographer's angle; recommend min polar
  ~55° (35° elevation max). Free, removes the ugliest angle class the owner keeps finding.
- Round-1's "camera measured fine" was self-referential (verification law) — it was NOT fine.

## TRACK E — Entourage & time of day (~15 min) ✅ MEASURED — the zero-byte jackpot
- 3 rigs shot on the real model (tod_midday/golden/dusk.png): **golden hour (low warm sun
  ~15° elevation, 0xffb066) + warm window glow = transformative.** Facade gets modelled by
  raking light, lit windows read "inhabited" — exactly the reference-reel look the owner chose.
  Dusk (stronger glow, cool ambient) also strong and does NOT clash with the cream page (tested,
  not assumed). Midday (today's rig) is the flattest of the three.
- Window glow = extend the site's EXISTING w#_g runtime override with a warm color — trivial.
- Entourage cost estimates (researched, unbuilt): car 2-6k tris +1 draw; patio set ~1k; figure
  ~500 (uncanny risk — recommend NO); all P4-nameable. Ranked below glow/time-of-day.
- Combined with Track A: bake the lightmap AT golden hour → the baked look IS the money look.

## TRACK C — Post-processing (~15 min) ✅ code-audited, one measured A/B
- AA: site already runs MSAA (antialias:true) with dpr [1,1.5]. The dpr cap softens 3x phones —
  a perf trade, leave unless the owner complains about softness specifically.
- **Anisotropy 1 vs 8: measured (aniso_1/8.png) — INDISTINGUISHABLE at hero framings.** Round-2's
  "cheapest quality gain" hypothesis REFUTED for our camera distances. Set it anyway (free), but
  it is NOT a lever. Honesty > confirmation.
- LUT colour-grade: 🔬 one 32³ texture + one pass (~1 ms desktop, ~2-3 ms low mobile via pmndrs
  postprocessing). PARKED — golden-hour rig (Track E) likely makes it redundant; revisit after.
- Bloom / quarter-res SSAO: ⚠ mobile fill-rate cost; only worth testing with the dusk look;
  parked with LUT. Nothing here beats Tracks A/E per unit cost.

## SPRINT WRAP (~2h05 total)
All six tracks closed: A 30m · F 15m · B 20m · D 15m · E 15m · C 15m + wrap 15m.
Blend saved before/after every experiment (19:16, 19:41 bake, final save at wrap).
No rebuild, no ship: PRISTINE house.glb untouched on main; all PoCs in scratchpad.
