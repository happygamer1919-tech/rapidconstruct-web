import type { Pathname } from "@/i18n/routing";
/**
 * Promo bar configuration (RC-110) — the ONE place the owner edits the slim
 * offer bar that sits above the header. Change `messageKey` (and the matching
 * string in messages/{ro,ru}.json under the `promo` namespace) to swap the
 * offer; bump `id` whenever the offer changes so the bar reappears for people
 * who dismissed a previous one (dismissal is stored in localStorage keyed by
 * this id). Set `active: false` to hide the bar sitewide.
 */
export type PromoConfig = {
  /** Master switch — false hides the bar everywhere. */
  active: boolean;
  /**
   * Stable id for this offer. Dismissal is remembered per-id, so changing this
   * value makes the bar reappear for everyone who closed the old one.
   */
  id: string;
  /** Key inside the `promo` message namespace (messages/{ro,ru}.json). */
  messageKey: string;
  /** Optional link target; when set the whole message becomes a link. */
  href?: Pathname;
};

export const promo: PromoConfig = {
  active: true,
  id: "2026-preturi-inghetate",
  messageKey: "offer2026",
};
