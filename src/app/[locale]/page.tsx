import { getTranslations, setRequestLocale } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";

type PageProps = {
  params: Promise<{ locale: string }>;
};

// Scaffolding page for RC-004 (routing only). Real hero/content is a later
// ticket; this exists so `/` (RO) and `/ru` (RU) are verifiably distinct and the
// locale switcher can flip between them.
export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const services = [
    tNav("reparatiiLaCheie"),
    tNav("caseConstructii"),
    tNav("fatade"),
    tNav("finisaje"),
    tNav("proiectare"),
    tNav("instalatii"),
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <span className="text-lg font-semibold tracking-tight">
          {tCommon("companyName")}
        </span>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {tCommon("companyName")}
        </h1>

        <ul className="flex flex-col gap-1 text-zinc-700">
          {services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>

        <div className="flex gap-4 text-zinc-700">
          <span>{tNav("despre")}</span>
          <span>{tNav("portofoliu")}</span>
          <span>{tNav("contact")}</span>
        </div>

        <a
          href="tel:+37376837180"
          className="inline-flex w-fit items-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
        >
          {tCommon("phoneCta")}
        </a>
      </section>
    </main>
  );
}
