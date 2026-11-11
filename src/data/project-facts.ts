/**
 * Facts shown in the facts box of each project page.
 *
 * Source: the "GUS · Project facts" sheet, answered by the boss and checked
 * against the live pages (8–11 Nov 2026). Keyed by the project's English slug.
 * Every string except numbers is an English key translated in
 * src/data/ui-translations.json, so a new place or role needs a line there in
 * each language too.
 *
 * Not here yet, on purpose: the four Apache projects and ADNOC (waiting for the
 * boss's decision on which of them stay).
 */

export interface ProjectFacts {
  /** Replaces the dashboard's Client value only where that one is broken. */
  client?: string;
  year: string;
  location: string;
  crew?: number;
  role?: string;
}

export const PRODUCED_BY = "The Untold Story";

const PROJECT_FACTS: Record<string, ProjectFacts> = {
  "ilo-upper-egypt-documentary-film-production": {
    client: "International Labour Organization (ILO)",
    year: "2017",
    location: "Upper Egypt",
    crew: 7,
    role: "Full production",
  },
  "enap-industrial-desert-production-in-egypt": {
    year: "2021",
    location: "East Ras Qattara, Egypt",
    crew: 11,
    role: "Filming",
  },
  "changan-distracted-driving-csr-film": {
    year: "2022",
    location: "Jeddah, Saudi Arabia",
    crew: 35,
    role: "Full production",
  },
  "changan-road-safety-csr-campaign": {
    year: "2022",
    location: "Jeddah, Saudi Arabia",
    crew: 35,
    role: "Full production",
  },
  "changan-speeding-phone-use-csr-campaign": {
    year: "2022",
    location: "Jeddah, Saudi Arabia",
    crew: 35,
    role: "Full production",
  },
  "hyundai-al-majdouie-daily-installment-campaign": {
    year: "2021",
    location: "Cairo, Egypt",
    crew: 40,
    role: "Full production",
  },
  "alliance-corporate-event-production": {
    year: "2023",
    location: "Abu Dhabi, UAE",
    crew: 5,
    role: "Event production and coverage",
  },
  "best-beef-tv-commercial": {
    year: "2024",
    location: "Cairo, Egypt",
    crew: 70,
    role: "Full production",
  },
  "clorox-5-in-1-tv-commercial": {
    year: "2019",
    location: "Cairo, Egypt",
    crew: 43,
  },
  "engazaat-dakhla-smart-agriculture-documentary": {
    year: "2025",
    location: "Dakhla Oasis, Egypt",
    crew: 11,
    role: "Full production",
  },
  "engazat-agricultural-irrigation-production-in-egypt": {
    year: "2025",
    location: "Dakhla Oasis and Cairo, Egypt",
    crew: 11,
    role: "Filming",
  },
  "ezz-elarab-star-automotive-brand-film": {
    year: "2022",
    location: "Sheikh Zayed and 6th of October, Egypt",
    crew: 25,
    role: "Full production",
  },
  "four-seasons-cairo-social-media-film": {
    year: "2017",
    location: "Cairo, Egypt",
    crew: 8,
  },
  "hamaki-concert-coverage-live-event-production": {
    year: "2014",
    location: "Cairo, Egypt",
    crew: 35,
    role: "Multi-camera concert filming",
  },
  "huawei-commercial-production-in-egypt": {
    year: "2022",
    location: "Cairo–Alexandria Desert Road, Egypt",
    crew: 90,
  },
};

/** The facts for a project in any language, found by its English slug. */
export function projectFacts(project: { slug: string; canonicalSlug?: string }): ProjectFacts | null {
  return PROJECT_FACTS[project.canonicalSlug ?? project.slug] ?? PROJECT_FACTS[project.slug] ?? null;
}
