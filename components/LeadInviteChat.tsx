"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LeadInviteChatProps = {
  lead: {
    name: string;
    title?: string;
    company?: string;
    location?: string;
    campaignContext?: string;
    currentMessage?: string;
    status?: string;
  };
  initialMessage: string;
};

export function LeadInviteChat({ lead, initialMessage }: LeadInviteChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: initialMessage }]);
  const [draft, setDraft] = useState("");
  const [sendOnEnter, setSendOnEnter] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant")?.content ?? initialMessage;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isSending]);

  async function sendMessage() {
    const content = draft.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);
    setError("");

    try {
      const response = await fetch("/api/ai/lead-invite-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: { ...lead, currentMessage: latestAssistant }, messages: nextMessages })
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Invite chat failed.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply ?? latestAssistant }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Invite chat failed.");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid max-h-64 gap-2 overflow-auto rounded-lg border border-line bg-slate-50 p-3">
        {messages.map((message, index) => (
          <p className={`m-0 rounded-lg border p-3 text-sm font-semibold leading-6 whitespace-pre-wrap ${message.role === "user" ? "justify-self-end border-blue-200 bg-blue-50" : "border-line bg-white"}`} key={`${message.role}-${index}`}>
            <strong className="mb-1 block text-xs font-extrabold text-accent-strong">{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
            {message.content}
          </p>
        ))}
        {isSending ? <p className="m-0 rounded-lg border border-line bg-white p-3 text-sm font-semibold leading-6"><strong className="mb-1 block text-xs font-extrabold text-accent-strong">Reachlyst AI</strong>Polishing...</p> : null}
        <div ref={endRef} />
      </div>
      <div className="flex justify-start">
        <CopyButton value={latestAssistant} label="Copy latest" />
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <textarea
          className="min-h-16 rounded-lg border border-line p-3 text-sm font-semibold leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && (sendOnEnter || event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Ask AI to make it shorter, warmer, more direct, or tailored to this lead..."
          value={draft}
        />
        <button className="rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50" disabled={isSending || !draft.trim()} onClick={() => void sendMessage()} type="button">
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-bold text-muted">
        <input className="h-4 w-4 accent-blue-600" checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
        Send on Enter
      </label>
      {error ? <p className="m-0 text-sm font-bold text-rose-700">{error}</p> : null}
    </div>
  );
}
