"use server";

import { deliverLead, isValidMdPhone, type LeadConfig } from "@/lib/lead";
import { estimateRoof, publicMaterials } from "@/lib/pricing";

/**
 * Roof-calculator lead action (RC-107).
 *
 * Reuses the same delivery seam and phone rule as the contact form
 * (`src/lib/lead.ts`), but the calculator only asks for name + phone (message is
 * optional) and attaches the visitor's configuration to the lead so the owner
 * calls back knowing the dimensions, material and range they saw.
 *
 * The range is RECOMPUTED here from the pricing engine using the submitted
 * dimensions + material id — client-sent prices are never trusted. Only public
 * (owner-confirmed) materials produce a config; an unrecognised material still
 * delivers the lead so no customer request is lost.
 *
 * Errors come back as stable CODES (not sentences); the client maps them to
 * RO/RU copy so validation strings stay in the message catalog.
 */

export type CalcLeadFieldError = "required" | "phone";

export type CalcLeadFormState = {
  status: "idle" | "success" | "error";
  /** Per-field validation errors (only present when status === "error"). */
  errors?: Partial<Record<"nume" | "telefon", CalcLeadFieldError>>;
  /** True when validation passed but delivery failed — show the fallback. */
  deliveryFailed?: boolean;
};

export async function submitCalcLead(
  _prev: CalcLeadFormState,
  formData: FormData,
): Promise<CalcLeadFormState> {
  // Honeypot: a filled hidden "website" field means a bot. Reject silently.
  const honeypot = (formData.get("website") ?? "").toString().trim();
  if (honeypot) {
    return { status: "error", deliveryFailed: true };
  }

  const nume = (formData.get("nume") ?? "").toString().trim();
  const telefon = (formData.get("telefon") ?? "").toString().trim();
  const mesaj = (formData.get("mesaj") ?? "").toString().trim();
  const locale = (formData.get("locale") ?? "ro").toString();

  const errors: NonNullable<CalcLeadFormState["errors"]> = {};
  if (!nume) errors.nume = "required";
  if (!telefon) errors.telefon = "required";
  else if (!isValidMdPhone(telefon)) errors.telefon = "phone";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  // Rebuild the config from the engine — never trust client-sent prices.
  const lungime = Number(formData.get("lungime"));
  const latime = Number(formData.get("latime"));
  const materialId = (formData.get("material") ?? "").toString();
  const material = publicMaterials().find((m) => m.id === materialId);
  const estimate = estimateRoof(lungime, latime, materialId);

  const config: LeadConfig | undefined =
    material && estimate
      ? {
          lungime,
          latime,
          area: estimate.area,
          material: material.name,
          low: estimate.low,
          high: estimate.high,
        }
      : undefined;

  // Message is optional here; synthesize a readable summary when it is empty so
  // the owner always has context even without free text.
  const composedMesaj =
    mesaj ||
    (config
      ? `Cerere din calculator: ${config.lungime} x ${config.latime} m, ${config.material}. Estimare afișată ${config.low} - ${config.high} lei.`
      : "Cerere din calculatorul de acoperiș.");

  try {
    await deliverLead({
      nume,
      telefon,
      mesaj: composedMesaj,
      locale: locale === "ru" ? "ru" : "ro",
      receivedAt: new Date().toISOString(),
      config,
    });
  } catch (err) {
    console.error("[calc-lead] delivery failed", err);
    return { status: "error", deliveryFailed: true };
  }

  return { status: "success" };
}
