"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { skipHeavy3d } from "@/lib/audit";

// Real drone photos of the company's built projects (owner assets, 2026-07-22).
// Shown as a darkened slideshow once the hero build settles.
const SLIDES = [
  "/images/slideshow/slide-1.jpg",
  "/images/slideshow/slide-2.jpg",
  "/images/slideshow/slide-3.jpg",
  "/images/slideshow/slide-4.jpg",
];

/**
 * HeroBuildVideo — homepage hero, one screen tall. Replaces the WebGL hero
 * (HouseBuild/HeroScene) with a 5s build time-lapse generated from the owner's
 * real built house (docs/reference-match/owner-drone-2026-07-22/DJI_0018.jpg →
 * Higgsfield frames + video, 2026-08-03). The 3D house lives on /configurator
 * only, where it is interactive and earns its bundle.
 *
 * Same contract as the hero it replaces:
 * - H1/CTAs are server-rendered instantly; only their fade-in waits.
 * - The build plays once, unveiled, then STAYS built; the copy panel slides in
 *   when the video ends (safety timer in case `ended` never fires).
 * - prefers-reduced-motion: finished house, static, copy immediately.
 * - ?no3d=1 (audit robots, RC-305): no video element at all — the blocking
 *   Lighthouse budget measures a poster-only hero.
 */
