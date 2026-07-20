# Keyword → page map (RC-301)

RO/RU keyword targeting for every existing and planned page. RO is the source of truth;
RU titles/descriptions below are drafted native Russian, pending owner review (logged in
`docs/RU-REVIEW.md`). Docs only, no code or string changes in this ticket. Refine the seed
list in `docs/SPEC.md` §4 as real Search Console data lands after launch (RC-403).

Grounding: phrasing is modelled on how people actually search in Moldova, not textbook terms.
RO buyers type `pret`, `la cheie`, `chisinau`; RU buyers type `цена`, `под ключ`, `кишинев`
(and the `кишинёв` spelling). We target both spellings where they differ.

## How to read this

- **Recommended title** is the authored page segment only. `buildMetadata` (`src/lib/seo.ts`)
  appends ` · Rapid Construct & 3D Design` automatically, so the full rendered `<title>` is
  ~32 characters longer. Keep the authored segment short (aim 45–52) so the key phrase still
  shows before Google truncates the full title around 60. All recommended segments below are
  ≤ 60 as the ticket requires; the tighter ones are marked.
- **Recommended description** is ≤ 155 characters, plain register, no em-dashes.
- `кровля` and `учебник`-style terms are fine as **keywords** (people search them), but customer
  copy uses `крыша` and plain words per the owner copy rule. RO copy avoids `etans`,
  `sistem pluvial` (use `jgheaburi si burlane`), `manopera` (use `lucru`), `invelitoare`
  (use `tigla`), `receptia lucrarii` (use `predam lucrarea`).

## Quick wins (LIVE pages whose current title should change now)

Only two pages are live today (`/` home and `/acoperisuri`). Home is already well targeted.
The roof page leaves high-intent `pret` / `ремонт` / `цена` traffic on the table:

| Page | Lang | Current title | Recommended title | Why |
|---|---|---|---|---|
| `/acoperisuri` | RO | Acoperișuri la cheie în Chișinău și Moldova | Acoperiș la cheie Chișinău, preț de la 160 lei/m² | Surfaces the price and the high-intent "pret" query in the title |
| `/acoperisuri` | RU | Крыша под ключ в Кишинёве и по Молдове | Ремонт и монтаж крыши в Кишинёве, цена от 160 лей | Adds "ремонт крыши" (top RU query) + "цена" |

APPLIED 2026-07-20 (PR: acoperis title quick-wins). Both titles below are live in
`messages/ro.json` and `messages/ru.json`. No other live page needs a title change.

## RO master table (rows = pages, RO keywords + RO title/description)

