import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. ALWAYS import `Link`, `usePathname`,
 * `useRouter`, `redirect` and `getPathname` from here (never from bare
 * `next/navigation`) so the `as-needed` locale prefixing stays correct.
 */
export const { Link, usePathname, useRouter, redirect, getPathname } =
  createNavigation(routing);
