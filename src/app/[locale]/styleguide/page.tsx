import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

// RC-003 styleguide — a temporary dev aid so the design tokens are verifiable
// in the PR preview. Renders ONLY tokens/utilities from globals.css (no inline
// hex). Not wired into nav; can be moved/removed once real pages land.
//
// Uses the RC-006 metadata helper (reference implementation) but is marked
// noindex + excluded from the sitemap — it is a dev aid, not a public page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    ...buildMetadata({
      locale: safeLocale,
      path: "/styleguide",
      title: "Styleguide — design tokens (RC-003)",
      description:
        "Internal design-token reference for the RapidConstruct rebuild. Not a public page.",
    }),
    robots: { index: false, follow: false },
  };
}

// Class names are written as complete literal strings so Tailwind's source
// scanner picks them up (no string interpolation on utility names).
type Swatch = { name: string; value: string; box: string; label: string };

const brandRamp: Swatch[] = [
  {
    name: "brand-50",
    value: "#fff4ed",
    box: "bg-brand-50",
    label: "text-ink-900",
  },
  {
    name: "brand-100",
    value: "#ffe6d5",
    box: "bg-brand-100",
    label: "text-ink-900",
  },
  {
    name: "brand-200",
    value: "#fecdaa",
    box: "bg-brand-200",
    label: "text-ink-900",
  },
  {
    name: "brand-300",
    value: "#fdac74",
    box: "bg-brand-300",
    label: "text-ink-900",
  },
  {
    name: "brand-400",
    value: "#fb833c",
    box: "bg-brand-400",
    label: "text-ink-900",
  },
  {
    name: "brand-500",
    value: "#f26419",
    box: "bg-brand-500",
    label: "text-ink-900",
  },
  {
    name: "brand-600",
    value: "#d94e0a",
    box: "bg-brand-600",
    label: "text-neutral-50",
  },
  {
    name: "brand-700",
    value: "#b23c08",
    box: "bg-brand-700",
    label: "text-neutral-50",
  },
  {
    name: "brand-800",
    value: "#8f3110",
    box: "bg-brand-800",
    label: "text-neutral-50",
  },
  {
    name: "brand-900",
    value: "#742a11",
    box: "bg-brand-900",
    label: "text-neutral-50",
  },
];

const inkRamp: Swatch[] = [
  {
    name: "ink-600",
    value: "#444444",
    box: "bg-ink-600",
    label: "text-neutral-50",
  },
  {
    name: "ink-700",
    value: "#333333",
    box: "bg-ink-700",
    label: "text-neutral-50",
  },
  {
    name: "ink-800",
    value: "#242424",
    box: "bg-ink-800",
    label: "text-neutral-50",
  },
  {
    name: "ink-900",
    value: "#1c1c1c",
    box: "bg-ink-900",
    label: "text-neutral-50",
  },
  {
    name: "ink-950",
    value: "#141414",
    box: "bg-ink-950",
    label: "text-neutral-50",
  },
];

const neutralRamp: Swatch[] = [
  {
    name: "neutral-50",
    value: "#faf8f5",
    box: "bg-neutral-50",
    label: "text-ink-900",
  },
  {
    name: "neutral-100",
    value: "#f3efe9",
    box: "bg-neutral-100",
    label: "text-ink-900",
  },
  {
    name: "neutral-200",
    value: "#e7e0d6",
    box: "bg-neutral-200",
    label: "text-ink-900",
  },
  {
    name: "neutral-300",
    value: "#d6ccbe",
    box: "bg-neutral-300",
    label: "text-ink-900",
  },
  {
    name: "neutral-400",
    value: "#b8ab99",
    box: "bg-neutral-400",
    label: "text-ink-900",
  },
  {
    name: "neutral-500",
    value: "#938776",
    box: "bg-neutral-500",
    label: "text-neutral-50",
  },
  {
    name: "neutral-600",
    value: "#675d4b",
    box: "bg-neutral-600",
    label: "text-neutral-50",
  },
  {
    name: "neutral-700",
    value: "#4f4739",
    box: "bg-neutral-700",
    label: "text-neutral-50",
  },
  {
    name: "neutral-800",
    value: "#332e25",
    box: "bg-neutral-800",
    label: "text-neutral-50",
  },
  {
    name: "neutral-900",
    value: "#211d17",
    box: "bg-neutral-900",
    label: "text-neutral-50",
  },
];

const semanticRamp: Swatch[] = [
  {
    name: "background",
    value: "neutral-50",
    box: "bg-background",
    label: "text-foreground",
  },
  {
    name: "foreground",
    value: "ink-900",
    box: "bg-foreground",
    label: "text-background",
  },
  {
    name: "surface",
    value: "#ffffff",
    box: "bg-surface",
    label: "text-surface-foreground",
  },
  {
    name: "muted",
    value: "neutral-100",
    box: "bg-muted",
    label: "text-foreground",
  },
  {
    name: "muted-foreground",
    value: "neutral-600",
    box: "bg-muted-foreground",
    label: "text-neutral-50",
  },
  {
    name: "border",
    value: "neutral-200",
    box: "bg-border",
    label: "text-ink-900",
  },
  {
    name: "accent",
    value: "brand-500",
    box: "bg-accent",
    label: "text-accent-foreground",
  },
  {
    name: "accent-strong",
    value: "brand-700",
    box: "bg-accent-strong",
    label: "text-neutral-50",
  },
];

