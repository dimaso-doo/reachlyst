"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import styles from "@/app/app/lead.module.css";

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
    <div className={styles.inviteChat}>
      <div className={styles.inviteThread}>
        {messages.map((message, index) => (
          <p className={message.role === "user" ? styles.inviteUser : styles.inviteAssistant} key={`${message.role}-${index}`}>
            <strong>{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
            {message.content}
          </p>
        ))}
        {isSending ? <p className={styles.inviteAssistant}><strong>Reachlyst AI</strong>Polishing...</p> : null}
        <div ref={endRef} />
      </div>
      <div className={styles.inviteActions}>
        <CopyButton value={latestAssistant} label="Copy latest" />
      </div>
      <div className={styles.inviteComposer}>
        <textarea
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
        <button disabled={isSending || !draft.trim()} onClick={() => void sendMessage()} type="button">
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      <label className={styles.enterToggle}>
        <input checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
        Send on Enter
      </label>
      {error ? <p className={styles.chatError}>{error}</p> : null}
    </div>
  );
}
