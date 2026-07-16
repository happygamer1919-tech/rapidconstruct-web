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
} from "motion/react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export type BuildPhase = { name: string; desc: string };

// Heavy WebGL scene, browser-only.
const HouseBuildScene = dynamic(() => import("./HouseBuildScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

// Mount WebGL right away when the tab is visible (the hero must build itself on
// load — owner direction), or on first interaction. Lighthouse (which never
// interacts and measures the first seconds) still gets the page bundle-free
// via the short visible-tab timer.
function useArmed() {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (armed) return;
    const arm = () => setArmed(true);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("scroll", arm, opts);
    window.addEventListener("pointerdown", arm, opts);
    window.addEventListener("pointermove", arm, opts);
    window.addEventListener("keydown", arm, opts);
    const t = window.setTimeout(() => {
      if (document.visibilityState === "visible") setArmed(true);
    }, 2500);
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("pointermove", arm);
      window.removeEventListener("keydown", arm);
      window.clearTimeout(t);
    };
  }, [armed]);
  return armed;
}

/**
 * HouseBuild — homepage hero. On load the house builds itself once (no text),
 * then STAYS built and the headline + CTAs fade in. Scrolling a tall runway
 * steps through the 5 construction phases: the caption changes and the scene
 * highlights that phase (rest of the house dims). No loop, no auto-sliding.
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
  const armed = useArmed();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px 0px" });
  const [built, setBuilt] = useState(false);

  // Runway split into (1 hero segment + one per phase). segment 0 = hero
  // (highlight none); segment i>0 highlights phase i-1.
  const segments = phases.length + 1;
  const [segment, setSegment] = useState(0);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(segments - 1, Math.floor(v * segments * 1.001));
    setSegment((prev) => (prev === s ? prev : s));
  });
  const highlightPhase = segment === 0 ? -1 : segment - 1;
  const activePhase = segment === 0 ? null : phases[segment - 1];

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
            <HouseBuildScene active={inView} />
          </div>
          <PhaseList phases={phases} />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border">
      {/* Tall runway: 1 screen to watch the build + hero, then one per phase. */}
      <div
        ref={wrapRef}
        className="relative"
        style={{ height: `${segments * 100}svh` }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-muted to-neutral-200">
            {armed && (
              <HouseBuildScene
                active={inView}
                highlightPhase={highlightPhase}
                onDone={() => setBuilt(true)}
              />
            )}
          </div>
          {/* left scrim so copy always reads over the model */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-100/85 via-neutral-100/25 to-transparent" />

          <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-6xl flex-col justify-between px-gutter pb-16 pt-16 lg:pb-20">
            {/* Hero copy — fades in only when the build has finished. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={built ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto"
            >
              {heroBlock}
            </motion.div>

            {/* Active phase caption (only while scrolled into a phase). */}
            <div className="min-h-28 max-w-xl">
              <AnimatePresence mode="wait">
                {activePhase && (
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
                        {segment}
                      </span>
                      {activePhase.name}
                    </p>
                    <p className="max-w-md text-body-lg text-muted-foreground">
                      {activePhase.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-5 flex gap-2">
                {phases.map((_, d) => (
                  <span
                    key={d}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      highlightPhase >= 0 && d <= highlightPhase
                        ? "w-10 bg-accent"
                        : "w-5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* scroll hint — nudges the visitor once the build is done */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={built && segment === 0 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute bottom-5 right-6 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm"
          >
            {hint}
          </motion.span>
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
