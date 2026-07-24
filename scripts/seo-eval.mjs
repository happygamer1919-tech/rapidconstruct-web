// Evaluate audit.json → PASS/FAIL/FLAG per check, reciprocity, duplicates.
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync(new URL("../audit.json", import.meta.url)));
const rows = data.rows;

// index by key+locale for reciprocity
const byKeyLoc = {};
for (const r of rows) byKeyLoc[`${r.key}:${r.locale}`] = r;

// canonical map: what URL should each page's canonical/hreflang be?
// canonical(self) == its own og:url == hreflang[self locale].
// reciprocity: RO.hreflang.ru === RU.canonical ; RU.hreflang.ro === RO.canonical.

function hasCyrillic(s) { return /[Ѐ-ӿ]/.test(s || ""); }
function cyrRatio(s) {
  const letters = (s || "").replace(/[^\p{L}]/gu, "");
  if (!letters.length) return 0;
  const cyr = (letters.match(/[Ѐ-ӿ]/g) || []).length;
  return cyr / letters.length;
}
function isAbsHttps(u) { return typeof u === "string" && /^https:\/\/[^/]+/.test(u); }

// duplicate title/description detection within scope (exclude non-200 & styleguide from uniqueness? keep all 200)
const titleMap = {}, descMap = {};
for (const r of rows) {
  if (r.status !== 200) continue;
  if (r.title) (titleMap[r.title] ||= []).push(`${r.key}:${r.locale}`);
  if (r.description) (descMap[r.description] ||= []).push(`${r.key}:${r.locale}`);
}
const dupTitles = Object.entries(titleMap).filter(([, v]) => v.length > 1);
const dupDescs = Object.entries(descMap).filter(([, v]) => v.length > 1);

