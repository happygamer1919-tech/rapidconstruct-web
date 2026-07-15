"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons";
import { estimateRoof } from "@/lib/pricing";
import {
  submitCalcLead,
  type CalcLeadFormState,
  type CalcLeadFieldError,
} from "@/app/actions/calcLead";

/** Public material shape passed from the server page (no unverified prices). */
export type CalcMaterial = { id: string; name: string; pricePerM2: number };

/** Engine bounds (mirror estimateRoof): metres, greater than 0, at most 200. */
const MIN_M = 1;
const MAX_M = 200;

const INITIAL_LEAD_STATE: CalcLeadFormState = { status: "idle" };

/** Group thousands with a thin non-breaking space, locale-agnostic. */
function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Count-up hook (motion guardrail: this is the endorsed "counter" pattern). The
 * displayed value eases toward `target` over a short window; under
 * prefers-reduced-motion it jumps straight to the value with no animation.
 */
function useCountUp(target: number): number {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion returns `target` directly (see the return below), so no
    // state update is needed here — just keep the ref in sync.
    if (reduce) {
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) return;

    const DURATION = 350;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, reduce]);

  return reduce ? target : display;
}

/**
 * Roof price calculator (RC-107).
 *
 * Three-step, mobile-first stepper on the merged pricing engine. Dimensions and
 * material feed `estimateRoof` reactively, so the honest ±10% range recomputes
 * live with no submit. The lead step reuses the shared lead seam and carries the
 * full config to the owner. All three panels stay mounted (visibility toggled)
 * so the material prices are present in server-rendered HTML for SEO/GEO.
 */
