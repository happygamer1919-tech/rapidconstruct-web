"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

/**
 * FacadeCompare — the "Variantă A/B" promise made interactive (RC-127).
 *
 * The owner's own site advertises comparing facade variants in 3D before
 * execution; this shows it instead of describing it. Two renders of the SAME
 * house are stacked and the visitor wipes between them with a draggable
 * handle.
 *
 * Mechanics, deliberately dependency-free:
 * - Position is one number (0-100). Pointer events cover mouse, touch and pen
 *   in one path, so no separate touch handling and no passive-listener fight.
 * - The top image is clipped with `clip-path: inset()` — compositor-friendly,
 *   no layout work per frame, so dragging stays smooth on a phone.
 * - It is a real `<input type="range">` under the hood: keyboard arrows work,
 *   screen readers announce it, and the visual handle is just decoration
 *   riding on the same value. That beats a div with mouse handlers on every
 *   axis that matters (a11y, focus, mobile).
 * - prefers-reduced-motion: no CSS transition on the wipe, so a keyboard user
 *   who wants no animation gets an instant jump instead of an eased slide.
 */
export default function FacadeCompare({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
  ariaLabel,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  ariaLabel: string;
}) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  // Dragging continues even when the pointer leaves the element, which is what
  // a wipe control should do — release anywhere ends it.
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, setFromClientX]);

  const ease = dragging || reduce ? "" : "transition-[clip-path] duration-200";

  return (
    <div
      ref={wrapRef}
      onPointerDown={(e) => {
        setDragging(true);
        setFromClientX(e.clientX);
      }}
      className="relative aspect-[16/10] w-full touch-pan-y select-none overflow-hidden rounded-2xl border border-border bg-muted"
    >
      {/* Variant B underneath, fully painted. */}
      <Image
        src={afterSrc}
        alt={afterLabel}
        fill
        sizes="(min-width: 1024px) 900px, 100vw"
        className="object-cover"
      />
      {/* Variant A on top, clipped to the handle position. */}
      <div
        className={`absolute inset-0 ${ease}`}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeLabel}
          fill
          sizes="(min-width: 1024px) 900px, 100vw"
          className="object-cover"
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink-950/65 px-3 py-1 text-micro font-semibold text-neutral-50 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink-950/65 px-3 py-1 text-micro font-semibold text-neutral-50 backdrop-blur-sm">
        {afterLabel}
      </span>

      {/* Divider + grab handle (decorative; the range input owns the value). */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-0.5 bg-neutral-50/90 ${ease}`}
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-50 text-ink-950 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9 6 4 12l5 6M15 6l5 6-5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuetext={`${Math.round(pos)}% ${beforeLabel}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-strong"
      />
    </div>
  );
}
