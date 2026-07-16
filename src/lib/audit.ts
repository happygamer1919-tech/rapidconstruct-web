/**
 * Should this page skip mounting the heavy 3D hero?
 *
 * WHY (RC-305, 2026-07-16): the hero mounts WebGL on a 2.5s timer so the house
 * builds itself on load (owner direction). Under Lighthouse that timer fires
 * too — `visibilityState` is "visible" — so the 1.15 MB model loaded and ran
 * under a 4x CPU throttle and the audit RUN ITSELF died (PAGE_HUNG /
 * Network.getResponseBody timeout), rather than merely scoring badly. The perf
 * gate was red on main from PR #37 (2026-07-16 01:11) onwards.
 *
 * Owner decision (2026-07-16): real visitors keep the build-on-load untouched;
 * only the speed test skips the 3D.
 *
 * HOW — and why NOT user-agent sniffing. The first attempt keyed off a
 * "Chrome-Lighthouse" UA suffix. That string does not exist in Lighthouse 12
 * (its UA is a plain `moto g power` string), so the check never once matched and
 * the model kept loading through every audit. Worse, the "proof" it worked came
 * from a probe using a hand-written fake UA — it only ever tested the regex
 * against itself. Verified for real via the audit's own network log: house.glb,
 * 925 KB, requested every run.
 *
 * So the opt-out is EXPLICIT instead of sniffed: CI asks for `?no3d=1`
 * (see lighthouserc.json). It cannot silently stop matching, it is visible in
 * the URL of every report, and it is impossible to mistake for cloaking —
 * nothing keys off who is asking. Real visitors, Googlebot and PageSpeed all hit
 * the normal URL and get the real 3D hero.
 */
export function skipHeavy3d(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("no3d");
}
