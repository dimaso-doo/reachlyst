"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import styles from "@/app/app/lead.module.css";

type AccessState = {
  isPaid: boolean;
  plan: string;
  status: string;
  tokenCount: number;
  seatLimit: number;
  activeToken?: string;
  boundDeviceLabel?: string;
  boundAt?: string;
  lastTokenCreatedAt?: string;
  lastTokenUsedAt?: string;
};

export function ExtensionTokenPanel({ initialAccess }: { initialAccess: AccessState }) {
  const [access, setAccess] = useState(initialAccess);
  const [token, setToken] = useState(initialAccess.activeToken ?? "");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
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

  async function revokeToken() {
    setRevoking(true);
    setError("");
    setCopied(false);

    const response = await fetch("/api/extension/token", { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message || data.error || "Token could not be revoked.");
      setRevoking(false);
      return;
    }

    setToken("");
    setAccess(data.access);
    window.dispatchEvent(new Event("reachlyst:extension-status"));
    setRevoking(false);
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
        <p>Use one private connection key for this workspace. The first browser that verifies it becomes the connected extension device.</p>
      </div>

      <div className={styles.accessStatus}>
        <span data-active={access.isPaid ? "true" : "false"}>{access.isPaid ? "Active" : "Billing required"}</span>
        <small>{access.plan} plan · {access.status}</small>
        <small>{access.seatLimit} workspace {access.seatLimit === 1 ? "seat" : "seats"} included</small>
        <small>{token ? "Connection key configured" : "No connection key yet"}</small>
      </div>

      {token ? (
        <div className={styles.tokenBox}>
          <label>Connection key<input readOnly value={token} /></label>
          <div className={styles.tokenButtonRow}>
            <button onClick={copyToken} type="button">{copied ? "Copied" : "Copy"}</button>
            <button data-variant="danger" disabled={revoking} onClick={revokeToken} type="button">{revoking ? "Revoking..." : "Revoke"}</button>
          </div>
          <small>{access.boundDeviceLabel ? `Connected to ${access.boundDeviceLabel}${access.boundAt ? ` since ${new Date(access.boundAt).toLocaleDateString()}` : ""}.` : "No browser is connected yet. The first verified extension will lock this key to that browser."}</small>
          <small>Seats control workspace users. This key controls the connected Chrome extension device.</small>
        </div>
      ) : null}

      {error ? <p className={styles.tokenError}>{error}</p> : null}

      <div className={styles.tokenActions}>
        {access.isPaid && !token ? (
          <button disabled={loading} onClick={generateToken} type="button">{loading ? "Generating..." : access.tokenCount > 0 ? "Regenerate connection key" : "Generate connection key"}</button>
        ) : !access.isPaid ? (
          <Button href="/app/billing">Open billing</Button>
        ) : (
          <small className={styles.tokenHint}>Copy this key into the Chrome extension, or revoke it when you need to connect a different browser.</small>
        )}
      </div>
    </Card>
  );
}
