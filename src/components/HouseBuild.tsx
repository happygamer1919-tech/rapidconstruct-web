"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { Icon } from "@/components/icons";

export type BuildPhase = { name: string; desc: string };

// Heavy WebGL scene, browser-only.
const HouseBuildScene = dynamic(() => import("./HouseBuildScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

// Mount heavy WebGL only after visitor intent (perf gate — Lighthouse).
function useInteracted() {
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (interacted) return;
    const arm = () => setInteracted(true);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("scroll", arm, opts);
    window.addEventListener("pointerdown", arm, opts);
    window.addEventListener("keydown", arm, opts);
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [interacted]);
  return interacted;
}

/**
 * HouseBuild — homepage design->construction story: the house stands as a
 * translucent 3D blueprint when you reach it, then builds itself piece by
 * piece as you scroll a tall native-scroll runway (no hijack), with the
 * matching construction-phase card per stage. Reduced motion: fully built
 * static view + the plain phase list, no pinning. The phase list is also
 * server-rendered below for SEO and reference.
 */
export default function HouseBuild({
  eyebrow,
  title,
  intro,
  phases,
  points,
  hint,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  phases: BuildPhase[];
  points: string[];
  hint: string;
}) {
  const reduce = useReducedMotion();
  const interacted = useInteracted();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "300px 0px" });

  const [mount3d, setMount3d] = useState(false);
  if (interacted && inView && !mount3d) setMount3d(true);

  // Scroll progress across the runway -> build 0..1 (springed for feel).
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Soft, slow spring — pieces settle in rather than snapping.
  const buildValue = useSpring(scrollYProgress, {
    stiffness: 42,
    damping: 26,
    mass: 0.9,
  });

  // Which phase's card is on screen (0..n-1), derived from progress.
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(phases.length - 1, Math.floor(v * phases.length * 1.02));
    setStage((prev) => (prev === s ? prev : s));
  });

  if (reduce) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-gutter py-16">
        <Header eyebrow={eyebrow} title={title} intro={intro} />
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
          {mount3d && <HouseBuildScene build={1} active={inView} />}
        </div>
        <PhaseList phases={phases} points={points} />
      </div>
    );
  }

  return (
    <>
      {/* Scroll runway: ~1 screen per phase keeps the build comfortable. */}
      <div ref={wrapRef} className="relative" style={{ height: "520vh" }}>
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* 3D fills the section as a background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-muted to-neutral-200">
            {mount3d && <HouseBuildScene buildValue={buildValue} active={inView} />}
          </div>

          {/* legibility scrim (left + bottom) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-100/70 to-transparent md:via-neutral-100/45" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-100/80 to-transparent" />

          {/* heading + active phase card overlaid */}
          <div className="relative mx-auto flex h-svh w-full max-w-6xl flex-col justify-center gap-6 px-gutter">
            <Header eyebrow={eyebrow} title={title} intro={intro} className="max-w-lg" />

            <div className="relative min-h-36 max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-h3 font-semibold lining-nums text-accent-strong">
                    {stage + 1}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-h2 text-foreground">
                      {phases[stage].name}
                    </h3>
                    <p className="text-body-lg text-muted-foreground">
                      {phases[stage].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 flex gap-2">
                {phases.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= stage ? "w-8 bg-accent" : "w-4 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
            {hint}
          </span>
        </div>
      </div>

      {/* Phase list below — server-rendered for SEO + quick reference. */}
      <div className="mx-auto w-full max-w-6xl px-gutter py-12">
        <PhaseList phases={phases} points={points} />
      </div>
    </>
  );
}

function Header({
  eyebrow,
  title,
  intro,
  className = "",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h2 className="font-serif text-display-lg text-foreground">{title}</h2>
      <p className="text-body-lg text-muted-foreground">{intro}</p>
    </div>
  );
}

function PhaseList({
  phases,
  points,
}: {
  phases: BuildPhase[];
  points: string[];
}) {
  return (
    <div className="flex flex-col gap-8">
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
      <ul className="flex flex-wrap gap-x-8 gap-y-3">
        {points.map((point) => (
          <li
            key={point}
            className="inline-flex items-center gap-2 text-caption font-medium text-muted-foreground"
          >
            <Icon name="cube" size={16} className="shrink-0 text-accent-strong" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
