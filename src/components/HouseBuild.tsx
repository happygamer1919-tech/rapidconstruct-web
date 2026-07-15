"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export type BuildPhase = { name: string; desc: string };

// Heavy WebGL scene, browser-only.
const HouseBuildScene = dynamic(() => import("./HouseBuildScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

// Mount heavy WebGL only after visitor intent (perf gate — Lighthouse: the
// hero H1 paints instantly, the three.js chunk downloads on first scroll).
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
 * HouseBuild — the homepage HERO (owner direction): the design->construction
 * house is pinned as a full-bleed background, and the text itself scrolls
 * over it as slides — first the H1 + CTAs, then one slide per construction
 * phase, its copy sliding through while that part of the house builds.
 * Scroll is native (no hijack); the 3D reads a springed scroll MotionValue.
 * Reduced motion: finished house, static, with the plain phase list.
 */
export default function HouseBuild({
  eyebrow,
  h1,
  subline,
  trust,
  ctaCall,
  ctaQuote,
  phone,
  phases,
  hint,
}: {
  eyebrow: string;
  h1: string;
  subline: string;
  trust: string;
  ctaCall: string;
  ctaQuote: string;
  phone: string;
  phases: BuildPhase[];
  hint: string;
}) {
  const reduce = useReducedMotion();
  const interacted = useInteracted();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "300px 0px" });

  const [mount3d, setMount3d] = useState(false);
  if (interacted && inView && !mount3d) setMount3d(true);

  // Slide k sits at progress k/(slides-1); phase i's slide is k = i+1, so
  // build = progress makes each phase finish just as its slide is centered.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Firm spring: tracks fast scrolling closely (a soft one let pieces trail
  // behind and feel chaotic when jumping several screens at once).
  const buildValue = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    mass: 0.5,
  });

  const heroBlock = (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h1 className="font-serif text-display-xl text-foreground">{h1}</h1>
      <p className="max-w-xl text-body-lg text-muted-foreground">{subline}</p>
      <p className="flex items-center gap-2 text-caption font-medium text-foreground">
        <Icon name="shield" size={18} className="shrink-0 text-accent-strong" />
        {trust}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          <Icon name="phone" size={18} />
          {ctaCall}
        </a>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-body font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          {ctaQuote}
          <Icon name="arrowRight" size={18} />
        </Link>
      </div>
    </div>
  );

  if (reduce) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-gutter py-16">
          {heroBlock}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
            {mount3d && <HouseBuildScene build={1} active={inView} />}
          </div>
          <PhaseList phases={phases} />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border">
      <div ref={wrapRef} className="relative">
        {/* Pinned 3D background — the house builds behind the passing text. */}
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-muted to-neutral-200">
            {mount3d && <HouseBuildScene buildValue={buildValue} active={inView} />}
          </div>
          {/* soft scrim so passing copy always reads */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-100/80 via-neutral-100/25 to-transparent" />
          <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
            {hint}
          </span>
        </div>

        {/* Text slides — normal document flow scrolling OVER the pinned 3D.
            pointer-events pass through empty space so the model stays
            draggable; only the cards themselves catch the cursor. */}
        <div className="pointer-events-none relative z-10 -mt-[100svh]">
          {/* Slide 1 — the hero itself (SSR, instant LCP) */}
          <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-gutter">
            <div className="pointer-events-auto">{heroBlock}</div>
          </div>

          {/* One slide per construction phase */}
          {phases.map((p, i) => (
            <div
              key={p.name}
              className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-gutter"
            >
              <div className="pointer-events-auto flex max-w-md items-start gap-4 rounded-2xl bg-neutral-100/75 p-6 backdrop-blur-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-h3 font-semibold lining-nums text-accent-strong">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-serif text-h2 text-foreground">{p.name}</h2>
                  <p className="text-body-lg text-muted-foreground">{p.desc}</p>
                  <div className="mt-3 flex gap-2">
                    {phases.map((_, d) => (
                      <span
                        key={d}
                        className={`h-1.5 rounded-full ${
                          d <= i ? "w-8 bg-accent" : "w-4 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase list — server-rendered for SEO + quick reference. */}
      <div className="mx-auto w-full max-w-6xl px-gutter py-12">
        <PhaseList phases={phases} />
      </div>
    </section>
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
