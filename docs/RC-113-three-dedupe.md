# RC-113 / RC-114 — three.js dedupe + PCFSoftShadowMap emitter location

Investigation-first, non-blocking. **No 3D behavior changed. Shadow type unchanged.**
Branched off `main` (`06fdb88`) into `rc/RC-113-three-dedupe`. Verified against the
real `package-lock.json` and installed `node_modules`, not recalled.

Date: 2026-07-24.

---

## RC-113 — the two three.js copies

### Diagnosis (before the fix)

`main`'s `package.json` declares, directly and transitively:

| Package | Declared range | Role |
|---|---|---|
| `three` | `^0.185.1` | **direct** dependency (r185) |
| `@react-three/fiber` | `^9.6.1` | direct; peer `three@>=0.156` — satisfied by r185 |
| `@react-three/drei` | `^10.7.7` | direct; peer `three@>=0.159` — satisfied by r185 |

Every resolved `three` in the tree, with its puller (from `package-lock.json` +
installed `node_modules`):

| Resolved copy | Version | Pulled by |
|---|---|---|
| `node_modules/three` | **0.185.1** (r185) | the direct `three@^0.185.1`; also the copy `@react-three/fiber@9.6.1` and `@react-three/drei@10.7.7` bind to (both peer-accept `>=0.156` / `>=0.159`) |
| `node_modules/stats-gl/node_modules/three` | **0.170.0** (r170) | `@react-three/drei@10.7.7` → `stats-gl@2.4.2`, which declares `three@^0.170.0` |

**Root cause.** `stats-gl@2.4.2` (a `drei` dependency, `drei` requires
`stats-gl@^2.2.8`) pins `three@^0.170.0`. For a `0.x` version a caret locks the
minor, so `^0.170.0` means `>=0.170.0 <0.171.0` — **r185 does not satisfy it**.
npm therefore nests a second, older `three@0.170.0` under `stats-gl` alongside the
top-level r185. That is the "two copies of three" — a larger install and the
classic seed for "multiple instances of three" runtime warnings once 3D code that
imports both paths ships.

Note: `drei`'s and `fiber`'s own `three` peer ranges are wide (`>=0.159` /
`>=0.156`) and are already met by r185 — only `stats-gl`'s tight caret forces the
duplicate.

### The dedupe (recommended approach)

Mechanical fix: an npm `overrides` entry pinning every transitive `three` to the
single top-level version. Referencing the direct dependency keeps one source of
truth:

```json
"overrides": {
  "three": "$three"
}
```

`$three` resolves to the root `three` spec (`^0.185.1`), so npm collapses
`stats-gl`'s `three` onto the same `0.185.1` node.

Why this is safe here:
- `three` has **no peer dependencies of its own**, so pinning it cannot create a
  peer conflict.
- `stats-gl` is a lightweight WebGL stats/perf panel (surfaced through drei's
  `<Stats>` / `<Perf>` helpers). The three core API it touches (`WebGLRenderer`
  and friends) is stable across r170→r185; forcing it onto r185 is a standard,
  well-trodden override in the R3F ecosystem.
- On `main` there is **no 3D code at all** (the scene lives only on the feature
  lanes — see RC-114 below), so `stats-gl` isn't even executed on `main`; the
  override is pure dependency-tree hygiene there and de-risks the eventual 3D
  merge.

### APPLIED — and verified green

The override was applied in this branch because it is mechanical and clean:

- `package.json` gained the `overrides` block above.
- After `npm install`, the tree collapses to **one** `three`:
  - `node_modules/three` → `0.185.1`
  - `node_modules/stats-gl/node_modules/three` → **absent** (deduped)
  - `package-lock.json` now has a single `three` node (`node_modules/three@0.185.1`).
  - (`npm ls three` / `npm why three` are permission-gated in this environment;
    the single-copy result was verified directly from `package-lock.json` and the
    installed `node_modules`, which are what those commands report.)
- `npm run build` → **exits 0**.
- `npm run test:e2e` (Playwright) → **106 passed**.

The duplicate exists on `main` itself (all four packages are declared on `main`),
not only under an unmerged 3D lane, so the "defer if the dup lives only under the
3D lanes" carve-out did not apply.

---

## RC-114 — PCFSoftShadowMap emitter location (LOCATE ONLY, not changed)

The shadow-map type is set inside `applyRenderer(r)` in the scene module. **It is
NOT present on `main`** — `main` carries no 3D scene code (grep of `src/` on this
`main`-based worktree returns zero matches for `PCFSoftShadowMap`,
`shadowMap.type`, or `applyRenderer`).

Exact emitter, per feature branch (current line numbers, verified via `git grep` /
`git show`):

| Branch | File:line | Statement |
|---|---|---|
| `feature/3d-hero` | `src/scenes/rapidconstruct-scene.js:659` | `r.shadowMap.type = THREE.PCFSoftShadowMap;` |
| `feature/configurator` | `src/scenes/rapidconstruct-scene.js:250` | `r.shadowMap.type = THREE.PCFSoftShadowMap;` |

Full `applyRenderer` block (identical on both branches; line numbers differ only
because the surrounding file evolved):

```js
function applyRenderer(r) {
  r.outputEncoding = THREE.sRGBEncoding;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.97;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;   // <- the emitter
}
```

Current value: **`THREE.PCFSoftShadowMap`** (PCF soft shadows). Left **unchanged**
by this task, by design.

> ⚠️ `docs/STATUS.md` (on the 3d-hero/configurator lanes) cites this emitter as
> `rapidconstruct-scene.js:487–494`. That line range is **stale** — after the
> LANE A frame/quoin polish and the configurator refactor the statement now lives
> at `:659` on `feature/3d-hero` and `:250` on `feature/configurator`. The
> `applyRenderer` function name and the setting are the durable anchors; grep for
> `shadowMap.type` rather than trusting a line number before any future change
> touches it.

---

## Summary

- **RC-113:** duplicate was `three@0.185.1` (direct) vs `three@0.170.0` (via
  `drei` → `stats-gl@2.4.2`'s `^0.170.0` caret). Fixed with an
  `overrides: { "three": "$three" }` pin. Applied and verified — one `three`
  version, `npm run build` exits 0, 106 Playwright tests pass.
- **RC-114:** `PCFSoftShadowMap` is emitted in `applyRenderer` at
  `src/scenes/rapidconstruct-scene.js:659` (`feature/3d-hero`) / `:250`
  (`feature/configurator`); not on `main`. Located only — shadow type unchanged.
