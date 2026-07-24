# RapidConstruct — start here

Next.js + React on Vercel for a construction company in Chișinău, Moldova.
Bilingual RO (default, `/`) + RU (`/ru`). Brand orange `#E08039`.
Production `rapidconstruct.md` is **still on Tilda** until the RC-403 cutover.

The repo owner (**Max**) and the person in this terminal are the same individual.
When a decision needs the owner, make it with them here directly — don't defer it
to a third party or stall waiting on someone else.

## Read before doing anything

1. `docs/PROJECT-MEMORY.md` — permanent memory: history, what was tried, what was
   measured, and why decisions went the way they did.
2. `docs/STATUS.md` — the living board: what is true *now* and what happens next.

**Where they disagree, `docs/STATUS.md` wins** — it is updated more often.
Do not re-derive decisions these two files already record; that is what cost this
project a month. If you need current state and cannot read them, ask — don't guess.

`@AGENTS.md` carries the working rules (branching, PRs, verification).

## Hard rules

- **Never restart photoreal 3D or Blender work.** It cost a month with zero
  measured gain — the realism harness proved material work moved the score by
  zero. The hero is procedural three.js: `src/scenes/rapidconstruct-scene.js`
  mounted by `src/components/HeroScene.tsx`. Reopening this needs a decision on
  Q-12, not a fresh attempt.
- **Never touch DNS.** `rapidconstruct.md` stays on Tilda until cutover.
- **`NEXT_PUBLIC_SITE_URL` stays absent from Vercel Production.** Its absence is
  what keeps every non-production host `noindex` + `Disallow: /`. A production
  build failing without it is the guard working, not a break. Restoring it is a
  **cutover-day step (RC-403)** — see the cutover box in `docs/STATUS.md`.
- **Never regress the build animation.** It is the only thing the 3D does that a
  photograph cannot, and it is the entire reason the 3D exists.

## End of every session

Update `docs/STATUS.md` — current state, and what changed. Append durable
reasoning (not status) to `docs/PROJECT-MEMORY.md`. Summarise back in four
columns: **Done / In Progress / Blocked / Next**.
