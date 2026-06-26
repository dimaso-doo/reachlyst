"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/app/ai-playbook.module.css";

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
    <section className={styles.trainer}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>AI Playbook</span>
          <h1>Train Reachlyst for your Sales Navigator workflow</h1>
          <p>Your AI Playbook controls how Reachlyst understands leads and writes manual message suggestions inside the extension.</p>
        </div>
        <span className={ready ? styles.readyPill : styles.trainingPill}>{ready ? "Ready" : "Not trained yet"}</span>
      </header>

      <div className={styles.chatPanel}>
        <div className={styles.chatTop}>
          <span className={styles.avatar}>R</span>
          <div>
            <strong>Reachlyst AI</strong>
            <small>{ready ? "AI Playbook is ready. You can refine it anytime." : "Answer the questions below to train your playbook."}</small>
          </div>
        </div>

        <div className={styles.thread}>
          {messages.map((message, index) => (
            <p className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${message.role}-${index}`}>
              <strong>{message.role === "user" ? "You" : "Reachlyst AI"}</strong>
              {message.content}
            </p>
          ))}
          <div ref={endRef} />
        </div>

        <div className={styles.composer}>
          <textarea
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
          <button disabled={!draft.trim()} onClick={sendMessage} type="button">Send</button>
        </div>

        <div className={styles.footerActions}>
          <label className={styles.switchLabel}>
            <span>Send on Enter</span>
            <input checked={sendOnEnter} onChange={(event) => setSendOnEnter(event.target.checked)} type="checkbox" />
            <span className={styles.switch} aria-hidden="true" />
          </label>
          <button className={styles.saveButton} disabled={!messages.some((message) => message.role === "user")} onClick={savePlaybook} type="button">
            {ready ? "Update AI Playbook" : "Save AI Playbook"}
          </button>
        </div>
      </div>
    </section>
  );
}
