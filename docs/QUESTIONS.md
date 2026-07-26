# Open Questions

Format: Q-id · status · question · recommended default · blocks.
When Max answers, move the decision to DECISIONS.md and unblock the tickets.

## Q-01 — OPEN — Brand: keep or refresh?
Keep the current orange/charcoal logo and colors, or refresh the visual identity as part
of the rebuild? **Recommended default:** keep the logo, modernize the palette around it
(orange accent on warm neutrals). **Blocks:** RC-003 final tokens (can start with default).

## Q-02 — RESOLVED 2026-07-13 — What are Tilda pages /1–/6 and /page53648667.html exactly?
Answered from the Tilda admin page list (owner logged in, Claude read the project).
Full confirmed redirect map in SPEC §5; audit notes in SPEC §6. /1=Reparatii la cheie,
/2=Case & Constructii, /3=Fatade, /4=Finisaje, /5=Proiectare & Design, /6=Instalatii;
/page53648667.html is an orphan legacy landing → redirect to /.

## Q-03 — OPEN — Where should leads go?
Form submissions + calculator leads: email only, or email + Telegram/WhatsApp notification
to Max's phone? Which number/chat? **Recommended default:** email to
rapidconstructmd@gmail.com + Telegram bot message to Max. **Blocks:** RC-105, RC-107.

## Q-04 — RESOLVED 2026-07-25 — Domain/DNS + Tilda access
**RESOLVED (2026-07-25):** the owner **has the domain/registrar credentials** for
`rapidconstruct.md`. This is no longer blocked on owner access. It unblocks the
**RC-403 cutover as a sequencing matter only** — the cutover itself stays the
**owner's call and timing**, DNS is **not** touched here, and `NEXT_PUBLIC_SITE_URL`
is **not** added (see the hard rules). The registrar-login details go into the
RC-403 cutover runbook when the owner chooses to cut over.

Tilda access: WORKS — owner logs into tilda.cc in the browser pane and Claude reads the
admin (done 2026-07-13 for the page audit; same flow for photo export). Owner should
change the Tilda password (it was pasted in chat once).

**DNS investigated 2026-07-22 (dig + whois.nic.md), facts:**
```
rapidconstruct.md   registered 2025-02-09, expires 2027-02-09
NameServers         ns1.tildadns.com, ns2.tildadns.com   <- Tilda hosts the ZONE
A                   194.48.203.138 (Tilda), www CNAMEs to apex
MX                  NONE
```
- Tilda controls the DNS **zone**, but Tilda is NOT the registrar — `.md` domains must be
  registered through a NIC.MD-accredited registrar. Someone registered it in Feb 2025 and
  delegated it to tildadns. NIC.MD hides the registrar in whois, so the only way to find it
  is to ask the owner **who he paid for the domain** (not Tilda).
- **Preferred cutover (Path A):** change nameservers at the REGISTRAR to
  `ns1.vercel-dns.com` / `ns2.vercel-dns.com`. Needs the registrar login — still missing.
- **Path B (avoid):** edit the A record inside Tilda's panel to point at Vercel. Uses the
  login we already have, BUT leaves the zone hosted by the vendor we are leaving — when the
  Tilda subscription lapses, DNS dies and the site goes dark. Also not certain Tilda's panel
  permits an A record pointing away from Tilda.
- ✅ **No MX records** — the company runs on rapidconstructmd@gmail.com, so nothing email
  depends on this domain. The cutover cannot break their email.

**Blocks:** RC-403 (registrar login is the last missing piece).

## Q-05 — OPEN — Is an EN version ever needed?
RO+RU covers the local market. EN only matters for foreign investors/commercial clients.
**Recommended default:** no EN at launch; architecture supports adding it later. **Blocks:** RC-504.

## Q-06 — OPEN — Real photos
Portfolio needs original project photos (before/after ideally). Tilda site photos may be
stock or low-res. Ask Max for a Drive/phone dump of real site photos. Also: the Tilda MD
folder has an unpublished page named "img" (pageid 106732726) that may be a photo stash —
check it during content export. **Blocks:** RC-104 quality (can build with placeholders).

## Q-08 — RESOLVED 2026-07-22 — Vercel Deployment Protection disabled
Preview links now open WITHOUT a Vercel login. Done via the API
(`PATCH /v9/projects/<id>` with `ssoProtection: null`); verified `ssoProtection`
is now `null` and a fresh preview returns 200 on `/`, `/ru`, `/portofoliu`,
`/ru/kryshi` and `/politica-de-confidentialitate`.

