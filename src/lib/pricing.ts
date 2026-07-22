/**
 * Pricing engine (RC-107a) — single source for calculator + configurator math.
 *
 * Prices extracted 2026-07-15 from the owner's live Tilda calculator
 * (docs/PRICING.md). Formula there: total = footprint area × price/m².
 * We return a ±10% RANGE: an online estimate is honest as a bracket, and the
 * exact number comes from the free on-site deviz (per site copy).
 * ⚠️ Items marked `verify` await owner confirmation (Q-10) and MUST NOT be
 * shown publicly until confirmed.
 */

export type RoofMaterial = {
  id: string;
  name: string;
  pricePerM2: number; // MDL
  verify?: boolean;
};

export const ROOF_MATERIALS: RoofMaterial[] = [
  {
    id: "novatik-classic",
    name: "Novatik Classic (rocă vulcanică)",
    pricePerM2: 232,
  },
  {
    id: "novatik-slate",
    name: "Novatik Slate (rocă vulcanică)",
    pricePerM2: 255,
  },
  {
    id: "novatik-roman",
    name: "Novatik Roman (rocă vulcanică)",
    pricePerM2: 232,
  },
  {
    id: "iko-cambridge",
    name: "Șindrilă IKO Cambridge Xpress",
    pricePerM2: 345,
  },
  {
    id: "iko-superglass",
    name: "Șindrilă IKO Superglass Hex",
    pricePerM2: 250,
  },
  {
    id: "creaton-balance",
    name: "Țiglă ceramică Creaton Balance",
    pricePerM2: 57,
    verify: true,
  },
  {
    id: "creaton-rapido",
    name: "Țiglă ceramică Creaton Rapido",
    pricePerM2: 58,
    verify: true,
  },
  { id: "barcelona", name: "Barcelona", pricePerM2: 198 },
  { id: "bavaria", name: "Bavaria 2.0/40 UTK", pricePerM2: 295 },
  { id: "finn", name: "Finn 2.0 UTK", pricePerM2: 295 },
  { id: "heta", name: "Heta 2.0 UTK", pricePerM2: 310 },
  { id: "zet", name: "Zet UTK", pricePerM2: 420 },
  { id: "izi-24", name: "IZI UTK 24", pricePerM2: 502 },
];

export type Estimate = {
  area: number; // m², rounded to 2 decimals
  low: number; // MDL
  high: number; // MDL
  exact: number; // MDL — internal / lead email only, never the public UI
};

const RANGE = 0.1; // ±10%

/** Same math as the owner's published calculator, as an honest range. */
export function estimateRoof(
  lengthM: number,
  widthM: number,
  materialId: string,
): Estimate | null {
  const material = ROOF_MATERIALS.find((m) => m.id === materialId);
  if (!material) return null;
  if (!Number.isFinite(lengthM) || !Number.isFinite(widthM)) return null;
  if (lengthM <= 0 || widthM <= 0 || lengthM > 200 || widthM > 200) return null;

  const area = Math.round(lengthM * widthM * 100) / 100;
  const exact = Math.round(area * material.pricePerM2);
  return {
    area,
    exact,
    low: Math.round((exact * (1 - RANGE)) / 100) * 100,
    high: Math.round((exact * (1 + RANGE)) / 100) * 100,
  };
}

/** Materials safe to show publicly (unverified ones stay internal, Q-10). */
export function publicMaterials(): RoofMaterial[] {
  return ROOF_MATERIALS.filter((m) => !m.verify);
}