const RO = "Construcții și Renovări — șindrilă, țiglă, fațadă";
const RU = "Ремонт крыши под ключ";

function SwatchGrid({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="micro-label text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {items.map((s) => (
          <div
            key={s.name}
            className={`flex aspect-[4/3] flex-col justify-end rounded-md border border-border p-2 ${s.box} ${s.label}`}
          >
            <span className="text-caption font-medium">{s.name}</span>
            <span className="text-micro opacity-80">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeRow({ label, sizeClass }: { label: string; sizeClass: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-6">
      <p className="micro-label text-muted-foreground">{label}</p>
      <p className={`font-serif text-foreground ${sizeClass}`}>{RO}</p>
      <p className={`font-sans text-muted-foreground ${sizeClass}`}>{RU}</p>
    </div>
  );
}

export default function Styleguide() {
  return (
    <div className="mx-auto w-full max-w-5xl px-gutter py-section">
      <header className="mb-16 flex flex-col gap-4">
        <p className="micro-label text-accent-strong">Est. 2009 — Chișinău</p>
        <h1 className="font-serif text-display-xl text-foreground">
          Design Tokens
        </h1>
        <p className="max-w-prose text-body-lg text-muted-foreground">
          RC-003 — orange accent on warm neutrals, light base. Every value below
          comes from the token system in{" "}
          <code className="text-accent-strong">src/app/globals.css</code>.
          Temporary dev aid; not linked in nav.
        </p>
      </header>

      {/* Colors */}
      <section className="mb-16 flex flex-col gap-10">
        <h2 className="font-serif text-h2 text-foreground">Color</h2>
        <SwatchGrid title="Brand — orange accent" items={brandRamp} />
        <SwatchGrid title="Ink — charcoal" items={inkRamp} />
        <SwatchGrid title="Warm neutrals" items={neutralRamp} />
        <SwatchGrid title="Semantic aliases" items={semanticRamp} />
      </section>

      {/* Type scale */}
      <section className="mb-16 flex flex-col">
        <h2 className="mb-4 font-serif text-h2 text-foreground">
          Type scale — serif display + sans body
        </h2>
        <p className="mb-6 max-w-prose text-body text-muted-foreground">
          Each row shows the size in the serif (Playfair Display) with a
          Romanian line (diacritics) and in the sans (Inter) with a Cyrillic
          line — visual proof both faces cover RO + RU glyphs.
        </p>
        <TypeRow label="display-2xl" sizeClass="text-display-2xl" />
        <TypeRow label="display-xl" sizeClass="text-display-xl" />
        <TypeRow label="display-lg" sizeClass="text-display-lg" />
        <TypeRow label="h1" sizeClass="text-h1" />
        <TypeRow label="h2" sizeClass="text-h2" />
        <TypeRow label="h3" sizeClass="text-h3" />
        <TypeRow label="body-lg" sizeClass="text-body-lg" />
        <TypeRow label="body" sizeClass="text-body" />
        <TypeRow label="caption" sizeClass="text-caption" />
      </section>

      {/* Micro-label */}
      <section className="mb-16 flex flex-col gap-4">
        <h2 className="font-serif text-h2 text-foreground">Micro-label</h2>
        <p className="max-w-prose text-body text-muted-foreground">
          Letterspaced all-caps label (the &ldquo;EST. 2009&rdquo; style) via
          the
          <code className="text-accent-strong"> micro-label</code> utility.
        </p>
        <div className="flex flex-wrap gap-8 rounded-lg border border-border bg-surface p-6">
          <span className="micro-label text-accent-strong">Est. 2009</span>
          <span className="micro-label text-foreground">Garanție 30 ani</span>
          <span className="micro-label text-muted-foreground">
            Orhei · 100 m² · 2025
          </span>
        </div>
      </section>

      {/* Light surface + dark editorial block side by side */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-h2 text-foreground">
          Surfaces — light + dark editorial
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-8">
            <p className="micro-label text-accent-strong">Light surface</p>
            <p className="font-serif text-h3 text-surface-foreground">
              Casele se construiesc.
            </p>
            <p className="text-body text-muted-foreground">
              {RO}. {RU}.
            </p>
            <button
              type="button"
              className="w-fit rounded-md bg-accent px-5 py-3 text-body font-medium text-accent-foreground"
            >
              Solicită ofertă
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-inverse-border bg-inverse-background p-8">
            <p className="micro-label text-inverse-accent">Dark editorial</p>
            <p className="font-serif text-h3 text-inverse-foreground">
              Încrederea se câștigă.
            </p>
            <p className="text-body text-inverse-muted-foreground">
              {RO}. {RU}.
            </p>
            <button
              type="button"
              className="w-fit rounded-md bg-accent px-5 py-3 text-body font-medium text-accent-foreground"
            >
              Sună acum
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
