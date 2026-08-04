"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";

/**
 * ProcessVideo — "Cum lucrăm" (RC-120): the owner's real site-work promo
 * (youtube @RapidConstruct, 255K views), shown as a lite click-to-play embed
 * (the imperlux.md reference pattern): a self-hosted poster + play button,
 * and the YouTube iframe is created ONLY on click. Zero third-party requests
 * and zero page weight until the visitor asks for the video.
 */
export default function ProcessVideo({
  eyebrow,
  title,
  intro,
  play,
  caption,
  videoId,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  play: string;
  caption: string;
  videoId: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <section aria-labelledby="process-video-title" className="border-b border-border bg-muted">
      <div className="mx-auto w-full max-w-6xl px-gutter py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-3">
          <p className="micro-label text-accent-strong">{eyebrow}</p>
          <h2
            id="process-video-title"
            className="font-serif text-display-lg text-foreground"
          >
            {title}
          </h2>
          <p className="max-w-2xl text-body-lg text-muted-foreground">
            {intro}
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink-950">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={caption}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={play}
              className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-strong"
            >
              <Image
                src="/images/video/cum-lucram-poster.jpg"
                alt={caption}
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Legibility + affordance: gentle dark wash, brand play chip. */}
              <span className="absolute inset-0 bg-ink-950/25 transition-colors group-hover:bg-ink-950/35" />
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Icon name="play" size={30} />
              </span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-950/60 px-3 py-1 text-micro font-medium text-neutral-50 backdrop-blur-sm">
                {caption}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
