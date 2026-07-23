# RapidConstruct — 3D Hero Build Spec

Reference definition for the homepage intro animation. Written so the scene can be
rebuilt from scratch, handed to another developer, or ported into React Three Fiber
without re-deriving any decisions.

Derived from the owner's drone photography (`DJI_0018`, `0020`, `0021`, `0022`, `0023`)
and dimensionally cross-checked against a Meshy photogrammetry scan of the real house.

---

## 1. Design position

**Stylized-realistic, not photoreal.** Clean parametric geometry with real materials and
real light. This is a deliberate decision, not a limitation:

- Photoreal realtime archviz at web weight is a losing fight — it was attempted and abandoned.
- A photogrammetry scan of the real house was generated (Meshy, multi-view, Private licence,
  157 KB after Draco). It is dimensionally accurate but surfaces are wobbly and the yard
  contains scan artifacts. **Not used for the hero.** Kept as a measurement reference.
- Crisp stylized geometry reads as intentional. A slightly-melted scan reads as a mistake.

**Ceiling acknowledged:** the remaining gap to photoreal is light behaviour, not detail —
baked global illumination, screen-space ambient occlusion, depth of field. SSAO and DOF are
available in the real site build via `@react-three/postprocessing`. Baked GI is a separate
workflow and a bigger commitment.

---

## 2. Coordinate system

- **Y up.** Ground plane at `y = 0`.
- **+Z is the front** (street side, where the camera lives).
- **+X is right** when facing the building.
- Units are metres.
- The whole plot sits roughly `x ∈ [-14, 16]`, `z ∈ [-9, 10]`.

---

## 3. Massing

Two volumes, stepped. This is the defining move — a long low wing running left, a taller
block at the right end, roofs stepping against each other.

### 3.1 Wing (left, single storey)

| | |
|---|---|
| Body | `10.6 × 3.5 × 5.2` at `(-3.7, 2.05, -0.1)` |
| Stone base | `y 0.30 → 1.35` |
| Banding course | `y 1.35 → 1.48`, projects 6 cm |
| Render above | `y 1.48 → 3.80` |
| Roof | hip, `hx 5.95`, `hz 4.15`, rise `1.35`, ridge half-length `2.9`, base `y 3.80`, centred `(-3.7, ·, 0.55)` |

The roof is **one continuous plane** extending forward past the wall to `z ≈ 4.7`, covering
the carport and the entrance. It is carried on four columns at its front edge. Getting this
wrong (treating the porch as a separate roof) was the single largest early error.

### 3.2 Block (right, two storeys)

Base geometry, "cu fronton" variant — the selected design:

| | |
|---|---|
| Centre | `x 5.9` |
| Width | `8.2` |
| Depth | `6.8`, centred `z 0.2` |
| Stone base | `y 0.30 → 1.15` |
| Banding course | `y 1.15 → 1.28` |
| Render above | `y 1.28 → 6.60` |
| String course | `y 3.60`, wraps the volume, marks the floor line |
| Roof | hip, `hx 4.85`, `hz 4.15`, rise `2.05`, ridge half-length `3.3`, base `y 6.60` |

**Cross gable** (the reason this variant was chosen — it breaks the roof):

| | |
|---|---|
| Bay | `3.6 × 6.3 × 1.6` projecting forward, centred `(7.5, 3.45, 4.4)` |
| Gable roof | `hx 2.05`, `hz 2.60`, rise `1.55`, base `y 6.60`, centred `z 2.8` — runs back into the main hip |
| Ridge | `y 8.15`, below the main ridge at `y 8.65`, so it reads as subordinate |
| Timber soffit | under the front overhang |

---

## 4. Roof

- **Tile**: dark neutral grey with a trace of green. Procedural canvas, 12 × 12 pan tiles
  with a quadratic crown curve, deep black shadow between rows, faint highlight on each
  crown, vertical sheet seams. Bump map from the same pattern.
- Material: `roughness 0.74`, `metalness 0.04`, tint `0x757b78`. **Matte.** Earlier versions
  were too metallic and too green.
- **Eave**: dark fascia rim (`0x131719`) with a **white soffit** inset inside it. The soffit
  is essential — the hip geometry has no underside, so without it you see through the roof.
- **Ridge and hip caps**: half-round cylinders (`radius 0.14–0.17`) along the ridge and all
  four hips of every roof.
- **Chimneys**: two, brick (procedural running bond, terracotta with pale mortar), concrete
  coping, metal cap raised on four short posts with an air gap.
- **Solar array** on the rear slope of the block roof.
- **No snow guards.** They were removed at the client's request and replaced with dormers.

### 4.1 Dormers — wing roof only

Two, at `x -6.2` and `-1.4`, seated at `f = 0.33` along the slope.

| | |
|---|---|
| Body | `1.70 × 0.86 × 1.75` |
| Gable roof | `hx 1.04`, `hz 1.08`, rise `0.50`, double-sided material |
| Ridge cap | runs out past the front |
| Timber soffit | under the front overhang, warm tint `0xd8b98a` |
| Window | `0.98 × 0.60`, landscape not square |

Deliberately low-profile. Earlier versions sat too tall and perched rather than sat.
**Not applied to the block roof** — it was tried and removed as too busy.

---

## 5. Walls

- **Render**: warm off-white `0xf1eee6`, procedural noise texture, subtle grime gradient at
  the base. Never pure white — that was reading blue and clinical.
- **Stone**: `0xc6bfb1`. Large-format staggered courses, per-block tonal variation, vertical
  veining, light-to-dark gradient per block so it reads as depth. Applied to the base storey
  and the corner quoins.
