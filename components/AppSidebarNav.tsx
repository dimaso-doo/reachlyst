"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";

export function AppSidebarNav() {
  const [ready, setReady] = useState(false);
  const [extensionReady, setExtensionReady] = useState(false);

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

    syncStatus();
    void syncExtensionStatus();
    window.addEventListener("storage", syncStatus);
    window.addEventListener("reachlyst:playbook-status", syncStatus);
    window.addEventListener("reachlyst:extension-status", syncExtensionStatus);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener("reachlyst:playbook-status", syncStatus);
      window.removeEventListener("reachlyst:extension-status", syncExtensionStatus);
    };
  }, []);

  const navItem = "relative flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white";
  const readyBadge = "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold leading-none text-emerald-800";
  const untrainedBadge = "shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold leading-none text-amber-800";

  return (
    <>
      <Link className="rounded-lg px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white" href="/app/dashboard">Dashboard</Link>
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
    </>
  );
}
