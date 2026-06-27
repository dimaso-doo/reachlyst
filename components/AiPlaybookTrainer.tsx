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

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";
const PLAYBOOK_NOTES_KEY = "reachlyst_ai_playbook_notes";

const welcomeMessage = `Welcome. I am your personal assistant for Sales Navigator leads.

I will help you build the rules Reachlyst uses inside the extension: who is a good lead, who should be skipped, what invite style to use, and how replies should sound when someone accepts your connection.

Start anywhere. The fastest path is to answer these:

1. What do you sell or offer?
2. Who is a perfect lead by role, industry, company size, and location?
3. Who is not relevant and should be marked Skip?
4. What signals make someone worth messaging?
5. What should invites and accepted-connection replies ask for?
6. What tone and words should Reachlyst avoid?

I will ask follow-up questions until the Playbook is specific enough to guide invite suggestions, reply suggestions, and lead-fit analysis.`;

function buildPlaybookReply(input: string) {
  return `Great. I captured this as your first AI Playbook draft:

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

If this direction is right, save the AI Playbook. You can keep refining it here anytime.`;
}

export function AiPlaybookTrainer() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcomeMessage }]);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sendOnEnter, setSendOnEnter] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setReady(window.localStorage.getItem(PLAYBOOK_STATUS_KEY) === "ready");
    const savedNotes = window.localStorage.getItem(PLAYBOOK_NOTES_KEY);
    if (savedNotes) {
      setMessages([
        { role: "assistant", content: welcomeMessage },
        { role: "user", content: savedNotes },
        { role: "assistant", content: buildPlaybookReply(savedNotes) }
      ]);
    }
    fetch("/api/ai-playbook")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load AI Playbook")))
      .then((data: { playbook?: AiPlaybook }) => {
        const playbook = data.playbook;
        if (!playbook?.rawNotes) return;
        window.localStorage.setItem(PLAYBOOK_NOTES_KEY, playbook.rawNotes);
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, playbook.status);
        setReady(playbook.status === "ready");
        setMessages([
          { role: "assistant", content: welcomeMessage },
          { role: "user", content: playbook.rawNotes },
          { role: "assistant", content: buildPlaybookReply(playbook.rawNotes) }
        ]);
      })
      .catch(() => {
        // Local storage keeps the trainer usable when the API is unavailable.
      });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function sendMessage() {
    const content = draft.trim();
    if (!content || thinking) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setThinking(true);
    try {
      const response = await fetch("/api/ai-playbook/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-24) })
      });
      if (!response.ok) throw new Error("Unable to chat about AI Playbook");
      const data = (await response.json()) as { reply?: string };
      setMessages((current) => [...current, { role: "assistant", content: data.reply || buildPlaybookReply(content) }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: buildPlaybookReply(content) }]);
    } finally {
      setThinking(false);
    }
  }

  async function savePlaybook() {
    const userNotes = messages.filter((message) => message.role === "user").map((message) => message.content.trim()).filter(Boolean).join("\n\n");
    const assistantSummary = messages.filter((message) => message.role === "assistant").at(-1)?.content.trim() ?? "";
    const latestUserMessage = [userNotes, assistantSummary ? `Latest AI Playbook summary:\n${assistantSummary}` : ""].filter(Boolean).join("\n\n").slice(0, 8000);
    if (!latestUserMessage) return;
    window.localStorage.setItem(PLAYBOOK_NOTES_KEY, latestUserMessage);
    window.localStorage.setItem(PLAYBOOK_STATUS_KEY, "ready");
    setSaving(true);
    try {
      const response = await fetch("/api/ai-playbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rawNotes: latestUserMessage, status: "ready" })
      });
      if (!response.ok) throw new Error("Unable to save AI Playbook");
      window.dispatchEvent(new Event("reachlyst:playbook-status"));
      setReady(true);
    } catch {
      window.dispatchEvent(new Event("reachlyst:playbook-status"));
      setReady(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <header className="grid gap-5 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-reachlyst md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-accent-strong">AI Playbook</span>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-ink">Train Reachlyst for your Sales Navigator workflow</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted">Your AI Playbook controls how Reachlyst understands leads and writes manual message suggestions inside the extension.</p>
        </div>
        <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-2 text-xs font-extrabold ${ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{ready ? "Ready" : "Not trained yet"}</span>
      </header>

      <div className="grid overflow-hidden rounded-lg border border-blue-100 bg-white shadow-reachlyst">
        <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/60 px-5 py-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-extrabold text-white shadow-[0_10px_22px_rgba(22,119,255,.24)]">R</span>
          <div>
            <strong className="block text-base font-extrabold text-ink">Reachlyst AI</strong>
            <small className="mt-0.5 block text-sm font-semibold text-muted">{ready ? "AI Playbook is ready. You can refine it anytime." : "Answer the questions below to train your playbook."}</small>
          </div>
        </div>

        <div className="grid max-h-[min(520px,calc(100vh-390px))] min-h-[360px] gap-3 overflow-auto bg-slate-50 p-5 max-md:max-h-none max-md:min-h-80">
          {messages.map((message, index) => (
            <p className={`m-0 max-w-3xl rounded-lg border p-4 text-sm font-semibold leading-6 whitespace-pre-wrap ${message.role === "user" ? "justify-self-end border-blue-200 bg-blue-50 text-ink" : "justify-self-start border-blue-100 bg-white text-slate-700"}`} key={`${message.role}-${index}`}>
              <strong className={`mb-1 block text-xs font-extrabold ${message.role === "user" ? "text-ink" : "text-accent-strong"}`}>{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
              {message.content}
            </p>
          ))}
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
            placeholder="Tell me what you offer, who you target, who to exclude, and what tone your messages should use..."
            value={draft}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white px-5 pb-5 pt-3">
          <button className="min-h-11 rounded-lg border border-blue-200 bg-accent px-5 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55" disabled={thinking || !draft.trim()} onClick={sendMessage} type="button">{thinking ? "Thinking..." : "Send"}</button>
          <label className="inline-flex min-h-11 select-none items-center gap-2 text-sm font-extrabold text-muted">
            <span>Send on Enter</span>
            <button
              aria-pressed={sendOnEnter}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border p-0.5 transition ${sendOnEnter ? "border-accent bg-accent" : "border-slate-300 bg-slate-300"}`}
              onClick={() => setSendOnEnter((current) => !current)}
              type="button"
            >
              <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${sendOnEnter ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>
          <button className="ml-auto min-h-11 min-w-40 rounded-lg border border-blue-200 bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55 max-md:ml-0 max-md:w-full" disabled={saving || !messages.some((message) => message.role === "user")} onClick={savePlaybook} type="button">
            {saving ? "Saving..." : ready ? "Update AI Playbook" : "Save AI Playbook"}
          </button>
        </div>
      </div>
    </section>
  );
}
