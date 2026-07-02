"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";

type AccessState = {
  isPaid: boolean;
  tokenCount: number;
  activeToken?: string;
  boundDeviceLabel?: string;
  boundAt?: string;
  lastTokenUsedAt?: string;
};

type OnboardingWizardOverlayProps = {
  initialPlaybookReady: boolean;
  initialExtensionAccess: AccessState;
};

const questions = [
  {
    key: "offer",
    label: "Offer",
    question: "What do you sell, and what concrete outcome do customers get?"
  },
  {
    key: "icp",
    label: "ICP",
    question: "Who is the ideal lead? Include roles, industries, company size, and countries."
  },
  {
    key: "signals",
    label: "Buying signals",
    question: "Which profile or company signals show that a lead is worth contacting?"
  },
  {
    key: "tone",
    label: "Tone",
    question: "How should Reachlyst sound in invites and replies? Add words to avoid if any."
  },
  {
    key: "cta",
    label: "CTA",
    question: "What should the first invite or follow-up usually try to achieve?"
  }
] as const;

type QuestionKey = (typeof questions)[number]["key"];

export function OnboardingWizardOverlay({ initialPlaybookReady, initialExtensionAccess }: OnboardingWizardOverlayProps) {
  const [playbookReady, setPlaybookReady] = useState(initialPlaybookReady);
  const [access, setAccess] = useState(initialExtensionAccess);
  const [step, setStep] = useState<"playbook" | "extension">(initialPlaybookReady ? "extension" : "playbook");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({
    offer: "",
    icp: "",
    signals: "",
    tone: "",
    cta: ""
  });
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");
  const extensionConnected = Boolean(access.boundAt || access.lastTokenUsedAt);
  const complete = playbookReady && extensionConnected;
  const currentQuestion = questions[questionIndex];

  const playbookProgress = useMemo(() => {
    const answered = questions.filter((question) => answers[question.key].trim()).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers]);

  useEffect(() => {
    if (complete) return;
    const timer = window.setInterval(() => {
      void refreshExtensionStatus();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [complete]);

  async function refreshExtensionStatus(showFeedback = false) {
    if (showFeedback) {
      setCheckingConnection(true);
      setConnectionMessage("");
      setError("");
    }
    try {
      const response = await fetch("/api/extension/token", { cache: "no-store" });
      const data = await response.json();
      setAccess(data);
      window.dispatchEvent(new Event("reachlyst:extension-status"));
      if (showFeedback) {
        const connected = Boolean(data?.boundAt || data?.lastTokenUsedAt);
        setConnectionMessage(connected ? "Connection verified. You can enter the dashboard." : "Not connected yet. Paste the key into the Chrome extension, open Sales Navigator, then click Start in the extension.");
      }
    } catch {
      if (showFeedback) setError("Could not check the extension connection. Try again.");
    } finally {
      if (showFeedback) setCheckingConnection(false);
    }
  }

  function getAnswersWithDraft() {
    const value = draft.trim();
    if (!value) return null;
    return { ...answers, [currentQuestion.key]: value };
  }

  async function nextQuestion() {
    setError("");
    const nextAnswers = getAnswersWithDraft();
    if (!nextAnswers) {
      setError("Add a short answer before continuing.");
      return;
    }
    if (questionIndex < questions.length - 1) {
      setAnswers(nextAnswers);
      setDraft("");
      setQuestionIndex((current) => current + 1);
      return;
    }
    await savePlaybook(nextAnswers);
  }

  async function savePlaybook(nextAnswers: Record<QuestionKey, string>) {
    const missing = questions.find((question) => !nextAnswers[question.key].trim());
    if (missing) {
      setError(`Add ${missing.label} before continuing.`);
      return;
    }

    setSaving(true);
    setError("");
    const rawNotes = [
      "Reachlyst onboarding AI Playbook",
      "",
      ...questions.map((question) => `${question.label}:\n${nextAnswers[question.key].trim()}`)
    ].join("\n\n");

    try {
      const response = await fetch("/api/ai-playbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rawNotes, status: "ready" })
      });
      if (!response.ok) throw new Error("Could not save AI Playbook.");
      window.localStorage.setItem("reachlyst_ai_playbook_status", "ready");
      window.localStorage.setItem("reachlyst_ai_playbook_notes", rawNotes);
      window.dispatchEvent(new Event("reachlyst:playbook-status"));
      setAnswers(nextAnswers);
      setDraft("");
      setPlaybookReady(true);
      setStep("extension");
    } catch {
      setError("Could not save AI Playbook. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function generateToken() {
    setTokenLoading(true);
    setError("");
    try {
      const response = await fetch("/api/extension/token", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Could not generate token.");
      setAccess({ ...data.access, activeToken: data.token ?? data.access?.activeToken });
      setConnectionMessage("Connection key is ready. Paste it into the Chrome extension, then click Start there.");
      window.dispatchEvent(new Event("reachlyst:extension-status"));
    } catch (tokenError) {
      setError(tokenError instanceof Error ? tokenError.message : "Could not generate token.");
    } finally {
      setTokenLoading(false);
    }
  }

  async function copyToken() {
    if (!access.activeToken) return;
    await navigator.clipboard.writeText(access.activeToken);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (complete) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-[#f5f7fb] text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(22,119,255,.16),transparent_34%),linear-gradient(180deg,#ffffff,#eef4ff)]" />
      <main className="relative mx-auto grid min-h-screen w-[min(1180px,calc(100%-32px))] content-center gap-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">Reachlyst setup wizard</span>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-ink">Set up Reachlyst before opening the dashboard.</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">First train the AI Playbook, then connect the Chrome extension to Sales Navigator.</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-reachlyst">
            <div className="flex min-w-52 items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Progress</span>
              <strong className="text-sm font-extrabold text-ink">{playbookReady ? extensionConnected ? "2" : "1" : "0"} / 2</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-accent transition-all" style={{ width: `${playbookReady ? extensionConnected ? 100 : 50 : 0}%` }} />
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,.12)]">
          <div className="grid border-b border-blue-100 bg-blue-50/60 lg:grid-cols-2">
            <button className={`grid gap-1 px-6 py-4 text-left ${step === "playbook" ? "bg-white" : ""}`} onClick={() => setStep("playbook")} type="button">
              <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">Step 1</span>
              <span className="flex items-center justify-between gap-3 text-lg font-extrabold text-ink">Train AI <Badge tone={playbookReady ? "good" : "warn"}>{playbookReady ? "Done" : "Needed"}</Badge></span>
            </button>
            <button className={`grid gap-1 px-6 py-4 text-left ${step === "extension" ? "bg-white" : ""}`} disabled={!playbookReady} onClick={() => setStep("extension")} type="button">
              <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">Step 2</span>
              <span className="flex items-center justify-between gap-3 text-lg font-extrabold text-ink">Connect extension <Badge tone={extensionConnected ? "good" : "warn"}>{extensionConnected ? "Connected" : "Needed"}</Badge></span>
            </button>
          </div>

          {step === "playbook" ? (
            <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">{currentQuestion.label}</span>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">{currentQuestion.question}</h2>
                <textarea
                  className="mt-5 min-h-44 w-full resize-y rounded-lg border border-blue-100 p-4 text-sm font-semibold leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write naturally. A rough answer is enough."
                  value={draft}
                />
                {error ? <p className="mt-3 text-sm font-extrabold text-rose-700">{error}</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button className="min-h-11 rounded-lg bg-accent px-5 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} onClick={() => void nextQuestion()} type="button">
                    {saving ? "Saving..." : questionIndex === questions.length - 1 ? "Finish AI training" : "Next question"}
                  </button>
                  <span className="text-sm font-semibold text-muted">Question {questionIndex + 1} of {questions.length}</span>
                </div>
              </div>
              <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-extrabold uppercase tracking-wide text-muted">AI training progress</span>
                <strong className="mt-2 block text-3xl font-extrabold text-ink">{playbookProgress}%</strong>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${playbookProgress}%` }} />
                </div>
                <div className="mt-4 grid gap-2">
                  {questions.map((question, index) => (
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted" key={question.key}>
                      <span>{question.label}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${answers[question.key].trim() || index === questionIndex && draft.trim() ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{answers[question.key].trim() || index === questionIndex && draft.trim() ? "OK" : "Open"}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          ) : (
            <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <h2 className="text-2xl font-extrabold text-ink">Install and connect the Chrome extension.</h2>
                <ol className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-muted">
                  <li className="rounded-lg border border-slate-200 bg-slate-50 p-4"><strong className="text-ink">1. Download</strong><br />Download and unzip the extension package.</li>
                  <li className="rounded-lg border border-slate-200 bg-slate-50 p-4"><strong className="text-ink">2. Load in Chrome</strong><br />Open <span className="font-mono">chrome://extensions</span>, enable Developer mode, then Load unpacked.</li>
                  <li className="rounded-lg border border-slate-200 bg-slate-50 p-4"><strong className="text-ink">3. Connect on Sales Navigator</strong><br />Paste the connection key in the extension, open Sales Navigator, and click Start.</li>
                </ol>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/reachlyst-extension.zip">Download extension</Button>
                  <button className="min-h-12 rounded-lg border border-blue-200 bg-white px-5 text-sm font-extrabold text-ink transition hover:border-blue-300 hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60" disabled={tokenLoading} onClick={() => void generateToken()} type="button">
                    {tokenLoading ? "Generating..." : access.activeToken ? "Refresh key" : "Generate connection key"}
                  </button>
                  <button className="min-h-12 rounded-lg border border-blue-200 bg-white px-5 text-sm font-extrabold text-ink transition hover:border-blue-300 hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60" disabled={checkingConnection} onClick={() => void refreshExtensionStatus(true)} type="button">
                    {checkingConnection ? "Checking..." : "Check connection"}
                  </button>
                </div>
              </div>
              <aside className="grid content-start gap-4 rounded-lg border border-blue-100 bg-blue-50/70 p-5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">Connection status</span>
                  <h3 className="mt-2 text-xl font-extrabold text-ink">{extensionConnected ? "Extension connected" : "Waiting for extension"}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{extensionConnected ? `Connected${access.boundDeviceLabel ? ` to ${access.boundDeviceLabel}` : ""}. You can enter the dashboard.` : "The wizard unlocks after the extension verifies the workspace key."}</p>
                </div>
                {access.activeToken ? (
                  <div className="grid gap-2">
                    <label className="text-xs font-extrabold uppercase tracking-wide text-muted">Connection key</label>
                    <input className="min-h-11 rounded-lg border border-blue-100 bg-white px-3 font-mono text-xs text-ink" readOnly value={access.activeToken} />
                    <button className="min-h-10 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong" onClick={() => void copyToken()} type="button">{copied ? "Copied" : "Copy key"}</button>
                  </div>
                ) : <p className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-extrabold leading-6 text-amber-800">Generate a connection key first.</p>}
                {connectionMessage ? <p className={`rounded-lg border p-3 text-sm font-extrabold leading-6 ${extensionConnected ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-amber-100 bg-amber-50 text-amber-800"}`}>{connectionMessage}</p> : null}
                {extensionConnected ? <button className="min-h-11 rounded-lg bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-700" onClick={() => window.location.reload()} type="button">Enter dashboard</button> : null}
                {error ? <p className="text-sm font-extrabold text-rose-700">{error}</p> : null}
              </aside>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