⚠️ **This removed the only thing keeping crawlers off the staging host.** Shipped
together with a safeguard (`IS_UNINDEXABLE_STAGING`): while `NEXT_PUBLIC_SITE_URL`
is unset, robots.txt returns `Disallow: /` with no sitemap line and every page
emits `noindex, nofollow`. Without it Google could index
rapidconstruct-web.vercel.app as canonical and rapidconstruct.md would launch
competing with its own staging duplicate. The safeguard clears itself when the
real domain is set (the production guard makes the staging value impossible
there) — nothing to undo at cutover. Regression tests in tests/redirects.spec.ts.

**Optional upgrade, still open:** install the Vercel GitHub App on the
happygamer1919-tech account (github.com/apps/vercel) and grant it
rapidconstruct-web — then every PR gets its preview URL automatically instead of
a manual `vercel deploy`.

## Q-07 — OPEN (ESCALATED 2026-07-25) — Are the claimed numbers accurate?
"500+ case", "250+ recenzii", "15+ ani", "garanție 30 ani", "160 lei/m²" — we will publish
these as quotable facts (SEO/GEO), so they must be true and defensible. Confirm with Max.

**ESCALATED 2026-07-25 — the client's OWN live site contradicts itself.** Harvested from
rapidconstruct.md, the same site states, in different places:
- **Projects:** "15000+ Proiecte Finalizate" **vs** "Peste 500 de case".
- **Rating:** "5/5" **vs** "4.9/5 din 250+ recenzii".
- **Warranty:** "garanție până la 30 ani" **vs** the FAQ's "între 3 și 50 ani".
**Do NOT copy any of these numbers** into the new site. The owner must **choose ONE
consistent set** before any of it is published as quotable SEO/GEO fact.
**Blocks:** none technically (site builds without them), but they must be resolved before
launch — publishing self-contradictory claims is a trust/legal risk (RC-402).

## Q-09 — OPEN — Email sending credentials (contact form leads)
The RC-105 contact form is live and validates leads server-side, but has no email channel
yet. Until one is set, every lead is written to the Vercel function logs (Vercel → project
rapidconstruct-web → Logs, grep `[lead]`) so nothing is lost. **Recommended default:** create
a free Resend account (resend.com, 100 emails/day free), then set `RESEND_API_KEY` in the
Vercel project env — leads then email to rapidconstructmd@gmail.com automatically (delivery
seam already wired in src/lib/lead.ts). A Telegram notifier can be added at the same seam
later (Q-03). **Blocks:** nothing (log fallback in place); improves owner's lead visibility.

## Q-10 — OPEN — Calculator prices need confirmation
Extracted from your live Tilda calculator (docs/PRICING.md): 13 materials. Confirm: (1) Creaton ceramică 57/58 lei — per BUCATĂ or per m²? (2) what exactly is "160 lei/m² înghețat" (no material matches it)? (3) do prices include jgheaburi/burlane și demontare? **Blocks:** publishing the two ceramic entries; the other 11 ship in the calculator.

