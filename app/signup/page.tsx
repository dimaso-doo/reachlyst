import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";
import { AuthMarketingConsent } from "@/components/AuthMarketingConsent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Reachlyst account for your manual outreach workflow.",
  robots: {
    index: false,
    follow: false
  }
};

export default function SignupPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_76%_12%,rgba(22,119,255,.16)_0,transparent_32%),linear-gradient(180deg,#ffffff,#f5f7fb)] p-8"><Link className="fixed left-5 top-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-3 text-sm font-extrabold text-muted shadow-[0_10px_30px_rgba(15,23,42,.08)] backdrop-blur transition hover:border-blue-200 hover:bg-blue-50 hover:text-accent-strong" href="/"><span aria-hidden="true">&larr;</span>Back home</Link><Card className="w-full max-w-[480px] !border-slate-200 !bg-white p-9 !text-ink shadow-[0_30px_90px_rgba(15,23,42,.12)]"><div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_18px_48px_rgba(22,119,255,.22)]"><img className="h-9 w-9" alt="Reachlyst" src="/reachlyst-mark.svg" /></div><h1 className="text-4xl font-extrabold leading-none text-ink">Create account</h1><p className="mt-3 text-sm font-semibold leading-6 text-muted">Start a read-only outreach logbook for Sales Navigator.</p><form className="my-5 grid gap-3"><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" placeholder="Work email" /><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" placeholder="Password" type="password" /><Button href="/app/dashboard">Create account with email</Button></form><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-extrabold uppercase text-muted before:h-px before:bg-slate-200 before:content-[''] after:h-px after:bg-slate-200 after:content-['']"><span>or</span></div><AuthMarketingConsent action="Sign up" /><p className="mt-5 text-center text-sm font-semibold text-muted">Already have an account? <Link className="font-extrabold text-accent-strong" href="/login">Log in</Link></p></Card></main>;
}
