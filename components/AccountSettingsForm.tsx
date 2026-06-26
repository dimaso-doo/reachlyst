"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import styles from "@/app/app/lead.module.css";

const defaults = {
  fullName: "Predrag",
  email: "user@example.com",
  role: "Workspace owner",
  timezone: "Europe/Belgrade",
  workspace: "Reachlyst Demo Workspace",
  website: "",
  offer: "",
  audience: "",
  tone: "Professional, concise, human",
  exclusions: "Students, freelancers, unrelated industries, enterprise profiles when the search is SMB.",
  rules: "Use only visible title, company, location, and about text. Do not invent context."
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
      <section className={styles.settingsGrid}>
        <Card>
          <h2>Profile</h2>
          <div className={styles.formGrid}>
            <label>Full name<input onChange={(event) => update("fullName", event.target.value)} value={values.fullName} /></label>
            <label>Work email<input onChange={(event) => update("email", event.target.value)} type="email" value={values.email} /></label>
            <label>Role<input onChange={(event) => update("role", event.target.value)} value={values.role} /></label>
            <label>Timezone<input onChange={(event) => update("timezone", event.target.value)} value={values.timezone} /></label>
          </div>
        </Card>

        <Card>
          <h2>Workspace</h2>
          <div className={styles.formGrid}>
            <label>Workspace name<input onChange={(event) => update("workspace", event.target.value)} value={values.workspace} /></label>
            <label>Company website<input onChange={(event) => update("website", event.target.value)} placeholder="https://example.com" value={values.website} /></label>
            <label>Default offer<input onChange={(event) => update("offer", event.target.value)} placeholder="What are you selling?" value={values.offer} /></label>
            <label>Default audience<input onChange={(event) => update("audience", event.target.value)} placeholder="Who should Reachlyst score as a fit?" value={values.audience} /></label>
          </div>
        </Card>

        <Card>
          <h2>Outreach defaults</h2>
          <div className={styles.formGrid}>
            <label>Message tone<input onChange={(event) => update("tone", event.target.value)} value={values.tone} /></label>
            <label>Bad-fit exclusions<textarea onChange={(event) => update("exclusions", event.target.value)} value={values.exclusions} /></label>
            <label>Personalization rules<textarea onChange={(event) => update("rules", event.target.value)} value={values.rules} /></label>
          </div>
        </Card>

        <Card>
          <h2>Extension</h2>
          <p>Chrome extension access is controlled by your billing status and extension token.</p>
          <p>Generate or copy your token from Dashboard or Chrome Extension.</p>
        </Card>
      </section>

      <div className={styles.settingsActions}>
        <button onClick={save} type="button">Save changes</button>
        {saved ? <span>Saved</span> : null}
      </div>
    </>
  );
}
