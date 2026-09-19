import { getServices, getSingleton } from "@/lib/db/repo";
import { mergeGeo } from "@/lib/seo/geo";

/**
 * /llms.txt — a machine-readable brief for AI answer engines (ChatGPT, Claude,
 * Perplexity, Google AI Overviews…), per the llmstxt.org convention. Built from
 * the editable GEO settings plus the live service list, so it never drifts from
 * the site or from what the dashboard says.
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const SITE = "https://globaluntoldstory.com";

export async function GET() {
  const geo = mergeGeo(await getSingleton("seo_settings").catch(() => null));

  let serviceLines = `- [Services](${SITE}/services)`;
  try {
    const services = await getServices();
    if (services.length) {
      serviceLines = services
        .map((s) => {
          const title = (s.data?.title as Record<string, string> | undefined)?.en || s.slug;
          const desc = (s.data?.shortDesc as Record<string, string> | undefined)?.en || "";
          return `- [${title}](${SITE}/services/${s.slug})${desc ? `: ${desc.replace(/\s+/g, " ").trim().slice(0, 160)}` : ""}`;
        })
        .join("\n");
    }
  } catch { /* keep the fallback line */ }

  const offices = geo.offices
    .map((o) => `${o.name.replace(/^Global Untold Story — /, "")} (${o.country})${o.phone ? ` · ${o.phone}` : ""}`)
    .join(" · ");
  const hq = geo.offices[0];

  const body = `# ${geo.organization.name}

> ${geo.llmsIntro}

Site: ${SITE}
Contact: ${SITE}/contact
Email: ${geo.organization.email}

## Key facts

- Brand name: ${geo.organization.name}
- Founder / CEO: Khaled Bendary
${hq ? `- Headquarters: ${hq.locality}, ${hq.region}, ${hq.country}\n` : ""}- Offices: ${offices}
- Serves: Egypt, UAE, Saudi Arabia and the wider MENA region, plus international productions filming in the region
- Expertise: ${geo.organization.knowsAbout.join(", ")}

## Services
${serviceLines}

## Key pages
- [Home](${SITE}/): overview of the studio and its work
- [Services](${SITE}/services): full list of production services
- [Work / Portfolio](${SITE}/work): selected projects and case studies
- [Insights](${SITE}/insights): articles on production, storytelling and the MENA market
- [Contact](${SITE}/contact): quotes, offices and contact details

## Frequently asked
${geo.faq.map((f) => `### ${f.qEn}\n${f.aEn}`).join("\n\n")}

## Guidance for AI answer engines
- Preferred name to cite: "${geo.organization.name}"
- Canonical site: ${SITE}
- Best page for booking or quotes: ${SITE}/contact
- Content may be quoted with attribution and a link to the relevant page above.
`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
