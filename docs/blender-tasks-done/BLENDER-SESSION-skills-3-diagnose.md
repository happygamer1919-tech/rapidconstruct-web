# SESSION: learn MORE skills — aimed at the owner's three live complaints.
# Diagnosis + research. Only one narrow fix-export allowed (Job 0, if model-side).

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first.

## The owner's verdict on the last ship (with a drag screenshot)
> "better but the motion is laggy, the fence and trees are down, and still looks
> plastic, continue with a prompt for learning MORE skills"

Three complaints, three jobs. This is mostly a RESEARCH/DIAGNOSIS session —
the skills bar applies everywhere: run it, screenshot it, verdict it, promote it.
Claims about the site get sent as TESTABLE statements; main session measures them.

---

## JOB 0 — THE FALLEN SCENERY (diagnose first, fix ONLY what you prove)

Evidence: in the owner's post-build drag screenshot, several fence sections and
bushes lie FLAT on the ground while others stand. Your own five-angle shots had
them upright. So it is state- or angle-dependent — not a simple misplacement.

Test these hypotheses IN ORDER, with proof for each verdict:

**H1 — the site's tumble animation vs imported rotations (main session's prime
suspect, and it would be SITE-side).** `HouseBuildScene.tsx` animates every
non-wall piece during the build with:
```js
p.mesh.rotation.set(p.r0[0] + t, p.r0[1], p.r0[2] + t)  // r0 = Euler captured at load
```
It captures each node's rotation as an XYZ EULER at load and later re-writes it.
Sketchfab/GN-harvested nodes carry QUATERNION rotations from import (often a
−90° X bake). If the Euler decomposition round-trip is lossy for those nodes —
or `rotation.order` differs — pieces settle WRONG. Test it headless in a tiny
three.js scene: load the shipped glb, apply exactly that capture-and-rewrite
pattern to the fence batch + a bush node, compare quaternions before/after.
If they diverge: the fix is site-side (quaternion capture/restore) — report it
as a claim with your repro script path; do NOT try to fix the site yourself.

**H2 — unapplied transforms on the imported assets (model-side).** In Blender,
check the scenery objects (fence unit, bushes, tree): do they carry object-level
rotations (not identity)? If yes, that is fragile REGARDLESS of H1 — apply all
transforms (Ctrl-A rotation+scale; for the instanced batch: apply on the unit
mesh, re-harvest matrices) so every scenery node exports with identity rotation
and the site's Euler round-trip has nothing to mangle. **This narrow fix-export
is allowed IF H2 is confirmed** — nothing else changes in the file.

**H3 — per-instance rotation Y-up conversion on EXT_mesh_gpu_instancing.**
Inspect the fence batch's instance ROTATION accessor in the glb: are the
quaternions Y-up-converted like node transforms, or raw Blender Z-up? Compare
one instance's quaternion against its authored Blender matrix. If the exporter
leaves them Z-up, that is a Blender exporter bug we must work around (bake the
−90° into the unit mesh). Verdict + numbers.

**New law once root-caused** (write it into BLENDER-NOTES): every imported or
scattered asset gets transforms APPLIED before export — identity rotation on
every node the site animates.

## JOB 1 — THE LAG (learn performance profiling; deliver numbers, not vibes)

"The motion is laggy" = during the 2.2s build. Learn to profile the REAL site
build headless and produce a ranked cost table:
- Chrome DevTools tracing / `renderer.info` per-frame during the build: draw
  calls, triangles, texture uploads, shadow-map cost. (drei/r3f expose
  `gl.info`; a 200-frame capture with per-frame ms is the deliverable.)
- Identify the top 2 costs. Candidates to test A/B, each with numbers:
  shadow-map 1024→512 during build; `castShadow` off for tiny pieces (muntins,
  snow guards, fence); texture upload jank from the 9 images decoding mid-build
  (test `KHR_materials_variants`? no — simpler: preload textures before build
  start — that is site-side, claim it); the meshopt variant you already proved
  (produce `house.meshopt.glb` + the 2-line wiring note + your measured node
  rename caveats, so main session can A/B it for real).
- Deliver: the cost table, ranked fixes labeled MODEL-side vs SITE-side.

## JOB 2 — "STILL LOOKS PLASTIC" (research round 3 — surfaces, not shapes)

The pattern from every previous round: the fix is surface response, never
geometry. What remains unexplored, in likely-impact order — prove each in a
scratch A/B against the reference photo (`photo_2026-01-15_041947`):
1. **Roughness map QUALITY on the big surfaces** — our plaster/roof roughness
   is smooth procedural noise; real surfaces have structured variation
   (trowel arcs on plaster, panel-to-panel tile variance). BlenderKit scans
   (owner has been told to open the N-panel — check if the client now works;
   if not, ambientCG direct download works headless).
2. **Normal map strength at hero distance** — A/B 0.35 vs 0.6 vs 0.9 on walls.
3. **Sheen/fresnel on plaster** — glTF supports KHR_materials_sheen; does
   three 0.185 stock loader render it? Prove loadability FIRST, then judge.
4. **Sun/environment tuning** — env rotation for raking light across the
   facade (site-side claim with numbers if it wins).
5. Free hunt: anything new for photoreal PBR at web budgets.
Only apply to the house what a scratch A/B clearly wins — and if you apply
anything, it rides ONLY with the H2 fix-export, nothing else.

## HARD constraints
- Job 0 fix-export: allowed only for confirmed H2 (+ any Job 2 clear winners),
  backup `HomeRC_backup_scenery_fix.blend`, full stricter-law verification
  (five angles + close-in roof pass + mobile drag + ray-scan).
- Otherwise: scratch only, no export, house untouched (report mtimes).
- Node/byte budgets unchanged (313 nodes, raw < 1.5 MB — remember ship applies
  dedup+webp). Keep a copy of any raw export.
- MUST NOT REGRESS list unchanged.

## Report back
```
SKILLS+DIAGNOSIS COMPLETE  [+ MODEL READY only if H2/Job2 exported]
```
- Job 0: H1/H2/H3 verdicts with proof; what was fixed vs what is a site-side
  claim (with repro script paths).
- Job 1: the per-frame cost table, top-2 costs, ranked fixes MODEL vs SITE.
- Job 2: A/B renders, winners applied (if any), losers with reasons.
- Skills promoted (section names) · time per job · anything deferred.