| Page (slug) | Status | RO primary keyword | RO secondary | Current title (RO) | Recommended title (RO) ≤60 | Recommended description (RO) ≤155 | Priority |
|---|---|---|---|---|---|---|---|
| Home `/` | LIVE | renovari la cheie chisinau | constructii case chisinau; firma constructii moldova | Construcții și renovări la cheie în Chișinău | Construcții și renovări la cheie în Chișinău | Acoperișuri, fațade, renovări complete în Chișinău și regiuni. Garanție scrisă până la 30 de ani, prețuri de la 160 lei/m². | H |
| Acoperișuri `/acoperisuri` | LIVE | acoperis chisinau | reparatie acoperis pret; tigla metalica pret moldova | Acoperișuri la cheie în Chișinău și Moldova | Acoperiș la cheie Chișinău, preț de la 160 lei/m² | Montăm acoperișuri din țiglă metalică și șindrilă, cu jgheaburi și burlane. Preț de la 160 lei/m², garanție scrisă până la 30 de ani. | H |
| Fațade `/fatade` | planned | fatade case chisinau | izolare fatada pret; termoizolatie fatada moldova | (none) | Fațade și termoizolație în Chișinău, preț corect | Fațade și termoizolație pentru case în Chișinău și regiuni. Lucru curat, materiale certificate UE, preț pe care îl vedeți din start. | H |
| Renovări la cheie `/renovari-la-cheie` | planned | renovari la cheie chisinau | reparatie apartament la cheie; reparatii case chisinau pret | (none) | Renovări la cheie în Chișinău, preț transparent | Renovări complete la cheie pentru case și apartamente în Chișinău. Ce scrie în deviz, aceea plătiți. Predăm lucrarea la termen. | H |
| Case & construcții `/case-constructii` | planned | constructii case la cheie moldova | construim casa la cheie chisinau; casa la rosu pret | (none) | Construim case la cheie în Moldova, preț clar | Construim case la cheie în Chișinău și regiuni, de la fundație la finisaj. Preț clar din start, garanție scrisă și materiale UE. | M |
| Finisaje `/finisaje` | planned | finisaje interioare chisinau | renovare finisaje pret; gletuire vopsire chisinau | (none) | Finisaje interioare în Chișinău, lucru curat | Finisaje interioare în Chișinău: gletuire, vopsire, gresie și faianță. Lucru curat, la termen, preț pe care îl vedeți din start. | M |
| Proiectare & 3D `/proiectare-3d` | planned | proiectare casa chisinau | proiect 3d casa moldova; design interior chisinau | (none) | Proiectare și design 3D casă în Chișinău | Proiectăm casa ta în 3D înainte de a construi: vezi cum arată, alegi finisajele, primești un preț clar. Chișinău și toată Moldova. | M |
| Instalații `/instalatii` | planned | instalatii electrice si sanitare chisinau | instalatii casa pret; electrica sanitare chisinau | (none) | Instalații electrice și sanitare în Chișinău | Instalații electrice și sanitare pentru case în Chișinău. Lucru făcut corect, la normă, cu garanție scrisă. Preț clar din start. | M |
| Portofoliu `/portofoliu` | planned | portofoliu constructii moldova | lucrari acoperis fatade chisinau; case construite moldova | (none) | Portofoliu: acoperișuri, fațade și case în Moldova | Lucrări reale în Chișinău, Orhei, Costești și Cahul: acoperișuri, fațade și renovări complete. Vezi ce am făcut și cu ce materiale. | M |
| Despre noi `/despre-noi` | planned | rapid construct chisinau | firma constructii de incredere moldova; echipa constructii chisinau | (none) | Despre noi: 15 ani în construcții la Chișinău | 15 ani în construcții, 500+ case, echipă cu experiență. Garanție scrisă până la 30 de ani și materiale certificate UE. Chișinău și regiuni. | L |
| Contact `/contact` | planned | contact rapid construct | firma acoperisuri chisinau contact; oferta constructii chisinau | (none) | Contact: sună sau cere ofertă în Chișinău | Sună la +373 76 837 180 sau lasă o cerere. Îți răspundem în 2 ore lucrătoare cu un preț clar. Chișinău, str. Nicolae Zelinski 24. | L |
| Calculator acoperiș `/calculator-acoperis` | planned | calcul pret acoperis | cat costa un acoperis moldova; pret acoperis la cheie | (none) | Calculator preț acoperiș, estimare rapidă | Află cât costă acoperișul tău în câteva minute. Alegi tipul de țiglă și suprafața, primești o estimare și oferta pe WhatsApp. | M |
| Calculator gard `/calculator-gard` | planned | calcul pret gard | cat costa un gard moldova; pret gard metalic | (none) | Calculator preț gard, estimare în 1 minut | Calculează prețul gardului tău în 1 minut. Alegi tipul și lungimea, primești o estimare rapidă și oferta pe WhatsApp. | L |
| Chișinău (oraș) `/chisinau` | LIVE | constructii renovari chisinau | acoperisuri fatade chisinau; firma constructii chisinau | (none) | Construcții și renovări în Chișinău, la cheie | Construcții, acoperișuri, fațade și renovări la cheie în Chișinău. Preț clar din start, garanție scrisă, echipă cu 15 ani experiență. | M |
| Orhei (oraș) `/orhei` | LIVE | constructii acoperis orhei | renovari case orhei; fatade orhei | (none) | Construcții, acoperișuri și fațade în Orhei | Lucrăm în Orhei: acoperișuri, fațade și renovări complete. Preț clar din start, garanție scrisă. Am făcut deja case în zonă. | L |
| Cahul (oraș) `/cahul` | LIVE | constructii acoperis cahul | renovari case cahul; fatade cahul | (none) | Construcții, acoperișuri și fațade în Cahul | Lucrăm în Cahul: acoperișuri, fațade și renovări complete. Preț clar din start, garanție scrisă. Am făcut deja case în zonă. | L |

## RU master table (rows = pages, RU keywords + RU title/description)

