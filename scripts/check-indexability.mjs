#!/usr/bin/env node
/**
 * Post-deploy indexability tripwire.
 *
 * Usage:  node scripts/check-indexability.mjs <deployed-url>
 *
 * WHY THIS EXISTS (2026-07-23 incident)
 * -------------------------------------
 * The repo already has build-time protection: `IS_UNINDEXABLE_STAGING` turns on
 * `Disallow: /` + `noindex` whenever `NEXT_PUBLIC_SITE_URL` is unset, and
 * tests/redirects.spec.ts asserts it. All of that passed. It still went wrong,
 * because the failure was in the ENVIRONMENT, not the code: someone set
 * `NEXT_PUBLIC_SITE_URL=https://rapidconstruct.md` in Vercel Production while
 * rapidconstruct.md still served Tilda. The safeguard keys off the variable
 * being ABSENT, so setting it silently switched indexing on — and the staging
 * host began publishing a 30-URL sitemap for a domain where 28 of those URLs
 * 404. CI could never catch that: CI builds locally, with no Vercel env at all.
 *
 * So this check runs against a DEPLOYED URL and asserts the rule that actually
 * matters:
 *
 *   A host that is not the real public domain MUST NOT be indexable.
 *
 * Run it after every deploy, and at cutover (where it flips: the real domain
 * MUST be indexable). It exits non-zero on violation so it can gate a release.
 */

const REAL_DOMAIN = "rapidconstruct.md";
const SAMPLE_PATHS = ["/", "/ru", "/acoperisuri"];

const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/check-indexability.mjs <deployed-url>");
  process.exit(2);
}

const base = target.replace(/\/+$/, "");
const host = new URL(base).host;
// The real domain (and its www form) is the only host allowed to be indexed.
const isRealDomain = host === REAL_DOMAIN || host === `www.${REAL_DOMAIN}`;
const failures = [];
const notes = [];

async function get(path) {
  const res = await fetch(base + path, { redirect: "follow" });
  return { status: res.status, body: await res.text() };
}

const robots = await get("/robots.txt");
if (robots.status !== 200) failures.push(`robots.txt returned ${robots.status}`);

const disallowsAll = /^\s*Disallow:\s*\/\s*$/im.test(robots.body);
const advertisesSitemap = /^\s*Sitemap:/im.test(robots.body);

const pages = [];
for (const p of SAMPLE_PATHS) {
  const r = await get(p);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(
    r.body,
  );
  pages.push({ path: p, status: r.status, hasNoindex });
}

if (isRealDomain) {
  // Cutover state: the real domain must be crawlable and must advertise itself.
  notes.push(`host ${host} is the real domain — expecting INDEXABLE`);
  if (disallowsAll) failures.push("real domain must NOT Disallow: /");
  if (!advertisesSitemap) failures.push("real domain must advertise a Sitemap:");
  for (const p of pages) {
    if (p.hasNoindex) failures.push(`${p.path} must NOT carry noindex on the real domain`);
  }
} else {
  // Pre-cutover state: every other host is a staging/preview copy.
  notes.push(`host ${host} is NOT the real domain — expecting NON-INDEXABLE`);
  if (!disallowsAll)
    failures.push(
      "robots.txt must contain 'Disallow: /' — a non-production host must not be crawled " +
        "(most likely cause: NEXT_PUBLIC_SITE_URL is set in Vercel before the DNS cutover)",
    );
  if (advertisesSitemap)
    failures.push("robots.txt must NOT advertise a Sitemap: on a non-production host");
  for (const p of pages) {
    if (p.status !== 200) failures.push(`${p.path} returned ${p.status}`);
    else if (!p.hasNoindex)
      failures.push(
        `${p.path} must carry <meta name="robots" content="noindex"> — robots.txt alone ` +
          "does not stop indexing of URLs discovered elsewhere",
      );
  }
}

console.log(`indexability check → ${base}`);
for (const n of notes) console.log(`  · ${n}`);
console.log(
  `  · robots.txt: ${disallowsAll ? "Disallow: /" : "no blanket disallow"}` +
    `, sitemap ${advertisesSitemap ? "advertised" : "absent"}`,
);
for (const p of pages) console.log(`  · ${p.path} → ${p.status}, noindex=${p.hasNoindex}`);

if (failures.length) {
  console.error(`\nFAIL (${failures.length}):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nPASS — indexability matches this host's expected state.");
