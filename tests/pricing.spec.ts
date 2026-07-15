import { test, expect } from "@playwright/test";
import { estimateRoof, publicMaterials, ROOF_MATERIALS } from "../src/lib/pricing";

test.describe("pricing engine (RC-107a)", () => {
  test("matches the published Tilda formula: area × price/m²", () => {
    // 10×10m in Novatik Classic (232 lei/m²) → exactly 23200
    const e = estimateRoof(10, 10, "novatik-classic");
    expect(e).not.toBeNull();
    expect(e!.area).toBe(100);
    expect(e!.exact).toBe(23200);
    expect(e!.low).toBeLessThan(e!.exact);
    expect(e!.high).toBeGreaterThan(e!.exact);
  });

  test("rejects nonsense inputs", () => {
    expect(estimateRoof(0, 10, "novatik-classic")).toBeNull();
    expect(estimateRoof(10, -1, "novatik-classic")).toBeNull();
    expect(estimateRoof(10, 10, "no-such-material")).toBeNull();
    expect(estimateRoof(NaN, 10, "novatik-classic")).toBeNull();
    expect(estimateRoof(500, 10, "novatik-classic")).toBeNull();
  });

  test("unverified (Q-10) materials are excluded from the public list", () => {
    const pub = publicMaterials();
    expect(pub.some((m) => m.id === "creaton-balance")).toBe(false);
    expect(pub.length).toBe(ROOF_MATERIALS.length - 2);
  });
});
