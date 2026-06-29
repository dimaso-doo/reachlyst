"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "assistant" | "user";
  content: string;
};
type AiPlaybook = {
  status: "not_trained" | "ready";
  rawNotes: string;
};
type AiUsage = { used: number; limit: number };

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";
const PLAYBOOK_NOTES_KEY = "reachlyst_ai_playbook_notes";

const readinessChecks = [
  { key: "offer", label: "Offer", patterns: ["offer", "sell", "service", "product", "help", "solution", "we do", "we build", "nudim", "prodajem", "usluga", "proizvod", "pomazemo", "resenje"] },
  { key: "icp", label: "ICP", patterns: ["icp", "target", "perfect lead", "founder", "owner", "ceo", "sales", "marketing", "industry", "company size", "cilj", "ideal", "osnivac", "vlasnik", "industrija", "velicina"] },
  { key: "signals", label: "Buying signals", patterns: ["signal", "trigger", "hiring", "posted", "growth", "funding", "recent", "pain", "problem", "signal", "zaposljava", "objavio", "rast", "investicija", "bol", "problem"] },
  { key: "tone", label: "Tone", patterns: ["tone", "casual", "professional", "friendly", "direct", "avoid words", "style", "ton", "stil", "profesionalno", "prijateljski", "direktno", "izbegava"] },
  { key: "cta", label: "CTA", patterns: ["cta", "ask", "call", "meeting", "reply", "connect", "next step", "pitaj", "poziv", "sastanak", "odgovor", "povezivanje", "sledeci korak"] }
];

const welcomeMessage = "Welcome. Talk to me naturally about your offer, buyers, website, messages, or the kind of leads you like. I will turn the useful parts into your Reachlyst AI Playbook for Sales Navigator.";

function buildPlaybookReply(input: string) {
  return `Great. I captured this as a working AI Playbook draft:

${input}

Recommended default message types for Reachlyst:

1. Short connection invite
Calm, human, under 180 characters, using only visible profile context.

2. Warmer connection invite
Still concise, but slightly softer when the lead looks like a high-fit relationship.

3. Direct relevance message
Clear and practical for decision makers who prefer direct context.

4. Follow-up after connection
A light manual follow-up that continues the same tone without pressure.

5. Not-now response
A polite reply pattern for leads who are not ready yet.

If this direction is close, save the AI Playbook. Or keep talking here and I will tighten the rules with you.`;
}

function calculateReadiness(messages: Message[]) {
  const userText = messages.filter((message) => message.role === "user").map((message) => message.content).join("\n").toLowerCase();
  const wordCount = userText.split(/\s+/).filter(Boolean).length;
  const matched = readinessChecks.filter((check) => check.patterns.some((pattern) => userText.includes(pattern)));
  const detailScore = Math.min(30, Math.floor(wordCount / 7));
  const coverageScore = matched.length * 14;
  const score = Math.min(100, Math.max(0, detailScore + coverageScore));
  const missing = readinessChecks.filter((check) => !matched.some((item) => item.key === check.key)).map((check) => check.label);
  const status = score >= 100 ? "Ready to start" : score >= 80 ? "Almost complete" : score >= 55 ? "Good draft" : score >= 25 ? "Needs more detail" : "Not trained yet";
  return { score, missing, status, wordCount };
}

