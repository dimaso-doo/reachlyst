"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import styles from "@/app/app/lead.module.css";

type AccessState = {
  isPaid: boolean;
  plan: string;
  status: string;
  tokenCount: number;
  lastTokenCreatedAt?: string;
  lastTokenUsedAt?: string;
};

export function ExtensionTokenPanel({ initialAccess }: { initialAccess: AccessState }) {
  const [access, setAccess] = useState(initialAccess);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generateToken() {
    setLoading(true);
    setError("");
    setCopied(false);

    const response = await fetch("/api/extension/token", { method: "POST" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message || data.error || "Token could not be generated.");
      setLoading(false);
      return;
    }

    setToken(data.token);
    setAccess(data.access);
    window.dispatchEvent(new Event("reachlyst:extension-status"));
    setLoading(false);
  }

  async function copyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Card className={styles.extensionAccess}>
      <div>
        <h2>Extension access</h2>
        <p>Use one workspace token for the Chrome extension. Generating a new token replaces the previous active token.</p>
      </div>

      <div className={styles.accessStatus}>
        <span data-active={access.isPaid ? "true" : "false"}>{access.isPaid ? "Active" : "Billing required"}</span>
        <small>{access.plan} plan · {access.status}</small>
        <small>{access.tokenCount > 0 ? "Workspace token configured" : "No workspace token yet"}</small>
      </div>

      {token ? (
        <div className={styles.tokenBox}>
          <label>Workspace token<input readOnly value={token} /></label>
          <button onClick={copyToken} type="button">{copied ? "Copied" : "Copy token"}</button>
          <small>Keep this token private. It is shown only once, so copy it into the extension now.</small>
        </div>
      ) : null}

      {error ? <p className={styles.tokenError}>{error}</p> : null}

      <div className={styles.tokenActions}>
        {access.isPaid ? (
          <button disabled={loading} onClick={generateToken} type="button">{loading ? "Generating..." : access.tokenCount > 0 ? "Generate new token" : "Generate workspace token"}</button>
        ) : (
          <Button href="/app/billing">Open billing</Button>
        )}
      </div>
    </Card>
  );
}
