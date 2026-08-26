import { relatedServiceSlugs } from "@/lib/legacy-redirects";

export type ServiceFaq = { question: string; answer: string };

const DEFAULT_FAQS: ServiceFaq[] = [
  {
    question: "How long does a typical production take in Egypt?",
    answer:
      "A commercial or corporate film usually needs two to six weeks from brief to delivery, depending on permits, locations and the post schedule. Live events follow the event dates. We lock a calendar before the shoot so international crews can book travel against it.",
  },
  {
    question: "Do you work with international crews or only local teams?",
    answer:
      "Both. We run full local productions and we attach to incoming crews as the on-ground partner — permits, fixing, equipment, locations and finishing — so the visiting team keeps creative control without building a vendor chain from scratch.",
  },
  {
    question: "Where are you based?",
    answer:
      "Egyptian Media Production City in Cairo, with offices in Business Bay, Dubai and Jeddah. That is the same EMPC campus used for studio, rebate and finishing work, which keeps logistics inside one standard.",
  },
];

const BY_SLUG: Record<string, ServiceFaq[]> = {
  "on-ground-egypt": [
    {
      question: "Do I need a permit to film in Egypt?",
      answer:
        "Yes. Most professional filming needs an official permit, and drone, military-adjacent or heritage sites need extra approvals. We file the paperwork, coordinate with the relevant authorities and keep the shoot legal so the visiting crew is not stuck at a gate.",
    },
    {
      question: "How long does a filming permit take?",
      answer:
        "Straightforward location permits often clear in a few working days when the brief is complete. Heritage sites, drones and large public-space shoots take longer. We start the permit track as soon as the locations are locked, not the week of the call sheet.",
    },
    {
      question: "What does the 30% EMPC rebate cover?",
      answer:
        "Qualifying productions shooting through Egyptian Media Production City can access a rebate on eligible local spend. Scope depends on the project and current EFC rules. We advise what is likely to qualify and what to keep out of the claim so the budget is honest before you fly.",
    },
    {
      question: "Can you handle locations, crew and equipment as separate modules?",
      answer:
        "Yes. On-ground support is available as a full package or as modules — permits, fixing, crew, camera and grip, locations, logistics or post — so an incoming production only pays for the gaps it does not already cover.",
    },
    {
      question: "Which locations can you access?",
      answer:
        "Cairo, Giza, Luxor, Aswan, the Red Sea, desert and studio stages at EMPC. We scout, hold and manage the sites, including the practical pieces: access windows, unit base, power and crowd control.",
    },
    ...DEFAULT_FAQS.slice(1),
  ],
  "commercial-video-production": [
    {
      question: "Do you produce TV commercials and digital cutdowns from one shoot?",
      answer:
        "Yes. Campaigns are planned as a family of assets from day one — hero TVC, digital films, performance cutdowns and social versions — so you are not paying for a second shoot to fill every screen.",
    },
    {
      question: "Can you localise a campaign for Egypt, GCC and English markets?",
      answer:
        "Yes. We shoot with versioning in mind and finish with dubbing, subtitles and market-specific cutdowns so the idea stays intact in Arabic, English and other languages the brief needs.",
    },
    ...DEFAULT_FAQS,
  ],
  "documentary-production-egypt": [
    {
      question: "Do you work with international documentary crews filming in Egypt?",
      answer:
        "Yes. We attach as the local production partner: research support, contributor access, permits, fixers, crew, archive coordination and post. Visiting directors keep editorial control; we keep the ground moving.",
    },
    {
      question: "Can you help with heritage and sensitive locations?",
      answer:
        "Heritage, archaeological and government-adjacent sites need extra paper. We flag that at treatment stage and run the approvals so the shoot plan is real, not a wish list.",
    },
    ...DEFAULT_FAQS,
  ],
  "corporate-video-production-egypt": [
    {
      question: "Can you film inside plants, energy sites and live operations?",
      answer:
        "Yes. Industrial and energy shoots are planned around HSE rules, access windows and the operational reality of the site. We do not treat a factory like a studio.",
    },
    ...DEFAULT_FAQS,
  ],
};

export function getServiceFaqs(slug: string): ServiceFaq[] {
  for (const related of relatedServiceSlugs(slug)) {
    if (BY_SLUG[related]) return BY_SLUG[related];
  }
  return DEFAULT_FAQS;
}
