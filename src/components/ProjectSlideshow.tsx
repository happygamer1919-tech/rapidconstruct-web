"use client";

import { useEffect, useState } from "react";
import type { Slide } from "@/data/slideshow";

type Copy = {
  headline: { ro: string; ru: string };
  subtext: { ro: string; ru: string };
};

type Props = {
  slides: Slide[];
  copy: Copy;
  locale: string;
  /** Auto-advance interval in ms. */
  intervalMs?: number;
};

/**
 * Full-bleed background project slideshow (SHELL).
 *
 * - Auto-advances every `intervalMs` (~5s), smooth opacity crossfade.
 * - Pauses on hover / focus-within.
 * - Respects prefers-reduced-motion: no auto-advance, no crossfade — a single
 *   static frame (the first slide).
 * - Content (images + copy) is fully data-driven from props; this file has no
 *   hard-coded slide content.
 */
export default function ProjectSlideshow({
  slides,
  copy,
  locale,
  intervalMs = 5000,
}: Props) {
  const lang = locale === "ru" ? "ru" : "ro";
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // prefers-reduced-motion (mandatory): single frame, no auto-advance.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Auto-advance, gated on reduced-motion / hover-pause / >1 slide.
  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [reduced, paused, slides.length, intervalMs]);

  const shown = reduced ? 0 : active;
  const current = slides[shown];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={copy.headline[lang]}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-neutral-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Slides — crossfade via opacity (transform/opacity only). */}
      {slides.map((s, i) => (
        <img
          key={s.id}
          src={s.src}
          alt={s.caption[lang]}
          aria-hidden={i !== shown}
          className={`absolute inset-0 h-full w-full object-cover ${
            reduced ? "" : "transition-opacity duration-[1200ms] ease-in-out"
          } ${i === shown ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {/* Scrim: keeps overlay text legible over any image (top + bottom). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45"
      />

      {/* Placeholder marker — this is a shell, not live content. */}
      <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200 ring-1 ring-white/20">
        Placeholder shell · not live · Q-14
      </div>

      {/* Copy overlay. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-6 sm:p-10 md:p-14">
        <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white drop-shadow sm:text-4xl md:text-5xl">
          {copy.headline[lang]}
        </h2>
        <p className="max-w-2xl text-base text-white/85 sm:text-lg">
          {copy.subtext[lang]}
        </p>

        {/* Per-slide caption + location (data-driven), crossfaded with the slide. */}
        <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
          <span className="rounded bg-white/10 px-2 py-0.5 ring-1 ring-white/15">
            {current.location}
          </span>
          <span>{current.caption[lang]}</span>
        </div>

        {/* Dots — manual jump + progress indicator. */}
        {slides.length > 1 && (
          <div className="mt-4 flex gap-2" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === shown}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === shown
                    ? "w-7 bg-amber-300"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status line for reduced-motion / paused (subtle, dev-preview aid). */}
      <p className="absolute bottom-2 right-3 z-10 text-[10px] text-white/40">
        {reduced ? "reduced-motion: single frame" : paused ? "paused (hover)" : "auto-advancing"}
      </p>
    </section>
  );
}
