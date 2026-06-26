"use client";

import { useState } from "react";
import { GoogleIcon } from "@/components/GoogleIcon";
import styles from "@/app/auth.module.css";

export function AuthMarketingConsent({ action }: { action: "Log in" | "Sign up" }) {
  const [consent, setConsent] = useState(false);
  const googleHref = consent ? "/api/auth/google?marketing_consent=1" : "/api/auth/google";

  return (
    <>
      <label className={styles.consentRow}>
        <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
        <span>I agree to receive Reachlyst product updates and promotional emails. I can unsubscribe anytime.</span>
      </label>
      <a className={styles.googleButton} href={googleHref}><GoogleIcon />{action} with Google</a>
    </>
  );
}
