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
| Old (Tilda) | New |
|---|---|
| /1 | /reparatii-la-cheie (confirm mapping Q-02) |
| /2 | /case-constructii (confirm) |
| /3 | /fatade (confirm) |
| /4 | /finisaje (confirm) |
| /5 | /proiectare-3d (confirm) |
| /6 | /instalatii (confirm) |
| /despre-noi | /despre-noi |
| /portofoliu | /portofoliu |
| /contacte | /contact |
| /calcul-acoperis | /calculator-acoperis |
| /calcul-gard | /calculator-gard |
| /page53648667.html | / (or its real target — audit Q-02) |
| /privacypolicy | /politica-de-confidentialitate |

## 6. Known Tilda-site defects we must NOT reproduce
- Title "Acasa", missing meta descriptions, no H1, empty `lang`.
- http:// canonicals and sitemap URLs.
- Numeric slugs (/1.../6).
- Stats counters rendering "0+" in crawlable HTML.
- Broken OG (favicon as share image, empty description).
- No structured data, no hreflang, RO-only.
