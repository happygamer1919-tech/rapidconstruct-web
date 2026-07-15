"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView, useReducedMotion } from "motion/react";

export type RoofLayer = { name: string; desc: string };

// Heavy WebGL scene, browser-only (same pattern as Model3D).
const RoofCutawayScene = dynamic(() => import("./RoofCutawayScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-800 to-neutral-300">
      <span className="micro-label text-neutral-50/80">Model 3D…</span>
    </div>
  ),
});

/**
 * Interactive exploded view of a metal-tile roof build-up (RC-103 signature 3D).
 * A slider pulls the 5 layers apart; the numbered legend explains each. Layers
 * and copy come from the message catalog (RO source of truth). Reduced motion:
 * starts fully exploded, no auto-rotate.
 */
export default function RoofCutaway({
  layers,
  sliderLabel,
  hint,
}: {
  layers: RoofLayer[];
  sliderLabel: string;
  hint: string;
}) {
  const reduce = useReducedMotion();
  const [explode, setExplode] = useState(reduce ? 1 : 0.65);
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { margin: "200px 0px" });
  const [mount3d, setMount3d] = useState(false);
  useEffect(() => {
    if (inView) setMount3d(true);
  }, [inView]);
  const sliderId = useId();

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-4">
        <div
          ref={boxRef}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted"
        >
          {mount3d ? (
            <RoofCutawayScene explode={explode} active={inView} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-muted" />
          )}
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
            {hint}
          </span>
        </div>
        <div className="flex items-center gap-3 px-1">
          <label
            htmlFor={sliderId}
            className="micro-label shrink-0 text-muted-foreground"
          >
            {sliderLabel}
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            value={Math.round(explode * 100)}
            onChange={(e) => setExplode(Number(e.target.value) / 100)}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[--color-accent]"
          />
        </div>
      </div>

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
    </div>
  );
}
