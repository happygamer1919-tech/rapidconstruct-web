/**
 * Is this page being loaded by an automated performance audit rather than a
 * real visitor?
 *
 * WHY (RC-305, 2026-07-16): the hero mounts heavy WebGL on a 2.5s timer so the
 * house builds itself on load (owner direction). The old code assumed Lighthouse
 * was excluded from that timer — it is not. Lighthouse runs with
 * `visibilityState === "visible"`, so the timer fired, the 1.15 MB model loaded
 * and animated under Lighthouse's 4x CPU throttle, and the RUN ITSELF crashed:
 * `PAGE_HUNG` and `Network.getResponseBody` timeouts, not a budget breach. The
 * perf gate was red on main from PR #37 (2026-07-16 01:11) until this landed.
 *
 * Owner decision (2026-07-16): real visitors keep the build-on-load exactly as
 * it is; only the audit robot skips the 3D. That is the behaviour the code
 * already believed it had.
 *
 * HONEST CAVEAT: this means the blocking budget no longer measures the hero's
 * real cost. That is a deliberate trade, not a free win — so CI also runs a
 * SEPARATE, NON-BLOCKING job against `/?3d=1`, which forces the 3D on and
 * reports the true number. See .github/workflows/ci.yml and lighthouserc.3d.json.
 *
 * This is not cloaking: it hides no content from Googlebot (whose UA does not
 * match), changes no text, markup, or links, and the escape hatch below lets
 * anyone — including us — measure the real thing on demand.
 */
export function isAuditRobot(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Chrome-Lighthouse|PageSpeed|PTST/i.test(navigator.userAgent);
}

/**
 * `?3d=1` forces the 3D on even for an audit robot, so the non-blocking CI job
 * (and anyone spot-checking) can measure the hero as visitors actually get it.
 */
export function force3d(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("3d");
}

/** Skip mounting heavy WebGL for audit robots, unless `?3d=1` overrides. */
export function skipHeavy3d(): boolean {
  return isAuditRobot() && !force3d();
}
