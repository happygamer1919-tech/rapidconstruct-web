#!/usr/bin/env node
// Live project board for RapidConstruct.
// Parses docs/STATUS.md on EVERY request and serves it as a dense dark kanban
// (Done / In Progress / Blocked / Next). No dependencies.
//
// The page is rendered client-side from data embedded on first paint, then the
// client polls /data every 10s and re-renders in place — so the live refresh
// never reloads the page or drops your filter text / focus. Done-column collapse
// and active chips are remembered in localStorage.
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
// Parsing  (unchanged behaviour: three STATUS formats, struck-through done
// items, ID badges on table rows, prose sub-blocks excluded per column)
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
// ID badges — extract Q-04 / RC-403 / B2 style ids and their prefixes so the
// client can offer quick-filter chips and match them in search.
// ---------------------------------------------------------------------------

const ID_RE = /\b(?:Q-\d{1,3}|RC-\d{1,3}|B\d{1,2})\b/g;
const PREFIX_ORDER = ['Q-', 'RC-', 'B'];

function idPrefix(id) {
  if (id.startsWith('Q-')) return 'Q-';
  if (id.startsWith('RC-')) return 'RC-';
  return 'B';
}

function extractIds(text) {
  return text.match(ID_RE) || [];
}

// Build the JSON the client renders from. Fresh each request.
function buildData(md) {
  const parsed = parseStatus(md);
  const prefixSet = new Set();
  const columns = COLUMNS.map((col) => {
    const cards = parsed[col.key].map((c) => {
      const ids = extractIds(c.title + ' ' + c.body);
      const prefixes = [...new Set(ids.map(idPrefix))];
      prefixes.forEach((p) => prefixSet.add(p));
      return { title: c.title, body: c.body, done: c.done, prefixes };
    });
    return { key: col.key, title: col.title, color: col.color, cards };
  });
  const prefixes = [...prefixSet].sort(
    (a, b) => (PREFIX_ORDER.indexOf(a) + 1 || 99) - (PREFIX_ORDER.indexOf(b) + 1 || 99)
  );
  return { columns, prefixes, refresh: REFRESH_SECONDS, stamp: new Date().toLocaleTimeString() };
}

// ---------------------------------------------------------------------------
// Client — stringified and embedded. Written with no backticks and no ${} so it
// drops cleanly into the server template. Never executed in Node.
// ---------------------------------------------------------------------------

