import "server-only";
import { addMessage, markMessageEmailed } from "@/lib/db/repo";
import { isMailConfigured, sendContactEmail } from "@/lib/mail";
import { NOURAN_KNOWLEDGE } from "@/data/nouran-knowledge";

/**
 * Nouran — the website's chat assistant. A thin wrapper over OpenAI's Chat
 * Completions API (same provider and raw-fetch style as src/lib/translate's
 * openaiTranslate), grounded in a company knowledge pack and able to file a
 * captured lead straight into the `messages` inbox via a tool call, the same
 * table the contact form writes to (see src/lib/db/repo.ts addMessage).
 */

const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.NOURAN_MODEL || "gpt-4o-mini";

export const nouranConfigured = (): boolean => Boolean(process.env.OPENAI_API_KEY);

export class NouranError extends Error {}

export type ChatMessage = { role: "user" | "assistant"; content: string };

const LOCALE_NAMES: Record<string, string> = {
  en: "English", ar: "Arabic (Egyptian/MSA, natural and warm)",
  de: "German", es: "Spanish", fr: "French", it: "Italian", pt: "Portuguese",
  tr: "Turkish", ru: "Russian", zh: "Simplified Chinese", ja: "Japanese",
  ko: "Korean", pl: "Polish", sw: "Swahili",
};

/** A short, standalone reminder — repeated right before the knowledge pack and
 * again as the very last message sent to the model. The instruction used to
 * appear once, near the top, ahead of a ~45k-token all-English knowledge pack
 * — with that much English context after it, the model reliably followed it
 * for English and Arabic (both very high-resource for it) but regularly drifted
 * back to English for the other 12 locales, a well-known "lost in the middle" /
 * context-anchoring effect in long-context LLM calls. Restating it right before
 * generation (the end of the message list, which models weight most heavily)
 * fixes that without having to shrink the knowledge pack. */
function languageReminder(locale: string): string {
  const language = LOCALE_NAMES[locale] || "English";
  return `REMINDER — reply ONLY in ${language}, not English, even though the reference material is in English.`;
}

function systemPrompt(locale: string): string {
  const language = LOCALE_NAMES[locale] || "English";
  return [
    `CRITICAL RULE: Write your entire reply in ${language} ONLY — never in English or any other ` +
      "language, even though the reference material further below is written in English. This is " +
      "the single most important rule and overrides everything else, including the visitor typing " +
      "in a different language. Only switch language if the visitor clearly and explicitly asks you to.",
    "You are Nouran, the warm and professional virtual assistant for Global Untold Story " +
      "(globaluntoldstory.com), an international creative production studio (film, advertising, " +
      "documentary, TV, live production, post-production, motion/CGI, and more), with offices in " +
      "Cairo, Dubai and Jeddah.",
    "Keep replies short and conversational (2-5 sentences), like a helpful chat message, not an essay. " +
      "Use the knowledge pack below to answer questions about the company, its services, past clients, " +
      "and how it works. Never invent specific prices, availability dates, booking confirmations, permit " +
      "or legal approvals, rights transfers, or guaranteed commercial results — the source material " +
      "explicitly does not establish these; if asked, say a team member will confirm exact details.",
    "Your other goal: when a visitor describes something they want (a project, a quote, a service), have " +
      "a brief, natural conversation to understand what they need, then collect their name and at least " +
      "one way to reach them (email or phone/WhatsApp). As soon as you have a name, a contact method, and " +
      "a clear idea of their request, call save_customer_request — don't wait until the chat ends, and " +
      "don't ask for information you already have. After saving, confirm warmly that the team will follow " +
      "up, and keep helping if they have more questions.",
    "Never pressure a visitor who is just asking general questions to give contact details.",
    "--- COMPANY KNOWLEDGE PACK (for grounding your answers; do not dump this verbatim or mention " +
      "'source pack' or page-citation codes like P2026 to the visitor) ---",
    NOURAN_KNOWLEDGE,
    "--- END OF KNOWLEDGE PACK ---",
    languageReminder(locale),
  ].join("\n\n");
}

