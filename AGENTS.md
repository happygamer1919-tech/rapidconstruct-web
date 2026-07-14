# RapidConstruct Website — Project Guide

Ground-up rebuild of rapidconstruct.md (construction & renovation company, Chișinău, Moldova).
Replaces the current Tilda site. Owner (Max) is non-technical. Bilingual: RO (default) / RU.

## Read first
- `docs/SPEC.md` — business context, reference-site content inventory, design & motion direction.
- `docs/BACKLOG.md` — phased tickets (RC-xxx). Work top-down within the current phase.
- `docs/QUESTIONS.md` — open questions blocking work (check before starting a blocked ticket).
- `docs/DECISIONS.md` — append-only decision log.

## Reference site
The live Tilda site https://rapidconstruct.md is the CONTENT reference only (services, copy,
contact details, promos, testimonials). Do NOT copy its markup, structure, or SEO mistakes.
Content inventory is captured in `docs/SPEC.md` §2.

## Working rules
- Feature branches only, never commit to main. Branch naming: `rc/<ticket-id>-<slug>`.
- Every PR: plain-language summary + click-through verification checklist for the owner on a preview URL.
- Blocked ticket protocol: write the question to `docs/QUESTIONS.md` with a recommended default,
  mark BLOCKED, move to the next unblocked ticket. Never idle, never guess product decisions.
- Verify behavior in a real browser (screenshots) before calling anything done. Test mobile viewport explicitly.
- Owner does not read code — all QA must be automated and machine-verifiable.

## Deploys & preview URLs (RC-002)
- Vercel project `rapidconstruct-web` (team sm33xys-projects, same as A&I). Linked via `.vercel/` (gitignored).
- Staging URL (public, give this to Max): https://rapidconstruct-web.vercel.app
- Per-PR previews: run `vercel deploy` on the branch, paste the deployment URL into the PR.
  CAVEAT: deployment-specific URLs are behind Vercel SSO until the owner disables
  Deployment Protection (see docs/QUESTIONS.md Q-08). Until then, Max verifies on the
  staging URL after merge.
- Real production (rapidconstruct.md DNS) stays on Tilda until launch ticket RC-403.
  `vercel deploy --prod` is reserved for that cutover — do not run it before RC-403.

## Stack
- Next.js App Router (TypeScript, Tailwind). Deployed on Vercel.
- i18n: next-intl, path-based locales — `/` = RO (default), `/ru/...` = Russian. hreflang on every page.
- Motion: Motion (framer-motion successor). Animate transform/opacity only.
- Forms: server action → email + Telegram notification to owner (see QUESTIONS.md for destination).
- Run `./scripts/setup.sh` once to scaffold the app (RC-001); after that, normal `npm run dev`.

## Motion guardrails
- prefers-reduced-motion is mandatory. Hero renders instantly (no LCP gating, no preloaders).
- Every animation must demonstrate the craft or the data (before/after, build-up reveals,
  counters, calculator feedback). No decorative-only motion, no scroll-jacking.

## SEO / GEO are first-class requirements (not a later phase)
Every page ships with: unique title + meta description, single H1, canonical (https),
OG tags + share image, JSON-LD (LocalBusiness sitewide; Service / FAQPage per page type),
correct `lang` and hreflang pair, and real content in server-rendered HTML (no client-only facts —
numbers like "500+ proiecte" must be in the markup, never rendered as "0+" placeholders).
Sitemap + robots + llms.txt generated from the route tree. Keep concrete, quotable facts
(prices from 160 lei/m², 30-year written warranty, 500+ projects) in crawlable text — they are
what AI engines cite.

## Language rules
- RO is the source of truth for copy; RU translations tracked per-page in the backlog.
- Never machine-translate silently: log every machine-drafted RU string set in
  `docs/RU-REVIEW.md` (owner-reviewed before launch). Do NOT put review markers in
  user-visible strings — that leaked into titles/UI once (2026-07-14).
- URLs: RO slugs at root (`/acoperisuri`), RU under `/ru/` with RU slugs (`/ru/kryshi`).

## Launch constraint
Old Tilda URLs (`/1`...`/6`, `/despre-noi`, `/contacte`, `/calcul-acoperis`, `/calcul-gard`,
`/portofoliu`) must 301 to their new equivalents at DNS cutover. Redirect map lives in `docs/SPEC.md` §5.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
