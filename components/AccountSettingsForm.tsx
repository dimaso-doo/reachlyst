"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import styles from "@/app/app/lead.module.css";

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
      <section className={styles.settingsGrid}>
        <Card>
          <h2>Profile</h2>
          <div className={styles.formGrid}>
            <label>Full name<input onChange={(event) => update("fullName", event.target.value)} value={values.fullName} /></label>
            <label>Work email<input readOnly type="email" value={values.email} /></label>
            <label>Phone number<input onChange={(event) => update("phone", event.target.value)} placeholder="+381..." type="tel" value={values.phone} /></label>
            <label>Role<input onChange={(event) => update("role", event.target.value)} value={values.role} /></label>
            <label>Timezone<input onChange={(event) => update("timezone", event.target.value)} value={values.timezone} /></label>
          </div>
        </Card>

        <Card>
          <h2>Workspace</h2>
          <div className={styles.formGrid}>
            <label>Workspace name<input onChange={(event) => update("workspace", event.target.value)} value={values.workspace} /></label>
            <label>Company website<input onChange={(event) => update("website", event.target.value)} placeholder="https://example.com" value={values.website} /></label>
          </div>
        </Card>
      </section>

      <div className={styles.settingsActions}>
        <button onClick={save} type="button">Save changes</button>
        {saved ? <span>Saved</span> : null}
      </div>
    </>
  );
}