- **Grey bands**: vertical strips on the block corner and around the entrance. Painted render
  with a white reveal line and a thin shadow line beneath each — this is what's actually built,
  it is *not* wood or panelling.
- **Plinth**: dark base line `0x1d2227`.
- **Quoins**: alternating stone blocks up each corner, wide/narrow alternating (`0.60` / `0.38`),
  course height ≈ `0.44`. Sized small — earlier versions read as boulders.

### 5.1 Openings — CRITICAL

This was got wrong three times. The rule:

> **A window frame must be a RING of four bars, never a solid box.**

A solid box, however thin, sits in front of the glass and hides it. The correct build:

1. Glass plane, recessed `0.10` behind the wall face. `roughness 0.04`, `metalness 0.95`.
2. Four frame bars — head, sill, two jambs — at `z = wallFace - 0.02`, section `0.09 × 0.15`.
3. Optional mullion bar, centred.
4. Projecting sill below, `w + 0.38` wide, light stone tone.

Same rule applies to the `winX` variant on side elevations, with the axes swapped and the
sign flipped by which side of the building the wall faces.

**Banding courses must clear all sills.** The stone base tops were lowered specifically so the
course line passes below every window. Doors must project further than the course, or the
course crosses in front of them.

---

## 6. Site

| Element | Notes |
|---|---|
| Paving | checkerboard, **rotated 45°** — it runs diagonal in the photos |
| Kerb | around the paving edge so it stops cleanly against grass |
| Gravel | right flank and rear, where paving stops |
| Foundation slab | pale grey, under both volumes |
| Fence | grey horizontal slat panels between rendered posts with caps |
| Sliding gate | vertical slats, top rail, runner track set into the paving, post intercom |
| Garage | flat-roofed block at the right boundary with a roller shutter |
| Car | dark, parked under the carport |
| Entrance | concrete steps, slatted dark door, two wall lights with faint emissive glow |
| Grass | procedural noise with dirt patches, extends to horizon |
| Trees | ~40, layered sphere canopies, varied greens — **not** faceted icosahedrons |
| Hills | flattened spheres at radius 430, hazy, sit under the fog |

---

## 7. Lighting and grade

```
toneMapping        ACESFilmic
toneMappingExposure 0.97
hemisphere         sky 0xafc6de / ground 0x7a6e52, intensity 0.52
key                directional 0xffe9c9, intensity 1.52, position (-24, 13, 16)
                   castShadow, 2048², radius 3.5, bias -0.0007
fill               directional 0x93b4d8, intensity 0.32, position (17, 9, -15)
fog                FogExp2 0xcbcdc9, density 0.0066
sky                vertical gradient — 0x7fa8d2 → 0xb0c8e0 → 0xdce1e3 → 0xe2dbcd
```

Low sun for long shadows across the paving. Exposure was pulled down from 1.16 — the earlier
version blew out the white walls.

---

## 8. Animation

Every piece flies in from an offset and fades up. Blueprint wireframe edges (`0x1f4fd6`) draw
first and fade as each piece lands.

```
BUILD_END  4.3 s
HOLD       2.1 s   (before loop restart)
ease-in    easeOutCubic  per piece
camera     custom quad ease — accelerates, settles rather than stops
```

Phase captions, Romanian, keyed to timeline:

| t | label |
|---|---|
| 0.00 | Proiect |
| 0.50 | Fundație |
| 0.85 | Pereți |
| 1.70 | Acoperiș |
| 2.30 | Finisaje |
| 3.50 | RapidConstruct |

Camera: radius `20 → 35`, height `2.4 → 15`, angle `-0.78 → -0.12 rad`, look-at rises
`2.4 → 3.3`. Starts low and close, pulls back into a drone three-quarter view.

---

## 9. Brand

| | |
|---|---|
| Accent | `#E08039` — eyedropped from the logo |
| Applied to | porch eave fascia line, final phase dot |
| Blueprint | `#1F4FD6` |
| Logo | black wordmark, orange roofline motif, white ground |

The company trades as **RAPID CONSTRUCT & 3D DESIGN** — 3D visualisation is already part of
the offering, so the animated 3D intro demonstrates a service rather than decorating the page.

---

## 10. Implementation notes

**Geometry helper order matters.** Rotate the geometry *before* translating it. Translating
first then rotating spins the piece around the world origin and flings it across the scene.
This bug produced the "stray sticks" on the roof.

**Custom geometry**
- `hipR(hx, hz, h, rx)` — hip roof with a real ridge, six triangles, UVs from footprint.
- `gable(hx, hz, h)` — prism, ridge along Z. Use `side: DoubleSide` — winding is unreliable.

**Elements sitting on a slope** (dormers, solar, anything on a roof) are placed by fraction
`f` along the slope: `y = base + h·f`, `z = cz + hz·(1-f)`, half-width `hx - (hx-rx)·f`.
Ignoring the taper is what pushed snow guards off the edge of the roof.

**Guard the render loop.** `requestAnimationFrame` first, then the update in a `try/catch`.
An uncaught throw kills the loop permanently and leaves a black canvas with no explanation.

---

## 11. Open items

- SSAO and depth of field — needs `@react-three/postprocessing`, not available in the preview sandbox.
- Baked ambient occlusion — the biggest remaining realism gain.
- Mobile fallback path and `prefers-reduced-motion` behaviour.
- Port to `HeroBuild3D.tsx` on branch `feature/3d-hero`, verify on the Vercel preview at full resolution.
