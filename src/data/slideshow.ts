/**
 * Project slideshow content — the SINGLE source of truth for the shell.
 *
 * PLACEHOLDER DATA (2026-07-25, feature/project-slideshow). Everything here is a
 * stand-in. Swapping in the owner's real photos later is a one-line change per
 * slide: replace `src` with the real image path (e.g. `/portofoliu/house-1.jpg`)
 * and fill in `caption`/`location`. Real captions, locations and any project
 * names/numbers are OWNER content (Q-14) — do NOT invent them here.
 *
 * The shell is NOT wired into the live homepage hero; it renders only at the
 * standalone /slideshow-preview route so placement can be decided later.
 */

export type Slide = {
  id: string;
  /** Swap this for a real photo path/URL. Currently a solid-colour placeholder. */
  src: string;
  /** Placeholder — real per-photo caption is Q-14 owner content. */
  caption: { ro: string; ru: string };
  /** Placeholder — real location is Q-14 owner content. */
  location: string;
};

// Solid-colour SVG placeholder as a self-contained data URI — no external file,
// no licensing, and unmistakably a placeholder (labelled on the image itself).
function placeholder(bg: string, n: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<text x="50%" y="47%" fill="#ffffff" fill-opacity="0.9" font-family="system-ui,sans-serif" font-size="70" font-weight="700" text-anchor="middle">PLACEHOLDER ${n}</text>` +
    `<text x="50%" y="56%" fill="#ffffff" fill-opacity="0.6" font-family="system-ui,sans-serif" font-size="30" text-anchor="middle">swap for owner photo — Q-14</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const SLIDES: Slide[] = [
  {
    id: "ph-1",
    src: placeholder("#3a4048", 1),
    caption: { ro: "Placeholder — descriere proiect (Q-14)", ru: "Заглушка — описание проекта (Q-14)" },
    location: "[locație — Q-14]",
  },
  {
    id: "ph-2",
    src: placeholder("#7a5c3e", 2),
    caption: { ro: "Placeholder — descriere proiect (Q-14)", ru: "Заглушка — описание проекта (Q-14)" },
    location: "[locație — Q-14]",
  },
  {
    id: "ph-3",
    src: placeholder("#48584f", 3),
    caption: { ro: "Placeholder — descriere proiect (Q-14)", ru: "Заглушка — описание проекта (Q-14)" },
    location: "[locație — Q-14]",
  },
  {
    id: "ph-4",
    src: placeholder("#8a6d4b", 4),
    caption: { ro: "Placeholder — descriere proiect (Q-14)", ru: "Заглушка — описание проекта (Q-14)" },
    location: "[locație — Q-14]",
  },
  {
    id: "ph-5",
    src: placeholder("#565160", 5),
    caption: { ro: "Placeholder — descriere proiect (Q-14)", ru: "Заглушка — описание проекта (Q-14)" },
    location: "[locație — Q-14]",
  },
];

// Section headline + subtext overlay. PLACEHOLDER copy, clearly marked — real
// RO/RU marketing copy is owner content (Q-14). RO is the source of truth; the RU
// here is a machine-drafted placeholder, not reviewed (see docs/RU-REVIEW.md when
// real copy lands).
export const COPY = {
  headline: {
    ro: "Galerie proiecte — titlu (placeholder)",
    ru: "Галерея проектов — заголовок (заглушка)",
  },
  subtext: {
    ro: "Subtitlu demonstrativ. Conținutul real (foto, titlu, subtitlu) vine de la proprietar — Q-14.",
    ru: "Демонстрационный подзаголовок. Реальный контент (фото, заголовок, текст) — от владельца, Q-14.",
  },
} as const;
