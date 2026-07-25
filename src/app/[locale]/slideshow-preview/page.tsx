import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ProjectSlideshow from "@/components/ProjectSlideshow";
import { SLIDES, COPY } from "@/data/slideshow";
import { routing } from "@/i18n/routing";

/**
 * Standalone PREVIEW route for the project-slideshow shell (feature/project-
 * slideshow). Not wired into the live homepage hero — it exists so placement can
 * be decided later (after the Higgsfield video). Placeholder content only;
 * noindex + excluded from the sitemap, like /styleguide.
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const title =
    safeLocale === "ru"
      ? "Превью галереи проектов (заглушка) — RapidConstruct"
      : "Previzualizare galerie proiecte (placeholder) — RapidConstruct";
  // Internal preview shell: keep it out of search entirely.
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export default async function SlideshowPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  setRequestLocale(safeLocale);

  return (
    <main>
      <ProjectSlideshow slides={SLIDES} copy={COPY} locale={safeLocale} />
    </main>
  );
}
