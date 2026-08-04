"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
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
              <div className="min-h-32">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={segment}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                </AnimatePresence>
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
            <div className="relative order-1 h-[42svh] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted lg:order-2 lg:aspect-square lg:h-auto">
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
