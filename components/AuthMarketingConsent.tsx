"use client";

import { useState } from "react";
import { GoogleIcon } from "@/components/GoogleIcon";

export function AuthMarketingConsent({ action }: { action: "Log in" | "Sign up" }) {
  const [consent, setConsent] = useState(false);
  const googleHref = consent ? "/api/auth/google?marketing_consent=1" : "/api/auth/google";

  return (
    <>
      <label className="mt-5 grid cursor-pointer grid-cols-[auto_1fr] items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-normal leading-5 text-muted">
        <input className="mt-0.5 h-4 w-4 accent-blue-500" checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
        <span>I agree to receive Reachlyst product updates and promotional emails. I can unsubscribe anytime.</span>
      </label>
      <a className="mt-2.5 flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg border border-blue-200 bg-white font-normal text-slate-900 no-underline transition hover:border-blue-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_12px_28px_rgba(22,119,255,.16)]" href={googleHref}><GoogleIcon />{action} with Google</a>
    </>
  );
}