function clientMain() {
  var DATA = window.__BOARD__;
  var PREVIEW_MIN = 12;   // only columns longer than this offer the fold affordance
  var PREVIEW_COUNT = 3;  // how many cards a folded column shows
  // Two independent per-column states, both keyed by column key and persisted:
  //   collapsed[key] — whole column body hidden (header toggle + chevron)
  //   folded[key]    — opt-in: fold a very long (>PREVIEW_MIN) open column to a preview
  var state = { q: '', prefixes: new Set(), collapsed: {}, folded: {} };
  try { state.prefixes = new Set(JSON.parse(localStorage.getItem('board.prefixes') || '[]')); } catch (e) {}
  try { state.collapsed = JSON.parse(localStorage.getItem('board.collapsed') || '{}'); } catch (e) {}
  try { state.folded = JSON.parse(localStorage.getItem('board.folded') || '{}'); } catch (e) {}
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var boardEl = document.getElementById('board');
  var statsEl = document.getElementById('stats');
  var chipsEl = document.getElementById('chips');
  var qEl = document.getElementById('q');
  var stampEl = document.getElementById('stamp');

  function colorOf(key) {
    var c = DATA.columns.filter(function (x) { return x.key === key; })[0];
    return c ? c.color : '#8b949e';
  }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function filterActive() { return state.q !== '' || state.prefixes.size > 0; }

  function matches(card) {
    var textOk = !state.q || (card.title + ' ' + card.body).toLowerCase().indexOf(state.q) !== -1;
    var pfxOk = state.prefixes.size === 0 || (card.prefixes || []).some(function (p) { return state.prefixes.has(p); });
    return textOk && pfxOk;
  }

  function renderCard(c) {
    var card = el('article', 'card' + (c.done ? ' done' : ''));
    var h = el('h3'); h.textContent = c.title; card.appendChild(h);
    if (c.body) { var p = el('p', 'body'); p.textContent = c.body; card.appendChild(p); }
    return card;
  }

  // One shared renderer for every column — no column is a special case.
  function renderColumn(col) {
    var visible = col.cards.filter(matches);
    // A filter with matches force-expands a collapsed column so hits are visible.
    var collapsed = !!state.collapsed[col.key] && !(filterActive() && visible.length > 0);

    var section = el('section', 'col' + (collapsed ? ' collapsed' : ''));
    section.style.setProperty('--c', col.color);

    var head = el('header', 'col-head');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-expanded', String(!collapsed));
    head.appendChild(el('span', 'dot'));
    var name = el('span', 'name'); name.textContent = col.title; head.appendChild(name);
    var count = el('span', 'count'); count.textContent = visible.length; head.appendChild(count);
    var chev = el('span', 'chev'); chev.textContent = '▾'; head.appendChild(chev);
    function toggleColumn() {
      state.collapsed[col.key] = !state.collapsed[col.key];
      save('board.collapsed', state.collapsed);
      render();
    }
    head.onclick = toggleColumn;
    head.onkeydown = function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggleColumn(); }
    };
    section.appendChild(head);

    if (!collapsed) {
      var wrap = el('div', 'cards');
      // Columns start fully expanded. Only very long columns (>PREVIEW_MIN) offer
      // an opt-in fold to a short preview; an active filter always shows every match.
      var folded = !filterActive() && !!state.folded[col.key];
      var longCol = col.cards.length > PREVIEW_MIN;
      var list = (folded && longCol) ? visible.slice(-PREVIEW_COUNT) : visible;
      list.forEach(function (c) { wrap.appendChild(renderCard(c)); });

      if (!filterActive() && longCol) {
        var btn = el('button', 'toggle');
        btn.textContent = folded ? 'Show all ' + visible.length : 'Show fewer';
        btn.onclick = function () {
          state.folded[col.key] = !state.folded[col.key];
          save('board.folded', state.folded);
          render();
        };
        wrap.appendChild(btn);
      }
      if (list.length === 0) { var e = el('p', 'empty'); e.textContent = '— nothing —'; wrap.appendChild(e); }
      section.appendChild(wrap);
    }
    return section;
  }

  // Stats bar — counts come straight from the parsed file and recompute on every
  // render (filter change and 10s poll alike). When a filter is active the count
  // metrics show "filtered / total" so a subset is obvious.
  function renderStats() {
    var totals = {}, filtered = {}, grand = 0, grandF = 0;
    DATA.columns.forEach(function (col) {
      var t = col.cards.length, f = col.cards.filter(matches).length;
      totals[col.key] = t; filtered[col.key] = f;
      grand += t; grandF += f;
    });
    var pct = grand ? Math.round((totals.done || 0) / grand * 100) : 0;
    var active = filterActive();

    var metrics = [
      { label: 'Total', color: '#c9d1d9', t: grand, f: grandF },
      { label: 'Done', color: colorOf('done'), t: totals.done, f: filtered.done },
      { label: 'In Progress', color: colorOf('progress'), t: totals.progress, f: filtered.progress },
      { label: 'Blocked', color: colorOf('blocked'), t: totals.blocked, f: filtered.blocked },
      { label: 'Next', color: colorOf('next'), t: totals.next, f: filtered.next },
      { label: '% Complete', color: colorOf('done'), pct: pct },
    ];

    statsEl.textContent = '';
    metrics.forEach(function (m) {
      var card = el('div', 'metric');
      card.style.setProperty('--c', m.color);
      var num = el('div', 'num');
      if (m.pct !== undefined) {
        num.textContent = m.pct + '%';
      } else if (active) {
        num.textContent = m.f + ' ';
        var sub = el('span', 'sub'); sub.textContent = '/ ' + m.t; num.appendChild(sub);
      } else {
        num.textContent = m.t;
      }
      var lbl = el('div', 'lbl'); lbl.textContent = m.label;
      card.appendChild(num); card.appendChild(lbl);
      statsEl.appendChild(card);
    });
  }

  function render() {
    renderStats();
    boardEl.textContent = '';
    DATA.columns.forEach(function (col) { boardEl.appendChild(renderColumn(col)); });
  }

  function renderChips() {
    chipsEl.textContent = '';
    DATA.prefixes.forEach(function (p) {
      var chip = el('button', 'chip' + (state.prefixes.has(p) ? ' on' : ''));
      chip.textContent = p;
      chip.onclick = function () {
        if (state.prefixes.has(p)) state.prefixes.delete(p); else state.prefixes.add(p);
        localStorage.setItem('board.prefixes', JSON.stringify([].concat(Array.from(state.prefixes))));
        renderChips(); render();
      };
      chipsEl.appendChild(chip);
    });
  }

  qEl.addEventListener('input', function () { state.q = qEl.value.trim().toLowerCase(); render(); });

  stampEl.textContent = 'read ' + DATA.stamp;
  renderChips();
  render();

  // Live refresh with no page reload: keeps the search text, focus and chips.
  setInterval(function () {
    fetch('/data', { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (fresh) {
      if (!fresh) return;
      DATA.columns = fresh.columns;
      DATA.prefixes = fresh.prefixes;
      DATA.stamp = fresh.stamp;
      stampEl.textContent = 'read ' + fresh.stamp;
      // Drop any active chip whose prefix no longer exists in the file.
      Array.from(state.prefixes).forEach(function (p) {
        if (fresh.prefixes.indexOf(p) === -1) state.prefixes.delete(p);
      });
      renderChips();
      render();
    }).catch(function () {});
  }, (DATA.refresh || 10) * 1000);
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

const STYLES = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #0d1117; color: #e6edf3; overflow: hidden;
    display: flex; flex-direction: column;
    font: 13px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header.top {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex: 0 0 auto;
    padding: 8px 14px; border-bottom: 1px solid #1f2630; background: #0f141b;
  }
  .brand { font-size: 13px; font-weight: 650; letter-spacing: .2px; }
  .brand .sub { color: #6e7681; font-size: 11px; font-weight: 400; margin-left: 6px; }
  .tools { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
  #q {
    background: #161b22; border: 1px solid #21262d; border-radius: 6px; color: #e6edf3;
    font-size: 12px; padding: 5px 9px; width: 210px; outline: none;
  }
  #q:focus { border-color: #58a6ff; }
  .chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .chip {
    background: #161b22; border: 1px solid #21262d; color: #9aa4af; border-radius: 999px;
    font: 600 11px/1 inherit; letter-spacing: .04em; padding: 4px 10px; cursor: pointer;
  }
  .chip:hover { border-color: #3d444d; color: #c9d1d9; }
  .chip.on { background: rgba(31,111,235,.18); border-color: #1f6feb; color: #79c0ff; }
  .stats {
    display: flex; gap: 8px; flex-wrap: wrap; flex: 0 0 auto;
    padding: 8px 14px 9px; border-bottom: 1px solid #1f2630; background: #0f141b;
  }
  .metric {
    flex: 1 1 0; min-width: 96px; background: #12181f;
    border: 1px solid #1f2630; border-top: 2px solid var(--c); border-radius: 8px;
    padding: 6px 10px 7px; display: flex; flex-direction: column; gap: 2px;
  }
  .metric .num { font-size: 21px; font-weight: 700; line-height: 1.05; color: var(--c); }
  .metric .num .sub { font-size: 12px; font-weight: 600; color: #6e7681; margin-left: 1px; }
  .metric .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: #7d8590; }
  .board {
    flex: 1 1 auto; min-height: 0; display: grid;
    grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
    gap: 10px; padding: 10px 14px;
  }
  @media (max-width: 900px) {
    html, body { height: auto; }
    body { overflow: auto; }
    .board {
      grid-template-columns: 1fr; grid-template-rows: none;
      grid-auto-rows: minmax(200px, auto); overflow: visible;
    }
  }
  .col {
    min-width: 0; min-height: 0; display: flex; flex-direction: column;
    background: #0f141b; border: 1px solid #1f2630; border-radius: 10px; overflow: hidden;
  }
  .col-head {
    display: flex; align-items: center; gap: 7px; flex: 0 0 auto; padding: 8px 10px;
    border-bottom: 1px solid #1f2630;
    background: color-mix(in srgb, var(--c) 13%, #0f141b);
    text-transform: uppercase; font-size: 11px; letter-spacing: .09em;
    cursor: pointer; user-select: none; transition: background .12s ease;
  }
  .col-head:hover { background: color-mix(in srgb, var(--c) 24%, #0f141b); }
  .col-head:focus-visible { outline: 1px solid var(--c); outline-offset: -1px; }
  .col.collapsed .col-head { border-bottom-color: transparent; }
  .col-head .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 7px var(--c); flex: 0 0 auto; }
  .col-head .name { font-weight: 700; }
  .col-head .count {
    margin-left: auto; min-width: 20px; text-align: center; padding: 0 7px; border-radius: 999px;
    font-size: 11px; font-weight: 700; color: var(--c);
    background: color-mix(in srgb, var(--c) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
  }
  .col-head .chev {
    flex: 0 0 auto; font-size: 10px; line-height: 1; color: #8b949e;
    transition: transform .15s ease; transform: rotate(0deg);
  }
  .col.collapsed .col-head .chev { transform: rotate(-90deg); }
  .cards {
    flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 8px;
    display: flex; flex-direction: column; gap: 7px;
  }
  .card {
    background: #161b22; border: 1px solid #21262d; border-left: 3px solid var(--c);
    border-radius: 7px; padding: 7px 9px;
  }
  .card h3 { margin: 0; font-size: 12.5px; font-weight: 620; line-height: 1.3; }
  .card .body { margin: 4px 0 0; color: #8b949e; font-size: 11.5px; line-height: 1.4; }
  .card.done { opacity: .5; }
  .card.done h3 { color: #8b949e; font-weight: 550; }
  .toggle {
    margin-top: 2px; background: transparent; border: 1px dashed #30363d; color: #7d8590;
    border-radius: 6px; font-size: 11px; padding: 5px; cursor: pointer;
  }
  .toggle:hover { color: #adbac7; border-color: #484f58; }
  .empty { color: #57606a; font-size: 11px; font-style: italic; margin: 4px; }
  .cards::-webkit-scrollbar { width: 8px; }
  .cards::-webkit-scrollbar-thumb { background: #21262d; border-radius: 4px; }
  .cards::-webkit-scrollbar-thumb:hover { background: #30363d; }
`;

function renderPage(data) {
  const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RapidConstruct — Live Board</title>
<style>${STYLES}</style>
</head>
<body>
  <div id="stats" class="stats"></div>
  <header class="top">
    <div class="brand">RapidConstruct — Live Board <span id="stamp" class="sub"></span></div>
    <div class="tools">
      <input id="q" type="search" placeholder="Filter cards…" autocomplete="off" spellcheck="false">
      <div id="chips" class="chips"></div>
    </div>
  </header>
  <main id="board" class="board"></main>
  <script>window.__BOARD__ = ${dataJson};</script>
  <script>(${clientMain.toString()})();</script>
</body>
</html>`;
}

function renderError(message) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="${REFRESH_SECONDS}">
<title>Board — error</title>
<style>body{background:#0d1117;color:#f85149;font:13px -apple-system,sans-serif;padding:40px}</style>
</head><body><h1>Cannot read the board</h1><pre>${escapeHtml(message)}</pre>
<p style="color:#7d8590">Expected file: ${escapeHtml(STATUS_FILE)}</p></body></html>`;
}

// ---------------------------------------------------------------------------
// Server — re-reads docs/STATUS.md on every request (page and /data alike)
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  let md;
  try {
    md = fs.readFileSync(STATUS_FILE, 'utf8'); // fresh read every request
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderError(err.message));
    return;
  }

  if (req.url === '/data' || req.url.startsWith('/data?')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(buildData(md)));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(renderPage(buildData(md)));
});

server.listen(PORT, () => {
  console.log(`RapidConstruct board → http://localhost:${PORT}`);
});
