"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";

export function AppSidebarNav() {
  const [ready, setReady] = useState(false);
  const [extensionReady, setExtensionReady] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    function syncStatus() {
      setReady(window.localStorage.getItem(PLAYBOOK_STATUS_KEY) === "ready");
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

    syncStatus();
    void syncExtensionStatus();
    void syncPlanUsage();
    window.addEventListener("storage", syncStatus);
    window.addEventListener("reachlyst:playbook-status", syncStatus);
    window.addEventListener("reachlyst:extension-status", syncExtensionStatus);
    window.addEventListener("reachlyst:plan-usage", syncPlanUsage);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener("reachlyst:playbook-status", syncStatus);
      window.removeEventListener("reachlyst:extension-status", syncExtensionStatus);
      window.removeEventListener("reachlyst:plan-usage", syncPlanUsage);
    };
  }, []);

  const navItem = "relative flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink";
  const readyBadge = "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold leading-none text-emerald-800";
  const untrainedBadge = "shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold leading-none text-amber-800";
  const percent = aiUsage?.limit ? Math.min(100, Math.round((aiUsage.used / aiUsage.limit) * 100)) : 0;

  return (
    <>
      <Link className="rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/app/dashboard">Dashboard</Link>
      <Link className={navItem} href="/app/ai-playbook">
        <span>AI Playbook</span>
        <small className={ready ? readyBadge : untrainedBadge} title={ready ? "AI Playbook is ready" : "AI Playbook is not trained yet"}>
          {ready ? "Ready" : "Not trained"}
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
