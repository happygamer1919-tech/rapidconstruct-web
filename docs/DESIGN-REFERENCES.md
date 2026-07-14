# Design References — Motion & Look Direction

Analyzed 2026-07-14 from two Instagram reels supplied by the owner side. These are
REFERENCES for patterns and feel — we borrow ideas, we never copy assets, copy, brand
names, or layouts 1:1. More references may be added; append new sections below.

## Reference 1 — Luxury design-build site (reel by @wearebrand, IG DaiOSriPGPP)
A screen-capture scroll-through of a US luxury design-build company's homepage.

**What happens on screen:** full-bleed cinematic hero (aerial drone shot of a mountain
home), then scrolling drives a *construction story*: bare land with an excavator →
foundation pour (concrete trucks) → timber framing → facade/roofing with crane → the
finished house glowing at golden hour → interiors with people. Each phase has a caption
in a fixed lower-left slot ("from concept…", "procurement", "building", "home") set in
elegant serif + handwritten-script accents, plus a small phase chip on the right
("Phase III — Facade"). Warm golden palette, dark gradient overlays keep text readable.

**Borrow:**
- The **construction-phases scroll narrative** — it IS our SPEC §3 "layered build-up
  reveal" idea, proven on a real construction brand. Land → foundation → structure →
  facade → finished home maps 1:1 to RapidConstruct's services.
- Fixed caption slot with per-phase copy swap (steady rhythm, no layout jumps).
- Phase chips = our process steps (Proiectare → Fundație → Structură → Fațadă → Finisaje).
- Dark gradient overlay recipe for text-on-photo legibility.
- Warm golden-hour photography direction — flatters both houses and our orange accent.

**Skip / adapt:**
- Full scroll-scrubbed video: heavy download, fights our instant-hero + no-scroll-jacking
  guardrails. Adapt as a **stepped image sequence** (5-6 stills, crossfade/parallax on
  scroll thresholds, transform/opacity only, lazy-loaded below the hero). Hero itself
  stays a static optimized image with instant text.
- Handwritten script for whole words — poor readability/contrast. Use an italic serif
  accent sparingly instead.
- Their irreverent copy tone — wrong for the Moldovan market; we stay confident-premium.

## Reference 2 — "Meridian Development Group" editorial concept (IG DZl4PovRcYy)
A screen-capture of a fictional luxury property-developer site concept (AI-built demo).

**What happens on screen:** ultra-minimal fixed top bar (thin letterspaced wordmark left,
"EST. 1999" right). Scroll again tells a build story — empty field → white structural
frame rising ("Vision made permanent") → finished villa ("Every detail, deliberate") →
stat numerals fading in over the photo (140+ / 27 / 1998) → beachfront tower rising →
finished tower ("Built to be lived in") → full-dark editorial statement section, huge
serif: "Most buildings are sold. The best are *inherited*." → project index as elegant
table rows (name + location + completion year, staggered blur-to-sharp text reveal) →
full-screen footer CTA "Bring us your next landmark." with a single email link.

**Borrow:**
- **Editorial statement section**: one huge serif sentence on dark background as a
  mid-page beat between content sections — gives the page a premium pause. RapidConstruct
  version e.g. "Casele se construiesc. Încrederea se câștigă." (final copy TBD).
- **Project index rows** with small-caps metadata (city · m² · year · type) and staggered
  reveal — perfect for our portfolio (Orhei 100m² 2025 · Cahul 180m² …).
- **Stats as typography over imagery** (numerals large, labels tiny-caps) instead of
  boxed counter cards — more premium than the Tilda counters, and server-rendered.
- Thin, letterspaced all-caps micro-labels for nav/metadata ("EST. 2009" style).
- Full-screen footer CTA with one action.

**Skip / adapt:**
- Blur-heavy text reveals (filter animations are not transform/opacity and can jank).
  Adapt: translateY + opacity stagger only.
- Near-black-on-black low-contrast metadata — fails WCAG AA; we keep 4.5:1 minimum.
- Their pure dark theme sitewide: we're light-base (conservative construction clients,
  SPEC §3), but the editorial statement section and footer CAN be dark blocks.

## Cross-check against design-system guidance (ui-ux-pro-max, 2026-07-14)
Style match: "Exaggerated Minimalism" (oversized type, high contrast, negative space —
best-for: architecture/luxury). Typography direction: display serif + neutral sans
(Playfair Display/Inter class pairing; final faces chosen in RC-003 with diacritics
support for RO/RU Cyrillic mandatory). Guardrails confirmed by the UX database:
- prefers-reduced-motion: HIGH severity — static fallback for every scroll effect.
- No scroll-jacking/forced parallax (motion-sickness) — scroll stays native everywhere.
- Animate 1-2 key elements per view max; hover transitions 150-300ms.
- Images: WebP/AVIF + srcset; no 4000px originals; explicit dimensions (CLS).
- Accent color: keep brand ORANGE as accent/CTA (database's pink is a placeholder);
  editorial black/charcoal + warm neutrals base; no AI purple/pink gradients.
- Checklist for every motion PR: SVG icons only, cursor-pointer, visible focus states,
  4.5:1 contrast, test at 375/768/1024/1440px.

## How this lands in the backlog
- **RC-003 (tokens):** serif display + sans body pairing (RO/RU glyph coverage), charcoal
  + warm-neutral palette with orange accent, letterspaced micro-label style. 
- **RC-101 (home):** section order gains an editorial statement beat and typographic
  stats over imagery (replaces boxed counters).
- **RC-102 (motion):** implement the stepped construction-story sequence (Reference 1)
  with per-phase captions + phase chips; staggered translateY/opacity reveals
  (Reference 2); reduced-motion static fallbacks. 
- **RC-104 (portfolio):** editorial index rows with small-caps metadata as the list view.
- **NEW RC-111** (added to backlog): "Construction story" section — 5-6 phase stills
  (needs real site-progress photos from Max; placeholder renders until Q-06 resolves).
