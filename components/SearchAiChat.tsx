"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/app/table.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SearchAiChatProps = {
  mode: "create_search" | "train_search";
  title: string;
  intro: string;
  placeholder: string;
  searchName?: string;
  searchUrl?: string;
  context?: string;
};

export function SearchAiChat({ mode, title, intro, placeholder, searchName, searchUrl, context }: SearchAiChatProps) {
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
      setMessages([...nextMessages, { role: "assistant", content: data.reply ?? "Tell me a little more about the audience you want to reach." }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "AI chat failed.");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className={styles.aiChat}>
      <div>
        <h2>{title}</h2>
        <p className={styles.aiHint}>Use this as a sales strategy chat for ICP, fit rules, exclusions, message tone, and manual outreach copy.</p>
      </div>
      <div className={styles.chatThread}>
        {messages.map((message, index) => (
          <p className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${message.role}-${index}`}>
            <strong>{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
            {message.content}
          </p>
        ))}
        {isSending ? <p className={styles.assistantMessage}><strong>Reachlyst AI</strong>Thinking...</p> : null}
        <div ref={endRef} />
      </div>
      <div className={styles.chatComposer}>
        <textarea
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
        <button disabled={isSending || !draft.trim()} onClick={() => void sendMessage()} type="button">
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      <label className={styles.enterToggle}>
        <input checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
        Send on Enter
      </label>
      {error ? <p className={styles.chatError}>{error}</p> : null}
    </section>
  );
}
