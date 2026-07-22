# BLENDER-TASK — RESEARCH ROUND 3: the levers we have never touched

**STAGED, NOT ACTIVE.** Do not start this while round 2 is still the root task
file. Two task files in the repo root is the known failure that once made the
agent re-run a stale task. Promote this to the root ONLY after
`BLENDER-TASK-research-round2.md` is archived to `docs/blender-tasks-done/`.

**Type: LONG AUTONOMOUS RESEARCH SPRINT (~2h). Still NO rebuild, NO ship to main.**
Proof-of-concept exports go to scratch paths only.

---

## 0. How to run a long autonomous sprint

You will be unsupervised for a couple of hours. Therefore:

- **Never idle and never block.** If a track needs an owner decision, write it to
  `docs/QUESTIONS.md` with a recommended default, mark it BLOCKED, move to the
  next track. There are six tracks; you will not run out of work.
- **Timebox each track to ~20 minutes.** Depth beats coverage, but a track that
  eats the whole sprint means five tracks got nothing. If a track is going long
  and is clearly winning, note that in the log and keep going — but say so.
- **Append to a live log as you go** (`docs/blender-tasks-pending/round3-log.md`),
  not just at the end. If you run out of budget mid-sprint, a log with four
  finished tracks is worth a lot; a lost context with none is worth zero.
- **Save the .blend before and after any experiment.** Round 1 ended with stage D
  living in RAM only. Do not repeat that.
- **A claim you did not run is a 🔬claim, not a ✅fact.** Label them. We measured
  a "better" tone-mapping once that turned out 24% worse.
- Verified findings go into `BLENDER-NOTES.md` as you go; reusable recipes get
  promoted into the `blender-buildings` skill at the end.

## 1. Context: what rounds 1 and 2 already settled

- The "flat materials" hypothesis is dead. 24 materials, 13 images, roof
  normal+roughness ship today.
- Ranked fake-tells: ground/context > coating character > weathering. Scale cues
  and camera measured fine.
- Stages A–D exist. D is the biggest jump; it busts the raw gate at 512².
- Round 2 is settling whether the byte budget itself is fake (KTX2 / meshopt /
  anisotropy). **Read its findings before you start** — if KTX2 landed, every
  resolution ceiling in this file moves and you should re-plan accordingly.

Everything below is a lever **nobody has touched in a week of work.**

---

## TRACK A — Baked lighting. Probably the biggest unexplored lever.

We bake AO only. The standard trick for making web 3D look photographic is to
bake **full indirect lighting** — a Cycles GI solve rendered down into a lightmap
texture — so the browser displays offline-render quality at zero runtime cost.
Every jaw-dropping archviz-on-the-web piece does this.

Research and PoC:
- Bake a Cycles lightmap (diffuse+indirect, or a combined lightmap) for the
  static house into a second UV channel. Compare against today's realtime
  sun+fill+rim at the hero angle.
- The obvious conflict: **our house assembles itself.** A lightmap baked on the
  finished house is wrong for pieces mid-flight. Investigate: bake only the
  *settled* state and cross-fade the lightmap in as the build completes? Bake
  per-phase? Or accept lit-realtime during the 2.2 s build and swap to the baked
  look on rest — we already have a `rested` flag in `HouseBuildScene.tsx` doing
  exactly this kind of state change for shadow updates.
- Cost: one extra texture (lightmap), one extra UV set, near-zero runtime. Under
  round 2's byte findings, is that affordable?
- Also evaluate: if a lightmap carries the lighting, can we **drop or cheapen the
  realtime shadow map** (currently 512² over ~240 casters)? That would pay for
  itself in draw calls.

This track alone could be the answer. Give it the most room.

## TRACK B — Teardown of sites that already look great

Stop theorising and go read the homework of people who solved this.

- Find 5–8 shipped web experiences with a 3D building/product hero that reads as
  real (awwwards "site of the day" architecture/real-estate entries, Lusion,
  Zajno, Active Theory, Vercel/Apple product pages, three.js showcase).
- For each: pull the actual assets off the network tab. Model bytes, texture
  count and resolution, compression extensions used, draw calls, whether the
  lighting is baked or realtime, whether there is post-processing, what the
  ground/backdrop is, what the camera does.
- **Write the comparison table against ours.** This converts "it looks shitty"
  into "they ship 6 MB and a lightmap, we ship 1 MB and realtime lights" — an
  argument the owner can act on.
- Be honest about what we cannot copy. If they ship 6 MB, say so; then the
  question becomes whether our gate is the right gate, which round 2 is already
  probing.

## TRACK C — Post-processing, dismissed once and never revisited

