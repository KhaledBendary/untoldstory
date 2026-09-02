/**
 * Conversion events.
 *
 * GA4 had no key events at all, so nothing distinguished a visitor who read a
 * page from one who asked for a quote — and with nothing to import, Google Ads
 * could not tell which campaigns produced work. These are the moments worth
 * counting.
 *
 * Every call is safe before the tags load and safe if a visitor blocks them:
 * the helpers check for the global and return quietly rather than throwing
 * inside a click handler and swallowing the click.
 */

type GtagFn = (command: string, ...args: unknown[]) => void;
type FbqFn = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
  }
}

/** How someone reached out, so the reports separate a form from a phone tap. */
export type LeadMethod = "form" | "email" | "phone" | "whatsapp";

function ga(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, params);
  } catch {
    // Analytics must never break the interaction it is measuring.
  }
}

function meta(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    /* same */
  }
}

/**
 * A completed enquiry. Mark this as a key event in GA4, then import it into
 * Google Ads as a conversion — that is the whole point of sending it.
 */
export function trackLead(method: LeadMethod, params: Record<string, unknown> = {}) {
  ga("generate_lead", { method, ...params });
  meta("Lead", { content_name: method, ...params });
}

/** Someone started typing. The gap between this and generate_lead is the
 *  drop-off rate, which is the number worth watching on a long form. */
export function trackFormStart() {
  ga("form_start", { form_name: "contact" });
}

/** A tap on an email, phone or WhatsApp link — an enquiry that never touches
 *  the form, and was previously invisible. */
export function trackContactClick(method: Exclude<LeadMethod, "form">) {
  ga("contact_click", { method });
  trackLead(method);
}
