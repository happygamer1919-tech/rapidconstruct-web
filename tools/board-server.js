#!/usr/bin/env node
// Live project board for RapidConstruct.
// Parses docs/STATUS.md on EVERY request and renders it as a dark kanban with
// four columns (Done / In Progress / Blocked / Next). No dependencies.
// The page meta-refreshes every 10s, so the board always reflects the file.
//
//   node tools/board-server.js         # http://localhost:4300
//   PORT=5000 node tools/board-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, '..', 'docs', 'STATUS.md');
const PORT = Number(process.env.PORT) || 4300;
const REFRESH_SECONDS = 10;

// The four columns we surface, matched against ## headings (emoji ignored).
// `match` is a lowercased substring test against the heading text.
const COLUMNS = [
  { key: 'done', title: 'Done', match: 'done', color: '#3fb950' },
  { key: 'progress', title: 'In Progress', match: 'in progress', color: '#d29922' },
  { key: 'blocked', title: 'Blocked', match: 'blocked', color: '#f85149' },
  { key: 'next', title: 'Next', match: 'next', color: '#58a6ff' },
];

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Strip inline markdown to readable plain text, then HTML-escape it.
function cleanInline(s) {
  return escapeHtml(
    String(s)
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) -> text
      .replace(/\*\*/g, '')                     // bold
      .replace(/`/g, '')                        // code
      .replace(/~~/g, '')                       // strikethrough markers
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Pull the lines belonging to one ## section: everything after its heading up
// to the next ## OR ### heading (so a section's prose sub-blocks are excluded).
function sectionLines(allLines, startIdx) {
  const out = [];
  for (let i = startIdx + 1; i < allLines.length; i++) {
    if (/^#{2,3}\s/.test(allLines[i])) break;
    out.push(allLines[i]);
  }
  return out;
}

// A heading line -> its plain text with leading emoji/# stripped.
function headingText(line) {
  return line.replace(/^#+\s*/, '').replace(/[\u{1F000}-\u{1FFFF}←-➿️]/gu, '').trim();
}

// Split a card's raw text into { title, body }, detecting a leading **bold**
// title or an em-dash separator.
function splitTitleBody(raw) {
  const text = raw.trim();
  let m = text.match(/^\*\*(.+?)\*\*(.*)$/);
  if (m) {
    return { title: cleanInline(m[1]), body: cleanInline(m[2].replace(/^\s*[—:-]\s*/, '')) };
  }
  const dash = text.indexOf(' — ');
  if (dash !== -1) {
    return { title: cleanInline(text.slice(0, dash)), body: cleanInline(text.slice(dash + 3)) };
  }
  return { title: cleanInline(text), body: '' };
}

function isTableSeparator(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c.trim()));
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

// Turn one section's lines into an array of cards: { title, body, done }.
function parseCards(lines) {
  const cards = [];
  let current = null; // an in-progress bullet / numbered card being extended
  const flush = () => {
    if (current) {
      cards.push(splitCard(current));
      current = null;
    }
  };

  // Pre-scan table rows to know which row is a header (the one above a separator).
  const headerRows = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\|.*\|\s*$/.test(lines[i]) && isTableSeparator(splitRow(lines[i]))) {
      if (i > 0 && /^\s*\|.*\|\s*$/.test(lines[i - 1])) headerRows.add(i - 1);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flush();
      const cells = splitRow(line);
      if (isTableSeparator(cells) || headerRows.has(i)) continue;
      cards.push(cardFromRow(cells));
      continue;
    }

    // New bullet
    let m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      flush();
      current = m[1];
      continue;
    }

    // New numbered item
    m = line.match(/^\s*\d+\.\s+(.*)$/);
    if (m) {
      flush();
      current = m[1];
      continue;
    }

    // Continuation of the current bullet/numbered card (indented wrap line)
    if (current && line.trim() !== '' && /^\s+\S/.test(line)) {
      current += ' ' + line.trim();
      continue;
    }

    // Anything else (blank line, intro prose) ends the current card.
    if (line.trim() === '') flush();
  }
  flush();
  return cards.filter((c) => c.title);
}

function splitCard(raw) {
  // Only a struck-through (~~...~~) line counts as "done/superseded" and gets dimmed.
  const done = /~~/.test(raw);
  const { title, body } = splitTitleBody(raw);
  return { title, body, done };
}

function cardFromRow(cells) {
  const done = cells.some((c) => /~~/.test(c));
  // Clean first, then drop cells that are empty or a bare dash placeholder.
  const parts = cells.map(cleanInline).filter((c) => c && c !== '—' && c !== '-');
  if (parts.length === 0) return { title: '', body: '', done: false };
  // If the first cell is a short id badge (e.g. "B2", "#", "B10"), use the next
  // cell as the title and keep the id as a prefix.
  let idx = 0;
  let badge = '';
  if (/^#?[A-Za-z]?\d{1,3}$/.test(parts[0]) && parts[0].length <= 4 && parts.length > 1) {
    badge = parts[0];
    idx = 1;
  }
  const title = (badge ? badge + ' · ' : '') + parts[idx];
  const body = parts.slice(idx + 1).join(' — ');
  return { title, body, done };
}

function parseStatus(md) {
  const lines = md.split('\n');
  const result = {};
  for (const col of COLUMNS) result[col.key] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!/^##\s/.test(lines[i])) continue;
    const text = headingText(lines[i]).toLowerCase();
    const col = COLUMNS.find((c) => text === c.match || text.includes(c.match));
    if (!col || result[col.key].length) continue; // first matching section only
    result[col.key] = parseCards(sectionLines(lines, i));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderCard(card, color) {
  const body = card.body ? `<p class="body">${card.body}</p>` : '';
  return (
    `<article class="card${card.done ? ' done' : ''}" style="--c:${color}">` +
    `<h3>${card.title}</h3>${body}</article>`
  );
}

function renderColumn(col, cards) {
  const items = cards.map((c) => renderCard(c, col.color)).join('') ||
    '<p class="empty">— nothing here —</p>';
  return (
    `<section class="col" style="--c:${col.color}">` +
    `<header class="col-head"><span class="dot"></span>` +
    `<span class="name">${col.title}</span>` +
    `<span class="count">${cards.length}</span></header>` +
    `<div class="cards">${items}</div></section>`
  );
}

function renderPage(data, meta) {
  const cols = COLUMNS.map((c) => renderColumn(c, data[c.key])).join('');
  const total = COLUMNS.reduce((n, c) => n + data[c.key].length, 0);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="${REFRESH_SECONDS}">
<title>RapidConstruct — Live Board</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #0d1117; color: #e6edf3;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header.top {
    display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
    padding: 20px 24px 8px;
  }
  header.top h1 { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: .2px; }
  header.top .sub { color: #7d8590; font-size: 12px; }
  .board {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    padding: 12px 24px 32px; align-items: start;
  }
  @media (max-width: 900px) { .board { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .board { grid-template-columns: 1fr; } }
  .col { background: #0f141b; border: 1px solid #1f2630; border-radius: 12px; overflow: hidden; }
  .col-head {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px; border-bottom: 1px solid #1f2630;
    background: color-mix(in srgb, var(--c) 12%, transparent);
  }
  .col-head .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
  .col-head .name { font-weight: 650; font-size: 13px; letter-spacing: .3px; }
  .col-head .count {
    margin-left: auto; min-width: 24px; text-align: center;
    padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 650;
    color: var(--c); background: color-mix(in srgb, var(--c) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
  }
  .cards { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
  .card {
    background: #161b22; border: 1px solid #21262d; border-left: 3px solid var(--c);
    border-radius: 8px; padding: 10px 12px;
  }
  .card h3 { margin: 0; font-size: 13px; font-weight: 620; line-height: 1.35; }
  .card .body { margin: 6px 0 0; color: #9aa4af; font-size: 12px; }
  .card.done h3 { color: #8b949e; }
  .card.done { opacity: .62; }
  .empty { color: #57606a; font-size: 12px; padding: 10px 12px; margin: 0; font-style: italic; }
  footer { color: #57606a; font-size: 11px; padding: 0 24px 24px; }
</style>
</head>
<body>
  <header class="top">
    <h1>RapidConstruct — Live Board</h1>
    <span class="sub">${total} items · re-read from docs/STATUS.md on every load · auto-refresh ${REFRESH_SECONDS}s · ${meta}</span>
  </header>
  <main class="board">${cols}</main>
  <footer>Source: docs/STATUS.md — where it disagrees with anything else, STATUS wins.</footer>
</body>
</html>`;
}

function renderError(message) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="${REFRESH_SECONDS}">
<title>Board — error</title>
<style>body{background:#0d1117;color:#f85149;font:14px -apple-system,sans-serif;padding:40px}</style>
</head><body><h1>Cannot read the board</h1><pre>${escapeHtml(message)}</pre>
<p style="color:#7d8590">Expected file: ${escapeHtml(STATUS_FILE)}</p></body></html>`;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  let body;
  try {
    const md = fs.readFileSync(STATUS_FILE, 'utf8'); // fresh read every request
    const data = parseStatus(md);
    const stamp = new Date().toLocaleTimeString();
    body = renderPage(data, `read ${stamp}`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  } catch (err) {
    body = renderError(err.message);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
  }
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`RapidConstruct board → http://localhost:${PORT}`);
});
