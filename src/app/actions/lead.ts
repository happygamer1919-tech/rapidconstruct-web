"use server";

import { deliverLead, isValidMdPhone } from "@/lib/lead";

/**
 * Contact-form server action (RC-105).
 *
 * Server-side validation is the source of truth: the form renders with
 * `noValidate`, so these checks run for every submission (and again on the
 * server even if a client bypasses the markup). Errors come back as stable
 * CODES, not sentences — the client component maps them to RO/RU strings via
 * next-intl, so validation copy stays in the message catalog and bilingual.
 */

/** Which field failed and why (client maps to a localized message). */
export type LeadFieldError = "required" | "phone";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  /** Per-field validation errors (only present when status === "error"). */
  errors?: Partial<Record<"nume" | "telefon" | "mesaj", LeadFieldError>>;
  /** True when validation passed but delivery failed — show the fallback. */
  deliveryFailed?: boolean;
};

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Honeypot: the hidden "website" field is invisible to humans; if it carries
  // any value, a bot filled it. Reject without delivering.
  const honeypot = (formData.get("website") ?? "").toString().trim();
  if (honeypot) {
    return { status: "error", deliveryFailed: true };
  }

  const nume = (formData.get("nume") ?? "").toString().trim();
  const telefon = (formData.get("telefon") ?? "").toString().trim();
  const mesaj = (formData.get("mesaj") ?? "").toString().trim();
  const locale = (formData.get("locale") ?? "ro").toString();

  const errors: NonNullable<LeadFormState["errors"]> = {};
  if (!nume) errors.nume = "required";
  if (!telefon) errors.telefon = "required";
  else if (!isValidMdPhone(telefon)) errors.telefon = "phone";
  if (!mesaj) errors.mesaj = "required";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    await deliverLead({
      nume,
      telefon,
      mesaj,
      locale: locale === "ru" ? "ru" : "ro",
      receivedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Never surface internals to the visitor; log for the owner/Vercel.
    console.error("[lead] delivery failed", err);
    return { status: "error", deliveryFailed: true };
  }

  return { status: "success" };
}
