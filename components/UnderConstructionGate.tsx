"use client";

import { useState } from "react";

export function UnderConstructionGate({ nextPath = "/" }: { nextPath?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loginState, setLoginState] = useState<"idle" | "loading" | "error">("idle");
  const [subscribeState, setSubscribeState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function unlock() {
    if (!username.trim() || !password) return;
    setLoginState("loading");
    const response = await fetch("/api/construction/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      setLoginState("error");
      return;
    }
    window.location.href = nextPath || "/";
  }

  async function subscribe() {
    if (!email.trim()) return;
    setSubscribeState("loading");
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source: "under_construction" })
    });
    setSubscribeState(response.ok ? "done" : "error");
    if (response.ok) setEmail("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f8fc] text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(22,119,255,.18),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(9,88,217,.15),transparent_28%),linear-gradient(180deg,#ffffff,#eef4ff)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[.18] [background-image:linear-gradient(rgba(22,119,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(22,119,255,.18)_1px,transparent_1px)] [background-size:42px_42px]" />
      <section className="relative mx-auto grid min-h-screen w-[min(1180px,calc(100%-32px))] items-center gap-10 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-blue-100 bg-white/80 px-4 py-2 shadow-[0_14px_40px_rgba(15,23,42,.08)] backdrop-blur">
            <img className="h-8 w-8" alt="Reachlyst" src="/reachlyst-mark.svg" />
            <span className="text-sm font-semibold text-accent-strong">Reachlyst</span>
          </div>
          <h1 className="text-5xl font-semibold leading-[.96] tracking-normal text-ink sm:text-6xl lg:text-7xl">We are polishing Reachlyst.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            The public launch page is temporarily closed while we finish the next version of the Sales Navigator AI workspace.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["AI lead context", "Manual outreach", "Sales Navigator workflow"].map((item) => (
              <div className="rounded-lg border border-white bg-white/72 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_14px_36px_rgba(15,23,42,.06)]" key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <section className="rounded-lg border border-blue-100 bg-white/88 p-6 shadow-[0_26px_80px_rgba(15,23,42,.12)] backdrop-blur">
            <span className="text-xs font-semibold uppercase tracking-[.1em] text-accent-strong">Private access</span>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Enter workspace preview</h2>
            <div className="mt-5 grid gap-3">
              <input
                className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void unlock();
                }}
                placeholder="Username"
                value={username}
              />
              <input
                className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void unlock();
                }}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button
                className="min-h-12 rounded-lg bg-accent px-5 text-base font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loginState === "loading" || !username.trim() || !password}
                onClick={() => void unlock()}
                type="button"
              >
                {loginState === "loading" ? "Opening..." : "Unlock Reachlyst"}
              </button>
              {loginState === "error" ? <p className="m-0 text-sm font-semibold text-rose-700">Username or password is not correct.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white/78 p-6 shadow-[0_18px_58px_rgba(15,23,42,.08)] backdrop-blur">
            <span className="text-xs font-semibold uppercase tracking-[.1em] text-muted">Launch updates</span>
            <h2 className="mt-3 text-xl font-semibold text-ink">Subscribe for news</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="min-h-12 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void subscribe();
                }}
                placeholder="you@company.com"
                type="email"
                value={email}
              />
              <button
                className="min-h-12 rounded-lg border border-blue-200 bg-white px-5 text-base font-semibold text-accent-strong transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={subscribeState === "loading" || !email.trim()}
                onClick={() => void subscribe()}
                type="button"
              >
                {subscribeState === "loading" ? "Saving..." : "Subscribe"}
              </button>
            </div>
            {subscribeState === "done" ? <p className="mt-3 text-sm font-semibold text-emerald-700">You are on the list. We will send launch updates.</p> : null}
            {subscribeState === "error" ? <p className="mt-3 text-sm font-semibold text-rose-700">Could not save that email. Please try again.</p> : null}
          </section>
        </div>
      </section>
    </main>
  );
}
