"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import type { RoofLayer } from "./RoofCutaway";

// Heavy WebGL scene, browser-only.
const RoofStructureScene = dynamic(() => import("./RoofStructureScene"), {
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
 * RoofStructure — full-bleed background treatment (owner prototype): the 3D
 * roof structure fills the section behind the heading/copy, drifting slowly.
 * The plain layer legend stays server-rendered below for SEO and reference.
 */
export default function RoofStructure({
  eyebrow,
  title,
  intro,
  hint,
  layers,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  hint: string;
  layers: RoofLayer[];
}) {
  const interacted = useInteracted();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "300px 0px" });
  const [mount3d, setMount3d] = useState(false);
  if (interacted && inView && !mount3d) setMount3d(true);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative isolate min-h-[86vh] w-full overflow-hidden bg-gradient-to-br from-neutral-100 via-muted to-neutral-200"
      >
        {/* 3D fills the section */}
        <div className="absolute inset-0">
          {mount3d && <RoofStructureScene active={inView} />}
        </div>

        {/* legibility scrim behind the text (left side) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-100/85 via-neutral-100/30 to-transparent" />

        {/* overlaid copy */}
        <div className="relative mx-auto flex min-h-[86vh] w-full max-w-6xl flex-col justify-center gap-4 px-gutter py-20">
          <p className="micro-label text-accent-strong">{eyebrow}</p>
          <h2 className="max-w-2xl font-serif text-display-lg text-foreground">
            {title}
          </h2>
          <p className="max-w-xl text-body-lg text-muted-foreground">{intro}</p>
        </div>

        {/* hint chip */}
        <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
          {hint}
        </span>
      </div>

      {/* server-rendered legend for SEO + reference */}
      <div className="mx-auto w-full max-w-6xl px-gutter py-12">
        <ol className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {layers.map((l, i) => (
            <li key={l.name} className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-body font-semibold lining-nums text-accent-strong">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-body font-semibold text-foreground">{l.name}</h3>
                <p className="text-caption text-muted-foreground">{l.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
