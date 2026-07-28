/**
 * Project slideshow content — the SINGLE source of truth.
 *
 * Real project photos (RC-104 drone set, 1600px webp in `public/portofoliu/`)
 * paired with the four projects the owner harvested from the live site (Q-14):
 * locality + built area. Captions carry ONLY those owner-supplied facts plus a
 * neutral "finished project" descriptor — NO completion years (never confirmed,
 * never invented) and no work-type claim beyond what a finished-house photo shows.
 *
 * ⚠️ PHOTO ↔ PROJECT PAIRING IS PROVISIONAL (owner to confirm — Q-14).
 * The portfolio page deliberately established NO photo→locality mapping (it
 * captions only what is visible), so which drone still belongs to Orhei vs
 * Costești vs Cahul vs Chișinău is the OWNER's to confirm. The pairing below is
 * a best guess so the flow is real and previewable; correcting it is a one-line
 * `src` swap per slide. Do not treat the pairing as verified until Max signs off
 * on the preview.
 */

export type Slide = {
  id: string;
  /** Real photo under /public/portofoliu (1600px webp). */
  src: string;
  /** Locality — owner-harvested fact (Q-14). Shown as a chip. */
  location: string;
  /** Built area in m² — owner-harvested fact (Q-14). */
  areaM2: number;
  /** Neutral, visibly-true descriptor + area. NO year, no unverified work type. */
  caption: { ro: string; ru: string };
};

/** Helper: a finished-project caption carrying only the harvested area. */
function done(areaM2: number): { ro: string; ru: string } {
  return {
    ro: `Proiect finalizat · ${areaM2} m²`,
    ru: `Завершённый проект · ${areaM2} м²`,
  };
}

export const SLIDES: Slide[] = [
  {
    id: "orhei",
    src: "/portofoliu/p-0018.webp", // pairing provisional — confirm (Q-14)
    location: "Orhei",
    areaM2: 100,
    caption: done(100),
  },
  {
    id: "costesti",
    src: "/portofoliu/p-0022.webp", // pairing provisional — confirm (Q-14)
    location: "Costești",
    areaM2: 320,
    caption: done(320),
  },
  {
    id: "cahul",
    src: "/portofoliu/p-0034.webp", // pairing provisional — confirm (Q-14)
    location: "Cahul",
    areaM2: 180,
    caption: done(180),
  },
  {
    id: "chisinau",
    src: "/portofoliu/p-0037.webp", // pairing provisional — confirm (Q-14)
    location: "Chișinău",
    areaM2: 280,
    caption: done(280),
  },
];

// Section headline + subtext (used by the STANDALONE /slideshow-preview; the
// homepage hero keeps its own card, so these are hidden in heroBackground mode).
// RO is the source of truth; the RU here is machine-drafted — logged in
// docs/RU-REVIEW.md, owner-reviewed before launch.
export const COPY = {
  headline: {
    ro: "Proiecte finalizate",
    ru: "Завершённые проекты",
  },
  subtext: {
    ro: "Câteva dintre casele pe care le-am construit în Chișinău și regiuni.",
    ru: "Некоторые из домов, которые мы построили в Кишинёве и регионах.",
  },
} as const;