export default function HeroBuildVideo({
  eyebrow,
  h1,
  subline,
  trustGuarantee,
  trustMaterials,
  ctaCall,
  ctaQuote,
  phone,
  hint,
}: {
  eyebrow: string;
  h1: string;
  subline: string;
  trustGuarantee: string;
  trustMaterials: string;
  ctaCall: string;
  ctaQuote: string;
  phone: string;
  hint: string;
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Client-only facts (URL param, autoplay ability) must not influence the
  // first render, or hydration mismatches. Decide after mount.
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");
  useEffect(() => {
    // Deferred a tick (same pattern as the 3D hero's useArmed): the lint rule
    // bans synchronous setState in an effect body, and nothing here needs to
    // beat first paint — the blueprint underlay is already correct for both.
    const t = window.setTimeout(() => {
      // Data saver or a 2G/3G estimate: a 3 MB hero video is the wrong
      // trade on that connection — go straight to the still + reel.
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const stingy = Boolean(
        conn?.saveData || /(^|-)[23]g$/.test(conn?.effectiveType ?? ""),
      );
      setMode(skipHeavy3d() || stingy ? "still" : "video");
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // ONE settle signal drives everything downstream: copy reveal, dim, reel.
  //
  // It used to be three independent paths, and `dimmed`/`showReel` were set
  // ONLY inside the video's `onEnded`. On a phone that meant: autoplay gets
  // refused (Low Power Mode, power-saving pause, data saver), `ended` never
  // fires, and the hero sat on a static blueprint with the copy on top — no
  // darkening, no slideshow, forever (owner report 2026-08-05, reproduced:
  // video loaded, paused at 0.13s, reel never mounted).
  //
  // Now: whatever happens to the video, the hero settles and the reel runs.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (mode === "pending") return;
    // Video path: the clip is 5s, so 9s is a generous ceiling for a slow
    // start. Still path: nothing to wait for beyond first paint.
    const t = window.setTimeout(() => setSettled(true), mode === "still" ? 400 : 9000);
    return () => window.clearTimeout(t);
  }, [mode]);

  // If autoplay is refused (Low Power Mode, data saver), don't leave the hero
  // frozen on the blueprint frame: show the finished house instead.
  useEffect(() => {
    if (mode !== "video" || reduce) return;
    const v = videoRef.current;
    if (!v) return;
    // Only NotAllowedError means autoplay is truly blocked (Low Power Mode,
    // data saver). AbortError just means the element re-rendered mid-play()
    // (StrictMode double-mount in dev) — falling back on it would wrongly
    // freeze the hero on the finished still and skip the build.
    const tryPlay = () => {
      const p = v.play();
      if (p)
        p.catch((err: DOMException) => {
          if (err?.name === "NotAllowedError") setMode("still");
        });
    };
    tryPlay();
    // Error names are not enough. Browsers also pause "video-only background
    // media to save power" and reject with AbortError, which we must ignore
    // (StrictMode raises the same one). So judge by BEHAVIOUR: if the clip has
    // not advanced ~1.6s after we asked, it is not going to play — fall back
    // to the finished still so the reel can take over.
    const stall = window.setTimeout(() => {
      if (v.paused && v.currentTime < 0.5) setMode("still");
    }, 1600);
    // A tab loaded in the background keeps the video paused at frame 0 (the
    // one-shot play() above fires while hidden and never retries; some
    // embedders suspend media outright). Retry when the tab becomes visible
    // so those visitors still get the build instead of a frozen blueprint.
    const onVisible = () => {
      if (document.visibilityState === "visible" && v.paused && !v.ended)
        tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(stall);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [mode, reduce]);

  // Once settled: FIRST the hero dims over the finished house (owner feedback
  // 2026-08-04: the darkening must be visible before the slides, not arrive
  // glued to them), THEN the reel of real project photos starts under that
  // same dark wash. Driven by `settled`, so it runs whether the video played,
  // stalled or was never offered — the reel is the payoff for phone visitors
  // who never see the build at all.
  const [dimmed, setDimmed] = useState(false);
  const [showReel, setShowReel] = useState(false);
  const [reelIn, setReelIn] = useState(false);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!showReel) return;
    const t = window.setTimeout(() => setReelIn(true), 30);
    return () => window.clearTimeout(t);
  }, [showReel]);
  useEffect(() => {
    if (!settled) return;
    const t1 = window.setTimeout(() => setDimmed(true), 700);
    const t2 = window.setTimeout(() => setShowReel(true), 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [settled]);
  useEffect(() => {
    if (!showReel) return;
    const t = window.setInterval(() => {
      // Don't burn slides (or battery) while the tab is hidden.
      if (document.visibilityState === "visible")
        setSlide((s) => (s + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [showReel]);

  const heroBlock = (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="micro-label text-accent-strong">{eyebrow}</p>
      <h1 className="font-serif text-display-xl text-foreground">{h1}</h1>
      {/* Column widths inherited from the 3D hero: they exist so no line runs
          off the translucent panel onto the busy image, where contrast died. */}
      <p className="max-w-md text-body-lg text-muted-foreground lg:max-w-sm">
        {subline}
      </p>
      {/* RC-124 (owner picked V2, refined): the GUARANTEE alone sits in the
          orange badge so it always fits one row; the materials note stays
          plain text beside it. rounded-md rather than a full pill, and no
          shadow, so it reads as a label — not a third pressable button. */}
      <p className="flex max-w-md flex-wrap items-center gap-x-3 gap-y-2 text-caption">
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-accent px-3 py-1.5 font-semibold text-accent-foreground">
          <Icon name="shield" size={16} className="shrink-0" />
          {trustGuarantee}
        </span>
        <span className="font-medium text-muted-foreground">
          {trustMaterials}
        </span>
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
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/hero/hero-finished.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-svh w-full overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        {/* Underlay still = the video's FIRST frame (blueprint), so the video
            takes over seamlessly and there is no finished-house spoiler flash
            before the build. The "still" mode swaps it for the finished house.
            This <Image> is the LCP element and is priority-loaded. */}
        <Image
          src={
            mode === "still"
              ? "/images/hero/hero-finished.jpg"
              : "/images/hero/hero-blueprint.jpg"
          }
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {mode === "video" && (
          <video
            ref={videoRef}
            // autoPlay in addition to the manual play() below: the attribute
            // lets the BROWSER start playback when it becomes possible (e.g.
            // the tab was hidden during mount, where a one-shot play() call
            // just stays paused forever). The manual call exists only to
            // detect NotAllowedError and fall back to the finished still.
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setSettled(true)}
            // No `loop`: the house builds ONCE and stays built (hero contract).
            // The element holds its last frame after `ended`.
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          >
            <source src="/videos/hero-build.mp4" type="video/mp4" />
          </video>
        )}
        {/* Post-build reel: real project photos with a LIVING Ken Burns pass —
            each slide gets its own camera move (zoom in / zoom out / pan left
            / pan right, .ken-0..3) so the reel never sits still (owner
            feedback 2026-08-04: static slides looked cheap). Transform and
            opacity only (motion guardrails). Mounted only once the reel
            starts, so these ~500KB images never compete with the video. */}
        {showReel && (
          <div
            aria-hidden
            // CSS transition, not a JS-driven one: browsers throttle
            // requestAnimationFrame on phones (background tabs, low power),
            // which froze this fade part-way. Compositor transitions keep
            // running regardless. `reelIn` flips one tick after mount so the
            // browser has an initial opacity-0 frame to animate from.
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
              reelIn ? "opacity-100" : "opacity-0"
            }`}
          >
            {SLIDES.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="100vw"
                className={`object-cover transition-opacity duration-[1500ms] ${
                  i === slide ? `opacity-100 ken-${i % 4}` : "opacity-0"
                }`}
              />
            ))}
          </div>
        )}
        {/* The dark wash lives ABOVE both the held video frame and the reel:
            it fades in on its own, right after the build settles, so the
            scene visibly dims before the first slide arrives. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-ink-950/45 transition-opacity duration-[1200ms] ease-in-out ${
            dimmed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-6xl flex-col justify-start px-gutter pb-8 pt-10 lg:justify-center lg:pb-0 lg:pt-0">
        {/* Translucent blurred panel behind the copy only — the owner-approved
            legibility treatment from the 3D hero (2026-07-23). */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto w-fit rounded-3xl bg-neutral-100/92 p-6 backdrop-blur-md ring-1 ring-ink-950/5 lg:p-7"
        >
          {heroBlock}
        </motion.div>
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={settled ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pointer-events-none absolute bottom-5 right-6 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm"
      >
        {hint}
      </motion.span>
    </section>
  );
}
