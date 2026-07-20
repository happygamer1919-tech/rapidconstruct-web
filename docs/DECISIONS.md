# Decision Log (append-only)

- **2026-07-13 — Rebuild from scratch, not fix Tilda.** Custom Next.js App Router site,
  deployed on Vercel; Tilda stays live until DNS cutover (RC-403). Rationale: Tilda caps
  SEO control, JS-rendering hides facts from crawlers, slow LCP; business is investing in
  the web channel.
- **2026-07-13 — Bilingual RO (default at `/`) + RU (at `/ru`).** No EN at launch (Q-05).
  Rationale: Moldova search market splits RO/RU; RU roughly doubles addressable queries.
- **2026-07-13 — SEO/GEO is a build requirement, not a phase.** Every page ships with full
  metadata, JSON-LD, hreflang, and server-rendered facts from day one (see CLAUDE.md).
- **2026-07-13 — Redirect map confirmed from Tilda admin (Q-02 closed).** Owner logged into
  Tilda in the shared browser pane; Claude read the page list. /1–/6 map by nav order exactly
  as guessed; legacy "Bara de meniu" pages are 404 and need no redirects; /page53648667.html → /.
  Tilda-access pattern for future needs: owner logs in, Claude reads (no credentials shared).
- **2026-07-13 — Same working model as A&I site.** Feature branches + PRs with plain-language
  owner checklists, blocked-question protocol, browser-verified QA. Owner (Max) reviews
  preview URLs only, never code.
- **2026-07-20 — Linkul „Portofoliu" scos din meniu până când pagina există (RC-104).**
  `/portofoliu` era linkat din meniu (sus + jos) și din secțiunea „Proiecte recente", dar
  pagina nu e construită — toate trei duceau în 404. Scoase temporar; rândurile de proiecte
  rămân vizibile, doar nu mai sunt clickabile. Se pun la loc când RC-104 construiește pagina
  (blocat pe Q-06, pozele reale). Rationale: un 404 în meniul principal strică și impresia
  vizitatorului, și scorul SEO.
