# SPEC — RapidConstruct Website Rebuild

## 1. Business context
Rapid Construct & 3D Design — construction/renovation company, Chișinău, Moldova.
Services: roofs, facades, turnkey renovations, finishes, 3D design/planning, installations.
Claims: 15+ years experience, 500+ houses, written warranty up to 30 years, EU-certified
materials, 4.9/5 from 250+ reviews. Serves Chișinău + regions (Orhei, Cahul, Costești, ...).

Goal of rebuild: replace the Tilda site with a fast, custom, bilingual (RO/RU) site with
modern motion design that ranks (SEO), gets cited by AI assistants (GEO), and converts
(calls, chat, quote forms).

## 2. Reference-site content inventory (captured 2026-07-13 from rapidconstruct.md)

**Contact / NAP (single source of truth — must be identical everywhere):**
- Rapid Construct & 3D Design
- Nicolae Zelinski St 24, Chișinău
- +373 76 837 180
- rapidconstructmd@gmail.com
- Mon–Sat 08:00–17:00, Sun closed
- Socials: Instagram, Facebook, TikTok, YouTube

**Nav / service taxonomy (Tilda):** Reparații la cheie · Case & Construcții ·
Fațade & Amenajări exterioare · Finisaje · Proiectare & Design · Instalații

**Hero copy:** "Construcții și Renovări complete" — Case · Renovări · Fațade · Acoperișuri ·
Finisaje · Instalații · Proiectare 3D · Execuție · Autorizații. "Garanție scrisă până la
30 ani • Materiale certificate UE."

**Promos (rotating):** -10% programări anticipate fațade/acoperișuri · Rate 0% la acoperiș ·
price-freeze 160 lei/m² pentru 2026.

**Benefits block:** garanție 30 ani în contract · materiale certificate EU · execuție la timp ·
echipă 10+ ani experiență · prețuri transparente ("ce scrie în deviz, aceea plătești") ·
suport post-lucrare.

**Portfolio seed projects:** Orhei 100m² șindrilă bituminoasă + pluvial · Costești 320m²
fațadă piatră naturală + izolare · Cahul 180m² țiglă metalică + termoizolație mansardă ·
Chișinău 280m² renovare completă.

**Testimonials:** Ion Miron (Chișinău, acoperiș metalic) · Maria Oprea (Orhei, fațadă+izolație) ·
Andrei Condrea (dezvoltator imobiliar). Full quotes on the live site.

**FAQ seeds:** durata montaj acoperiș (7–15 zile) · garanție · materiale · izolare fațade ·
calcul preț · lucru pe timp rece.

**Form promise:** response within 2 working hours.

## 3. Design & motion direction
- Aesthetic: premium craft — confident, solid, warm. Keep the orange + charcoal brand
  direction from the current logo unless Max wants a refresh (Q-01).
- Light base (construction clients skew conservative), bold dark hero allowed.
- Motion demonstrates the craft: before/after wipes, layered build-up reveals
  (foundation → walls → roof), live calculator feedback, count-up stats.
- Hard rules: prefers-reduced-motion, transform/opacity only, instant hero, no preloaders.

## 4. Keyword direction (to be refined in RC-301)
RO: acoperis chisinau, reparatie acoperis, fatade case moldova, renovare la cheie chisinau,
tigla metalica pret moldova, izolare fatada pret.
RU: ремонт крыши кишинев, кровля молдова цена, фасадные работы кишинев, ремонт под ключ
кишинев, металлочерепица цена молдова.
GEO surface: concrete quotable facts (160 lei/m² price-freeze, 30-year written warranty,
500+ projects, 7–15 day roof install) in server-rendered text + JSON-LD + expanded FAQs.

## 5. Redirect map (Tilda → new, implement in RC-401)
CONFIRMED 2026-07-13 from the Tilda admin page list (Q-02 resolved — see §7).
| Old (Tilda) | Tilda page title | New |
|---|---|---|
| /1 | Reparatii case la cheie | /reparatii-la-cheie |
| /2 | Case & Constructii | /case-constructii |
| /3 | Fatade & Amenajari exterioare | /fatade |
| /4 | Finisaje | /finisaje |
| /5 | Proiectare & Design | /proiectare-3d |
| /6 | Instalatii | /instalatii |
| /despre-noi | Despre Noi | /despre-noi |
| /portofoliu | Portofoliu | /portofoliu |
| /contacte | Contacte | /contact |
| /calcul-acoperis | Calculare Pret Acoperis | /calculator-acoperis |
| /calcul-gard | Calculare Pret Gard | /calculator-gard |
| /page53648667.html | orphan legacy landing ("Rapid Construct", no meta) | / |
| /privacypolicy | Privacy Policy | /politica-de-confidentialitate |

## 6. Tilda project audit notes (2026-07-13, from admin)
- Project id 10384819, plan "Tilda Personal" (max 1 website), 32 pages total.
- Folder "Rapid Construct MD" = the live site (14 published pages, as in the sitemap).
- Folder "Rapid Construct FR" is EMPTY. Folder "Bara de meniu" holds 13 legacy pages from an
  older site version (Case Modulare, Servicii, Preturi, ...) — all verified 404 on the live
  domain, so NO redirects needed for them.
- Unpublished drafts in MD folder: "Neactive---", "img" (possible photo stash — check during
  content export, Q-06), "Acasa1", duplicate "Calculare Pret Acoperis" (/calcul-acoperis1).
- Live calculator page /calcul-acoperis has unpublished latest changes in Tilda — when
  porting the calculator (RC-107), read the DRAFT version in admin, not just the live page.
- Leads are collected in Tilda CRM ("Leads" section) — export them before the Tilda plan
  is cancelled post-launch.

## 7. Known Tilda-site defects we must NOT reproduce
- Title "Acasa", missing meta descriptions, no H1, empty `lang`.
- http:// canonicals and sitemap URLs.
- Numeric slugs (/1.../6).
- Stats counters rendering "0+" in crawlable HTML.
- Broken OG (favicon as share image, empty description).
- No structured data, no hreflang, RO-only.
