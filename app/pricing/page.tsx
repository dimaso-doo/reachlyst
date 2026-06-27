/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { formatLimit } from "@/lib/planLimits";
import { plans } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <main className="pageShell min-w-0 bg-[#050a18]">
      <MarketingNav />
      <section className="bg-[radial-gradient(circle_at_78%_8%,rgba(22,119,255,.26)_0,transparent_32%),#050a18] py-20 text-white sm:pb-14 sm:pt-28">
        <div className="container">
          <span className="inline-flex text-xs font-black uppercase tracking-[.08em] text-blue-300">Pricing</span>
          <h1 className="my-5 max-w-[760px] text-5xl font-extrabold leading-none sm:text-7xl">Simple pricing for LinkedIn lead workflows.</h1>
          <p className="max-w-[620px] text-xl font-semibold leading-8 text-white/70">Start with the dashboard. Upgrade to activate the Chrome extension, AI invite chat, and usage-based outreach logging.</p>
        </div>
      </section>
      <section className="min-w-0 border-y border-white/10 bg-[#08111f] py-20 text-white sm:py-24">
        <div className="container">
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => <Card className={`!border-white/10 !bg-white/5 p-5 !text-white ${plan.key === "growth" ? "-translate-y-2 !border-blue-300/60 shadow-[0_24px_80px_rgba(22,119,255,.18)]" : ""}`} key={plan.key}>
              <h3 className="text-xl font-extrabold">{plan.name}</h3>
              <strong className="my-4 block text-4xl font-extrabold">{plan.price}<span className="ml-1 text-sm text-white/55">/mo</span></strong>
              <p className="min-h-[52px] font-bold leading-6 text-white/80">{plan.summary}</p>
              <div className="my-5 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="flex items-center justify-between gap-4 py-2 font-semibold leading-6 text-white/65"><b className="text-white">{formatLimit(plan.limits.searches)}</b> active search workflows</p>
                <p className="flex items-center justify-between gap-4 border-t border-white/10 py-2 font-semibold leading-6 text-white/65"><b className="text-white">{formatLimit(plan.limits.leads)}</b> lead scans/mo</p>
                <p className="flex items-center justify-between gap-4 border-t border-white/10 py-2 font-semibold leading-6 text-white/65"><b className="text-white">{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI replies/mo</p>
                <p className="flex items-center justify-between gap-4 border-t border-white/10 py-2 font-semibold leading-6 text-white/65"><b className="text-white">{formatLimit(plan.limits.seats)}</b> workspace user{plan.limits.seats > 1 ? "s" : ""}</p>
              </div>
              <div className="grid gap-2">
                {plan.features.map((feature) => <p className="m-0 font-semibold leading-6 text-white/65" key={feature}>✓ {feature}</p>)}
              </div>
              <form className="mt-5" action="/api/stripe/checkout" method="post">
                <input name="plan" type="hidden" value={plan.key} />
                <Button type="submit" variant={plan.key === "growth" ? "primary" : "secondary"}>{plan.cta}</Button>
              </form>
            </Card>)}
          </div>
          <Card className="mt-5 !border-white/10 !bg-white/5 p-7 !text-white">
            <span className="inline-flex text-xs font-black uppercase tracking-[.08em] text-blue-300">Add-ons</span>
            <h2 className="my-3 text-3xl font-extrabold">Buy more only when volume grows.</h2>
            <p className="max-w-[780px] font-semibold leading-7 text-white/65">Growth includes enough capacity for a real Sales Navigator workflow. When you need more, add lead scan packs, AI reply packs, or workspace users without changing the whole account.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="rounded-full border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm font-extrabold">Extra lead packs</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm font-extrabold">Extra AI replies</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm font-extrabold">Additional users</span>
            </div>
          </Card>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}

function MarketingNav() {
  return <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#050a18]"><div className="container flex min-h-[72px] flex-col items-start gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0"><Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-extrabold text-white/70"><Link className="transition hover:scale-[1.025] hover:text-white" href="/features">Features</Link><Link className="transition hover:scale-[1.025] hover:text-white" href="/pricing">Pricing</Link><Link className="transition hover:scale-[1.025] hover:text-white" href="/login">Login</Link><Button href="/signup">Sign up</Button></div></div></nav>;
}

function MarketingFooter() {
  return <footer className="border-t border-white/10 bg-[#050a18] py-8 text-white/70"><div className="container flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between"><Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold"><Link className="hover:text-white" href="/pricing">Pricing</Link><Link className="hover:text-white" href="/features">Features</Link><Link className="hover:text-white" href="/privacy">Privacy Policy</Link><Link className="hover:text-white" href="/terms">Terms</Link><Link className="hover:text-white" href="/blog">Blog</Link></nav></div></footer>;
}
