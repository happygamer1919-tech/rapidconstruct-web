"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { promo } from "@/config/promo";

const STORAGE_KEY = "promoDismissed";

/**
 * Slim promo bar (RC-110) that sits ABOVE the sticky header. Content and the
 * on/off switch live in src/config/promo.ts + the `promo` message namespace so
 * the owner edits offers in one place.
 *
 * No layout shift, no hydration mismatch: the bar is rendered server-side and
 * is present in the initial HTML (good for SEO and no CLS). A tiny synchronous
 * inline script hides the element BEFORE first paint for anyone who already
 * dismissed this exact offer id, so returning visitors never see a flash.
 * React starts with `dismissed = false` (identical to the server render, so
 * hydration matches) and reconciles in an effect. Closing the bar writes the
 * offer id to localStorage.
 */
export default function PromoBar() {
  const t = useTranslations("promo");
  const [dismissed, setDismissed] = useState(false);

  // Reconcile React state with what the pre-paint inline script already decided.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === promo.id) setDismissed(true);
    } catch {
      // localStorage can throw (private mode / disabled) — just keep the bar.
    }
  }, []);

  if (!promo.active || dismissed) return null;

  const message = t(promo.messageKey);
  const content = promo.href ? (
    <Link
      href={promo.href}
      className="underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
    >
      {message}
    </Link>
  ) : (
    message
  );

  return (
    <>
      <div
        id="promo-bar"
        data-promo-id={promo.id}
        className="relative bg-accent text-accent-foreground"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-gutter py-2">
          <p className="text-center text-xs font-medium leading-tight sm:text-sm">
            {content}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(STORAGE_KEY, promo.id);
              } catch {
                // Ignore storage failures; the bar still closes for this view.
              }
              setDismissed(true);
            }}
            aria-label={t("dismiss")}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-1 text-accent-foreground/90 transition-colors hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-foreground"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>
      {/* Runs synchronously as the parser reaches it (the bar above is already in
          the DOM), hiding the bar before paint for returning dismissers. Kept
          constant — it reads the id from data-promo-id — so server and client
          HTML are byte-identical and hydration never mismatches. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var b=document.getElementById('promo-bar');" +
            "if(b&&localStorage.getItem('" +
            STORAGE_KEY +
            "')===b.dataset.promoId){b.style.display='none';}}catch(e){}})();",
        }}
      />
    </>
  );
}
