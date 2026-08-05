# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

| Scope | Drafted | Status |
|---|---|---|
| Full messages/ru.json (all homepage + shell strings) | 2026-07-14 (rewritten, natural RU) | NEEDS NATIVE REVIEW before launch (RC-402) |

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| roofPage (acoperisuri service page, all strings) | 2026-07-15 | NEEDS NATIVE REVIEW before launch |
| docs/KEYWORD-MAP.md RU titles + descriptions (16 pages, drafted, not yet wired into messages) | 2026-07-15 (RC-301) | NEEDS NATIVE REVIEW before wiring into messages/ru.json |

# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| home.testimonials (RU translations of verbatim live-site quotes) | 2026-07-15 | translations of owner-published RO originals; native check before launch |

# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| aboutPage (despre-noi page: hero, values, process, cta, seo) | 2026-07-15 | NEEDS NATIVE REVIEW before launch |

# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| contactPage (/contact page + lead form, all strings) | 2026-07-14 | NEEDS NATIVE REVIEW before launch |

# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| chat (RC-106 floating WhatsApp/Viber widget: labels + prefilled greeting) | 2026-07-14 | NEEDS NATIVE REVIEW before launch |

# RU copy review status

Rule (replaces the old visible `TODO(ru-review)` suffixes, which leaked into the UI —
owner feedback 2026-07-14): machine-drafted Russian is tracked HERE, not in user-visible
strings. A PR that adds/changes RU strings updates this table.

Reviewer notes: RU is written for the Moldovan market (Кишинёв, лей/м², Оргеев/Кагул
city names). Check tone + terminology, especially construction terms.
| promo namespace (promo bar offer + dismiss label, RC-110) | 2026-07-14 | NEEDS NATIVE REVIEW before launch — offer copy reuses contact promo; "крышу" used instead of banned "кровлю" per copy register |
| servicePages namespace (RC-103: fatade, renovari, finisaje, proiectare, instalatii; hero/process/faq/cta + seo title and description for 5 service pages) | 2026-07-15 | NEEDS NATIVE REVIEW before launch. Plain register per owner copy rule; used krysha/stroika, no banned krovlya/germetichnyy; no price invented (Смета бесплатно). |
| calcPage namespace (RC-107: roof calculator page — hero, 3 stepper steps, materials, result, lead form + seo title/description) | 2026-07-15 | NEEDS NATIVE REVIEW before launch. Plain register per owner copy rule; used крыша/черепица, no banned кровля/герметичный; range shown as "от X до Y лей", no invented price (расчёт предварительный, точная цена на бесплатной смете). |
| home.faq + roofPage.faq new Q&As (RC-302: 10 new home FAQ + 10 new roof FAQ, RU) | 2026-07-15 | NEEDS NATIVE REVIEW before launch. Plain register per owner copy rule; used крыша/черепица, no banned кровля/герметичный; answer-shaped for GEO/AEO; only fact-based figures (160 лей/м² 2026, до 30 лет, 08:00 до 17:00, до 2 рабочих часов, рассрочка 0%), no invented prices. |
| cityPages namespace (RC-303: city landing pages — chisinau, orhei, cahul; hero/services/process/faq/cta + seo title and description for 3 city pages, RU) | 2026-07-15 | NEEDS NATIVE REVIEW before launch. Plain register per owner copy rule; city names Кишинёв/Оргеев/Кагул; used крыша/черепица, no banned кровля/герметичный; only fact-based figures (до 30 лет, до 2 рабочих часов, portfolio m2 from SPEC), no invented prices (Смета бесплатно). |
| configuratorPage namespace + header.configurator (feature/configurator: 3D configurator page — hero, roof types/materials, specs, prices + seo title/description, RU) | 2026-07-24 | NEEDS NATIVE REVIEW before launch. Plain register per owner copy rule; used крыша/черепица, no banned кровля (fixed «Кровельный материал» → «Материал крыши» before commit); prices are the owner-supplied category bands (от 450/550/800 лей/м²), ceramic deliberately «цена по запросу» (Q-10). Step 2 adds area/estimate strings (площадь, итоговая смета, «ориентировочная смета … смета бесплатная»); step 3 adds fence strings (Забор: Жалюзи/Штакетник/Сплошной/Комбинированный с камнем). |

## 2026-08-04 — home.processVideo (RC-120, "Cum lucrăm" video section)

| key | RU | note |
|---|---|---|
| eyebrow | Видео с объекта | "с объекта" = de pe șantier, natural register |
| title | Как мы работаем | |
| intro | Работы под ключ, снятые на наших объектах. Без постановки, только исполнение. | "без постановки" = fără regie |
| play | Воспроизвести видео | standard media label |
| caption | Ремонт и строительство в Кишинёве, работы под ключ | mirrors the YT video's own framing |

Owner review pending, like all RU strings in this file.

## 2026-08-04 — RC-123: services.{industriale,terasamente} + servicePages.{industriale,terasamente} + proiectare rename

Full RU blocks for the two new services (grid card + service page: seo, hero,
process, faq, cta) and the rename "Проектирование и 3D-визуализация". Register
notes: "земляные работы" (not "грунтовые"), "цеха/склады" for hale/depozite,
"под ключ" kept consistent with existing pages. Owner review pending.

## 2026-08-04 — FAQ hub, configurator promo, hero trust split

| key | RU | note |
|---|---|---|
| header.intrebari | Вопросы | nav label |
| faqPage.seo.title | Частые вопросы о строительстве и ремонте | |
| faqPage.seo.description | Понятные ответы... Кишинёв и вся Молдова. | |
| faqPage.title | Что клиенты спрашивают чаще всего | mirrors old home section |
| faqPage.intro | Короткие ответы по делу... максимум за 2 рабочих часа. | |
| home.configuratorPromo.* | Соберите свой дом в 3D / Открыть конфигуратор | |
| home.hero.trustGuarantee | Письменная гарантия до 30 лет | split from old trust line |
| home.hero.trustMaterials | Материалы с сертификацией ЕС | split from old trust line |

Owner review pending.

## 2026-08-05 — portfolioPage item 9 (terasă travertin, used as homepage card 2)

| field | RU |
|---|---|
| tag | Отделка |
| title | Терраса с летней кухней |
| desc | Терраса, облицованная травертином, с большими раздвижными окнами и уличным камином из камня, рядом с домом. |
| alt | Терраса, облицованная травертином, с раздвижными окнами и уличным камином из камня |

Photo recovered from the owner's own Tilda site. Owner review pending.

## 2026-08-05 — portfolioPage items 10 & 11 (photos sourced from rapidconstruct.md)

| field | RU (item 10 — șindrilă) | RU (item 11 — renovare acoperiș) |
|---|---|---|
| tag | Кровля | Ремонт |
| title | Крыша из битумной черепицы | Новая крыша на существующем доме |
| desc | Четырёхскатная крыша из антрацитовой битумной черепицы… | Полная замена кровли на металлочерепицу… |

⚠️ Both photos come from the owner's own live Tilda site. Most of that site is
stock; these two were hand-picked as genuine site photography. Owner must
confirm they are his company's works before launch (Q-14).
