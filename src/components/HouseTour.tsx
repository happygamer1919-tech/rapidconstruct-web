"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

export type BuildPhase = { name: string; desc: string };

// Photoreal stage frames of the SAME house as the hero video (Higgsfield,
// generated from the owner's real built house — Q-12/2026-08-04), one per
// phase, index-aligned with home.build.phases. The 3D model this replaces
// lives on /configurator, where it is interactive.
const STAGE_IMAGES = [
  "/images/stages/stage-1.jpg", // Fundația — slab + string lines
  "/images/stages/stage-2.jpg", // Pereții — block walls, scaffolding
  "/images/stages/stage-3.jpg", // Acoperișul — roof on bare walls
  "/images/stages/stage-4.jpg", // Ferestre și uși — joinery in, base plaster
  "/images/hero/hero-finished.jpg", // Ultimele detalii — the finished frame
];

/**
 * RC-125 — stage-type strips, one list per stage, labels matched to images
 * we actually own. Every card is now the SAME plot in the same golden-hour
 * light: the real Tilda formwork photo was swapped for a generated one on
 * 2026-08-05 because its flat cloudy light and different house stood out
 * against the rest (it survives in git history and the Tilda scrape, and
 * its background JCB is still the best machinery reference for RC-126).
 * Real owner photos replace these as they arrive (Q-19); a stage with an
 * empty list shows no strip.
 */
type StageType = { label: string; src: string };
const STAGE_TYPES: (StageType[] | null)[] = [
  [
    {
      label: "Săpătură și trasare",
      src: "/images/stages/types/sapatura-trasare.jpg",
    },
    {
      label: "Fundație în cofraj",
      src: "/images/stages/types/fundatie-cofraj.jpg",
    },
    { label: "Radier (placă monolită)", src: "/images/stages/stage-1.jpg" },
    {
      label: "Fundație finisată",
      src: "/images/stages/types/fundatie-finisata.jpg",
    },
  ],
  [
    { label: "Zidărie din BCA", src: "/images/stages/stage-2.jpg" },
    {
      label: "Zidărie din cărămidă",
      src: "/images/stages/types/caramida.jpg",
    },
    {
      label: "Beton armat în cofraj",
      src: "/images/stages/types/beton-cofraj.jpg",
    },
    {
      label: "Termoizolație fațadă",
      src: "/images/stages/types/termoizolatie.jpg",
    },
  ],
  [
    { label: "Țiglă metalică", src: "/images/stages/types/tigla-metalica.jpg" },
    {
      label: "Șindrilă bituminoasă",
      src: "/images/stages/types/sindrila.jpg",
    },
    {
      label: "Montaj învelitoare",
      src: "/images/stages/types/montaj-invelitoare.jpg",
    },
  ],
  [
    { label: "Ferestre și uși montate", src: "/images/stages/stage-4.jpg" },
    {
      label: "Ușă de intrare",
      src: "/images/stages/types/usa-intrare.jpg",
    },
    {
      label: "Ferestre panoramice",
      src: "/images/stages/types/ferestre-panoramice.jpg",
    },
  ],
  [
    { label: "Casa predată", src: "/images/hero/hero-finished.jpg" },
    {
      label: "Jgheaburi și burlane",
      src: "/images/stages/types/jgheaburi.jpg",
    },
    { label: "Pavaj și alee", src: "/images/stages/types/pavaj.jpg" },
    {
      label: "Gard și poartă",
      src: "/images/stages/types/gard-poarta.jpg",
    },
  ],
];

/**
 * HouseTour — the scroll story, in a box, below the hero. Scrolling the runway
 * BUILDS the house stage by stage (owner direction 2026-08-04): each phase
 * crossfades to its photoreal construction frame, so the visitor scrubs
 * through the build like a time-lapse. No scroll-jacking — the runway is
 * plain sticky positioning and the pages scroll natively.
 * Reduced motion: finished house + a plain list.
 */
