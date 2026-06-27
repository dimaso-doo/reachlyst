"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

const PLAYBOOK_STATUS_KEY = "reachlyst_ai_playbook_status";

export function DashboardReadiness({ extensionReady, tokenCount }: { extensionReady: boolean; tokenCount: number }) {
  const [playbookReady, setPlaybookReady] = useState(false);

  useEffect(() => {
    function syncStatus() {
      setPlaybookReady(window.localStorage.getItem(PLAYBOOK_STATUS_KEY) === "ready");
    }

    syncStatus();
    window.addEventListener("storage", syncStatus);
    window.addEventListener("reachlyst:playbook-status", syncStatus);
    return () => {
      window.removeEventListener("storage", syncStatus);
      window.removeEventListener("reachlyst:playbook-status", syncStatus);
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
          <small className="mt-1 block text-sm font-semibold leading-6 text-muted">{tokenCount > 0 ? "Workspace token configured." : "Generate a workspace token and paste it into the Chrome extension."}</small>
        </div>
      </div>
      <Button href="/app/ai-playbook" variant="secondary">Train AI Playbook</Button>
    </Card>
  );
}
