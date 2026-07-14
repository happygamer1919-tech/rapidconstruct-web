"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Toggles RO ⇄ RU while preserving the current pathname.
 *
 * Uses next-intl's navigation `Link` + `usePathname` (NOT bare next/navigation),
 * so `usePathname()` returns the path WITHOUT the locale prefix and the `locale`
 * prop re-applies the correct `as-needed` prefix for the target locale.
 *
 * This is a temporary visible slot — the real header lands in RC-005.
 */
export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-2 text-sm">
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={isActive ? "true" : undefined}
            className={
              isActive
                ? "rounded px-2 py-1 font-semibold underline"
                : "rounded px-2 py-1 text-zinc-500 hover:text-zinc-900"
            }
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
