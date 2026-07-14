"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export type StoryPhase = {
  chip: string;
  title: string;
  caption: string;
  image: string;
};

/**
 * "Construcția ta, pas cu pas" — the signature scroll narrative (design ref
 * Reel 1): each build phase is a full-width band with its photo; as it enters
 * the viewport the image settles and the caption slides up. transform/opacity
 * only; prefers-reduced-motion → everything static and visible. Native scroll,
 * no scroll-jacking.
 */
export default function ConstructionStory({
  eyebrow,
  title,
  phases,
}: {
  eyebrow: string;
  title: string;
  phases: StoryPhase[];
}) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="story-title"
      className="bg-ink-950 text-inverse-foreground"
    >
      <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-24">
        <div className="mb-12 flex flex-col gap-3">
          <p className="micro-label text-inverse-accent">{eyebrow}</p>
          <h2
            id="story-title"
            className="max-w-2xl font-serif text-display-lg text-inverse-foreground"
          >
            {title}
          </h2>
        </div>

        <ol className="flex flex-col gap-8 lg:gap-12">
          {phases.map((phase, i) => (
            <li key={phase.chip}>
              <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
                {/* Photo */}
                <motion.div
                  className={`relative aspect-[3/2] overflow-hidden rounded-xl border border-inverse-border ${
                    i % 2 === 1 ? "lg:order-2" : ""
                  }`}
                  initial={reduce ? false : { opacity: 0, scale: 1.06 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={phase.image}
                    alt={phase.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ink-950/70 px-3 py-1 text-micro font-semibold uppercase tracking-widest text-neutral-50 backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")} · {phase.chip}
                  </span>
                </motion.div>

                {/* Caption */}
                <motion.div
                  className={`flex flex-col gap-3 ${
                    i % 2 === 1 ? "lg:order-1" : ""
                  }`}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <h3 className="font-serif text-h2 text-inverse-foreground">
                    {phase.title}
                  </h3>
                  <p className="max-w-md text-body-lg text-inverse-muted-foreground">
                    {phase.caption}
                  </p>
                </motion.div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