export default function HouseTour({
  eyebrow,
  title,
  intro,
  phases,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  phases: BuildPhase[];
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // One runway segment per phase.
  const [segment, setSegment] = useState(0);
  // RC-125: a tapped type card temporarily replaces the stage frame; leaving
  // the stage clears the pick so the runway always resumes its own story.
  const [typePick, setTypePick] = useState<{ seg: number; src: string } | null>(
    null,
  );
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(
      phases.length - 1,
      Math.floor(v * phases.length * 1.001),
    );
    setSegment((prev) => (prev === s ? prev : s));
    setTypePick((p) => (p && p.seg !== s ? null : p));
  });
  const active = phases[segment];

  if (reduce) {
    return (
      <section
        aria-labelledby="tour-title"
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-gutter py-16">
          <Heading eyebrow={eyebrow} title={title} intro={intro} />
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border">
            <Image
              src={STAGE_IMAGES[STAGE_IMAGES.length - 1]}
              alt={phases[phases.length - 1]?.name ?? ""}
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
          </div>
          <PhaseList phases={phases} />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="tour-title"
      className="border-b border-border bg-surface"
    >
      {/* Heading sits above the runway so the pinned panel only has to hold the
          house + the active phase — on a phone all three would not fit. */}
      <div className="mx-auto w-full max-w-6xl px-gutter pt-16">
        <Heading eyebrow={eyebrow} title={title} intro={intro} />
      </div>

      {/* One screen of runway per phase; the box stays pinned inside it. */}
      <div
        ref={wrapRef}
        className="relative"
        style={{ height: `${phases.length * 100}svh` }}
      >
        <div className="sticky top-0 flex h-svh w-full items-center">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-gutter lg:grid-cols-2 lg:gap-10">
            {/* The story copy for the phase you are on. Second on a phone so the
                house leads; left column on desktop. */}
            <div className="order-2 flex flex-col gap-5 lg:order-1">
              {/* No AnimatePresence/mode="wait" here: it queued an exit
                  animation before every entry, so scrolling the runway fast
                  backed the queue up and the heading fell out of sync with
                  the image and the dots (owner bug report 2026-08-05 — the
                  photo showed Fundația while the title read "3 Acoperișul").
                  A keyed motion.div animates on mount only: whatever segment
                  the scroll lands on renders immediately, no queue to drain. */}
              <div className="min-h-32">
                <motion.div
                  key={segment}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-2"
                >
                  <p className="font-serif text-display-lg leading-tight text-foreground">
                    <span className="mr-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 align-middle text-h3 font-semibold lining-nums text-accent-strong">
                      {segment + 1}
                    </span>
                    {active.name}
                  </p>
                  <p className="max-w-md text-body-lg text-muted-foreground">
                    {active.desc}
                  </p>
                </motion.div>
              </div>
              <div className="flex gap-2">
                {phases.map((p, d) => (
                  <span
                    key={p.name}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      d <= segment ? "w-10 bg-accent" : "w-5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* The build, in its box: all five stage frames stacked. The
                active stage SNAPS into place — a fast 300ms fade plus a tiny
                scale settle (animate-stage-snap) — like the next piece of a
                model kit clicking on. The first continuous-blend version read
                as a blurry mush mid-scroll (owner feedback 2026-08-04), so
                transitions are quick and discrete; long overlaps are gone. */}
            {/* min-w-0 is load-bearing: without it this grid item refuses to
                shrink below the strip's intrinsic width (min-width:auto), the
                strip's overflow-x never engages, and the whole PAGE scrolls
                sideways on phones (owner bug report 2026-08-05). */}
            <div className="order-1 flex w-full min-w-0 flex-col gap-3 lg:order-2">
              <div className="relative h-[38svh] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted lg:aspect-square lg:h-auto">
                {STAGE_IMAGES.map((src, i) => (
                  <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      i === segment
                        ? "animate-stage-snap opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={i === segment ? (phases[i]?.name ?? "") : ""}
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
                {/* A tapped type card takes over the box until the visitor
                    scrolls to another stage. */}
                {typePick && typePick.seg === segment && (
                  <div className="animate-stage-snap absolute inset-0">
                    <Image
                      src={typePick.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* RC-125: type strip for the active stage — a plain swipeable
                  row, no scroll-jacking. Rendered only for stages that have
                  a type list (demo: Fundația only, placeholder images). */}
              {STAGE_TYPES[segment] && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {STAGE_TYPES[segment].map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() =>
                        setTypePick({ seg: segment, src: t.src })
                      }
                      className={`group relative h-16 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors lg:h-20 lg:w-36 ${
                        typePick?.src === t.src && typePick.seg === segment
                          ? "border-accent-strong ring-2 ring-accent-strong"
                          : "border-border hover:border-accent-strong"
                      }`}
                      aria-label={t.label}
                    >
                      <Image
                        src={t.src}
                        alt=""
                        fill
                        sizes="144px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-ink-950/65 px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight text-neutral-50">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* The duplicate phase list that used to render here was removed on
          owner direction (2026-08-04) — the runway already tells each stage.
          PhaseList remains the reduced-motion fallback above. */}
    </section>
  );
}

function Heading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h2
        id="tour-title"
        className="font-serif text-display-lg text-foreground"
      >
        {title}
      </h2>
      <p className="max-w-md text-body-lg text-muted-foreground">{intro}</p>
    </div>
  );
}

function PhaseList({ phases }: { phases: BuildPhase[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
      {phases.map((p, i) => (
        <li key={p.name} className="flex items-start gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-body font-semibold lining-nums text-accent-strong">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-body font-semibold text-foreground">
              {p.name}
            </h3>
            <p className="text-caption text-muted-foreground">{p.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
