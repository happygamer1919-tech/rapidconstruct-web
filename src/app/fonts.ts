import { Playfair_Display, Inter } from "next/font/google";

// RC-003 design tokens consume these two CSS variables (--font-serif / --font-sans)
// via @theme inline in globals.css. Subsets are mandatory: `latin-ext` carries the
// Romanian diacritics (ă â î ș ț), `cyrillic` carries the Russian (RU) copy.
export const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});
