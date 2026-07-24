#!/usr/bin/env node
/**
 * verify-hero.mjs — Tier 1 of the hero gate (RC-115).
 *
 * WHAT IT REPLACES. LANE A tickets used to verify the hero by hashing ONE file
 * and hardcoding the expected md5 in the ticket text:
 *
 *     git show feature/3d-hero:src/scenes/rapidconstruct-scene.js | md5
 *     # approved md5 is 68a4fb72172b7695a0f067ec261f7c25
 *
 * That broke twice over. It hashed a monolith that the configurator refactor
 * split across house-kit.js and houses/*.js, so the hash could never match
 * again — every LANE A ticket would have escalated a false q341-scene-drift.
 * And the expected value lived in a queue/*.md prompt that is moved to done/
 * and never updated, so each ticket had to re-hardcode the hash the previous
 * one produced (340 had already grown an exception paragraph for 028bb9c).
 *
 * The fix is not a better hash — it is putting the invariant in the repo, where
 * the baseline updates in the same commit as the change that justifies it.
 *
 * WHAT THIS IS. A change detector, not a correctness check. It answers "did
 * anything under the hero move since the last approved state, and what?" That
 * is what the ticket's STEP 1 baseline actually wanted. Whether the hero still
 * LOOKS right is Tier 2's job (rendered-output baselines, after SSAO lands).
 *
 * HOW IT SURVIVES REFACTORS. The file list is derived by walking the import
 * graph from the hero's two entry points — never hand-listed. Split a file in
 * two and both halves are picked up automatically; that is precisely the case
 * the md5 gate could not survive. An import it cannot resolve is a hard error
 * rather than a silent skip, because a silent skip is how a file escapes the
 * gate unnoticed.
 *
 *   npm run verify:hero           # compare against the manifest; exit 1 on drift
 *   npm run verify:hero:update    # re-approve the current state (deliberate)
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(REPO_ROOT, 'tests', 'hero-manifest.json');

/**
 * Entry points. Both are the LANE A surface as the tickets define it: the mount
 * (HeroScene.tsx) and the scene itself. Walking from the mount is what pulls in
 * `@/lib/audit` — the low-end / ?no3d=1 gate that LANE A work must key off —
 * and walking from the scene pulls in `@/config/configurator`, whose
 * DEFAULT_CONFIG decides what the no-config default actually renders. Neither
 * was covered by the single-file md5.
 */
const ROOTS = [
  'src/components/HeroScene.tsx',
  'src/scenes/rapidconstruct-scene.js',
];

// tsconfig.json: "paths": { "@/*": ["./src/*"] }
const ALIAS = { '@/': 'src/' };

// Tried in order for extensionless specifiers ('./house-kit') and for
// directory specifiers ('./houses' -> './houses/index.js').
const EXTENSIONS = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs'];
const INDEX_FILES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'index.mjs'];

/**
 * Import specifiers in a source file.
 *
 * Statements are matched anchored at the start of a line, which is where real
 * ES module syntax lives. That also means a commented-out import (`// import
 * ...`) or a mention inside a docblock (` * import ...`) is skipped for free,
 * without trying to strip comments — comment stripping trips over `http://`
 * inside string literals, which this codebase's docblocks are full of.
 */
function readSpecifiers(source) {
  const specs = new Set();
  const push = (s) => { if (s) specs.add(s); };

  for (const line of source.split('\n')) {
    // import x from 'y' / import 'y' / export { x } from 'y'
    const statik = line.match(/^\s*(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]/)
      ?? line.match(/^\s*import\s*['"]([^'"]+)['"]/);
    if (statik) push(statik[1]);

    // await import('y') — can appear mid-line, so skip comment/docblock lines.
    if (!/^\s*(?:\/\/|\*|\/\*)/.test(line)) {
      for (const m of line.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) push(m[1]);
    }
  }
  return [...specs];
}

/** Resolve a specifier to a repo-relative path, or null if it is a bare package. */
function resolveSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(path.join(REPO_ROOT, fromFile)), spec);
  } else {
    const alias = Object.keys(ALIAS).find((a) => spec.startsWith(a));
    if (!alias) return null; // bare specifier: react, three, next/* — not hero source
    base = path.join(REPO_ROOT, ALIAS[alias], spec.slice(alias.length));
  }

  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(REPO_ROOT, candidate);
    }
  }
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const index of INDEX_FILES) {
      const candidate = path.join(base, index);
      if (fs.existsSync(candidate)) return path.relative(REPO_ROOT, candidate);
    }
  }
  return { unresolved: spec, from: fromFile };
}

