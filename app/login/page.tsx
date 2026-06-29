import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";
import { AuthMarketingConsent } from "@/components/AuthMarketingConsent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Reachlyst outreach workspace.",
  robots: {
    index: false,
    follow: false
  }
};

const authErrors: Record<string, string> = {
  "supabase-auth-not-configured": "Supabase auth keys are missing in the app environment.",
  "google-oauth-not-configured": "Google OAuth is not enabled in Supabase, or the Google redirect URL is missing.",
  "auth-callback-failed": "Google did not return an auth code.",
  "auth-session-failed": "Supabase could not create a session from the Google callback."
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; demo?: string }> }) {
  const params = await searchParams;
  const error = params?.error ? authErrors[params.error] : null;
  const showDemo = params?.demo === "1" || process.env.SHOW_DEMO_LOGIN === "true";
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_76%_12%,rgba(22,119,255,.16)_0,transparent_32%),linear-gradient(180deg,#ffffff,#f5f7fb)] p-8"><Link className="fixed left-5 top-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-3 text-sm font-extrabold text-muted shadow-[0_10px_30px_rgba(15,23,42,.08)] backdrop-blur transition hover:border-blue-200 hover:bg-blue-50 hover:text-accent-strong" href="/"><span aria-hidden="true">&larr;</span>Back home</Link><Card className="w-full max-w-[480px] !border-slate-200 !bg-white p-9 !text-ink shadow-[0_30px_90px_rgba(15,23,42,.12)]"><div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_18px_48px_rgba(22,119,255,.22)]"><img className="h-9 w-9" alt="Reachlyst" src="/reachlyst-mark.svg" /></div><h1 className="text-4xl font-extrabold leading-none text-ink">Log in</h1><p className="mt-3 text-sm font-semibold leading-6 text-muted">Continue to your Sales Navigator outreach workspace.</p>{error ? <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-extrabold leading-6 text-rose-800">{error}</div> : null}<form className="my-5 grid gap-3"><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" placeholder="Email" defaultValue="" /><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" placeholder="Password" type="password" defaultValue="" /><Button href="/app/dashboard">Log in with email</Button></form><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-extrabold uppercase text-muted before:h-px before:bg-slate-200 before:content-[''] after:h-px after:bg-slate-200 after:content-['']"><span>or</span></div><AuthMarketingConsent action="Log in" />{showDemo ? <div className="my-5 grid gap-1.5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-ink"><strong>Private demos</strong><span className="font-mono text-sm text-muted">Workspace demo: demo@reachlyst.local</span><a className="my-1 inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 font-extrabold text-accent-strong transition hover:bg-blue-50" href="/api/demo-login?role=workspace_owner">Open workspace demo</a><span className="font-mono text-sm text-muted">Super admin demo: admin@reachlyst.local</span><a className="my-1 inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 font-extrabold text-accent-strong transition hover:bg-blue-50" href="/api/demo-login?role=super_admin">Open super admin demo</a></div> : null}<p className="mt-5 text-center text-sm font-semibold text-muted">No account? <Link className="font-extrabold text-accent-strong" href="/signup">Sign up</Link></p></Card></main>;
}
