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

export type RoofLayer = { name: string; desc: string };

// Heavy WebGL scene, browser-only.
const RoofCutawayScene = dynamic(() => import("./RoofCutawayScene"), {
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
 * RoofCutaway — a full-bleed roof section that is BUILT when you reach it and
 * opens up layer-by-layer as you scroll through a tall runway (native scroll,
 * no hijack). The matching layer description fades in per stage. Reduced motion:
 * fully built static view + the plain list, no pinning. The full legend stays
 * server-rendered below for SEO and reference.
 */
export default function RoofCutaway({
  eyebrow,
  title,
  intro,
  layers,
  hint,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  layers: RoofLayer[];
  hint: string;
}) {
  const reduce = useReducedMotion();
  const interacted = useInteracted();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "300px 0px" });

  const [mount3d, setMount3d] = useState(false);
  if (interacted && inView && !mount3d) setMount3d(true);

  // Scroll progress across the runway -> explode 0..1 (springed for feel).
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const explodeValue = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });

  // Which layer's card is on screen (0..n-1), derived from progress.
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(layers.length - 1, Math.floor(v * layers.length * 1.02));
    setStage((prev) => (prev === s ? prev : s));
  });

  if (reduce) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-gutter py-16">
        <Header eyebrow={eyebrow} title={title} intro={intro} />
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
          {mount3d && <RoofCutawayScene explode={1} active={inView} />}
        </div>
        <LayerList layers={layers} />
      </div>
    );
  }

  return (
    <>
      {/* Scroll runway: ~1 screen per layer keeps the opening comfortable. */}
      <div ref={wrapRef} className="relative" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* 3D fills the section as a background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-muted to-neutral-200">
            {mount3d && (
              <RoofCutawayScene explodeValue={explodeValue} active={inView} />
            )}
          </div>

          {/* legibility scrim (left + bottom) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-100/70 to-transparent md:via-neutral-100/45" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-100/80 to-transparent" />

          {/* heading + active layer description overlaid */}
          <div className="relative mx-auto flex h-svh w-full max-w-6xl flex-col justify-center gap-6 px-gutter">
            <Header
              eyebrow={eyebrow}
              title={title}
              intro={intro}
              className="max-w-lg"
            />

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
                      {layers[stage].name}
                    </h3>
                    <p className="text-body-lg text-muted-foreground">
                      {layers[stage].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 flex gap-2">
                {layers.map((_, i) => (
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

      {/* Full legend below — server-rendered for SEO + quick reference. */}
      <div className="mx-auto w-full max-w-6xl px-gutter py-12">
        <LayerList layers={layers} />
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

function LayerList({ layers }: { layers: RoofLayer[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
      {layers.map((l, i) => (
        <li key={l.name} className="flex items-start gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-body font-semibold lining-nums text-accent-strong">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-body font-semibold text-foreground">
              {l.name}
            </h3>
            <p className="text-caption text-muted-foreground">{l.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