const SAVE_LEAD_TOOL = {
  type: "function" as const,
  function: {
    name: "save_customer_request",
    description:
      "Save the visitor's captured lead once you have their name, at least one contact method " +
      "(email or phone/WhatsApp), and a clear description of what they want. Call this once, as soon " +
      "as that information is available.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The visitor's name." },
        email: { type: "string", description: "Email address, or an empty string if not given." },
        phone: { type: "string", description: "Phone/WhatsApp number, or an empty string if not given." },
        request_summary: {
          type: "string",
          description: "A clear, concise summary in English of what the visitor is asking for or interested in.",
        },
      },
      required: ["name", "request_summary"],
    },
  },
};

type OpenAIMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
};

async function callOpenAI(messages: OpenAIMessage[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new NouranError("not-configured");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 500,
      messages,
      tools: [SAVE_LEAD_TOOL],
      tool_choice: "auto",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Nouran OpenAI error", res.status, detail.slice(0, 300));
    throw new NouranError(res.status === 401 ? "bad-key" : `http-${res.status}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: OpenAIMessage }[];
  };
  const message = json.choices?.[0]?.message;
  if (!message) throw new NouranError("empty");
  return message;
}

export type NouranResult = { reply: string; leadCaptured: boolean };

/** Run one turn of the conversation, handling a save_customer_request tool call inline if the model makes one. */
export async function nouranChat(history: ChatMessage[], locale: string): Promise<NouranResult> {
  const reminder: OpenAIMessage = { role: "system", content: languageReminder(locale) };
  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt(locale) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  // The reminder goes last, not just once near the top — models weight the
  // end of a long message list far more heavily than a few hundred tokens in
  // among another ~45k of English knowledge-pack context.
  const first = await callOpenAI([...messages, reminder]);

  const toolCall = first.tool_calls?.find((c) => c.function.name === "save_customer_request");
  if (!toolCall) {
    return { reply: (first.content || "").trim(), leadCaptured: false };
  }

  let args: { name?: string; email?: string; phone?: string; request_summary?: string };
  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch {
    args = {};
  }

  const name = (args.name || "").trim();
  const email = (args.email || "").trim();
  const phone = (args.phone || "").trim();
  const requestSummary = (args.request_summary || "").trim();
  const hasContact = Boolean(email || phone);

  let toolResult: string;
  let leadCaptured = false;

  if (name && requestSummary && hasContact) {
    const payload = {
      name,
      email: email || "not-provided@chatbot.globaluntoldstory.com",
      phone: phone || undefined,
      service: "Nouran (chatbot)",
      message: requestSummary,
      locale,
    };
    // Store first — the lead must survive even if the notification email
    // fails — then notify by email as a best-effort extra, same order as the
    // contact form (see src/app/api/contact/route.ts).
    let messageId: number | null = null;
    try {
      messageId = await addMessage({
        ...payload,
        source: "chatbot",
        conversation: [...history, { role: "assistant", content: requestSummary }],
      });
      leadCaptured = true;
      toolResult = "Saved successfully. Tell the visitor warmly that the team will follow up soon.";
    } catch (error) {
      console.error("Nouran lead save failed:", error);
      toolResult = "Saving failed due to a server error. Apologize briefly and continue helping.";
    }
    if (messageId && isMailConfigured()) {
      try {
        await sendContactEmail({ ...payload, source: "chatbot" });
        await markMessageEmailed(messageId);
      } catch (error) {
        console.error("Nouran lead email failed:", error);
      }
    }
  } else {
    const missing = [!name && "name", !hasContact && "an email or phone number", !requestSummary && "what they're looking for"]
      .filter(Boolean)
      .join(", ");
    toolResult = `Not saved yet — still missing: ${missing}. Ask the visitor for it naturally.`;
  }

  const followUp = await callOpenAI([
    ...messages,
    { role: "assistant", content: first.content ?? null, tool_calls: first.tool_calls },
    { role: "tool", content: toolResult, tool_call_id: toolCall.id },
    reminder,
  ]);

  return { reply: (followUp.content || "").trim(), leadCaptured };
}