**Discrepancy found 2026-07-25 (client's live site).** The live rapidconstruct.md
advertises **"160 lei/m² înghețat pentru 2026"** for *acoperiș* — but our configurator
placeholders quote roofing bands of **450 / 550 / 800 lei/m²** (metalică / shingle / rocă
vulcanică). These don't reconcile: "160 lei/m²" may be a promo floor, a labour-only rate, or
a different scope entirely. **Owner must clarify what "160 lei/m²" covers** (material?
labour? which roof?) before either figure is published — do not merge the two.

**🚨 ESCALATED 2026-07-25 — LAUNCH-BLOCKING for the configurator.** The
configurator's "placeholder" roofing bands **450 / 550 / 800 lei/m²** are **not
neutral placeholders** — they are **Imperlux's LIVE PUBLISHED price bands**, a named
competitor (source `imperlux.md/acoperisuri/preturi`):
- țiglă metalică **450–900**, shingle **550–1100**, rocă vulcanică **800–1450**.
Our placeholders were seeded from the low end of a competitor's real prices. **The
configurator MUST NOT go live with these numbers under any circumstances** — a
pre-launch gate was added to `docs/LAUNCH-CHECKLIST.md` that FAILS if the
Imperlux-derived bands (450/550/800) are still present.

The client's **only** public price is "160 lei/m² înghețat 2026" for acoperiș, which
is **below the market manoperă-only (labour-only) rate of 180–280 lei/m²** — so its
scope is unclear and it **cannot be used as a band** as-is. **No fence prices exist
publicly** either. **The owner must supply his own real price bands** (roof materials
+ fences) before the configurator can launch.
**Blocks:** now LAUNCH-BLOCKING for the whole configurator (was: only the 2 ceramic
roof-calculator entries).

**✅ PARTIALLY ANSWERED 2026-07-25 (owner) — ROOFS supplied; fences + "160" still open.**
Owner's real configurator roof bands, **montaj (installation) inclus**, "de la X"
(starting price, min only — no max given):
| Material | Owner band | Replaces (Imperlux) |
|---|---|---|
| țiglă metalică | **de la 1100 lei/m²** | ~~450–900~~ |
| șindrilă bituminoasă (shingle) | **de la 1200 lei/m²** | ~~550–1100~~ |
| rocă vulcanică | **de la 1400 lei/m²** | ~~800–1450~~ |
| **țiglă ceramică** | **de la 1600 lei/m²** | ~~preț la cerere~~ (now HAS a band) |

- **Configurator code update required (LANE C, `feature/configurator`, NOT this docs
  PR):** set these min values in `src/config/configurator.ts` `ROOF_MATERIALS_3D[*].band`
  (owner gave min only → display "de la X"; the `max` field has no owner value, drop it
  or make it nullable), mark prices "montaj inclus", and **give țiglă ceramică a band
  (min 1600), remove "preț la cerere", and INCLUDE it in the JSON-LD AggregateOffers.**
  Only after that lands does the §1b roof gate clear (the 450/550/800 competitor numbers
  are gone).
- **Fences — still open, with a UNIT trap.** Only **gard jaluzele = de la 2900
  lei/METRU LINIAR** (per linear metre, **NOT lei/m²**), cu fundație de beton. The
  configurator schema **has no fence price field today** (fences are just type ids);
  adding jaluzele needs a **new fence price with an explicit unit `lei/ml`** — distinct
  from roofs' implicit lei/m² — and the estimate step must price fences by linear metre,
  not area. **șipcă / plin / combinat-cu-piatră still unanswered** → keep "preț la cerere".
- **🚨 CRITICAL CONTRADICTION (misleading-advertising risk).** The live site advertises
  **"îngheață prețul de 160 lei/m²"** for acoperiș, while the owner's **real starting
  price is 1100 lei/m²**. The new site **must NOT carry the "160 lei/m²" claim** until
  the owner explains its scope — a hard gate is added to `docs/LAUNCH-CHECKLIST.md`.
**✅ ROOFS SHIPPED 2026-07-25.** The configurator now carries the owner's real bands on
`feature/configurator` (`a32caeb`): metalică 1100, șindrilă 1200, rocă vulcanică 1400,
țiglă ceramică 1600 lei/m² (montaj inclus, "de la X"). Imperlux 450/550/800 removed;
ceramică has a band + is in the JSON-LD AggregateOffers; estimate shows "de la {total}",
disclaimer says "nu o ofertă contractuală". **§1b roof gate CLEARED.**

**"160 lei/m²" DOWNGRADED 2026-07-25** from launch-blocker to a normal open question. It
sits in the promo banner, `/acoperisuri` title/meta, several FAQ answers and the price
chip, while the configurator now shows "de la 1100" — they disagree on the same page.
**Owner decides:** keep / remove / qualify (e.g. "montaj de la 160 lei/m²"). Not blocking.

**Blocks (still):** **fences** — only jaluzele answered (2900 **lei/ml**, not m² — schema
needs a per-unit field); șipcă/plin/combinat unanswered. Roof-calculator ceramic (Creaton
57/58) still pending. RU strings added (`estimate.from`, disclaimer) are machine-drafted —
flag for RU review.

## Q-11 (2026-07-21, 3D agent) — Pick ONE house to photo-match
We've been modelling an "average" house. Point at ONE photo from your 110 and say "build that
one" — matching a single real building beats approximating a genus.
**Recommended default**: the 2026-01-15_041947 chalet (already the committed reference master,
saved at docs/reference-match/research-2026-07-21/owner_01.jpg). STATUS: OPEN

## Q-12 (2026-07-21, 3D agent) — Is the 3D hero still the right call?
You have 110 real photos of finished work; a photo of a real house cannot look fake. The 3D's
unique value is the build animation, which a photo can't do. After a week of iterations this
option deserves a decision.
**Recommended default**: keep the 3D build animation, but consider leading with a real photo and
placing the 3D below the fold.
**STATUS: RECLASSIFIED 2026-07-25 — INTERNAL / IN PROGRESS, no longer owner-blocked.**
We are **deliberately not asking the owner yet**: the homepage flow is still being built
(Higgsfield hero restyle undecided, project-slideshow shell not placed). This decision is
**gated on the homepage flow being settled**, then it goes to the owner. Nothing here waits
on the owner today.

## Q-13 (2026-07-21, 3D agent) — Enable Sketchfab / Hyper3D / Hunyuan3D in BlenderMCP N-panel
Would give ready-made planting and props instead of modelling them (free tiers; may need a free
API key each). Note: Sketchfab + Hyper3D showed as ticked in earlier sessions but the task list
says OFF — please verify the N-panel state either way.
**Recommended default**: enable all three. STATUS: OPEN

## Q-14 (2026-07-22) — Portfolio project metadata (city / year / size)
The `/portofoliu` page is live with 8 real photos from the drone set. It
publishes NO location, floor area or completion year, because nobody has
confirmed those facts and inventing them on a proof page would discredit the
page itself. Real metadata would make each entry rank for local queries
("casă la cheie Orhei") and let us add richer JSON-LD.
**Ask the owner, per photo:** locality, approximate built area (m²), year
finished, work type, and whether the client agreed to be shown.
**Recommended default**: ship as-is without metadata (already done); enrich when
the owner supplies it.
**STATUS: PARTIALLY RESOLVED 2026-07-25 — photos in hand, metadata pending.** The
owner has supplied/has the photos; only the **per-photo metadata** (locality, year,
m², work type) is still outstanding. **HARD CONSTRAINT: metadata must NOT be
invented.** Portfolio / slideshow MAY ship now with photos captioned **only by what
is visibly true** (e.g. "Acoperiș din țiglă metalică", "Fațadă ventilată") — **no
location, year, or m²** until the owner supplies them. Enrich per-photo once he does.

**UPDATE 2026-07-25 — 4 projects now have locality + area + work type, harvested from
the CLIENT'S OWN LIVE SITE (rapidconstruct.md), NOT invented.** Source = client's live
homepage. **YEAR is still missing for all four** (do not invent it).
| Locality | Area | Work type |
|---|---|---|
| Orhei | 100 m² | acoperiș șindrilă bituminoasă + sistem pluvial |
| Costești | 320 m² | fațadă piatră naturală + tencuială decorativă |
| Cahul | 180 m² | acoperiș țiglă metalică + termoizolație mansardă |
| Chișinău | 280 m² | renovare completă, acoperiș nou + izolare termică |

Notes: the `/portofoliu` page currently carries **no per-project data** — these four can now
be attached (locality + area + work type; year stays blank). ⚠️ On the source site the
**image alt-text conflicts with the captions — trust the captions** (above), not the alt
attributes. Still pending owner: the completion **year** per project, and confirmation the
client agreed to be shown.

## Q-15 (2026-07-22) — Canonical domain: apex or www?
`NEXT_PUBLIC_SITE_URL` is unset and Vercel has zero env vars, so every canonical
/ hreflang / sitemap / og:image URL currently points at the staging host. A
production build now FAILS rather than shipping that (verified both ways).
Before cutover the owner must pick the canonical host.
**Recommended default**: `https://rapidconstruct.md` (apex) — it matches the
current Tilda URLs, so the 301s from legacy pages land on the same host with no
extra redirect hop. See docs/LAUNCH-CHECKLIST.md §1.
**STATUS: RESOLVED 2026-07-25 — APEX `rapidconstruct.md` (no www).** Decision by the
owner, matching the client's existing canonical `http://rapidconstruct.md`. This only
fixes the **value** to use; it does **NOT** change anything now — `NEXT_PUBLIC_SITE_URL`
stays absent and DNS is untouched. The apex value gets set at the **RC-403 cutover**
(owner's call), where it becomes `https://rapidconstruct.md`.

## Q-16 (2026-07-22) — Privacy policy: legal entity + retention period
`/politica-de-confidentialitate` is live in RO + RU and describes exactly what the
code does (verified: no analytics, no tracking cookies, self-hosted fonts, form
collects name/phone/message, delivered by email via Resend, hosted on Vercel).

Two things were deliberately LEFT OUT because inventing them would be inventing a
legal fact:
1. **The registered legal entity + IDNO.** The page names the trading name
   "Rapid Construct & 3D Design". If the contracting entity is an SRL with a
   different registered name, it should be stated.
2. **A concrete retention period.** The page currently says data is kept "as long
   as needed to answer, and as long as accounting/contract law requires" — true
   as written, but a specific period (e.g. 12 months for non-clients) is clearer.

**Recommended default**: publish as-is (already done — it is accurate), and add
the entity name + a concrete period when the owner confirms them. STATUS: OPEN

## Q-17 (2026-07-22) — Pre-existing homepage accessibility audits (not launch-blocking)
Lighthouse a11y on `/` is 0.89 (above the 0.88 CI gate) but three audits fail on
BOTH main and every branch — pre-existing, not introduced by any recent PR:
- **aria-hidden-focus** — the mobile menu drawer keeps `aria-hidden="true"` while
  closed but still contains 12 focusable links. Fix: also set `inert` (or
  `tabindex=-1`/`hidden`) on the closed drawer so its links leave the tab order.
- **definition-list / dlitem** — two homepage stat blocks use `<dl>` with bare
  `<div>` children instead of `<dt>`/`<dd>` pairs. Fix: wrap each stat's value in
  `<dd>` and label in `<dt>` (or drop the `<dl>` and use plain elements).
Neither blocks launch (score already clears the gate). Worth a small dedicated
a11y ticket after cutover. STATUS: OPEN (not blocking)
