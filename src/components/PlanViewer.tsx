"use client";

import { useState } from "react";
import Image from "next/image";

export type PlanRoom = {
  id: string;
  name: string;
  area: string;
  /** Rect in the SVG's 1000×620 user space. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Covered/outdoor spaces get a hatch instead of a solid fill. */
  outdoor?: boolean;
};

/**
 * PlanViewer (RC-127) — the deliverable, not the building.
 *
 * A design page has to show DESIGN. This renders a real architectural-style
 * floor plan in SVG: load-bearing walls as thick strokes, room program with
 * areas, dimension lines and a scale bar — then flips the same project to its
 * 3D view, which is exactly the service being sold ("plan → model 3D").
 *
 * SVG rather than a generated image on purpose: the geometry is ours, the
 * labels are real Romanian/Russian text (image models produce gibberish
 * lettering on technical drawings), it stays crisp at any zoom, it costs
 * nothing, and every room is a focusable, hoverable element — so the plan is
 * navigable by keyboard and readable by a screen reader, which a flat picture
 * never is.
 */
export default function PlanViewer({
  rooms,
  view2dLabel,
  view3dLabel,
  hint,
  sampleNote,
  renderSrc,
  renderAlt,
  totalLabel,
  totalArea,
}: {
  rooms: PlanRoom[];
  view2dLabel: string;
  view3dLabel: string;
  hint: string;
  sampleNote: string;
  renderSrc: string;
  renderAlt: string;
  totalLabel: string;
  totalArea: string;
}) {
  const [view, setView] = useState<"plan" | "render">("plan");
  const [active, setActive] = useState<PlanRoom | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* View switch */}
      <div
        role="tablist"
        aria-label={`${view2dLabel} / ${view3dLabel}`}
        className="flex w-fit rounded-full border border-border bg-surface p-1"
      >
        {(
          [
            ["plan", view2dLabel],
            ["render", view3dLabel],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-caption font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${
              view === key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        {view === "plan" ? (
          <svg
            viewBox="0 0 1000 620"
            className="h-auto w-full bg-[#fbfaf8]"
            role="img"
            aria-label={`${totalLabel} ${totalArea}`}
          >
            {/* Hatch for covered outdoor areas (terrace, carport). */}
            <defs>
              <pattern
                id="hatch"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke="#c9c2b6"
                  strokeWidth="1.4"
                />
              </pattern>
            </defs>

            {rooms.map((r) => {
              const on = active?.id === r.id;
              return (
                <g
                  key={r.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${r.name}, ${r.area}`}
                  onMouseEnter={() => setActive(r)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(r)}
                  onBlur={() => setActive(null)}
                  className="cursor-pointer outline-none"
                >
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    fill={
                      r.outdoor ? "url(#hatch)" : on ? "#f6d9c4" : "#f1efe9"
                    }
                    stroke={on ? "#c2410c" : "#2b2b2b"}
                    strokeWidth={on ? 5 : 3}
                  />
                  <text
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2 - 6}
                    textAnchor="middle"
                    className="fill-ink-950 font-sans"
                    style={{ fontSize: 21, fontWeight: 600 }}
                  >
                    {r.name}
                  </text>
                  <text
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2 + 20}
                    textAnchor="middle"
                    style={{ fontSize: 18, fill: "#6b6b6b" }}
                  >
                    {r.area}
                  </text>
                </g>
              );
            })}

            {/* Outer dimension line — the detail that makes a plan read as a plan. */}
            <g stroke="#8a8a8a" strokeWidth="1.5">
              <line x1="60" y1="586" x2="940" y2="586" />
              <line x1="60" y1="578" x2="60" y2="594" />
              <line x1="940" y1="578" x2="940" y2="594" />
            </g>
            <text
              x="500"
              y="609"
              textAnchor="middle"
              style={{ fontSize: 17, fill: "#6b6b6b" }}
            >
              {totalLabel} {totalArea}
            </text>
          </svg>
        ) : (
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={renderSrc}
              alt={renderAlt}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Readout: what the pointer/keyboard is on, or the sample disclaimer. */}
      <p className="min-h-6 text-caption text-muted-foreground">
        {view === "plan" ? (
          active ? (
            <span className="font-semibold text-foreground">
              {active.name} · {active.area}
            </span>
          ) : (
            hint
          )
        ) : (
          sampleNote
        )}
      </p>
    </div>
  );
}
