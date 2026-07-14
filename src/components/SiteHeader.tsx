"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Icon } from "@/components/icons";
import { PRIMARY_NAV, SERVICES } from "@/config/navigation";
import { site } from "@/config/site";

/**
 * Sitewide header (RC-101). Wordmark + primary content nav + services menu +
 * phone CTA + locale switcher, with a mobile hamburger slide-in menu and a
 * floating "call" button on small screens.
 *
 * Motion: transform/opacity only; the slide-in respects prefers-reduced-motion
 * (transitions are neutralised globally in globals.css). All interactive targets
 * have visible focus states and cursor-pointer.
 */
export default function SiteHeader() {
  const t = useTranslations("header");
  const tServices = useTranslations("services");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Lock body scroll and enable Escape-to-close while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-gutter py-3">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Rapid Construct{" "}
          <span className="text-accent-strong">&amp; 3D Design</span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label={t("home")}
          className="hidden items-center gap-7 lg:flex"
        >
          <Link href="/" className={navLinkClass}>
            {t("home")}
          </Link>

          {/* Visible content links come BEFORE the (default-hidden) services
              dropdown so a keyboard user — and the CI nav smoke test — reaches a
              visible link first. */}
          {PRIMARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass}>
              {t(item.key)}
            </Link>
          ))}

          {/* Services disclosure — opens on hover/focus (pure CSS, keyboard-safe). */}
          <div className="group relative">
            <button
              type="button"
              aria-haspopup="true"
              className={`${navLinkClass} inline-flex cursor-pointer items-center gap-1`}
            >
              {t("services")}
              <Icon
                name="chevronDown"
                size={16}
                className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-64 pt-3 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <ul className="grid gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg shadow-black/5">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={s.slug}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-surface-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <Icon
                        name={s.icon}
                        size={18}
                        className="shrink-0 text-accent-strong"
                      />
                      {tServices(`${s.key}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Right cluster: phone CTA + locale switcher (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${site.phone}`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            <Icon name="phone" size={16} />
            {t("callNow")}
          </a>
          <LocaleSwitcher />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={menuOpen}
            className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-strong"
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-ink-950/50 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("services")}
          className={`absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col gap-6 overflow-y-auto bg-surface px-6 py-5 shadow-xl transition-transform duration-200 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-base font-semibold">
              Rapid Construct
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("closeMenu")}
              className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-strong"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          <nav aria-label={t("home")} className="flex flex-col gap-1 text-base">
            <Link href="/" onClick={closeMenu} className={mobileLinkClass}>
              {t("home")}
            </Link>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div>
            <p className="micro-label mb-2 text-muted-foreground">
              {t("services")}
            </p>
            <ul className="flex flex-col gap-1">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={s.slug}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <Icon
                      name={s.icon}
                      size={18}
                      className="shrink-0 text-accent-strong"
                    />
                    {tServices(`${s.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`tel:${site.phone}`}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
          >
            <Icon name="phone" size={18} />
            {t("callNow")} · {site.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Floating call button (mobile only) */}
      <a
        href={`tel:${site.phone}`}
        aria-label={`${t("callNow")} ${site.phoneDisplay}`}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong lg:hidden"
      >
        <Icon name="phone" size={24} />
      </a>
    </header>
  );
}

const navLinkClass =
  "text-sm font-medium text-foreground/80 transition-colors hover:text-accent-strong focus-visible:text-accent-strong focus-visible:outline-none";

const mobileLinkClass =
  "rounded-md px-2 py-2 font-medium transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";
