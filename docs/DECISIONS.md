# Decision Log (append-only)

- **2026-07-13 — Rebuild from scratch, not fix Tilda.** Custom Next.js App Router site,
  deployed on Vercel; Tilda stays live until DNS cutover (RC-403). Rationale: Tilda caps
  SEO control, JS-rendering hides facts from crawlers, slow LCP; business is investing in
  the web channel.
- **2026-07-13 — Bilingual RO (default at `/`) + RU (at `/ru`).** No EN at launch (Q-05).
  Rationale: Moldova search market splits RO/RU; RU roughly doubles addressable queries.
- **2026-07-13 — SEO/GEO is a build requirement, not a phase.** Every page ships with full
  metadata, JSON-LD, hreflang, and server-rendered facts from day one (see CLAUDE.md).
- **2026-07-13 — Same working model as A&I site.** Feature branches + PRs with plain-language
  owner checklists, blocked-question protocol, browser-verified QA. Owner (Max) reviews
  preview URLs only, never code.