Customer copy uses `крыша`, not `кровля` (owner rule). `кровля` stays only in the keyword
column because it is a real search term.

| Page (slug) | RU slug (RC-201) | RU primary keyword | RU secondary | Current title (RU) | Recommended title (RU) ≤60 | Recommended description (RU) ≤155 | Priority |
|---|---|---|---|---|---|---|---|
| Home `/` | `/ru` | ремонт под ключ кишинев | строительная компания кишинев; строительство домов молдова | Строительство и ремонт под ключ в Кишинёве | Строительство и ремонт под ключ в Кишинёве | Крыши, фасады, комплексный ремонт в Кишинёве и по Молдове. Письменная гарантия до 30 лет, цены от 160 лей/м². | H |
| Акопериш `/acoperisuri` | `/ru/kryshi` | ремонт крыши кишинев | металлочерепица цена молдова; кровля молдова цена | Крыша под ключ в Кишинёве и по Молдове | Ремонт и монтаж крыши в Кишинёве, цена от 160 лей | Монтаж крыши из металлочерепицы и битумной черепицы, с желобами и водостоками. Цена от 160 лей/м², письменная гарантия до 30 лет. | H |
| Фасады `/fatade` | `/ru/fasady` | фасадные работы кишинев | утепление фасада цена; фасад дома молдова | (none) | Фасады и утепление в Кишинёве, честная цена | Фасады и утепление домов в Кишинёве и по Молдове. Аккуратно, сертифицированные в ЕС материалы, цена понятна сразу. | H |
| Ремонт под ключ `/renovari-la-cheie` | `/ru/remont-pod-klyuch` | ремонт под ключ кишинев | ремонт квартир под ключ цена; ремонт домов кишинев | (none) | Ремонт под ключ в Кишинёве, честная цена | Комплексный ремонт домов и квартир под ключ в Кишинёве. Что в смете, то и платите. Сдаём работу в срок, с гарантией. | H |
| Дома и строительство `/case-constructii` | `/ru/stroitelstvo-domov` | строительство домов под ключ молдова | построить дом кишинев цена; дом под ключ молдова | (none) | Строим дома под ключ в Молдове, цена сразу | Строим дома под ключ в Кишинёве и регионах, от фундамента до отделки. Понятная цена сразу, письменная гарантия, материалы из ЕС. | M |
| Отделка `/finisaje` | `/ru/otdelka` | внутренняя отделка кишинев | отделочные работы цена; шпаклёвка покраска кишинев | (none) | Внутренняя отделка в Кишинёве, чисто | Внутренняя отделка в Кишинёве: шпаклёвка, покраска, плитка. Работаем аккуратно и в срок, цена понятна сразу. | M |
| Проектирование и 3D `/proiectare-3d` | `/ru/proektirovanie` | проект дома кишинев | 3d дизайн дома молдова; дизайн интерьера кишинев | (none) | Проект и 3D дизайн дома в Кишинёве | Проектируем дом в 3D до начала стройки: видите, как будет, выбираете отделку, получаете понятную цену. Кишинёв и вся Молдова. | M |
| Инженерные сети `/instalatii` | `/ru/inzhenernye-seti` | электрика и сантехника кишинев | инженерные сети дома цена; проводка сантехника кишинев | (none) | Электрика и сантехника в Кишинёве | Электрика и сантехника для домов в Кишинёве. Делаем по нормам, с письменной гарантией. Цена понятна сразу. | M |
| Портфолио `/portofoliu` | `/ru/portfolio` | портфолио строительство молдова | примеры работ крыша фасад; построенные дома молдова | (none) | Портфолио: крыши, фасады и дома в Молдове | Реальные работы в Кишинёве, Оргееве, Костештах и Кагуле: крыши, фасады и комплексный ремонт. Смотрите, что мы сделали. | M |
| О нас `/despre-noi` | `/ru/o-nas` | рапид констракт кишинев | надежная строительная компания молдова; бригада строителей кишинев | (none) | О нас: 15 лет в строительстве в Кишинёве | 15 лет в строительстве, 500+ домов, опытная бригада. Письменная гарантия до 30 лет и материалы с сертификацией ЕС. | L |
| Контакты `/contact` | `/ru/kontakty` | контакты рапид констракт | строительная компания кишинев телефон; заказать смету кишинев | (none) | Контакты: позвоните или закажите смету | Звоните +373 76 837 180 или оставьте заявку. Ответим за 2 рабочих часа с понятной ценой. Кишинёв, ул. Николае Зелински 24. | L |
| Калькулятор крыши `/calculator-acoperis` | `/ru/kalkulyator-kryshi` | рассчитать цену крыши | сколько стоит крыша молдова; цена крыши под ключ | (none) | Калькулятор цены крыши, быстрый расчёт | Узнайте, сколько стоит ваша крыша, за пару минут. Выбираете черепицу и площадь, получаете расчёт и смету в WhatsApp. | M |
| Калькулятор забора `/calculator-gard` | `/ru/kalkulyator-zabora` | рассчитать цену забора | сколько стоит забор молдова; цена забора под ключ | (none) | Калькулятор цены забора, расчёт за минуту | Посчитайте цену забора за минуту. Выбираете тип и длину, получаете быстрый расчёт и смету в WhatsApp. | L |
| Кишинёв (город) `/chisinau` | `/ru/kishinev` | строительство ремонт кишинев | крыши фасады кишинев; строительная компания кишинев | (none) | Строительство и ремонт в Кишинёве, под ключ | Строительство, крыши, фасады и ремонт под ключ в Кишинёве. Понятная цена сразу, письменная гарантия, опыт 15 лет. | M |
| Оргеев (город) `/orhei` | `/ru/orhei` | строительство крыша оргеев | ремонт домов оргеев; фасады оргеев | (none) | Строительство, крыши и фасады в Оргееве | Работаем в Оргееве: крыши, фасады и комплексный ремонт. Понятная цена сразу, письменная гарантия. Уже строили дома в районе. | L |
| Кагул (город) `/cahul` | `/ru/cahul` | строительство крыша кагул | ремонт домов кагул; фасады кагул | (none) | Строительство, крыши и фасады в Кагуле | Работаем в Кагуле: крыши, фасады и комплексный ремонт. Понятная цена сразу, письменная гарантия. Уже строили дома в районе. | L |

