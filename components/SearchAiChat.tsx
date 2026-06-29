"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SearchAiChatProps = {
  mode: "create_search" | "train_search";
  title: string;
  intro: string;
  placeholder: string;
  description?: string;
  assistantName?: string;
  searchName?: string;
  searchUrl?: string;
  context?: string;
};

export function SearchAiChat({ mode, title, intro, placeholder, description = "Use this as a sales strategy chat for ICP, buying signals, message tone, and manual outreach copy.", assistantName = "Reachlyst AI", searchName, searchUrl, context }: SearchAiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: intro }]);
  const [draft, setDraft] = useState("");
  const [sendOnEnter, setSendOnEnter] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

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
      const response = await fetch("/api/ai/search-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, searchName, searchUrl, context, messages: nextMessages })
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "AI chat failed.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply ?? "Write it however it comes to mind. I will turn the rough version into clearer ICP, signals, filters, and message angles." }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "AI chat failed.");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,.04)]">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm font-normal leading-6 text-muted">{description}</p>
      </div>
      <div className="grid max-h-72 gap-2 overflow-auto rounded-lg border border-line bg-slate-50 p-3">
        {messages.map((message, index) => (
          <p className={`m-0 rounded-lg border p-3 text-sm font-normal leading-6 whitespace-pre-wrap ${message.role === "user" ? "justify-self-end border-blue-200 bg-blue-50" : "border-line bg-white"}`} key={`${message.role}-${index}`}>
            <strong className="mb-1 block text-xs font-normal text-accent-strong">{message.role === "user" ? "You" : assistantName}</strong>
            {message.content}
          </p>
        ))}
        {isSending ? <p className="m-0 rounded-lg border border-line bg-white p-3 text-sm font-normal leading-6"><strong className="mb-1 block text-xs font-normal text-accent-strong">{assistantName}</strong>Thinking...</p> : null}
        <div ref={endRef} />
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <textarea
          className="min-h-20 rounded-lg border border-line p-3 text-sm font-normal leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && (sendOnEnter || event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder={placeholder}
          value={draft}
        />
        <button className="rounded-lg bg-accent px-4 text-sm font-normal text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50" disabled={isSending || !draft.trim()} onClick={() => void sendMessage()} type="button">
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-normal text-muted">
        <input className="h-4 w-4 accent-blue-600" checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
        Send on Enter
      </label>
      {error ? <p className="m-0 text-sm font-normal text-rose-700">{error}</p> : null}
    </section>
  );
}