export function AiPlaybookTrainer({ initialAiUsage = null }: { initialAiUsage?: AiUsage | null }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcomeMessage }]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sendOnEnter, setSendOnEnter] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(initialAiUsage);
  const endRef = useRef<HTMLDivElement | null>(null);
  const readiness = calculateReadiness(messages);
  const extensionReady = readiness.score >= 100;

  async function refreshAiUsage() {
    try {
      const response = await fetch("/api/plan", { cache: "no-store" });
      const data = await response.json();
      setAiUsage({
        used: Number(data?.usage?.monthlyAiSuggestions ?? 0),
        limit: Number(data?.limits?.monthlyAiSuggestions ?? 0)
      });
    } catch {
      setAiUsage(null);
    }
  }

  useEffect(() => {
    fetch(`/api/ai-playbook?ts=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load AI Playbook")))
      .then((data: { playbook?: AiPlaybook }) => {
        const playbook = data.playbook;
        if (!playbook?.rawNotes) {
          window.localStorage.removeItem(PLAYBOOK_NOTES_KEY);
          window.localStorage.setItem(PLAYBOOK_STATUS_KEY, "not_trained");
          setMessages([{ role: "assistant", content: welcomeMessage }]);
          return;
        }
        window.localStorage.setItem(PLAYBOOK_NOTES_KEY, playbook.rawNotes);
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, playbook.status);
        setMessages([
          { role: "assistant", content: welcomeMessage },
          { role: "user", content: playbook.rawNotes },
          { role: "assistant", content: buildPlaybookReply(playbook.rawNotes) }
        ]);
      })
      .catch(() => {
        // Local storage keeps the trainer usable when the API is unavailable.
      });
    const refreshTimer = window.setTimeout(() => {
      void refreshAiUsage();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function wait(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function revealAssistantReply(reply: string) {
    const safeReply = reply.trim() || "I am with you. Send one rough example of an ideal buyer, a bad-fit lead, or a message style you like, and I will shape it into Playbook rules.";
    setStreaming(true);
    setMessages((current) => [...current, { role: "assistant", content: "" }]);

    const words = safeReply.split(/(\s+)/);
    let visible = "";
    for (let index = 0; index < words.length; index += 1) {
      visible += words[index];
      setMessages((current) => {
        const next = [...current];
        const last = next.at(-1);
        if (last?.role === "assistant") next[next.length - 1] = { ...last, content: visible };
        return next;
      });
      if (index % 3 === 0) await wait(24);
    }
    setStreaming(false);
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content || thinking || streaming) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setThinking(true);
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/ai-playbook/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-24) })
      });
      if (!response.ok) throw new Error("Unable to chat about AI Playbook");
      const data = (await response.json()) as { reply?: string };
      await wait(Math.max(350, 900 - (Date.now() - startedAt)));
      setThinking(false);
      await revealAssistantReply(data.reply || buildPlaybookReply(content));
    } catch {
      await wait(Math.max(350, 900 - (Date.now() - startedAt)));
      setThinking(false);
      await revealAssistantReply(buildPlaybookReply(content));
    } finally {
      setThinking(false);
      void refreshAiUsage();
      window.dispatchEvent(new Event("reachlyst:plan-usage"));
    }
  }

  async function savePlaybook() {
    const userNotes = messages.filter((message) => message.role === "user").map((message) => message.content.trim()).filter(Boolean).join("\n\n");
    const assistantSummary = messages.filter((message) => message.role === "assistant").at(-1)?.content.trim() ?? "";
    const latestUserMessage = [userNotes, assistantSummary ? `Latest AI Playbook summary:\n${assistantSummary}` : ""].filter(Boolean).join("\n\n").slice(0, 8000);
    if (!latestUserMessage) return;
    const nextStatus = readiness.score >= 100 ? "ready" : "not_trained";
    window.localStorage.setItem(PLAYBOOK_NOTES_KEY, latestUserMessage);
    window.localStorage.setItem(PLAYBOOK_STATUS_KEY, nextStatus);
    setSaving(true);
    try {
      const response = await fetch("/api/ai-playbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rawNotes: latestUserMessage, status: nextStatus })
      });
      if (!response.ok) throw new Error("Unable to save AI Playbook");
      window.dispatchEvent(new Event("reachlyst:playbook-status"));
    } catch {
      window.dispatchEvent(new Event("reachlyst:playbook-status"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <header className="grid gap-5 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-reachlyst lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.4fr)] lg:items-start">
        <div>
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-accent-strong">AI Playbook</span>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-ink">Train Reachlyst for your Sales Navigator workflow</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted">Your AI Playbook controls how Reachlyst understands leads and writes manual message suggestions inside the extension.</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${extensionReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{extensionReady ? "Ready to start" : readiness.status}</span>
            <strong className="text-sm font-extrabold text-ink">{readiness.score}%</strong>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <span className={`block h-full rounded-full ${extensionReady ? "bg-emerald-500" : readiness.score >= 55 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${readiness.score}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted">
            {extensionReady
              ? "100% trained. You can start using the extension."
              : readiness.missing.length
                ? `To reach 100%, add: ${readiness.missing.slice(0, 3).join(", ")}.`
                : "Add more concrete examples to reach 100%."}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {readinessChecks.map((check) => {
            const complete = !readiness.missing.includes(check.label);
            return <span className={`rounded-full px-2 py-1 text-[11px] font-extrabold ${complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`} key={check.key}>{check.label}</span>;
            })}
          </div>
        </div>
      </header>

      <div className="grid overflow-hidden rounded-lg border border-blue-100 bg-white shadow-reachlyst">
        <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/60 px-5 py-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-extrabold text-white shadow-[0_10px_22px_rgba(22,119,255,.24)]">R</span>
          <div className="min-w-0">
            <strong className="block text-base font-extrabold text-ink">Reachlyst AI</strong>
            <small className="mt-0.5 block text-sm font-semibold text-muted">{extensionReady ? "100% trained. Start the extension, or refine it anytime." : "Complete the missing areas to reach 100% before starting the extension."}</small>
          </div>
          {aiUsage ? <div className="ml-auto shrink-0 rounded-lg border border-blue-100 bg-white px-3 py-2 text-right">
            <span className="block text-[10px] font-extrabold uppercase tracking-wide text-accent-strong">AI messages</span>
            <strong className="mt-0.5 block text-sm font-extrabold text-ink">{aiUsage.used.toLocaleString("en-US")} / {aiUsage.limit.toLocaleString("en-US")}</strong>
          </div> : null}
        </div>

        <div className="grid max-h-[min(520px,calc(100vh-390px))] min-h-[360px] gap-3 overflow-auto bg-slate-50 p-5 max-md:max-h-none max-md:min-h-80">
          {messages.map((message, index) => (
            <p className={`m-0 max-w-3xl rounded-lg border p-4 text-sm font-semibold leading-6 whitespace-pre-wrap ${message.role === "user" ? "justify-self-end border-blue-200 bg-blue-50 text-ink" : "justify-self-start border-blue-100 bg-white text-slate-700"}`} key={`${message.role}-${index}`}>
              <strong className={`mb-1 block text-xs font-extrabold ${message.role === "user" ? "text-ink" : "text-accent-strong"}`}>{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
              {message.content || (message.role === "assistant" && streaming ? "Writing..." : "")}
            </p>
          ))}
          {thinking ? <p className="m-0 max-w-3xl justify-self-start rounded-lg border border-blue-100 bg-white p-4 text-sm font-semibold leading-6 text-slate-700"><strong className="mb-1 block text-xs font-extrabold text-accent-strong">Reachlyst AI</strong>Reading context and shaping the next question...</p> : null}
          <div ref={endRef} />
        </div>

        <div className="grid gap-3 border-t border-blue-100 bg-white px-5 pt-4">
          <textarea
            className="min-h-24 resize-y rounded-lg border border-blue-100 p-3 text-sm font-semibold leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && (sendOnEnter || event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Write freely: your offer, buyers, website link, lead examples, message style, objections, or anything Reachlyst should learn..."
            value={draft}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white px-5 pb-5 pt-3">
          <button className="min-h-11 rounded-lg border border-blue-200 bg-accent px-5 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55" disabled={thinking || streaming || !draft.trim()} onClick={sendMessage} type="button">{thinking ? "Reading..." : streaming ? "Writing..." : "Send"}</button>
          <label className="inline-flex min-h-11 select-none items-center gap-2 text-sm font-extrabold text-muted">
            <span>Send on Enter</span>
            <button
              aria-pressed={sendOnEnter}
              className={`relative inline-flex min-h-0 shrink-0 items-center rounded-full border p-0.5 transition ${sendOnEnter ? "border-accent bg-accent" : "border-slate-300 bg-slate-300"}`}
              onClick={() => setSendOnEnter((current) => !current)}
              style={{ width: 40, height: 24, minHeight: 24 }}
              type="button"
            >
              <span className={`block rounded-full bg-white shadow-sm transition ${sendOnEnter ? "translate-x-4" : "translate-x-0"}`} style={{ width: 20, height: 20 }} />
            </button>
          </label>
          <button className="ml-auto min-h-11 min-w-40 rounded-lg border border-blue-200 bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55 max-md:ml-0 max-md:w-full" disabled={saving || !messages.some((message) => message.role === "user")} onClick={savePlaybook} type="button">
            {saving ? "Saving..." : extensionReady ? "Save and start extension" : "Save draft"}
          </button>
        </div>
      </div>
    </section>
  );
}
