"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/app/app.module.css";

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

  return (
    <>
      <Link href="/app/dashboard">Dashboard</Link>
      <Link className={styles.playbookNavItem} href="/app/ai-playbook">
        <span>AI Playbook</span>
        <small className={ready ? styles.readyBadge : styles.untrainedBadge} title={ready ? "AI Playbook is ready" : "AI Playbook is not trained yet"}>
          {ready ? "Ready" : "Not trained"}
        </small>
      </Link>
      <Link className={styles.playbookNavItem} href="/app/extension">
        <span>Extension Setup</span>
        <small className={extensionReady ? styles.readyBadge : styles.untrainedBadge} title={extensionReady ? "Extension token is ready" : "Extension setup is not ready yet"}>
          {extensionReady ? "Ready" : "Not ready"}
        </small>
      </Link>
      <Link className={styles.billingNavItem} href="/app/billing">
        <span>Billing</span>
        <small>Plan</small>
      </Link>
    </>
  );
}
