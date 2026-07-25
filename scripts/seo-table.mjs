// Emit the markdown audit table from audit.json.
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync(new URL("../audit.json", import.meta.url)));

const byKeyLoc = {};
for (const r of data.rows) byKeyLoc[`${r.key}:${r.locale}`] = r;
function cyrRatio(s){const l=(s||"").replace(/[^\p{L}]/gu,"");if(!l.length)return 0;return (l.match(/[Ѐ-ӿ]/g)||[]).length/l.length;}
function abs(u){return typeof u==="string"&&/^https:\/\/[^/]+/.test(u);}

const titleMap={},descMap={};
for(const r of data.rows){if(r.status!==200)continue;if(r.title)(titleMap[r.title]||=[]).push(1);if(r.description)(descMap[r.description]||=[]).push(1);}

function cell(v){return v;}
const lines=[];
lines.push("| # | Route | Loc | Title | Desc | Canon | hreflang | OG | JSON-LD | H1 | lang | Notes |");
lines.push("|---|-------|-----|-------|------|-------|----------|----|---------|----|----|-------|");
let i=0;
for(const r of data.rows){
  i++;
  if(r.status!==200){lines.push(`| ${i} | ${r.key} | ${r.locale} | — | — | — | — | — | — | — | — | **FAIL HTTP ${r.status}** |`);continue;}
  const notes=[];
  // title
  let T="PASS"; if(r.titleCount!==1){T="FAIL";notes.push(`${r.titleCount} titles`);}
  else if((titleMap[r.title]||[]).length>1){T="FAIL";notes.push("dup title");}
  // desc
  let D="PASS";
  if(r.descCount!==1){D="FAIL";notes.push(`${r.descCount} desc`);}
  else{
    const dup=(descMap[r.description]||[]).length>1;
    const langOk=r.locale==="ru"?cyrRatio(r.description)>0.3:cyrRatio(r.description)<0.15;
    if(dup){D="FAIL";notes.push("dup desc");}
    else if(!langOk){D="FAIL";notes.push("desc lang");}
    else if(r.descLen>160){D="FLAG";notes.push(`desc ${r.descLen}ch >160`);}
    else if(r.descLen<50){D="FLAG";notes.push(`desc ${r.descLen}ch <50`);}
    else D=`PASS`;
  }
  // canonical
  let C=r.canonicalCount===1&&abs(r.canonical)?"PASS":"FAIL";
  if(C==="FAIL")notes.push(`canon ${r.canonicalCount}`);
  // hreflang
  const hl=r.hreflang||{};const have=["ro","ru","x-default"].every(k=>hl[k]);
  const cp=byKeyLoc[`${r.key}:${r.locale==="ro"?"ru":"ro"}`];
  let recip=true;
  if(cp&&cp.status===200){const o=r.locale==="ro"?"ru":"ro";if(hl[o]!==cp.canonical)recip=false;if(hl[r.locale]!==r.canonical)recip=false;}
  let H=have?(recip?"PASS":"FAIL"):"FAIL"; if(H==="FAIL")notes.push("hreflang");
  // og
  const og=r.og||{};const need=["og:title","og:description","og:type","og:url","og:image","og:locale"];
  const miss=need.filter(k=>!og[k]);const imgOk=og["og:image"]&&data.ogImageStatus[og["og:image"]]===200;
  let O=miss.length?"FAIL":(imgOk?"PASS":"FAIL"); if(miss.length)notes.push("og "+miss.join(","));else if(!imgOk)notes.push("og:image");
  // jsonld
  const ld=r.jsonld||[];const inv=ld.some(x=>!x.valid);const types=ld.flatMap(x=>x.types||[]);const hasLB=types.some(t=>/Business/i.test(t));
  let L=inv?"FAIL":(hasLB?"PASS":"FAIL");
  const typeShort=[...new Set(types)].map(t=>t.replace("HomeAndConstructionBusiness","LB")).join("+");
  if(inv)notes.push("bad JSON-LD");else if(!hasLB)notes.push("no LB");
  // h1
  let H1=r.h1Count===1?"PASS":"FAIL"; if(r.h1Count!==1)notes.push(`${r.h1Count} h1`);
  if(r.h1Count===1){const ok=r.locale==="ru"?cyrRatio(r.h1)>0.3:cyrRatio(r.h1)<0.2;if(!ok&&r.h1){H1="FLAG";notes.push(`h1 lang "${r.h1}"`);}}
  // lang
  let LG=r.htmlLang===r.locale?"PASS":"FAIL"; if(r.htmlLang!==r.locale)notes.push(`lang=${r.htmlLang}`);
  const noteStr=notes.length?notes.join("; "):`LD:${typeShort}`;
  lines.push(`| ${i} | ${r.key} | ${r.locale} | ${T} | ${D} | ${C} | ${H} | ${O} | ${L} | ${H1} | ${LG} | ${noteStr} |`);
}
console.log(lines.join("\n"));