The code comments rule out SSAO "because it would sink the low-end phone that
already cannot finish a Lighthouse run." That was one measurement of one effect.
The cheap end of the stack was never tested:

- Anti-aliasing quality (what are we doing now — MSAA? none?). Jagged roof edges
  against a flat page tone are a strong fake tell at grazing angles.
- A subtle colour-grade LUT — one 32×32 texture, one fullscreen pass. This is how
  film-look is done cheaply, and it is how you make a render match the warm
  golden-hour direction in `docs/DESIGN-REFERENCES.md`.
- Very slight bloom on the roof specular and window glass.
- Whether a *low-resolution* AO pass (quarter-res, upsampled) is affordable where
  full-res was not.

Measure each on a mobile profile. Report the ones that survive. Anything that
costs more than ~1 ms is dead on arrival — say so and move on.

## TRACK D — Camera, lens, and composition

Round 1 said the camera "measured fine." Measured against what, though — we set
the framing ourselves, so a self-consistent check proves nothing (verification
law). Re-examine independently:

- **Vertical convergence.** Real architectural photography keeps verticals
  parallel (tilt-shift / two-point perspective). A tilted-back camera making the
  walls converge is one of the most recognisable "this is a 3D render" tells.
  Check what our hero camera does. This may be a one-line fix.
- Focal length. Architecture is shot long (35–50 mm equivalent+). A wide lens
  close in gives the dollhouse read. What are we on?
- The drag range. The owner finds defects by dragging on his phone — are we
  letting him orbit to angles no photographer would ever choose, e.g. straight
  down onto the roof, or below the ground plane? Constraining polar angle is
  free and removes whole classes of ugly.

## TRACK E — Entourage and time of day

The reference reels the owner liked are golden-hour with life in the frame. We
render a vacant house in flat daylight.

- Research the cheap end of entourage: a car in the drive, warm interior light
  spilling from windows at dusk, a figure for scale, patio furniture. What does
  each cost in draw calls? (We already fake a "lights are on" glow in
  `HouseBuildScene.tsx` — extend that idea rather than reinventing it.)
- **Time of day is free.** A dusk/golden-hour lighting setup costs the same as
  midday and photographs dramatically better — it is why every real-estate shoot
  is at that hour. Render the current model at 3–4 times of day and compare. If
  golden hour wins, that is a zero-byte upgrade.
- Constraint: the page tone is a light warm cream. A dusk model on a cream page
  may fight the design. Test it, do not assume.

## TRACK F — Build the realism scoring harness

The owner does not read code, and "does it look good" has been an argument for a
week. Make it a number.

- Automate: render the hero angle headless → sample per-region (roof / wall /
  ground / sky) → compare mean, std-dev, and hue against the owner's own photos
  in `docs/reference-match/research-2026-07-21/` → emit a score per region.
- Round 2 does this comparison once, by hand. **Make it a script** we can run on
  every future export, so realism becomes a regression test like the SEO gate.
- Put it in `scripts/`, wire nothing into CI yet (that is a separate ticket), and
  record today's baseline score for stages current/A/B/C/D so we can prove
  movement instead of debating it.

---

## 2. Hard rules (unchanged, all bought with pain)

- No rebuild of the house. No new `house.glb` on main. Scratch paths for PoCs.
- Verify in the REAL three.js renderer, never the Blender viewport. Dragged
  angle included. Five-angle + close-in + mobile.
- Dump the exported per-material texCoord table — that wiring is invisible in the
  viewport and the bug has shipped three times.
- Never instance structural pieces; an instanced batch animates as one piece and
  destroys the one-by-one build the owner values most.
- `img.pack()` after any pixel edit. Re-orient imports to Z-up, bake scale,
  verify world bbox z-span.
- `| tail` eats exit codes — `cmd > /tmp/x 2>&1; echo $?`.
- After a PR merges, never push to that branch again. Fresh branch from
  `origin/main`; diff CONTENT before opening anything.
- MUST-NOT-REGRESS: 2.2 s build, ~16 airborne, blueprint-blue to 55% of flight,
  jerkinhead roof, no truss, dark timber on gables + entry, real eaves,
  ~330 draw calls.

## 3. Report back with

1. The live log, complete, with each track's timebox and what it cost.
2. **One ranked list**: every lever found across rounds 1–3, ordered by
   realism-gained per hour-of-work, with byte and draw-call cost attached.
3. The teardown table (Track B) — us vs sites that look great.
4. The baseline realism scores (Track F) for current/A/B/C/D.
5. Your single recommended next build task, in one paragraph, with its cost — and
   if that recommendation contradicts round 2's, say which one you believe and why.
6. Notes + skill updates. Only verified facts.