/** Walk the import graph from ROOTS. Returns { files, errors }. */
function collect() {
  const files = new Map(); // repo-relative path -> { sha256, lines }
  const errors = [];
  const queue = [...ROOTS];

  while (queue.length) {
    const rel = queue.shift();
    if (files.has(rel)) continue;

    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) {
      errors.push(`entry point missing: ${rel}`);
      continue;
    }

    const bytes = fs.readFileSync(abs);
    const source = bytes.toString('utf8');
    files.set(rel, {
      sha256: createHash('sha256').update(bytes).digest('hex'),
      lines: source.split('\n').length,
    });

    for (const spec of readSpecifiers(source)) {
      const resolved = resolveSpecifier(spec, rel);
      if (resolved === null) continue;              // bare package
      if (typeof resolved === 'object') {
        // A relative/aliased import we could not resolve. Loud, never silent:
        // an unwatched hero file is the failure this gate exists to prevent.
        errors.push(`unresolved import ${JSON.stringify(resolved.unresolved)} in ${resolved.from}`);
        continue;
      }
      if (!files.has(resolved)) queue.push(resolved);
    }
  }

  // Sorted so the manifest diffs cleanly in review.
  const sorted = Object.fromEntries([...files.entries()].sort(([a], [b]) => a.localeCompare(b)));
  return { files: sorted, errors };
}

function writeManifest(files) {
  const manifest = {
    note: 'Approved hero surface (RC-115). Regenerate ONLY with an intentional, '
        + 'reviewed hero change: npm run verify:hero:update. Derived by walking '
        + 'the import graph from "roots" — never edit "files" by hand.',
    roots: ROOTS,
    files,
  };
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

// ---- run ---------------------------------------------------------------------

const update = process.argv.includes('--update');
const { files, errors } = collect();

if (errors.length) {
  console.error('HERO GATE: FAILED — the import graph could not be resolved.\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('\nFix the import (or teach scripts/verify-hero.mjs the new alias)');
  console.error('before trusting any hero verification.');
  process.exit(2);
}

if (update) {
  writeManifest(files);
  console.log(`HERO GATE: manifest updated — ${Object.keys(files).length} files approved.\n`);
  for (const [f, m] of Object.entries(files)) console.log(`  ${f}  (${m.lines} lines)`);
  console.log('\nCommit tests/hero-manifest.json together with the change that justifies it.');
  process.exit(0);
}

if (!fs.existsSync(MANIFEST)) {
  console.error('HERO GATE: no manifest yet. Create it with:\n\n  npm run verify:hero:update\n');
  process.exit(2);
}

const approved = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).files ?? {};
const added = Object.keys(files).filter((f) => !(f in approved));
const removed = Object.keys(approved).filter((f) => !(f in files));
const changed = Object.keys(files).filter((f) => f in approved && files[f].sha256 !== approved[f].sha256);

if (!added.length && !removed.length && !changed.length) {
  console.log(`HERO GATE: PASS — all ${Object.keys(files).length} hero files match the approved manifest.`);
  process.exit(0);
}

console.error('HERO GATE: DRIFT — the hero surface differs from the approved manifest.\n');
for (const f of changed) {
  const delta = files[f].lines - approved[f].lines;
  const sign = delta > 0 ? `+${delta}` : `${delta}`;
  console.error(`  CHANGED  ${f}  (${approved[f].lines} -> ${files[f].lines} lines, ${sign})`);
}
for (const f of added) console.error(`  ADDED    ${f}  (${files[f].lines} lines) — now reachable from the hero`);
for (const f of removed) console.error(`  REMOVED  ${f} — no longer reachable from the hero`);

console.error('\nThis is a report, not a verdict. Drift is EXPECTED when a LANE A task');
console.error('intentionally edits the hero — a refactor that only moves code between');
console.error('these files is fine, and so is adding a file the graph now reaches.');
console.error('\n  Intentional?  npm run verify:hero:update, and commit the manifest with the change.');
console.error('  Unexplained?  stop and write mailbox/questions/q341-scene-drift.md.');
process.exit(1);
