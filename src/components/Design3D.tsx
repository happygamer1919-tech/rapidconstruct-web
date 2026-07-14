"use client";

import dynamic from "next/dynamic";
import { Icon } from "@/components/icons";

// 3D canvas is heavy + browser-only → load client-side after paint so it never
// blocks SSR or the LCP. A calm skeleton holds the box until it mounts.
const Model3D = dynamic(() => import("./Model3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-800 to-neutral-300">
      <span className="micro-label text-neutral-50/80">Model 3D…</span>
    </div>
  ),
});

export default function Design3D({
  eyebrow,
  title,
  intro,
  points,
  hint,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  hint: string;
}) {
  return (
    <section
      aria-labelledby="design3d-title"
      className="border-b border-border bg-surface"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-gutter py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-5">
          <p className="micro-label text-accent-strong">{eyebrow}</p>
          <h2
            id="design3d-title"
            className="font-serif text-display-lg text-foreground"
          >
            {title}
          </h2>
          <p className="max-w-md text-body-lg text-muted-foreground">{intro}</p>
          <ul className="mt-1 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Icon
                  name="cube"
                  size={20}
                  className="mt-0.5 shrink-0 text-accent-strong"
                />
                <span className="text-body text-surface-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-neutral-100 to-muted">
          <Model3D />
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
            {hint}
          </span>
        </div>
      </div>
    </section>
  );
}
