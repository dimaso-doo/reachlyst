"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";
const PLAYBOOK_NOTES_KEY = "reachlyst_ai_playbook_notes";

export function DashboardReadiness({ extensionReady, tokenCount }: { extensionReady: boolean; tokenCount: number }) {
  const [playbookReady, setPlaybookReady] = useState(false);

  useEffect(() => {
    async function syncStatus() {
      try {
        const response = await fetch("/api/ai-playbook", { cache: "no-store" });
        const data = await response.json();
        const ready = data?.playbook?.status === "ready" && Boolean(String(data?.playbook?.rawNotes ?? "").trim());
        setPlaybookReady(ready);
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, ready ? "ready" : "not_trained");
        if (!ready) window.localStorage.removeItem(PLAYBOOK_NOTES_KEY);
      } catch {
        setPlaybookReady(false);
        window.localStorage.setItem(PLAYBOOK_STATUS_KEY, "not_trained");
        window.localStorage.removeItem(PLAYBOOK_NOTES_KEY);
      }
    }

    const syncStatusHandler = () => void syncStatus();
    void syncStatus();
    window.addEventListener("storage", syncStatusHandler);
    window.addEventListener("reachlyst:playbook-status", syncStatusHandler);
    return () => {
      window.removeEventListener("storage", syncStatusHandler);
      window.removeEventListener("reachlyst:playbook-status", syncStatusHandler);
    };
  }, []);

  return (
    <Card className="grid gap-4 p-6">
      <h2 className="text-lg font-extrabold text-ink">Workspace readiness</h2>
      <div className="grid grid-cols-[14px_minmax(0,1fr)] gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${playbookReady ? "bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.14)]" : "bg-amber-500 shadow-[0_0_0_6px_rgba(245,158,11,0.16)]"}`} />
        <div>
          <strong className="block text-sm font-extrabold text-ink">AI Playbook</strong>
          <small className="mt-1 block text-sm font-semibold leading-6 text-muted">{playbookReady ? "Ready. You can refine it anytime." : "Train it so the extension knows your offer, ICP, tone, and message style."}</small>
        </div>
      </div>
      <div className="grid grid-cols-[14px_minmax(0,1fr)] gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${extensionReady ? "bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.14)]" : "bg-amber-500 shadow-[0_0_0_6px_rgba(245,158,11,0.16)]"}`} />
        <div>
          <strong className="block text-sm font-extrabold text-ink">Extension Setup</strong>
          <small className="mt-1 block text-sm font-semibold leading-6 text-muted">{extensionReady ? "Extension connected to this workspace." : tokenCount > 0 ? "Connection key generated. Verify it inside the Chrome extension." : "Generate a connection key and paste it into the Chrome extension."}</small>
        </div>
      </div>
      <Button href="/app/ai-playbook" variant="secondary">Train AI Playbook</Button>
    </Card>
  );
}
