"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

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
    <Card className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div>
        <h2 className="text-lg font-extrabold text-ink">Extension access</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Use one private connection key for this workspace. The first browser that verifies it becomes the connected extension device.</p>
      </div>

      <div className="grid min-w-48 gap-1.5 lg:justify-items-end">
        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${access.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{access.isPaid ? "Extension active" : "Access unavailable"}</span>
        <small className="text-xs font-bold text-muted">{access.plan} plan · {access.status}</small>
        <small className="text-xs font-bold text-muted">Private extension connection</small>
        <small className="text-xs font-bold text-muted">{token ? "Connection key configured" : "No connection key yet"}</small>
      </div>

      {token ? (
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
          <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Connection key<input className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm normal-case text-ink" readOnly value={token} /></label>
          <div className="flex flex-wrap items-center gap-2">
            <button className="min-h-10 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60" onClick={copyToken} type="button">{copied ? "Copied" : "Copy"}</button>
            <button className="min-h-10 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={revoking} onClick={revokeToken} type="button">{revoking ? "Revoking..." : "Revoke"}</button>
          </div>
          <small className="text-sm font-semibold leading-6 text-muted">{access.boundDeviceLabel ? `Connected to ${access.boundDeviceLabel}${access.boundAt ? ` since ${new Date(access.boundAt).toLocaleDateString()}` : ""}.` : "No browser is connected yet. The first verified extension will lock this key to that browser."}</small>
          <small className="text-sm font-semibold leading-6 text-muted">This key controls the connected Chrome extension device.</small>
        </div>
      ) : null}

      {error ? <p className="font-extrabold text-rose-700 lg:col-span-2">{error}</p> : null}

      <div className="flex items-center lg:col-span-2">
        {access.isPaid && !token ? (
          <button className="min-h-11 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={generateToken} type="button">{loading ? "Generating..." : access.tokenCount > 0 ? "Regenerate connection key" : "Generate connection key"}</button>
        ) : !access.isPaid ? (
          <Button href="/app/billing">View packages</Button>
        ) : (
          <small className="text-sm font-bold text-muted">Copy this key into the Chrome extension, or revoke it when you need to connect a different browser.</small>
        )}
      </div>
    </Card>
  );
}
