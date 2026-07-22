"use client";

import { useActionState, useId } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons";
import {
  submitLead,
  type LeadFormState,
  type LeadFieldError,
} from "@/app/actions/lead";

/** Initial form state. Lives here (not in the "use server" action module, which
 *  may only export async functions) and is passed into useActionState. */
const INITIAL_LEAD_STATE: LeadFormState = { status: "idle" };

/**
 * Contact lead form (RC-105).
 *
 * Progressive-enhancement form wired to the `submitLead` server action via
 * `useActionState`. Validation runs on the server (the form is `noValidate`) and
 * comes back as error CODES; this component maps them to RO/RU copy so all
 * strings stay in the message catalog. On success the whole form is replaced by
 * a clear confirmation panel.
 */
export default function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contactPage.form");
  const [state, formAction, isPending] = useActionState(
    submitLead,
    INITIAL_LEAD_STATE,
  );

  const baseId = useId();
  const errorFor = (code?: LeadFieldError) =>
    code === "phone"
      ? t("errPhone")
      : code === "required"
        ? t("errRequired")
        : null;

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
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
      aria-describedby={
        state.deliveryFailed ? `${baseId}-form-error` : undefined
      }
    >
      <h2 className="text-h3 font-semibold text-foreground">{t("title")}</h2>

      {state.deliveryFailed && (
        <p
          id={`${baseId}-form-error`}
          role="alert"
          className="rounded-lg border border-red-500 bg-red-50 p-3 text-caption text-red-700"
        >
          {t("errGeneric")}
        </p>
      )}

      <Field
        id={`${baseId}-nume`}
        name="nume"
        label={t("numeLabel")}
        placeholder={t("numePlaceholder")}
        autoComplete="name"
        error={errorFor(errors.nume)}
      />

      <Field
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

      <Field
        id={`${baseId}-mesaj`}
        name="mesaj"
        label={t("mesajLabel")}
        placeholder={t("mesajPlaceholder")}
        textarea
        error={errorFor(errors.mesaj)}
      />

      {/* Honeypot: hidden from humans and assistive tech, off the tab order.
          A filled value means a bot — the server action rejects it. */}
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

      {/* Locale travels with the lead so the owner sees which site it came from. */}
      <input type="hidden" name="locale" value={locale} />

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-body font-semibold text-accent-foreground transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? t("sending") : t("submit")}
        {!isPending && <Icon name="arrowRight" size={18} />}
      </button>
    </form>
  );
}

function Field({
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
    "aria-required": true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `rounded-lg border bg-surface px-4 py-3 text-body text-surface-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${
      error ? "border-red-500" : "border-border"
    }`,
  } as const;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-caption font-semibold text-foreground"
      >
        {label}
      </label>
      {textarea ? (
        <textarea rows={5} {...shared} />
      ) : (
        <input type={type} inputMode={inputMode} {...shared} />
      )}
      {hint && (
        <p id={hintId} className="text-micro text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-micro font-medium text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
