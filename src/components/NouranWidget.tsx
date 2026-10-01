"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { trackLead } from "@/lib/analytics";
import NouranAvatar from "./NouranAvatar";

type Msg = { role: "user" | "assistant"; content: string };

/** The site's chat assistant: a floating launcher stacked above the WhatsApp
 * button, opening a small chat panel that talks to /api/chat (see
 * src/lib/nouran.ts). Fully client-side state — no history is kept once the
 * tab closes; the only durable record is the lead Nouran may file server-side. */
export default function NouranWidget() {
  const { t, locale, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true;
      setMessages([{ role: "assistant", content: t("Nouran greeting") }]);
    }
  }, [open, t]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { reply: string; leadCaptured?: boolean };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.leadCaptured) trackLead("chatbot", { service: "chatbot" });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Chat with Nouran")}
        className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-[200] w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/15 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden"
      >
        <NouranAvatar size={56} />
      </button>

      {open && (
        <div
          dir={dir}
          className="fixed bottom-[9.5rem] right-5 md:bottom-[11rem] md:right-8 z-[200] w-[88vw] max-w-sm h-[65vh] max-h-[520px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#161616]">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <NouranAvatar size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">Nouran</div>
              <div className="text-[11px] text-white/40">Global Untold Story</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("Close")}
              className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-[#5b3a8e] text-white rounded-br-sm"
                    : "self-start bg-[#1f1f1f] text-white/90 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-[#1f1f1f] text-white/50 text-sm px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" />
              </div>
            )}
            {error && (
              <div className="self-start text-[#ff6b6b] text-xs px-1">
                {t("Nouran is unavailable right now, please try again") !== "Nouran is unavailable right now, please try again"
                  ? t("Nouran is unavailable right now, please try again")
                  : "Something went wrong — please try again."}
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 p-3 border-t border-white/10 bg-[#161616]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("Type your message…")}
              rows={1}
              className="flex-1 resize-none bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 max-h-24"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label={t("Send")}
              className="w-9 h-9 shrink-0 rounded-xl bg-[#5b3a8e] disabled:opacity-40 text-white flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rtl:-scale-x-100">
                <path d="M3 20l18-8L3 4v6l12 2-12 2v6z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
