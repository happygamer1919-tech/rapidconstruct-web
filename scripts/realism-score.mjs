#!/usr/bin/env node
// Realism region-score: compares a render against a reference photo, per region.
// Usage: node scripts/realism-score.mjs <render.png> <reference.jpg> [--json]
// Regions are fractions of each image (render-region + photo-region pairs below).
// Emits per-region mean/std/hue deltas and a 0-100 score (100 = matches photo stats).
import fs from "fs";
import { PNG } from "pngjs";
import { execSync } from "child_process";

function loadPixels(p) {
  // normalize any input to PNG via sips (macOS) into a temp file
  const tmp = `/tmp/rs_${Math.random().toString(36).slice(2)}.png`;
  execSync(`sips -s format png "${p}" --out "${tmp}" > /dev/null 2>&1`);
  const png = PNG.sync.read(fs.readFileSync(tmp));
  fs.unlinkSync(tmp);
  return png;
}
function regionStats(img, fx0, fy0, fx1, fy1) {
  const x0 = Math.floor(fx0*img.width), x1 = Math.floor(fx1*img.width);
  const y0 = Math.floor(fy0*img.height), y1 = Math.floor(fy1*img.height);
  let n=0, sr=0,sg=0,sb=0, sr2=0,sg2=0,sb2=0;
  for (let y=y0;y<y1;y+=2) for (let x=x0;x<x1;x+=2) {
    const i=(y*img.width+x)*4;
    const r=img.data[i], g=img.data[i+1], b=img.data[i+2];
    sr+=r; sg+=g; sb+=b; sr2+=r*r; sg2+=g*g; sb2+=b*b; n++;
  }
  const mr=sr/n, mg=sg/n, mb=sb/n;
  const lum=(0.2126*mr+0.7152*mg+0.0722*mb);
  const std=Math.sqrt(Math.max(0,(sr2+sg2+sb2)/n-(mr*mr+mg*mg+mb*mb)))/Math.sqrt(3);
  const hue=Math.atan2(Math.sqrt(3)*(mg-mb), 2*mr-mg-mb)*180/Math.PI;
  const sat=(Math.max(mr,mg,mb)-Math.min(mr,mg,mb))/Math.max(1,Math.max(mr,mg,mb));
  return { mean:[mr,mg,mb].map(v=>+v.toFixed(1)), lum:+lum.toFixed(1), std:+std.toFixed(1), hue:+hue.toFixed(1), sat:+sat.toFixed(3) };
}
// region: [render fx0,fy0,fx1,fy1] , [photo fx0,fy0,fx1,fy1]
const REGIONS = {
  roof:   { render: [0.46,0.22,0.72,0.42], photo: [0.30,0.10,0.75,0.30] },
  wall:   { render: [0.42,0.50,0.55,0.66], photo: [0.55,0.42,0.72,0.55] },
  ground: { render: [0.30,0.86,0.60,0.97], photo: [0.25,0.85,0.70,0.97] },
};
const [render, reference] = process.argv.slice(2);
const R = loadPixels(render), P = loadPixels(reference);
const out = {};
let total = 0;
for (const [name, r] of Object.entries(REGIONS)) {
  const a = regionStats(R, ...r.render), b = regionStats(P, ...r.photo);
  const lumErr = Math.abs(a.lum-b.lum)/255;
  const stdErr = Math.abs(a.std-b.std)/Math.max(8,b.std);
  const satErr = Math.abs(a.sat-b.sat);
  const score = Math.max(0, Math.round(100*(1 - 0.4*lumErr - 0.4*Math.min(1,stdErr) - 0.2*Math.min(1,satErr*3))));
  out[name] = { render: a, photo: b, score };
  total += score;
}
out.TOTAL = Math.round(total/Object.keys(REGIONS).length);
console.log(JSON.stringify(out, null, 1));
