// One-shot SEO/GEO audit harness (LANE B, RC-seo-geo-sweep).
// Fetches the REAL rendered HTML of every route+locale from the running dev
// server and runs the 8 checks. Emits JSON to stdout + writes audit.json.
// Usage: node scripts/seo-audit.mjs [baseUrl]  (default http://localhost:3000)

import { writeFileSync } from "node:fs";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");

// Route keys → { ro path, ru path }. Source: next-intl `pathnames` config
// (src/i18n/routing.ts) — NOT hand-guessed. RO default has no prefix; RU is /ru.
const ROUTES = [
  { key: "home", ro: "/", ru: "/ru" },
  { key: "acoperisuri", ro: "/acoperisuri", ru: "/ru/kryshi" },
  { key: "fatade", ro: "/fatade", ru: "/ru/fasady" },
  { key: "renovari-la-cheie", ro: "/renovari-la-cheie", ru: "/ru/remont-pod-klyuch" },
  { key: "finisaje", ro: "/finisaje", ru: "/ru/otdelka" },
  { key: "instalatii", ro: "/instalatii", ru: "/ru/elektrika-santehnika" },
  { key: "proiectare-3d", ro: "/proiectare-3d", ru: "/ru/proekt-3d" },
  { key: "despre-noi", ro: "/despre-noi", ru: "/ru/o-nas" },
  { key: "contact", ro: "/contact", ru: "/ru/kontakty" },
  { key: "portofoliu", ro: "/portofoliu", ru: "/ru/portfolio" },
  { key: "calculator-acoperis", ro: "/calculator-acoperis", ru: "/ru/kalkulyator-kryshi" },
  { key: "politica-de-confidentialitate", ro: "/politica-de-confidentialitate", ru: "/ru/politika-konfidencialnosti" },
  { key: "chisinau", ro: "/chisinau", ru: "/ru/kishinev" },
  { key: "orhei", ro: "/orhei", ru: "/ru/orgeev" },
  { key: "cahul", ro: "/cahul", ru: "/ru/kagul" },
  { key: "styleguide", ro: "/styleguide", ru: "/ru/styleguide" },
];

async function fetchText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const body = await res.text();
      return { status: res.status, body, location: res.headers.get("location") };
    } catch (e) {
      if (i === tries - 1) return { status: 0, body: "", error: String(e) };
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

async function headOk(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status;
  } catch {
    return 0;
  }
}

// --- tiny HTML helpers (regex; dev HTML is well-formed enough) ---
function allMatches(html, re) {
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m);
  return out;
}
function getTag(html, attrsPattern) {
  // returns array of tag attribute-strings for <link ...> / <meta ...>
  const re = new RegExp(`<(?:link|meta)\\b[^>]*>`, "gi");
  return allMatches(html, re).map((m) => m[0]).filter((t) => attrsPattern.test(t));
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")) ||
    tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i"));
  return m ? m[1] : null;
}
function decode(s) {
  if (s == null) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function analyze(html) {
  const r = {};
  // <title>
  const titles = allMatches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi).map((m) => decode(m[1].trim()));
  r.titleCount = titles.length;
  r.title = titles[0] ?? null;

  // meta description
  const descTags = getTag(html, /name\s*=\s*["']description["']/i);
  r.descCount = descTags.length;
  r.description = descTags[0] ? decode(attr(descTags[0], "content")) : null;
  r.descLen = r.description ? r.description.length : 0;

  // canonical
  const canon = getTag(html, /rel\s*=\s*["']canonical["']/i);
  r.canonicalCount = canon.length;
  r.canonical = canon[0] ? decode(attr(canon[0], "href")) : null;

  // hreflang alternates
  const alts = getTag(html, /rel\s*=\s*["']alternate["']/i).filter((t) => /hreflang/i.test(t));
  r.hreflang = {};
  for (const t of alts) {
    const lang = attr(t, "hreflang");
    const href = decode(attr(t, "href"));
    if (lang) r.hreflang[lang.toLowerCase()] = href;
  }

  // Open Graph + og:image
  const metas = allMatches(html, /<meta\b[^>]*>/gi).map((m) => m[0]);
  const og = {};
  for (const t of metas) {
    const prop = attr(t, "property");
    if (prop && /^og:/i.test(prop)) og[prop.toLowerCase()] = decode(attr(t, "content"));
  }
  r.og = og;

  // JSON-LD
  const ld = allMatches(html, /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  r.jsonld = [];
  for (const m of ld) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const types = Array.isArray(parsed) ? parsed.map((x) => x["@type"]) : [parsed["@type"]];
      r.jsonld.push({ valid: true, types });
    } catch (e) {
      r.jsonld.push({ valid: false, error: String(e), snippet: raw.slice(0, 120) });
    }
  }

  // h1
  const h1s = allMatches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((m) => decode(m[1].replace(/<[^>]+>/g, "").trim()));
  r.h1Count = h1s.length;
  r.h1 = h1s[0] ?? null;

  // html lang
  const htmlTag = html.match(/<html\b[^>]*>/i);
  r.htmlLang = htmlTag ? attr(htmlTag[0], "lang") : null;

  // robots meta (to confirm staging noindex — expected, not a defect)
  const robots = getTag(html, /name\s*=\s*["']robots["']/i);
  r.robots = robots[0] ? decode(attr(robots[0], "content")) : null;

  return r;
}

const rows = [];
for (const route of ROUTES) {
  for (const locale of ["ro", "ru"]) {
    const path = route[locale];
    const url = BASE + path;
    const res = await fetchText(url);
    const row = { key: route.key, locale, path, url, status: res.status };
    if (res.status === 200) {
      Object.assign(row, analyze(res.body));
    } else {
      row.note = `HTTP ${res.status}` + (res.location ? ` -> ${res.location}` : "");
    }
    rows.push(row);
    process.stderr.write(`${url} -> ${res.status}\n`);
  }
}

// og:image reachability (check the default share image once + any per-page override)
const ogImages = new Set(rows.map((r) => r.og && r.og["og:image"]).filter(Boolean));
const ogImageStatus = {};
for (const img of ogImages) {
  ogImageStatus[img] = await headOk(img);
}

// sitemap for cross-check
const sm = await fetchText(BASE + "/sitemap.xml");
const smUrls = sm.status === 200 ? allMatches(sm.body, /<loc>([^<]+)<\/loc>/gi).map((m) => m[1]) : [];

const out = { base: BASE, rows, ogImageStatus, sitemapCount: smUrls.length, sitemapUrls: smUrls };
writeFileSync(new URL("../audit.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.stderr.write(`\nDONE: ${rows.length} rows, sitemap ${smUrls.length} urls\n`);
