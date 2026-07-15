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
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-800 to-neutral-300">
      <span className="micro-label text-neutral-50/80">Model 3D…</span>
    </div>
  ),
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
 * RoofCutaway v3 — SCROLL-DRIVEN story (owner request): the section pins on
 * screen while ~3 extra viewport-heights of scroll pull the 5 layers apart;
 * the matching layer card fades in per stage. Native scroll only (no
 * hijacking — the page keeps scrolling normally through a tall runway).
 * Reduced motion: static exploded view + plain full list, no pinning.
 * The full legend stays server-rendered below for SEO and reference.
 */
export default function RoofCutaway({
  layers,
  hint,
}: {
  layers: RoofLayer[];
  hint: string;
}) {
  const reduce = useReducedMotion();
  const interacted = useInteracted();
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
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

  // Which layer's card is on screen (0..4), derived from progress.
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(layers.length - 1, Math.floor(v * layers.length * 1.02));
    setStage((prev) => (prev === s ? prev : s));
  });

  if (reduce) {
    // Static variant: exploded model + the plain list, no pinning.
    return (
      <div className="flex flex-col gap-8">
        <div
          ref={wrapRef}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted"
        >
          <div ref={boxRef} className="absolute inset-0">
            {mount3d ? (
              <RoofCutawayScene explode={1} active={inView} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-muted" />
            )}
          </div>
        </div>
        <LayerList layers={layers} />
      </div>
    );
  }

  return (
    <>
      {/* Scroll runway: ~1 screen per layer keeps the pace comfortable. */}
      <div ref={wrapRef} className="relative" style={{ height: "320vh" }}>
        <div className="sticky top-0 flex h-svh items-center">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-gutter lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
              {mount3d ? (
                <RoofCutawayScene explodeValue={explodeValue} active={inView} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-muted" />
              )}
              <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
                {hint}
              </span>
            </div>

            {/* Active layer card — swaps as the visitor scrolls. */}
            <div className="relative min-h-40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-h3 font-semibold lining-nums text-accent-strong">
                    {stage + 1}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-h2 text-foreground">
                      {layers[stage].name}
                    </h3>
                    <p className="max-w-sm text-body-lg text-muted-foreground">
                      {layers[stage].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
              {/* Progress dots */}
              <div className="mt-8 flex gap-2">
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
        </div>
      </div>

      {/* Full legend below — server-rendered for SEO + quick reference. */}
      <LayerList layers={layers} />
    </>
  );
}

function LayerList({ layers }: { layers: RoofLayer[] }) {
  return (
    <ol className="flex flex-col divide-y divide-border border-y border-border">
      {layers.map((l, i) => (
        <li key={l.name} className="flex items-start gap-4 py-4">
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