export default function RoofCalculator({
  locale,
  materials,
}: {
  locale: string;
  materials: CalcMaterial[];
}) {
  const t = useTranslations("calcPage");
  const baseId = useId();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lungime, setLungime] = useState("");
  const [latime, setLatime] = useState("");
  const [materialId, setMaterialId] = useState("");

  const lenNum = Number(lungime.replace(",", "."));
  const widNum = Number(latime.replace(",", "."));
  const dimsValid =
    Number.isFinite(lenNum) &&
    Number.isFinite(widNum) &&
    lenNum >= MIN_M &&
    lenNum <= MAX_M &&
    widNum >= MIN_M &&
    widNum <= MAX_M;

  const liveArea = dimsValid ? Math.round(lenNum * widNum * 100) / 100 : 0;

  const estimate = useMemo(
    () => (dimsValid && materialId ? estimateRoof(lenNum, widNum, materialId) : null),
    [dimsValid, materialId, lenNum, widNum],
  );

  const chosen = materials.find((m) => m.id === materialId) ?? null;

  const area = useCountUp(estimate?.area ?? 0);
  const low = useCountUp(estimate?.low ?? 0);
  const high = useCountUp(estimate?.high ?? 0);

  const steps = [
    { n: 1 as const, label: t("steps.dims") },
    { n: 2 as const, label: t("steps.material") },
    { n: 3 as const, label: t("steps.result") },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Step indicator */}
      <ol className="mb-8 flex items-center gap-2" aria-hidden="true">
        {steps.map((s, i) => (
          <li key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold transition-colors ${
                step >= s.n
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.n}
            </span>
            <span
              className={`hidden text-caption font-medium sm:inline ${
                step >= s.n ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${step > s.n ? "bg-accent" : "bg-border"}`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        {/* STEP 1 — dimensions */}
        <section hidden={step !== 1} aria-labelledby={`${baseId}-s1`}>
          <h2
            id={`${baseId}-s1`}
            className="mb-1 text-h3 font-semibold text-surface-foreground"
          >
            {t("dims.title")}
          </h2>
          <p className="mb-6 text-caption text-muted-foreground">
            {t("dims.hint")}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id={`${baseId}-lungime`}
              name="lungime"
              label={t("dims.lungimeLabel")}
              placeholder={t("dims.lungimePlaceholder")}
              value={lungime}
              onChange={setLungime}
            />
            <NumberField
              id={`${baseId}-latime`}
              name="latime"
              label={t("dims.latimeLabel")}
              placeholder={t("dims.latimePlaceholder")}
              value={latime}
              onChange={setLatime}
            />
          </div>

          <p
            className="mt-4 text-caption text-muted-foreground"
            aria-live="polite"
          >
            {dimsValid
              ? `${t("result.areaLabel")}: ${fmt(liveArea)} ${t("result.areaUnit")}`
              : t("dims.errRange")}
          </p>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              data-testid="to-material"
              disabled={!dimsValid}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("dims.next")}
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </section>

        {/* STEP 2 — material */}
        <section hidden={step !== 2} aria-labelledby={`${baseId}-s2`}>
          <h2
            id={`${baseId}-s2`}
            className="mb-1 text-h3 font-semibold text-surface-foreground"
          >
            {t("material.title")}
          </h2>
          <p className="mb-6 text-caption text-muted-foreground">
            {t("material.intro")}
          </p>

          <div
            role="radiogroup"
            aria-label={t("material.title")}
            className="grid gap-3 sm:grid-cols-2"
          >
            {materials.map((m) => {
              const selected = m.id === materialId;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-testid="material-card"
                  onClick={() => setMaterialId(m.id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${
                    selected
                      ? "border-accent bg-brand-50"
                      : "border-border bg-surface hover:border-accent-strong"
                  }`}
                >
                  <span className="text-body font-medium text-surface-foreground">
                    {m.name}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-caption font-semibold lining-nums text-accent-strong">
                    {fmt(m.pricePerM2)} {t("material.perM2")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-body font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
            >
              {t("material.back")}
            </button>
            <button
              type="button"
              data-testid="to-result"
              disabled={!materialId}
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("material.next")}
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </section>

        {/* STEP 3 — result + lead */}
        <section hidden={step !== 3} aria-labelledby={`${baseId}-s3`}>
          <h2
            id={`${baseId}-s3`}
            className="mb-6 text-h3 font-semibold text-surface-foreground"
          >
            {t("result.title")}
          </h2>

          <div className="rounded-lg border border-border bg-muted p-6">
            <dl className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <dt className="micro-label text-muted-foreground">
                  {t("result.areaLabel")}
                </dt>
                <dd className="text-h3 font-semibold lining-nums text-foreground">
                  {fmt(area)} {t("result.areaUnit")}
                </dd>
              </div>
              {chosen && (
                <div className="text-right">
                  <dt className="micro-label text-muted-foreground">
                    {t("result.materialLabel")}
                  </dt>
                  <dd className="text-body font-medium text-foreground">
                    {chosen.name}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-border pt-5">
              <dt className="micro-label text-accent-strong">
                {t("result.rangeLabel")}
              </dt>
              <dd
                data-testid="calc-range"
                aria-live="polite"
                className="mt-1 font-serif text-display-lg lining-nums text-foreground"
              >
                {t("result.between")} {fmt(low)} {t("result.and")} {fmt(high)}{" "}
                {t("result.currency")}
              </dd>
            </div>
          </div>

          <p className="mt-4 text-caption text-muted-foreground">
            {t("result.honest")}
          </p>

          {/* TODO(3d): live roof preview, white session */}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-body font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
            >
              {t("result.changeMaterial")}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-body font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
            >
              {t("result.changeDims")}
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <LeadForm
              locale={locale}
              lungime={lungime}
              latime={latime}
              materialId={materialId}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function NumberField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        min={MIN_M}
        max={MAX_M}
        step="0.1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-4 py-3 text-body lining-nums text-surface-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
      />
    </div>
  );
}

/**
 * Lead capture under the result. Reuses the calculator lead action; the current
 * dimensions + material travel as hidden fields so the delivered lead carries
 * the exact config the visitor configured. On success the form is replaced by a
 * confirmation panel.
 */
function LeadForm({
  locale,
  lungime,
  latime,
  materialId,
}: {
  locale: string;
  lungime: string;
  latime: string;
  materialId: string;
}) {
  const t = useTranslations("calcPage.lead");
  const [state, formAction, isPending] = useActionState(
    submitCalcLead,
    INITIAL_LEAD_STATE,
  );
  const baseId = useId();

  const errorFor = (code?: CalcLeadFieldError) =>
    code === "phone" ? t("errPhone") : code === "required" ? t("errRequired") : null;

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-3 rounded-lg border border-accent bg-brand-50 p-6"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon name="shield" size={22} />
        </span>
        <h3 className="text-h3 font-semibold text-foreground">
          {t("successTitle")}
        </h3>
        <p className="text-body text-muted-foreground">{t("successBody")}</p>
      </div>
    );
  }

  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div>
        <h3 className="text-h3 font-semibold text-foreground">{t("title")}</h3>
        <p className="mt-1 text-caption text-muted-foreground">{t("intro")}</p>
      </div>

      {state.deliveryFailed && (
        <p
          role="alert"
          className="rounded-lg border border-red-500 bg-red-50 p-3 text-caption text-red-700"
        >
          {t("errGeneric")}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${baseId}-nume`}
          name="nume"
          label={t("numeLabel")}
          placeholder={t("numePlaceholder")}
          autoComplete="name"
          error={errorFor(errors.nume)}
        />
        <TextField
          id={`${baseId}-telefon`}
          name="telefon"
          type="tel"
          inputMode="tel"
          label={t("telefonLabel")}
          placeholder={t("telefonPlaceholder")}
          hint={t("telefonHint")}
          autoComplete="tel"
          error={errorFor(errors.telefon)}
        />
      </div>

      <TextField
        id={`${baseId}-mesaj`}
        name="mesaj"
        label={t("mesajLabel")}
        placeholder={t("mesajPlaceholder")}
        textarea
      />

      {/* Honeypot: hidden from humans and assistive tech, off the tab order. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${baseId}-website`}>Website</label>
        <input
          id={`${baseId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Config + locale travel with the lead so sales calls back informed. */}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="lungime" value={lungime} />
      <input type="hidden" name="latime" value={latime} />
      <input type="hidden" name="material" value={materialId} />

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? t("sending") : t("submit")}
        {!isPending && <Icon name="phone" size={18} />}
      </button>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  placeholder,
  hint,
  error,
  type = "text",
  inputMode,
  autoComplete,
  textarea = false,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  type?: string;
  inputMode?: "tel";
  autoComplete?: string;
  textarea?: boolean;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const shared = {
    id,
    name,
    placeholder,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `rounded-lg border bg-surface px-4 py-3 text-body text-surface-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${
      error ? "border-red-500" : "border-border"
    }`,
  } as const;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-semibold text-foreground">
        {label}
      </label>
      {textarea ? (
        <textarea rows={3} {...shared} />
      ) : (
        <input type={type} inputMode={inputMode} {...shared} />
      )}
      {hint && (
        <p id={hintId} className="text-micro text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-micro font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
