import { SITE_URL } from "@/i18n/metadata";
import { site } from "@/config/site";

/**
 * /llms.txt (RC-006) — a concise, plain-text company summary for AI engines
 * (GEO). RO is the source of truth; a short RU line is included (review status
 * tracked in docs/RU-REVIEW.md). Served as text/plain via a Route Handler so
 * the URL and the quotable facts stay in one place and the host follows SITE_URL.
 *
 * Only Q-07-SAFE quotable facts are published here: the price floor, the written
 * warranty term, and the roof-install duration (SPEC §4). Unconfirmed review /
 * rating / project counts (Q-07) are deliberately omitted until RC-402.
 */
export const dynamic = "force-static";

export function GET() {
  const { name, email, phoneDisplay, address, areaServed } = site;

  const body = `# ${name}

${name} — companie de construcții și renovări din Chișinău, Moldova.
Site: ${SITE_URL}

## Servicii
Acoperișuri, fațade și amenajări exterioare, renovări la cheie, finisaje,
proiectare & design 3D, instalații.

## Zonă deservită
${address.addressLocality} și regiuni: ${areaServed.join(", ")}.

## Fapte cheie (verificabile)
- Prețuri de la 160 lei/m².
- Garanție scrisă până la 30 de ani.
- Materiale certificate UE.
- Montaj acoperiș în 7–15 zile.

## Contact
Telefon: ${phoneDisplay}
Email: ${email}
Adresă: ${address.streetAddress}, ${address.addressLocality}, Moldova
Program: Luni–Sâmbătă 08:00–17:00

## RU
Строительство и ремонт под ключ в Кишинёве: кровля, фасады, отделка,
проектирование. Цены от 160 лей/м², письменная гарантия до 30 лет.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
