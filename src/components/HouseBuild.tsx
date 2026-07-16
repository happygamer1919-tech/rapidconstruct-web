"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

// Heavy WebGL scene, browser-only.
const HouseBuildScene = dynamic(() => import("./HouseBuildScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

// Mount WebGL right away when the tab is visible (the hero must build itself on
// load — owner direction), or on first interaction. Lighthouse (which never
// interacts and measures the first seconds) still gets the page bundle-free
// via the short visible-tab timer.
// The hero frames the house differently on a phone (below the copy) than on a
// desktop (beside it) — that is a camera/position change, not just CSS.
function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

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
 * HouseBuild — homepage hero, one screen tall. On load the house builds itself
 * once (no text), then STAYS built and the headline + CTAs slide in. The
 * phase-by-phase scroll story lives further down the page in HouseTour, so the
 * hero stays a single screen and never holds the visitor on a long runway.
 * Reduced motion: finished house, static.
 */
export default function HouseBuild({
  eyebrow,
  h1,
  subline,
  trust,
  ctaCall,
  ctaQuote,
  phone,
  hint,
}: {
  eyebrow: string;
  h1: string;
  subline: string;
  trust: string;
  ctaCall: string;
  ctaQuote: string;
  phone: string;
  hint: string;
}) {
  const reduce = useReducedMotion();
  const armed = useArmed();
  const narrow = useIsNarrow();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px 0px" });
  const [built, setBuilt] = useState(false);

  const heroBlock = (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h1 className="font-serif text-display-xl text-foreground">{h1}</h1>
      {/* max-w-md, not -xl: the long service list used to run out past the
          scrim onto the beige wall, where muted grey stopped reading. */}
      <p className="max-w-md text-body-lg text-muted-foreground">{subline}</p>
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
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapRef}
      className="relative h-svh w-full overflow-hidden border-b border-border"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-muted to-neutral-200">
        {armed && (
          <HouseBuildScene
            active={inView}
            layout={narrow ? "heroMobile" : "hero"}
            onDone={() => setBuilt(true)}
          />
        )}
      </div>
      {/* Scrim so the copy always reads over the model. Muted grey text on the
          beige wall measured ~1:1 — invisible. Desktop gets a LEFT scrim (copy
          left, house right); a phone has no side space, so it gets a TOP-DOWN
          scrim instead and the copy sits up top, clear of the house. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-100 from-38% via-neutral-100/60 via-50% to-transparent to-58% lg:bg-gradient-to-r lg:from-15% lg:via-neutral-100/70 lg:via-45% lg:to-70%" />

      <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-6xl flex-col justify-start px-gutter pt-20 lg:justify-center lg:pt-0">
        {/* Hero copy — slides in only once the build has finished. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={built ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto"
        >
          {heroBlock}
        </motion.div>
      </div>

      {/* scroll hint — nudges the visitor down to the tour once the build ends */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={built ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pointer-events-none absolute bottom-5 right-6 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm"
      >
        {hint}
      </motion.span>
    </section>
  );
}
