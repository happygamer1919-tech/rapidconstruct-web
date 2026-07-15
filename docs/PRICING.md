# Pricing — extracted from the owner's live Tilda calculator (2026-07-15)

Source: public JS of https://rapidconstruct.md/calcul-acoperis (the owner's own published
prices). Formula used there: `total = (lungime × lățime) × preț_material` (flat footprint,
no pitch factor). Options for installments ("rate") and a discount step exist in the UI.

## Roof materials (lei/m², material + montaj as published)
| Material | lei/m² |
|---|---|
| Novatik Classic (rocă vulcanică) | 232 |
| Novatik Slate (rocă vulcanică) | 255 |
| Novatik Roman (rocă vulcanică) | 232 |
| Șindrilă IKO Cambridge Xpress | 345 |
| Șindrilă IKO Superglass Hex | 250 |
| Țiglă ceramică Creaton Balance | 57 ⚠️ |
| Țiglă ceramică Creaton Rapido | 58 ⚠️ |
| Barcelona | 198 |
| Bavaria 2.0/40 UTK | 295 |
| Finn 2.0 UTK | 295 |
| Heta 2.0 UTK | 310 |
| Zet UTK | 420 |
| IZI UTK 24 | 502 |

## ⚠️ Owner-verification needed before publishing (Q-10)
1. Creaton ceramic at 57–58: almost certainly per PIECE, not per m² (ceramic runs ~10-13
   pieces/m²). Confirm unit.
2. The promo "160 lei/m² înghețat pentru 2026" matches NO material above — confirm what the
   promo price refers to (cheapest config? labor only?).
3. Whether prices include jgheaburi/burlane and demontare or those are extras.

## Engine
`src/lib/pricing.ts` implements the same formula with the published list, returns a RANGE
(±10%) instead of a false-precision single number, and is UI-agnostic so the roof calculator
(RC-107), fence calculator (RC-108) and the 3D configurator (RC-112) all share it.
