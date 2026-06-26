"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import styles from "@/app/app/dashboard.module.css";

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
    <Card className={styles.statusCard}>
      <h2>Workspace readiness</h2>
      <div className={styles.statusItem}>
        <span data-ready={playbookReady ? "true" : "false"} />
        <div>
          <strong>AI Playbook</strong>
          <small>{playbookReady ? "Ready. You can refine it anytime." : "Train it so the extension knows your offer, ICP, tone, and message style."}</small>
        </div>
      </div>
      <div className={styles.statusItem}>
        <span data-ready={extensionReady ? "true" : "false"} />
        <div>
          <strong>Extension Setup</strong>
          <small>{tokenCount > 0 ? "Workspace token configured." : "Generate a workspace token and paste it into the Chrome extension."}</small>
        </div>
      </div>
      <Button href="/app/ai-playbook" variant="secondary">Train AI Playbook</Button>
    </Card>
  );
}
