import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { PRIMARY_NAV, SERVICES, SOCIALS } from "@/config/navigation";
import { site } from "@/config/site";

/**
 * Sitewide footer (RC-101). NAP is rendered EXACTLY from `site.ts` (the single
 * source of truth, SPEC §2) so it can never drift from the JSON-LD or metadata.
 * Services + quick links read from the shared navigation config.
 */
export default async function SiteFooter() {
  const t = await getTranslations("footer");
  const tHeader = await getTranslations("header");
  const tServices = await getTranslations("services");

  return (
    <footer className="mt-auto border-t border-inverse-border bg-inverse-background text-inverse-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-gutter py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + NAP */}
        <div className="flex flex-col gap-4">
          <span className="font-serif lining-nums text-lg font-semibold">
            Rapid Construct{" "}
            <span className="text-inverse-accent">
              <span className="font-sans font-normal">&amp;</span> 3D Design
            </span>
          </span>
          <p className="max-w-xs text-caption text-inverse-muted-foreground">
            {t("tagline")}
          </p>
          <address className="flex flex-col gap-2 text-caption not-italic">
            <span className="flex items-start gap-2">
              <Icon
                name="mapPin"
                size={16}
                className="mt-0.5 shrink-0 text-inverse-accent"
              />
              {site.address.streetAddress}, {site.address.addressLocality}
            </span>
            <a
              href={`tel:${site.phone}`}
              className="flex items-center gap-2 transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
            >
              <Icon
                name="phone"
                size={16}
                className="shrink-0 text-inverse-accent"
              />
              {site.phoneDisplay}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2 transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
            >
              <Icon
                name="mail"
                size={16}
                className="shrink-0 text-inverse-accent"
              />
              {site.email}
            </a>
          </address>
        </div>

        {/* Services */}
        <nav aria-label={t("servicesTitle")} className="flex flex-col gap-3">
          <p className="micro-label text-inverse-muted-foreground">
            {t("servicesTitle")}
          </p>
          <ul className="flex flex-col gap-2 text-caption">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={s.slug}
                  className="transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
                >
                  {tServices(`${s.key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label={t("companyTitle")} className="flex flex-col gap-3">
          <p className="micro-label text-inverse-muted-foreground">
            {t("companyTitle")}
          </p>
          <ul className="flex flex-col gap-2 text-caption">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
              >
                {tHeader("home")}
              </Link>
            </li>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
                >
                  {tHeader(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hours + Socials */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="micro-label text-inverse-muted-foreground">
              {t("hoursLabel")}
            </p>
            <p className="flex items-start gap-2 text-caption">
              <Icon
                name="clock"
                size={16}
                className="mt-0.5 shrink-0 text-inverse-accent"
              />
              {t("hours")}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="micro-label text-inverse-muted-foreground">
              {t("socialTitle")}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-caption">
              {/* TODO(social): swap "#" for real profile URLs once the owner
                  confirms them (site.social is intentionally empty). */}
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="transition-colors hover:text-inverse-accent focus-visible:text-inverse-accent focus-visible:outline-none"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-inverse-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-gutter py-5 text-micro text-inverse-muted-foreground">
          <span>{t("rights")}</span>
          {/* CC-BY attribution — legally required, and it must track what
              ACTUALLY ships. The shipped house.glb carries scenery derived from
              this author's CC-BY assets (plinth_shrub_*, plinth_tree_*,
              plinth_hedge_*), so the credit is owed as long as any of them are
              in the model. It was written for the Look B model but applies to
              the currently-shipped one too — the assets predate that work.
              Rescued from PR #47, which was closed for unrelated reasons; the
              site was live-facing without this credit until 2026-07-22.
              RE-CHECK whenever scenery assets change: if the photo-match rebuild
              replaces every CC-BY-derived prop, remove this; if it adds new
              third-party assets, add them. */}
          <span className="text-inverse-muted-foreground/70">
            {t("modelCredits")}{" "}
            <a
              href="https://sketchfab.com/levandreev23032010"
              rel="noopener noreferrer"
              target="_blank"
              className="underline decoration-inverse-border underline-offset-2 hover:text-inverse-foreground"
            >
              levandreev23032010
            </a>{" "}
            (CC-BY)
          </span>
        </div>
      </div>
    </footer>
  );
}
