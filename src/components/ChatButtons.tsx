"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons";
import { site } from "@/config/site";

/**
 * Floating click-to-chat widget (RC-106). A collapsed round button that expands
 * on tap (mobile) or hover/focus (pointer) into a stack of channel buttons:
 * WhatsApp, Viber, and a plain phone-call fallback.
 *
 * Placement: bottom-right, but offset UP on small screens so it never covers the
 * sticky mobile call button that SiteHeader already pins at bottom-right
 * (bottom-5 right-5, lg:hidden). On large screens that call button is hidden, so
 * this widget drops back down to bottom-5.
 *
 * The channel links are ALWAYS in the DOM (only their visibility/position is
 * toggled), so they render server-side in the initial HTML — collapsed just
 * hides them visually and removes them from the tab order. Brand marks are inline
 * SVG (no emoji, no external images). Motion is transform/opacity only and is
 * neutralised globally under prefers-reduced-motion (globals.css).
 */

// Numbers derive from the single NAP source (site.config) so they can never
// drift: wa.me wants bare digits, Viber wants a URL-encoded "+", tel: keeps the
// E.164 string as-is.
const DIGITS = site.phone.replace(/\D/g, "");

function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

function ViberGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.187.687 6.7.621 9.816.554 12.93.475 17.588 4.921 18.836v1.914s-.03.775.48.932c.617.192 .98-.396 1.57-1.031l1.104-1.246c3.041.255 5.377-.328 5.644-.415.612-.199 4.079-.642 4.641-5.242.581-4.743-.279-7.741-1.826-9.094l-.001-.001c-.468-.431-2.348-1.801-6.539-1.82 0 0-.309-.02-.816-.011.309.001.309.001.309.001M11.489 1.35c.43-.008.694.011.694.011 3.544.016 5.242 1.081 5.638 1.441 1.309 1.13 1.979 3.831 1.489 7.787v.002c-.474 3.841-3.284 4.084-3.802 4.25-.221.071-2.271.578-4.853.41 0 0-1.923 2.317-2.523 2.918-.094.094-.204.132-.278.114-.104-.026-.133-.15-.132-.331l.016-3.181c-3.77-1.041-3.55-5.004-3.51-7.171.041-2.167.532-3.947 1.723-5.121 1.955-1.669 5.153-1.827 6.005-1.836zm.489 2.881a.174.174 0 0 0-.174.172.174.174 0 0 0 .172.176c1.298.01 2.35.436 3.163 1.291.816.859 1.219 2.02 1.226 3.526a.174.174 0 0 0 .174.173h.001a.174.174 0 0 0 .173-.175c-.007-1.596-.437-2.855-1.322-3.787-.881-.928-2.033-1.398-3.413-1.409zm-4.421.87a.51.51 0 0 0-.359.115l-.005.004c-.315.278-.606.598-.85.936-.222.313-.343.62-.372.921-.017.178.001.36.052.541l.019.011c.145.427.436.883.86 1.401.257.315.529.606.79.87l.024.033.033.024c.264.261.555.533.871.79.517.424.973.716 1.401.86l.012.019c.181.051.363.069.541.052.301-.029.608-.15.921-.372.338-.244.658-.535.936-.85l.004-.005a.51.51 0 0 0 .115-.359.512.512 0 0 0-.174-.348l-.998-.842c-.209-.176-.522-.155-.706.046l-.263.271c-.135.135-.385.099-.559-.08-.516-.464-.994-.943-1.458-1.458-.179-.174-.215-.424-.08-.559l.271-.263c.201-.184.222-.497.046-.706l-.842-.998a.512.512 0 0 0-.348-.174zm4.884.207a.174.174 0 0 0-.17.178.174.174 0 0 0 .177.17c.898.02 1.573.288 2.075.809.503.523.755 1.216.757 2.117a.174.174 0 0 0 .174.174h.001a.174.174 0 0 0 .173-.175c-.002-.976-.286-1.789-.855-2.383-.571-.593-1.348-.9-2.315-.921zm.492 1.727a.174.174 0 0 0-.166.181.174.174 0 0 0 .181.167c.319.012.53.108.673.269.144.163.223.412.229.762a.174.174 0 0 0 .174.171h.003a.174.174 0 0 0 .171-.177c-.007-.416-.108-.755-.316-.99-.209-.238-.517-.37-.925-.383z" />
    </svg>
  );
}

export default function ChatButtons() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const { chat } = site;

  // One entry per live channel. `viber:` uses %2B for the leading "+"; wa.me
  // takes bare digits and a prefilled RO/RU greeting. Telegram is config-gated
  // (null today) so it stays out of the DOM until switched on.
  const channels = [
    chat.whatsapp && {
      key: "whatsapp",
      href: `https://wa.me/${DIGITS}?text=${encodeURIComponent(t("greeting"))}`,
      label: t("whatsapp"),
      color: "#25D366",
      glyph: <WhatsAppGlyph />,
    },
    chat.viber && {
      key: "viber",
      href: `viber://chat?number=%2B${DIGITS}`,
      label: t("viber"),
      color: "#7360F2",
      glyph: <ViberGlyph />,
    },
    /* TODO(chat): enable Telegram once the owner confirms a destination — flip
       site.chat.telegram to the handle and add a branch here. */
  ].filter(Boolean) as {
    key: string;
    href: string;
    label: string;
    color: string;
    glyph: React.ReactNode;
  }[];

  if (channels.length === 0) return null;

  return (
    // Offset above the mobile call button (SiteHeader: bottom-5, h-14); on lg
    // that button is hidden so we drop to bottom-5. Below the mobile menu (z-50).
    //
    // Reveal is driven two ways that never fight each other: pointer hover and
    // keyboard focus expand it via pure CSS (group-hover / group-focus-within),
    // while tap/click toggles the `open` state. Keeping hover out of React state
    // avoids the enter-then-click race that would collapse the stack on click.
    <div className="group fixed bottom-24 right-5 z-30 flex flex-col items-end gap-3 lg:bottom-5 print:hidden">
      {channels.map((c) => (
        <a
          key={c.key}
          href={c.href}
          aria-label={c.label}
          tabIndex={open ? 0 : -1}
          style={{ backgroundColor: c.color }}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-black/25 transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:pointer-events-auto ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-3 scale-90 opacity-0"
          }`}
        >
          {c.glyph}
        </a>
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-black/25 transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
      >
        <Icon name={open ? "close" : "chat"} size={26} />
      </button>
    </div>
  );
}
