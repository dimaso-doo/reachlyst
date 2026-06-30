import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";
import { AuthMarketingConsent } from "@/components/AuthMarketingConsent";
import { plans } from "@/lib/stripe";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Reachlyst account for your manual outreach workflow.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignupPage({ searchParams }: { searchParams?: Promise<{ plan?: string; checkout?: string }> }) {
  const params = await searchParams;
  const selectedPlan = plans.find((plan) => plan.key === params?.plan) ?? plans.find((plan) => plan.key === "free") ?? plans[0];
  const isPaid = selectedPlan.key !== "free";
  const paymentComplete = params?.checkout === "success";
  const formAction = isPaid && !paymentComplete ? "/api/stripe/checkout" : "/app/dashboard";
  const formMethod = isPaid && !paymentComplete ? "post" : "get";
  const cta = paymentComplete ? "Create account and open workspace" : isPaid ? "Continue to payment" : "Create free workspace";

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_76%_12%,rgba(22,119,255,.16)_0,transparent_32%),linear-gradient(180deg,#ffffff,#f5f7fb)] p-8"><Link className="fixed left-5 top-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-3 text-sm font-extrabold text-muted shadow-[0_10px_30px_rgba(15,23,42,.08)] backdrop-blur transition hover:border-blue-200 hover:bg-blue-50 hover:text-accent-strong" href="/"><span aria-hidden="true">&larr;</span>Back home</Link><Card className="w-full max-w-[500px] !border-slate-200 !bg-white p-9 !text-ink shadow-[0_30px_90px_rgba(15,23,42,.12)]"><div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_18px_48px_rgba(22,119,255,.22)]"><img className="h-9 w-9" alt="Reachlyst" src="/reachlyst-mark.svg" /></div><h1 className="text-4xl font-extrabold leading-none text-ink">Create account</h1><p className="mt-3 text-sm font-semibold leading-6 text-muted">Start your Reachlyst workspace with the selected package.</p><div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4"><span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">Selected package</span><div className="mt-2 flex items-end justify-between gap-3"><strong className="text-xl font-extrabold text-ink">{selectedPlan.name}</strong><span className="text-sm font-extrabold text-muted">{selectedPlan.price}/mo</span></div><p className="mt-2 text-sm font-semibold leading-6 text-muted">{selectedPlan.summary}</p><Link className="mt-3 inline-flex text-sm font-extrabold text-accent-strong" href="/pricing">Change package</Link></div>{params?.checkout === "cancelled" ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-extrabold leading-6 text-amber-800">Checkout was cancelled. You can continue with the same package or choose another one.</div> : null}{paymentComplete ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-extrabold leading-6 text-emerald-800">Payment received. Finish account setup to open your workspace.</div> : null}<form action={formAction} className="my-5 grid gap-3" method={formMethod}><input name="plan" type="hidden" value={selectedPlan.key} /><input name="origin" type="hidden" value="signup" /><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" name="email" placeholder="Work email" type="email" /><input className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-ink outline-none placeholder:text-slate-400" name="password" placeholder="Password" type="password" /><Button type="submit">{cta}</Button></form><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-extrabold uppercase text-muted before:h-px before:bg-slate-200 before:content-[''] after:h-px after:bg-slate-200 after:content-['']"><span>or</span></div><AuthMarketingConsent action="Sign up" /><p className="mt-5 text-center text-sm font-semibold text-muted">Already have an account? <Link className="font-extrabold text-accent-strong" href="/login">Log in</Link></p></Card></main>;
}
