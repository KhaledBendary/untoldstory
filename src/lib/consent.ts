/**
 * Consent state for analytics and advertising.
 *
 * The tags used to load and start collecting the moment a page opened. In the
 * EU and UK that has to happen the other way round: nothing that is not
 * strictly necessary runs until the visitor agrees.
 *
 * Implemented with Google Consent Mode v2 rather than by withholding the
 * scripts. The tags load either way, but start denied, so they send nothing
 * until `grant()` flips them. That keeps a single code path, and Google
 * receives the signal it expects instead of silence.
 */

export type ConsentChoice = "granted" | "denied";

export const CONSENT_KEY = "gus_consent";
/** Bumped when the categories change, so an old answer stops counting. */
export const CONSENT_VERSION = 1;

type StoredConsent = { choice: ConsentChoice; version: number; at: string };

/** Regions where consent must precede collection. */
const CONSENT_REQUIRED_TIMEZONES = /^(Europe|Atlantic\/(Canary|Madeira|Azores|Faroe|Reykjavik))/;

/**
 * Whether this visitor has to be asked.
 *
 * Timezone is a rough proxy — it is what runs client-side without an IP
 * lookup, and it errs toward asking. Someone in Cairo is not shown a banner
 * they do not need; someone in Berlin is.
 */
export function consentRequired(): boolean {
  if (typeof Intl === "undefined") return true;
  try {
    return CONSENT_REQUIRED_TIMEZONES.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  } catch {
    return true;
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed.choice === "granted" ? "granted" : "denied";
  } catch {
    // Private browsing, or storage blocked entirely.
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    const value: StoredConsent = { choice, version: CONSENT_VERSION, at: new Date().toISOString() };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* the update below still applies for this page view */
  }
}

type ConsentSignals = Record<string, ConsentChoice>;

function updateGoogle(signals: ConsentSignals) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("consent", "update", signals);
  } catch {
    /* never break the page over a consent ping */
  }
}

function updateMeta(choice: ConsentChoice) {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  if (typeof w.fbq !== "function") return;
  try {
    w.fbq("consent", choice === "granted" ? "grant" : "revoke");
  } catch {
    /* same */
  }
}

/** Apply a decision to both platforms. Safe to call before either has loaded —
 *  the inline default in the layout covers that window. */
export function applyConsent(choice: ConsentChoice) {
  updateGoogle({
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
  updateMeta(choice);
}

export function setConsent(choice: ConsentChoice) {
  writeConsent(choice);
  applyConsent(choice);
}
