/**
 * Configurator schema (feature/configurator lane).
 *
 * Single source for everything the 3D house configurator offers: roof types,
 * roof materials (with public price bands + spec sheet), wall finishes, fence
 * types, house models and area presets. The 3D side consumes `tex` specs via
 * `src/scenes/house-kit.js`; the UI consumes ids + bands + specs. Visible
 * labels live in the message catalog (`configuratorPage.*`) — RO is the source
 * of truth, RU is tracked in docs/RU-REVIEW.md.
 *
 * ⚠️ PRICES. The four bands below are the category-level "de la X lei/m²"
 * bands supplied by the owner for the configurator (2026-07-24). They are
 * deliberately NOT the per-product install prices in `src/lib/pricing.ts`
 * (RC-107a) — that engine keeps powering the roof calculator. Țiglă ceramică
 * has NO public band: the ceramic entries are owner-blocked (Q-10 / B4), so
 * the UI must show "preț la cerere" and never invent a number.
 */

export type RoofTypeId = "2ape" | "4ape" | "mansarda" | "combinat";
export type RoofMaterialId =
  | "tigla-metalica"
  | "shingle"
  | "roca-vulcanica"
  | "tigla-ceramica";
export type WallFinishId = "stucco-alb";
export type FenceTypeId = "jaluzele" | "sipca" | "plin" | "combinat-piatra";
export type HouseModelId = "cu-fronton";

export type HouseConfig = {
  model: HouseModelId;
  roof: { type: RoofTypeId; material: RoofMaterialId };
  walls: { finish: WallFinishId };
  fence: { type: FenceTypeId };
};

/**
 * The approved hero house, exactly as signed off ("cu fronton"). The hero
 * passes no config, gets this, and must render the same scene as before the
 * refactor.
 */
export const DEFAULT_CONFIG: HouseConfig = {
  model: "cu-fronton",
  roof: { type: "combinat", material: "roca-vulcanica" },
  walls: { finish: "stucco-alb" },
  fence: { type: "jaluzele" },
};

export const ROOF_TYPES: readonly RoofTypeId[] = [
  "2ape",
  "4ape",
  "mansarda",
  "combinat",
] as const;

export const FENCE_TYPES: readonly FenceTypeId[] = [
  "jaluzele",
  "sipca",
  "plin",
  "combinat-piatra",
] as const;

export const WALL_FINISHES: readonly WallFinishId[] = ["stucco-alb"] as const;

/** m² presets for the estimate step. Free input is allowed alongside. */
export const AREA_PRESETS: readonly number[] = [100, 120, 150, 200, 250] as const;

/**
 * Procedural texture recipe for one roof material. Consumed by the tile
 * generator in `src/scenes/house-kit.js` (the parameterised version of the
 * approved generator — same painter, different stops/profile).
 *
 * `stops` are [offset, css-color] pairs for the per-tile vertical gradient.
 * `tint`/`rough`/`metal` go onto the MeshStandardMaterial. The approved roof
 * is `roca-vulcanica`: its stops/tint are byte-for-byte the values from the
 * signed-off scene — do not "improve" them.
 */
export type RoofTexSpec = {
  profile: "pantile" | "shingle";
  base: string;
  stops: readonly (readonly [number, string])[];
  stroke: string;
  /** Speckle overlay (mineral granules) — shingle + stone-coated looks. */
  granular?: boolean;
  tint: number;
  rough: number;
  metal: number;
};

export type RoofMaterial3D = {
  id: RoofMaterialId;
  /** Public price band, lei/m² — null = "preț la cerere" (Q-10, ceramic). */
  band: { min: number; max: number } | null;
  /** Spec sheet strings (unit-free; units live in the message templates). */
  specs: { durability: string; warranty: string; weight: string };
  tex: RoofTexSpec;
};

export const ROOF_MATERIALS_3D: Record<RoofMaterialId, RoofMaterial3D> = {
  "tigla-metalica": {
    id: "tigla-metalica",
    band: { min: 450, max: 900 },
    specs: { durability: "40–50", warranty: "10–15", weight: "4,5–5" },
    tex: {
      profile: "pantile",
      base: "#26292c",
      stops: [
        [0, "#0b0e10"],
        [0.11, "#5a646c"],
        [0.36, "#3a4147"],
        [0.64, "#2a3036"],
        [0.9, "#181c20"],
        [1, "#0b0d0f"],
      ],
      stroke: "rgba(8,10,12,.8)",
      tint: 0x8a9199,
      rough: 0.45,
      metal: 0.4,
    },
  },
  shingle: {
    id: "shingle",
    band: { min: 550, max: 1100 },
    specs: { durability: "25–30", warranty: "15–20", weight: "8–12" },
    tex: {
      profile: "shingle",
      base: "#1b1d1e",
      stops: [
        [0, "#101112"],
        [0.5, "#35393b"],
        [1, "#0c0d0e"],
      ],
      stroke: "rgba(5,6,6,.9)",
      granular: true,
      tint: 0x9a938a,
      rough: 0.96,
      metal: 0,
    },
  },
  "roca-vulcanica": {
    id: "roca-vulcanica",
    band: { min: 800, max: 1450 },
    specs: { durability: "50+", warranty: "30–50", weight: "6–7" },
    // EXACT approved values (signed-off scene) — the hero default.
    tex: {
      profile: "pantile",
      base: "#242827",
      stops: [
        [0, "#060809"],
        [0.11, "#3b4241"],
        [0.36, "#2a3130"],
        [0.64, "#1d2322"],
        [0.9, "#111514"],
        [1, "#080a0a"],
      ],
      stroke: "rgba(4,5,5,.8)",
      tint: 0x757b78,
      rough: 0.74,
      metal: 0.04,
    },
  },
  "tigla-ceramica": {
    id: "tigla-ceramica",
    band: null, // Q-10 — owner-blocked; UI shows "preț la cerere"
    specs: { durability: "80–100", warranty: "30+", weight: "40–45" },
    tex: {
      profile: "pantile",
      base: "#8f4a2e",
      stops: [
        [0, "#5a2413"],
        [0.11, "#c06a43"],
        [0.36, "#a5532f"],
        [0.64, "#8c4526"],
        [0.9, "#6b3119"],
        [1, "#54200f"],
      ],
      stroke: "rgba(50,18,8,.8)",
      tint: 0xffffff,
      rough: 0.85,
      metal: 0,
    },
  },
};

export const ROOF_MATERIAL_ORDER: readonly RoofMaterialId[] = [
  "tigla-metalica",
  "shingle",
  "roca-vulcanica",
  "tigla-ceramica",
] as const;

/** House models available to the configurator. Adding a model = adding a
 *  recipe file under `src/scenes/houses/` + one entry here. */
export const HOUSE_MODELS: readonly HouseModelId[] = ["cu-fronton"] as const;
