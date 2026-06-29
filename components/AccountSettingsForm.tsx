"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

const defaults = {
  fullName: "Predrag",
  email: "predrag@example.com",
  phone: "",
  role: "Workspace owner",
  timezone: "Europe/Belgrade",
  workspace: "Reachlyst Demo Workspace",
  website: ""
};

export function AccountSettingsForm() {
  const [values, setValues] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("reachlyst.accountSettings");
      if (stored) setValues({ ...defaults, ...JSON.parse(stored) });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update(key: keyof typeof defaults, value: string) {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save() {
    window.localStorage.setItem("reachlyst.accountSettings", JSON.stringify(values));
    setSaved(true);
  }

  return (
    <>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-extrabold text-ink">Profile</h2>
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Full name<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("fullName", event.target.value)} value={values.fullName} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Work email<input className="min-h-11 cursor-default rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold normal-case text-muted" readOnly type="email" value={values.email} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Phone number<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("phone", event.target.value)} placeholder="+381..." type="tel" value={values.phone} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Role<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("role", event.target.value)} value={values.role} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Timezone<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("timezone", event.target.value)} value={values.timezone} /></label>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-extrabold text-ink">Workspace</h2>
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Workspace name<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("workspace", event.target.value)} value={values.workspace} /></label>
            <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">Company website<input className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold normal-case text-ink" onChange={(event) => update("website", event.target.value)} placeholder="https://example.com" value={values.website} /></label>
          </div>
        </Card>
      </section>

      <div className="mt-4 flex items-center gap-3">
        <button className="min-h-11 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition hover:bg-accent-strong" onClick={save} type="button">Save changes</button>
        {saved ? <span className="text-sm font-extrabold text-emerald-700">Saved</span> : null}
      </div>
    </>
  );
}
