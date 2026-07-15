/**
 * Lead delivery seam (RC-105).
 *
 * A single choke point for "a customer sent us their details". The contact-form
 * server action (`src/app/actions/lead.ts`) validates input and then calls
 * `deliverLead` — it does not know or care HOW the lead reaches the owner. That
 * lets us swap or add channels here without touching the form:
 *
 *   - If `RESEND_API_KEY` is set, the lead is emailed to the owner via Resend.
 *   - Otherwise the lead is logged as JSON (visible in Vercel function logs) and
 *     we still report success, so no customer message is ever lost while email
 *     credentials are pending (docs/QUESTIONS.md Q-09).
 *
 * A Telegram notifier is planned as a second channel (docs/QUESTIONS.md Q-03);
 * it hangs off the SAME point below, so both channels fire for one lead.
 */

/**
 * Roof-calculator configuration attached to a lead (RC-107). When a lead comes
 * from the calculator, the owner needs the exact config the visitor saw so the
 * sales call is informed (dimensions, chosen material, the shown range). All
 * numbers are recomputed server-side from the pricing engine, never trusted
 * from the client. Absent for plain contact-form leads.
 */
export type LeadConfig = {
  /** House footprint length in metres. */
  lungime: number;
  /** House footprint width in metres. */
  latime: number;
  /** Computed area in m² (from the engine). */
  area: number;
  /** Chosen material's display name. */
  material: string;
  /** Low end of the shown range (MDL). */
  low: number;
  /** High end of the shown range (MDL). */
  high: number;
};

export type Lead = {
  /** Customer name (required, already trimmed by the caller). */
  nume: string;
  /** Customer phone (required, validated MD format by the caller). */
  telefon: string;
  /** Free-text request (required, already trimmed). */
  mesaj: string;
  /** Locale the form was submitted in ("ro" | "ru"), for the owner's context. */
  locale: string;
  /** ISO timestamp stamped by the server action when the lead arrived. */
  receivedAt: string;
  /** Calculator config, present only for roof-calculator leads (RC-107). */
  config?: LeadConfig;
};

/**
 * Moldovan phone numbers: `+373` + 8 digits, or a local `0` + 8 digits. We
 * strip everything except digits and a leading `+` first, so the customer can
 * type spaces, dashes or parentheses. Shared by every lead action so the
 * accepted format stays identical across forms.
 */
export function isValidMdPhone(raw: string): boolean {
  const normalized = raw.replace(/[^\d+]/g, "");
  return /^(\+373\d{8}|0\d{8})$/.test(normalized);
}

/** Where lead emails are delivered (the owner's inbox, SPEC §2 / site.ts). */
const LEAD_TO = "rapidconstructmd@gmail.com";
/**
 * Resend's shared onboarding sender — works with zero DNS setup so leads flow
 * the moment RESEND_API_KEY is added. Swap for a verified rapidconstruct.md
 * sender at launch (RC-403) for better deliverability.
 */
const LEAD_FROM = "onboarding@resend.dev";

/**
 * Deliver one validated lead. Throws only if a configured channel fails (e.g.
 * Resend returns a non-2xx) so the caller can show a "call us instead" fallback;
 * the no-credentials path never throws.
 */
export async function deliverLead(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email credentials yet: keep the lead where the owner can retrieve it
    // (Vercel → project → Logs). Single-line JSON so it greps cleanly.
    console.log(`[lead] ${JSON.stringify(lead)}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: LEAD_FROM,
      to: LEAD_TO,
      reply_to: lead.telefon,
      subject: `Cerere de ofertă de la ${lead.nume}`,
      text: [
        `Nume: ${lead.nume}`,
        `Telefon: ${lead.telefon}`,
        `Limba: ${lead.locale}`,
        `Primit: ${lead.receivedAt}`,
        // Calculator config, when present, so the owner calls back informed.
        ...(lead.config
          ? [
              "",
              "Calculator acoperiș:",
              `Dimensiuni: ${lead.config.lungime} x ${lead.config.latime} m (${lead.config.area} m²)`,
              `Material: ${lead.config.material}`,
              `Estimare afișată: ${lead.config.low} - ${lead.config.high} lei`,
            ]
          : []),
        "",
        "Mesaj:",
        lead.mesaj,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API responded ${response.status}: ${body}`);
  }

  // TODO(Q-03): send the same lead to the owner's Telegram here, so a dropped
  // email still reaches them. Add it as a second await (or Promise.allSettled)
  // and only throw if BOTH channels fail.
}
