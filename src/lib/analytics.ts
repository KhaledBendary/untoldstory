/**
 * Conversion events.
 *
 * GA4 had no key events at all, so nothing distinguished a visitor who read a
 * page from one who asked for a quote — and with nothing to import, Google Ads
 * could not tell which campaigns produced work. These are the moments worth
 * counting.
 *
 * Every call is safe before the container loads and safe if a visitor blocks
 * it: the push goes onto an array that exists either way, and throws are
 * swallowed rather than escaping a click handler and eating the click.
 */

type FbqFn = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: FbqFn;
  }
}

/** How someone reached out, so the reports separate a form from a phone tap. */
export type LeadMethod = "form" | "email" | "phone" | "whatsapp";

/*
 * Events go on the dataLayer, where Tag Manager can see them.
 *
 * They used to be sent with gtag(), which pushes its arguments object in a
 * shape GTM does not read as an event — with GA4 now loading through the
 * container rather than from this app, a gtag() call would have gone nowhere.
 * The push is also safe before the container loads: the array exists first and
 * GTM replays whatever is already in it.
 */
function push(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
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
  // form_id only where there is a form. This is also reached from a tap on an
  // email, phone or WhatsApp link, and labelling those "contact_form" would
  // make the container unable to tell a submission from a phone call.
  push({
    event: "generate_lead",
    ...(method === "form" ? { form_id: "contact_form" } : {}),
    method,
    ...params,
  });
  meta("Lead", { content_name: method, ...params });
}

/** Someone started typing. The gap between this and generate_lead is the
 *  drop-off rate, which is the number worth watching on a long form. */
export function trackFormStart() {
  push({ event: "form_start", form_name: "contact" });
}

/** A tap on an email, phone or WhatsApp link — an enquiry that never touches
 *  the form, and was previously invisible. */
export function trackContactClick(method: Exclude<LeadMethod, "form">) {
  push({ event: "contact_click", method });
  trackLead(method);
}