const findings = [];
const scored = [];
for (const r of rows) {
  const s = { key: r.key, locale: r.locale, path: r.path, status: r.status };
  if (r.status !== 200) {
    s.ALL = `FAIL(HTTP ${r.status})`;
    scored.push(s);
    findings.push(`${r.key}:${r.locale} NON-200: ${r.status} ${r.note || ""}`);
    continue;
  }
  const expectLang = r.locale;
  // 1 title
  s.title = r.titleCount === 1 && r.title ? "PASS" : `FAIL(count=${r.titleCount})`;
  if (r.titleCount !== 1) findings.push(`${r.key}:${r.locale} title count=${r.titleCount}`);
  const dupT = dupTitles.find(([t]) => t === r.title);
  if (dupT) { s.title = "FAIL(dup)"; }
  // truncation: keyword phrase before ' · ' should be intact (we can't know intent; check length)
  s.titleLen = r.title ? r.title.length : 0;

  // 2 description
  if (r.descCount !== 1 || !r.description) { s.desc = `FAIL(count=${r.descCount})`; findings.push(`${r.key}:${r.locale} desc count=${r.descCount}`); }
  else {
    const len = r.descLen;
    const dupD = dupDescs.find(([d]) => d === r.description);
    const langOk = expectLang === "ru" ? cyrRatio(r.description) > 0.3 : cyrRatio(r.description) < 0.15;
    if (dupD) { s.desc = "FAIL(dup)"; }
    else if (!langOk) { s.desc = `FAIL(lang cyr=${cyrRatio(r.description).toFixed(2)})`; findings.push(`${r.key}:${r.locale} desc lang mismatch`); }
    else if (len < 50) { s.desc = `FLAG(short ${len})`; }
    else if (len > 160) { s.desc = `FLAG(long ${len})`; }
    else s.desc = `PASS(${len})`;
  }

  // 3 canonical
  s.canonical = r.canonicalCount === 1 && isAbsHttps(r.canonical) ? "PASS" : `FAIL(count=${r.canonicalCount},v=${r.canonical})`;
  if (!(r.canonicalCount === 1 && isAbsHttps(r.canonical))) findings.push(`${r.key}:${r.locale} canonical ${r.canonicalCount} ${r.canonical}`);

  // 4 hreflang + reciprocity
  const hl = r.hreflang || {};
  const have = ["ro", "ru", "x-default"].every((k) => hl[k]);
  let recip = true, recipNote = "";
  const counterpart = byKeyLoc[`${r.key}:${r.locale === "ro" ? "ru" : "ro"}`];
  if (counterpart && counterpart.status === 200) {
    const otherLoc = r.locale === "ro" ? "ru" : "ro";
    // this page's hreflang for the other locale should equal counterpart canonical
    if (hl[otherLoc] !== counterpart.canonical) { recip = false; recipNote = `hl.${otherLoc}=${hl[otherLoc]} vs counterpart.canonical=${counterpart.canonical}`; }
    // self hreflang should equal own canonical
    if (hl[r.locale] !== r.canonical) { recip = false; recipNote += ` self hl=${hl[r.locale]} vs canon=${r.canonical}`; }
  }
  if (!have) { s.hreflang = "FAIL(missing)"; findings.push(`${r.key}:${r.locale} hreflang missing one of ro/ru/x-default: ${JSON.stringify(hl)}`); }
  else if (!recip) { s.hreflang = "FAIL(recip)"; findings.push(`${r.key}:${r.locale} hreflang recip: ${recipNote}`); }
  else s.hreflang = "PASS";

  // 5 OG
  const og = r.og || {};
  const need = ["og:title", "og:description", "og:type", "og:url", "og:image", "og:locale"];
  const missing = need.filter((k) => !og[k]);
  const imgStatus = og["og:image"] ? data.ogImageStatus[og["og:image"]] : null;
  if (missing.length) { s.og = `FAIL(missing ${missing.join(",")})`; findings.push(`${r.key}:${r.locale} og missing ${missing.join(",")}`); }
  else if (imgStatus !== 200) { s.og = `FAIL(image ${imgStatus})`; findings.push(`${r.key}:${r.locale} og:image status ${imgStatus}`); }
  else s.og = "PASS";

  // 6 JSON-LD
  const ld = r.jsonld || [];
  const anyInvalid = ld.some((x) => !x.valid);
  const types = ld.flatMap((x) => x.types || []);
  const hasLB = types.some((t) => /Business/i.test(t));
  if (anyInvalid) { s.jsonld = "FAIL(invalid)"; findings.push(`${r.key}:${r.locale} invalid JSON-LD`); }
  else if (!hasLB) { s.jsonld = "FAIL(noLocalBusiness)"; findings.push(`${r.key}:${r.locale} no LocalBusiness`); }
  else s.jsonld = `PASS(${types.join("+")})`;

  // 7 h1
  s.h1 = r.h1Count === 1 ? "PASS" : `FAIL(count=${r.h1Count})`;
  if (r.h1Count !== 1) findings.push(`${r.key}:${r.locale} h1 count=${r.h1Count} first="${r.h1}"`);
  const h1lang = expectLang === "ru" ? cyrRatio(r.h1) > 0.3 : cyrRatio(r.h1) < 0.2;
  if (r.h1Count === 1 && !h1lang && r.h1) { s.h1 = `FLAG(lang cyr=${cyrRatio(r.h1).toFixed(2)})`; findings.push(`${r.key}:${r.locale} h1 lang? "${r.h1}"`); }

  // 8 html lang
  s.htmlLang = r.htmlLang === expectLang ? "PASS" : `FAIL(${r.htmlLang})`;
  if (r.htmlLang !== expectLang) findings.push(`${r.key}:${r.locale} htmlLang=${r.htmlLang}`);

  s.robots = r.robots;
  scored.push(s);
}

console.log("=== DUP TITLES ===");
for (const [t, v] of dupTitles) console.log(`  "${t}" -> ${v.join(", ")}`);
console.log("=== DUP DESCS ===");
for (const [d, v] of dupDescs) console.log(`  "${d.slice(0,60)}..." -> ${v.join(", ")}`);
console.log("\n=== FINDINGS (" + findings.length + ") ===");
for (const f of findings) console.log("  - " + f);
console.log("\n=== OG IMAGE STATUS ===", JSON.stringify(data.ogImageStatus));
console.log("=== SITEMAP COUNT ===", data.sitemapCount);
console.log("\n=== SCORED TABLE ===");
for (const s of scored) {
  console.log(`${(s.key+":"+s.locale).padEnd(34)} T:${s.title||s.ALL} D:${s.desc||""} C:${s.canonical||""} H:${s.hreflang||""} OG:${s.og||""} LD:${s.jsonld||""} h1:${s.h1||""} lang:${s.htmlLang||""} [${s.robots||""}] tlen=${s.titleLen||""}`);
}
