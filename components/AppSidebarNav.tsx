"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";
const PLAYBOOK_NOTES_KEY = "reachlyst_ai_playbook_notes";

export function AppSidebarNav() {
  const [ready, setReady] = useState<"checking" | "ready" | "not_trained">("checking");
  const [extensionReady, setExtensionReady] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    async function syncStatus() {
      try {
        const response = await fetch("/api/ai-playbook", { cache: "no-store" });
        const data = await response.json();
        const playbookReady = data?.playbook?.status === "ready" && Boolean(String(data?.playbook?.rawNotes ?? "").trim());
        setReady(playbookReady ? "ready" : "not_trained");
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, playbookReady ? "ready" : "not_trained");
        if (!playbookReady) window.localStorage.removeItem(PLAYBOOK_NOTES_KEY);
      } catch {
        setReady("not_trained");
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, "not_trained");
        window.localStorage.removeItem(PLAYBOOK_NOTES_KEY);
      }
    }

    async function syncExtensionStatus() {
      try {
        const response = await fetch("/api/extension/token", { cache: "no-store" });
        const data = await response.json();
        setExtensionReady(Boolean(data?.isPaid && data?.tokenCount > 0));
      } catch {
        setExtensionReady(false);
      }
    }

    async function syncPlanUsage() {
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

    const syncStatusHandler = () => void syncStatus();
    const syncStatusOnVisible = () => {
      if (document.visibilityState === "visible") void syncStatus();
    };
    void syncStatus();
    void syncExtensionStatus();
    void syncPlanUsage();
    window.addEventListener("storage", syncStatusHandler);
    window.addEventListener("reachlyst:playbook-status", syncStatusHandler);
    window.addEventListener("focus", syncStatusHandler);
    document.addEventListener("visibilitychange", syncStatusOnVisible);
    window.addEventListener("reachlyst:extension-status", syncExtensionStatus);
    window.addEventListener("reachlyst:plan-usage", syncPlanUsage);
    return () => {
      window.removeEventListener("storage", syncStatusHandler);
      window.removeEventListener("reachlyst:playbook-status", syncStatusHandler);
      window.removeEventListener("focus", syncStatusHandler);
      document.removeEventListener("visibilitychange", syncStatusOnVisible);
      window.removeEventListener("reachlyst:extension-status", syncExtensionStatus);
      window.removeEventListener("reachlyst:plan-usage", syncPlanUsage);
    };
  }, []);

  const navItem = "relative flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink";
  const readyBadge = "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold leading-none text-emerald-800";
  const untrainedBadge = "shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold leading-none text-amber-800";
  const checkingBadge = "shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold leading-none text-slate-500";
  const percent = aiUsage?.limit ? Math.min(100, Math.round((aiUsage.used / aiUsage.limit) * 100)) : 0;
  const playbookIsReady = ready === "ready";

  return (
    <>
      <Link className="rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/app/dashboard">Dashboard</Link>
      <Link className={navItem} href="/app/ai-playbook">
        <span>AI Playbook</span>
        <small className={ready === "checking" ? checkingBadge : playbookIsReady ? readyBadge : untrainedBadge} title={playbookIsReady ? "AI Playbook is ready" : "AI Playbook is not trained yet"}>
          {ready === "checking" ? "Checking" : playbookIsReady ? "Ready" : "Not trained"}
        </small>
      </Link>
      <Link className={navItem} href="/app/extension">
        <span>Extension Setup</span>
        <small className={extensionReady ? readyBadge : untrainedBadge} title={extensionReady ? "Extension token is ready" : "Extension setup is not ready yet"}>
          {extensionReady ? "Ready" : "Not ready"}
        </small>
      </Link>
      <Link className={navItem} href="/app/billing">
        <span>Billing</span>
        <small className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-extrabold leading-none text-accent-strong">Plan</small>
      </Link>
      {aiUsage ? <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted">AI messages</span>
          <strong className="text-[11px] font-extrabold text-ink">{aiUsage.used.toLocaleString("en-US")} / {aiUsage.limit.toLocaleString("en-US")}</strong>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div> : null}
    </>
  );
}
