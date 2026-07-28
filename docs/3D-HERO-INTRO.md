# feature/3d-hero — homepage 3D intro

Scratch/scaffold for the new homepage 3D intro. This branch is cut from `main`
(production, PR #48) and is intentionally SEPARATE from the launch work — the 3D
model rebuild can churn for weeks here without touching the live site.

## Status
- Branch created 2026-07-22 from `main` @ bc1edaa.
- No UI change yet. The preview currently matches production on purpose — this
  doc is the starting commit so the branch has a deployable preview URL.

## Not on this branch (deliberate)
`main` does NOT yet include the RU localized slugs, the privacy policy, the
shorter title suffix, or the `/2` & `/calcul-gard` redirect repoints — those are
in **PR #49**, still open. Keep the two efforts separate: they touch different
files (3D hero = homepage/model; PR #49 = routing/privacy), so they will merge
without conflict. If PR #49 merges first, rebase this branch on the new `main`.

## Guardrails (from the project handoff — do not break)
- The build animation is the one thing a photo cannot do; it is why the 3D
  exists. Do not regress it.
- `prefers-reduced-motion` mandatory; hero renders instantly (no LCP gating).
- Ship budget: model < 1.5 MB, ~330 draw-call ceiling.
- The photo-match direction (owner's drone photos, 2026-07-22) is the target
  look — full hip roof, white stucco, not the reverted dark-timber Look B.

## Next
Design the intro (options-as-renders first, owner picks from pictures), then
build. This doc gets replaced by the real work.
