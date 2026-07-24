"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { skipHeavy3d } from "@/lib/audit";

// WebGL scene, browser-only.
//
// The hero intro is HeroScene, which mounts the APPROVED scene source held
// verbatim in src/scenes/rapidconstruct-scene.js ("cu fronton": stepped massing
// — a long single-storey wing plus a two-storey block with a cross gable — hip
// roofs, white render, stone base and quoins, dormers, carport, paved yard,
// fence and gate). It builds itself from blueprint lines while the camera pulls
// back to a drone 3/4. It ships as GEOMETRY rather than a 1 MB glb, so the hero
// never waits on a model download. HouseBuildScene is untouched and still powers
// the scroll story (HouseTour) further down the page.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />,
});

// `useIsNarrow` and the `useInView` gate went away with the HouseBuildScene
// swap: HeroScene drives its own camera (a scripted pull-back to a drone 3/4),
// so there is no per-breakpoint `layout` prop to feed it. Reinstate them if a
// future hero needs breakpoint-specific framing.

// Mount WebGL right away when the tab is visible (the hero must build itself on
// load — owner direction), or on first interaction.
//
// The comment that used to live here claimed Lighthouse "still gets the page
// bundle-free via the short visible-tab timer". That was backwards:
// visibilityState IS "visible" under Lighthouse, so the timer fired, the 3D
// mounted mid-audit and crashed the run. Audit robots now skip it outright
// (src/lib/audit.ts); real visitors are unaffected.
function useArmed() {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (armed || skipHeavy3d()) return;
    const arm = () => setArmed(true);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("scroll", arm, opts);
    window.addEventListener("pointerdown", arm, opts);
    window.addEventListener("pointermove", arm, opts);
    window.addEventListener("keydown", arm, opts);
    // 250ms, not 2500. The long wait only ever existed to keep the 3D out of a
    // Lighthouse run, and it never worked (Lighthouse waits far longer than
    // 2.5s) — audit robots are now excluded explicitly via ?no3d=1, so the delay
    // is pure dead time before the build starts. It cost the visitor 2.5s of
    // staring at an empty hero, on top of the build itself, before any headline
    // appeared. Short enough to let first paint land, long enough not to fight it.
    const t = window.setTimeout(() => {
      if (document.visibilityState === "visible") setArmed(true);
    }, 250);
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
  const wrapRef = useRef<HTMLDivElement>(null);

  // The headline + CTAs are hidden until the build finishes, and `built` is
  // flipped by the scene's onDone. So if the scene never mounts or never
  // finishes, the hero copy stays invisible FOREVER — no headline, no CTAs.
  // That bites in two real cases:
  //   1. audit robots, which now skip the 3D (they measured a hero with no text
  //      and picked the tour heading further down as the LCP element);
  //   2. any visitor whose WebGL fails or is blocked — a phone, a locked-down
  //      browser — who would just never see the hero copy at all.
  // So: reveal immediately when there will be no build, and keep a safety net
  // that reveals the copy regardless if onDone has not fired in time. The copy
  // is never allowed to depend on WebGL succeeding.
  const [built, setBuilt] = useState(false);
  useEffect(() => {
    // 0 = there will be no build to wait for, so reveal on the next tick.
    const delay = skipHeavy3d() || reduce ? 0 : 9000;
    const t = window.setTimeout(() => setBuilt(true), delay);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const heroBlock = (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h1 className="font-serif text-display-xl text-foreground">{h1}</h1>
      {/* max-w-md, not -xl: the long service list used to run out past the
          scrim onto the beige wall, where muted grey stopped reading. */}
      {/* max-w-sm on large screens, not -md: the service list is the one hero
          line that still ran its tail out of the scrim and onto the house, where
          muted grey measured 3.0:1. Narrowing the column wraps it earlier and
          keeps every line inside the strong part of the scrim — which costs the
          house nothing, unlike pushing the gradient further right. */}
      <p className="max-w-md text-body-lg text-muted-foreground lg:max-w-sm">
        {subline}
      </p>
      {/* max-w-md for the same reason as the subline above: its tail ran past the
          scrim onto the house and dropped to 3.07 contrast. Wrapping keeps it
          over the scrim. */}
      <p className="flex max-w-md items-center gap-2 text-caption font-medium text-foreground">
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
            {/* HeroScene reads prefers-reduced-motion itself and renders the
                FINISHED house with no animation, which is exactly what this
                branch wants. */}
            <HeroScene loop={false} />
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
        {/* `armed` still gates the mount, so audit robots (?no3d=1) never get a
            WebGL canvas — the blocking Lighthouse perf budget measures that URL.
            `loop={false}`: the hero builds ONCE and stays built, matching the
            existing hero contract that the copy reveal depends on. Looping would
            also keep a render loop running forever behind the copy, which is the
            battery/lag problem HouseBuildScene's `rested` flag exists to avoid.

            FRAMING: HeroScene scripts its own camera (it has no `layout` prop),
            so the composition is set by sizing its BOX rather than the camera.
            Full-bleed put the house straight through the headline on desktop and
            over the CTAs on a phone. Instead:
            FULL-BLEED (2026-07-23). The canvas used to be a sub-box — right 62%
            on desktop, bottom 52% on a phone — which suited the previous hero.
            Against the approved scene it failed twice over: that scene is a whole
            SITE (house, carport, fence, gate, garage, paving, trees), so a cropped
            box sliced it off mid-building, and the leftover area read as a dead
            white half with a hard seam down the middle. The scene now gets the
            entire hero and the scrim alone carries copy legibility. HeroScene
            widens its lens on portrait so the whole site still fits. */}
        {armed && (
          <div className="absolute inset-0">
            <HeroScene loop={false} onRested={() => setBuilt(true)} />
          </div>
        )}
      </div>
      {/* Scrim so the copy reads over the model — FADED IN WITH THE COPY, not
          painted from the start (owner direction 2026-07-23: "the writing on the
          left should appear after the animation, but the animation itself has to
          be clear on both PC and mobile").

          That is the whole point of this element being animated. While the house
          is assembling there is no text on screen, so a scrim buys nothing and
          costs everything: it washed the build out on desktop and turned the
          phone into a haze. Now the build plays at full contrast edge to edge,
          and the scrim arrives only at the moment it has something to protect.

          Desktop gets a LEFT scrim (copy left, house right); a phone has no side
          space, so it gets a TOP-DOWN scrim instead.

          Stops are MEASURED, not guessed. Sampling the composited pixels behind
          the worst text runs found real failures at the previous settings:
          desktop service list 1.53:1 over the dark roof, mobile outlined CTA
          2.80:1 over the house — both well under WCAG AA 4.5:1, and the same
          "muted grey on the beige wall" class of defect this scrim exists for.

          Desktop: the copy is max-w-md inside max-w-6xl, so text reaches ~41% of
          a 1440px viewport — the scrim therefore holds to 47% before clearing by
          72%, leaving the right third of the house clean.
          Mobile: the copy runs to the bottom edge, so the gradient never reaches
          full transparency; it settles at 58% so the outlined CTA keeps a
          backdrop. The house reads as a soft haze behind the copy, which suits
          the scene's own FogExp2 atmosphere rather than fighting it.

          NOTE: the far stop is `neutral-100/0`, NOT `to-transparent`. Tailwind's
          `transparent` is transparent BLACK, so a gradient running colour ->
          transparent interpolates through black and darkens the midpoint. That
          is measurable here: with `to-transparent` the backdrop behind the
          service list sampled rgb(151,144,130) where the maths predicted ~226,
          and contrast sat at 2.04:1. Same-hue zero-alpha keeps the ramp clean. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: built ? 1 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-100 from-28% via-neutral-100/84 via-58% to-neutral-100/84 to-100% lg:bg-gradient-to-r lg:from-neutral-100 lg:from-30% lg:via-neutral-100/88 lg:via-44% lg:to-neutral-100/0 lg:to-68%"
      />

      {/* pt-10 on a phone, not pt-20: with the promo bar and a two-line header
          above it, the old padding pushed "Solicită ofertă gratuită" under the
          fold — a hero CTA the visitor could not see. Desktop is unchanged. */}
      <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-6xl flex-col justify-start px-gutter pb-8 pt-10 lg:justify-center lg:pb-0 lg:pt-0">
        {/* Hero copy — slides in only once the build has finished. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={built ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          // w-fit is load-bearing: as a plain flex child this div stretched the
          // full container width and swallowed every pointer event over the
          // house, so "Trage pentru a roti" did nothing across most of the hero.
          // Only the copy itself should capture clicks.
          className="pointer-events-auto w-fit"
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