## Notes for downstream tickets

- **RC-103 (service pages):** wire each recommended RO/RU title+description into `*.seo.title`
  / `*.seo.description` namespaces as pages are built. Keep the `pret` / `цена` word in the
  service titles that target price queries (acoperisuri, fatade, calculators).
- **RC-201 (RU IA):** the RU slug column above is a proposal, not final. Confirm slugs against
  the redirect plan before shipping.
- **RC-301 follow-up — RESOLVED 2026-07-16.** `docs/SPEC.md` §5 maps the Tilda page `/1`
  (Reparatii case la cheie) to `/reparatii-la-cheie`, while this map and `docs/BACKLOG.md`
  RC-103 use `renovari-la-cheie`. `/reparatii-la-cheie` was never built and is not planned, so
  the `/1` redirect in `next.config.ts` was permanently sending a real Tilda URL into a 404.
  The 301 is now repointed to `/renovari-la-cheie` (the page that exists, and the slug that
  matches the target keyword "renovari la cheie chisinau"). `/2` → `/case-constructii` stays as
  is: that page is genuinely still to come. **SPEC §5 is now stale on this row** — treat this
  map as the source of truth for slugs.
- **City slugs — RECONCILED 2026-07-16.** RC-303 shipped `/chisinau`, `/orhei`, `/cahul`. This
  map previously listed the Chișinău row as `/acoperis-chisinau`, which matched neither what
  shipped nor its own sibling rows (Orhei/Cahul were already bare city slugs) nor its own target
  keyword ("constructii renovari chisinau" is broader than roofing). Map now says `/chisinau`.
  No redirect existed for the old slug, so nothing was broken and nothing needs one.
- **City pages (RC-303):** only build city pages backed by real portfolio projects (Chișinău,
  Orhei, Cahul, Costești). Thin pages without real work hurt more than help.
- **GEO surface:** keep the quotable facts (160 lei/m², garanție 30 ani, 500+ case, montaj 7–15
  zile) in server-rendered text and JSON-LD on every page above, per AGENTS.md.
- {/* TODO(3d): white session */} the `/proiectare-3d` and `/configurator` pages will host the
  interactive 3D model; no model work happens in this docs ticket.
