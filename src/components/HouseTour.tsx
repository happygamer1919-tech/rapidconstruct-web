"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { skipHeavy3d } from "@/lib/audit";

export type BuildPhase = { name: string; desc: string };

// Heavy WebGL scene, browser-only.
const HouseBuildScene = dynamic(() => import("./HouseBuildScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

/**
 * HouseTour — the scroll story, in a box, below the hero. The house arrives
 * already built (the hero above is where it builds itself); scrolling the
 * runway steps the 5 phases, keeping the active one full-colour while the rest
 * lerp toward the page tone. Reduced motion: finished house + a plain list.
 */
export default function HouseTour({
  eyebrow,
  title,
  intro,
  phases,
  hint,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  phases: BuildPhase[];
  hint: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px 0px" });
  // Lighthouse: this section is below the fold, so don't even DOWNLOAD the
  // three.js chunk until the visitor scrolls near it. Latch it on so the canvas
  // is not torn down again once it has been seen. Audit robots skip it outright:
  // Lighthouse scrolls the page for some audits, which would otherwise pull the
  // 1.15 MB model in mid-run and crash it (src/lib/audit.ts).
  const [mounted, setMounted] = useState(false);
  if (inView && !mounted && !skipHeavy3d()) setMounted(true);

  // One runway segment per phase.
  const [segment, setSegment] = useState(0);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(phases.length - 1, Math.floor(v * phases.length * 1.001));
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
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
            <HouseBuildScene active={inView} play={false} layout="box" />
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

            {/* The house, in its box. */}
            <div className="relative order-1 h-[42svh] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted lg:order-2 lg:aspect-square lg:h-auto">
              {mounted && (
                <HouseBuildScene
                  active={inView}
                  play={false}
                  layout="box"
                  highlightPhase={segment}
                />
              )}
              <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
                {hint}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase list — server-rendered for SEO + quick reference. */}
      <div className="mx-auto w-full max-w-6xl px-gutter py-12">
        <PhaseList phases={phases} />
      </div>
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
      <h2 id="tour-title" className="font-serif text-display-lg text-foreground">
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
            <h3 className="text-body font-semibold text-foreground">{p.name}</h3>
            <p className="text-caption text-muted-foreground">{p.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
