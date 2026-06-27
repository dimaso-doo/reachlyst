"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";
const PLAYBOOK_NOTES_KEY = "reachlyst_ai_playbook_notes";

const welcomeMessage = `Welcome. I am your personal assistant for Sales Navigator leads.

To train Reachlyst for your extension, tell me what you do, which leads you want to find, and what kind of manual messages you want me to generate.

Start with a simple answer to these questions:

1. What do you sell or offer?
2. Who is your ideal lead by role, industry, company size, and location?
3. Which leads should I exclude?
4. What tone should your messages use: professional, friendly, direct, premium, short, or another style?
5. What should the message ask for: a soft connection, permission to share more, a quick reply, or another CTA?

After that, I will turn it into your AI Playbook and suggest default message types for Reachlyst.`;

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
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function sendMessage() {
    const content = draft.trim();
    if (!content) return;
    setMessages((current) => [...current, { role: "user", content }, { role: "assistant", content: buildPlaybookReply(content) }]);
    setDraft("");
  }

  function savePlaybook() {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    if (latestUserMessage) window.localStorage.setItem(PLAYBOOK_NOTES_KEY, latestUserMessage);
    window.localStorage.setItem(PLAYBOOK_STATUS_KEY, "ready");
    window.dispatchEvent(new Event("reachlyst:playbook-status"));
    setReady(true);
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

        <div className="grid gap-3 border-t border-blue-100 bg-white px-5 pb-3 pt-4 md:grid-cols-[minmax(0,1fr)_auto]">
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
          <button className="min-h-11 rounded-lg border border-blue-200 bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55" disabled={!draft.trim()} onClick={sendMessage} type="button">Send</button>
        </div>

        <div className="flex items-center justify-between gap-3 bg-white px-5 pb-5 max-md:grid">
          <label className="inline-flex items-center gap-2 text-sm font-extrabold text-muted">
            <span>Send on Enter</span>
            <input className="peer sr-only" checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
            <span className="relative inline-flex h-5 w-9 rounded-full bg-slate-300 shadow-inner transition peer-checked:bg-accent after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" aria-hidden="true" />
          </label>
          <button className="min-h-11 min-w-40 rounded-lg border border-blue-200 bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-55 max-md:w-full" disabled={!messages.some((message) => message.role === "user")} onClick={savePlaybook} type="button">
            {ready ? "Update AI Playbook" : "Save AI Playbook"}
          </button>
        </div>
      </div>
    </section>
  );
}
