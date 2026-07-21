# TASK: roof to MATCH the dark cladding + rebuild the roof/porch/wing roof models.
# Plus the still-unfixed AO wiring (Job 0 — do it first, it has failed twice).

Paste into the Blender terminal. Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.
All laws apply (five angles + close roof pass + mobile drag + ray-scan).

## JOB 0 — THE AO WIRING. Failed twice. Fix it at source and PROVE it.
Your Look B report said this was fixed. The exported glb again said otherwise:
```
roof.occlusionTexture = {"index":17}    <-- no texCoord key -> defaults to UV0
```
Every other material exports `ao:1`; only `roof` does not. Main session has now
hand-patched the shipped file TWICE. Until the source is right, every export
reintroduces the owner's "strange circles".
- Compare the `roof` material's occlusion path node-for-node against a known-good
  one (`plaster`, `beige_wall_001`) and make them structurally identical (the
  occlusion texture almost certainly lacks a UVMap node pointing at the atlas UV,
  so the exporter assumes UV0).
- **Prove it from the EXPORTED file before declaring victory** — Blender's
  viewport cannot show this, which is why it slipped twice:
```
node -e "const fs=require('fs');const b=fs.readFileSync('X.glb');const j=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));console.log(j.materials.filter(m=>m.occlusionTexture&&(m.occlusionTexture.texCoord||0)!==1).map(m=>m.name))"
```
  Must print `[]`. Paste the full per-material texCoord table in your report.

## JOB 1 — ROOF COLOUR: match the dark cladding ("make it the same as the black wall")
Owner likes the new colour scheme but the roof clashes. Main session measured why:
| | baseColor | metallic |
|---|---|---|
| roof | 0.052, 0.060, **0.068** (BLUE highest = cool) | **0.20** |
| clad_dark / timber_dark | warm (RED highest) | **0** |
The roof is both cool-tinted AND metallic, so it mirrors the blue sky HDR and
renders blue-grey; the cladding is warm and dielectric so it stays black.

Fix both causes: retint the roof base to the cladding's WARM near-black family,
and cut the metallic sky-reflection. **Judgement call for you:** a real metal
roof keeps a little sheen — going fully matte may read as felt, not metal. Find
the point where it reads as the same dark family as the wall while still reading
as metal roofing. A/B it in three.js and show the pair. Apply the same to
`roof_sg` (snowguards) and check `roof_soffit`/`gutter` still sit in the family.

## JOB 2 — ROOF MODEL: "change the structure or model of the roof, make it better"
At close range the slopes read as long vertical standing-seam strips. Their real
job photos are **modular pantile** — stepped courses with a repeating module, not
long unbroken seams. Rebuild the read so it matches the product they actually
install:
- Give the courses genuine module rhythm (horizontal step + vertical rib) rather
  than continuous strips, via the normal/geometry balance you judge best.
- Ridge/hip caps: verify they read as proper rounded caps at close range.
- Keep the jerkinhead silhouette — the owner likes the shape. This is surface and
  detail, not form.

## JOB 3 — THE FRONT-DOOR ROOF and the WING ("square small building") ROOF
Owner: "same for the front door roof, and square small building roof."
- **Porch canopy**: currently a plain flat slab — it looks cheap next to the
  rebuilt house. Give it the same construction language as the main roof
  (module rhythm, real edge thickness, fascia + soffit underside, correct pitch)
  at porch scale.
- **Wing roof**: same colour + module treatment as the main roof so all three
  roofs read as one product.
- ⚠ **Stray geometry**: in the owner's close screenshot there is a small
  cone/spike sitting ON the porch canopy surface near the wall. Find it and
  remove it (or explain what it legitimately is).

## HARD constraints
- Nodes 307 now, ceiling ~330. Raw 1.34 MB vs 1.5 MB gate — module detail should
  be normal-map/faces-on-existing, not a pile of new nodes.
- Phase contract unchanged; report any new names + buckets.
- MUST NOT REGRESS: Look B cladding + greige walls (owner likes them), jerkinhead
  silhouette, eaves/fascia/soffit, windows/reveals, fence, trees, AO coverage,
  course-by-course build, snowguards instanced, watertight ray-scan.
- Export: usual flags + gpu_instances → house.glb. Backup
  `HomeRC_backup_roofmatch.blend`. Keep a raw copy. No dedup/webp.

## Report back
```
MODEL READY: public/models/house.glb (<size> raw)
```
- **Job 0 proof**: the per-material texCoord table from the exported glb.
- Roof colour A/B (before vs after) at the owner's close raised angle, plus what
  metallic/roughness you landed on and why.
- Roof module rebuild: close crop before/after.
- Porch + wing roof: before/after; what the stray cone was.
- Node/byte accounting; laws passed.
