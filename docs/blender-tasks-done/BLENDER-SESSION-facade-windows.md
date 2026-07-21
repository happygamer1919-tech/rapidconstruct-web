# SESSION (2–3h): research skills → pick reference → rebuild facade + windows,
# and fix the paper-white quoins

Paste this whole file into the Blender terminal.
Read `BLENDER-AGENT.md` + `BLENDER-NOTES.md` first — including the multi-angle
law and the two hard rules from the roof cleanup (img.pack(); UVs+ao-vcol on any
textured mesh). They apply to everything below.

## The owner's brief, verbatim
> "rebuild the model for the building and windows … research 2-3 hours for
> skills and pick maybe a reference … do something about the white bricks, they
> look too white and unrealistic, again take a reference associating the roof"

"White bricks" = the **quoins** (corner blocks + window surrounds). He is right:
`trim_white` is flat RGB [0.88, 0.86, 0.82] — pure paper-white, no texture, no
roughness variation, no shadowing between blocks. Against the near-black roof
and warm tan plaster they read as stickers, not stone.

## Timebox: ~2–3 hours total
- Phase 1 RESEARCH: ~90–120 min. No touching HomeRC.blend. Scratch only.
- Phase 2 APPLY: ~60 min + the five-angle verification.
Track your time and say in the report roughly where it went.

---

## PHASE 1 — RESEARCH (scratch collections only)

### 1a. The reference (~20 min) — pick it and commit to it
Default: `photo_2026-01-15_041947` (already in `docs/reference-match/`) — it has
EXACTLY what we need: warm cream rusticated quoins + white window architraves
that WORK against a dark roof, and real window frames with correct proportions.
Scan the other Tilda CDN job photos (`docs/PHOTO-INVENTORY.md`) for a better
facade close-up if one exists — a shot where quoin texture and window detail are
readable. Whatever you pick: **sample the actual pixel colours** (sunlit quoin,
shaded quoin, window frame, architrave) via bpy like last time, and write the
sRGB values into the report. "Associating the roof" is the owner's key phrase —
the trim tones must harmonise with the anthracite roof + warm tan plaster, NOT
fight them with pure white.

### 1b. Quoin/stone realism skills (~30 min)
Research + PROVE in scratch (screenshot each, ✅/❌/⚠️ verdicts, promote to the
skill):
- Rusticated quoin treatment: per-block bevel/chamfer + slight per-block colour
  variation (vertex colour or tiny noise texture) + visible mortar gap/shadow
  line between blocks. This is what makes quoins read as STONE.
- BlenderKit/ambientCG/Poly Haven: limestone / cast-stone / travertine scans —
  one small texture for all trim (atlas-friendly, 512² budget).
- The bake pipeline you already proved (high→low) for block edge wear if cheap.

### 1c. Window construction skills (~40 min)
Windows are 31 nodes (`w#_f/g/mun/trim` + sills) and read "toy". Research what
real window geometry needs at hero+drag distance, prove in scratch:
- Frame PROFILE (not a flat box): outer frame + sash step, ~2 bevels.
- Reveal depth and a proper sill with overhang + drip edge.
- Muntin proportions from the reference (ours may be too thick/thin).
- Glass: keep the site's runtime override in mind — the site REPLACES `w#_g`
  material (emissive warm glass). Do not fight it; shape/depth is your job,
  glass material is site-side.
- Instancing candidates: muntin bars and sills repeat — linked duplicates + one
  Empty per batch IF a group-appearance is acceptable; windows themselves are
  P3 pieces that pop individually, so frames stay individual.
### 1d. Facade/plaster upgrades (~20 min)
The 155 wall segments carry the plaster material. Research: subtle large-scale
tonal variation (a second low-frequency noise layered on the plaster), stains
under sills, base-course transition. Cheap wins only — the walls mostly work.

### Phase 1 report (before touching the house)
Post: chosen reference + sampled colours; the quoin recipe you will apply (with
scratch screenshot); the window profile plan (with scratch screenshot); what you
proved vs killed; time spent. THEN continue to Phase 2 in the same session.

---

## PHASE 2 — APPLY to the house

Priority order (stop cleanly at the timebox — a finished subset beats a broken
everything):
1. **QUOINS + window surrounds** (the owner's named complaint): reference-
   sampled warm stone tone, per-block variation, mortar shadow lines, bevels.
   Apply to the 5 quoin stacks AND the window architraves (`w#_trim`) — same
   family, same treatment.
2. **Windows**: profiled frames, correct muntins, real sills. Keep every node
   name (`w#_f`, `w#_g`, `w#_mun`, `w#_trim`, `sill*`) — the phase contract and
   the site's glass override depend on them. If you instance muntins/sills,
   name the Empties `w_muntins`/`w_sills`… wait — those would fall to P1 walls.
   Use a `sill_batch`/`handle`-free scheme ONLY if it buckets P3
   (`^(w\d+_|sill|door|handle)`) — an Empty named `sill_batch` matches `^sill`
   → P3. For muntins: `w0_muntins` matches `^w\d+_` → P3. Use those.
3. **Facade**: the subtle plaster variation layer if time remains.
4. Do NOT touch: roof, truss, eaves, porch shape, garden, snow guards.

## HARD constraints
- **Wall segmentation is sacred**: the 155 `main/wing/entry_c##_*` pieces ARE
  the build animation. Rebuild window/quoin geometry, not the wall courses. If a
  wall segment must change shape around a new reveal, keep its exact name.
- Node budget: 314 now, ceiling ~330 individual. Windows must not balloon —
  use instanced batches (1 node each) or joined-per-window geometry.
- Phase contract as always; new trim/quoin pieces: quoins fall to P1 (walls) via
  fallback — correct. Window parts must match P3 patterns above.
- Export: GLB, use_selection, apply, Y-up, gpu_instances → house.glb. Backup:
  `HomeRC_backup_facade.blend`. No dedup (ship-time).
- **Five-angle law** before reporting done. Judge in three.js, not viewport.
- img.pack() after any pixel edit; UVs + ao vcol on every textured mesh.

## Report back
```
MODEL READY: public/models/house.glb (<size>)   [+ Phase 1 report earlier]
```
- Quoins: before/after crop at hero distance + sampled colour values used.
- Windows: before/after crop (front window close, from the drag envelope).
- The five angle shots, clean.
- Node/byte accounting; every name kept/added + phase bucket.
- What was proved into the skill; what you deferred at the timebox.
