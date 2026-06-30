import type { Metadata } from "next";

import { MarketingFooter, MarketingNav } from "@/components/MarketingChrome";
import { Button, Card } from "@/components/ui";
import { formatLimit } from "@/lib/planLimits";
import { plans } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a Reachlyst package for AI-assisted Sales Navigator outreach workflows, with plans based on monthly AI message usage.",
  alternates: {
    canonical: "/pricing"
  },
  openGraph: {
    title: "Reachlyst Pricing",
    description: "Simple pricing for manual-first Sales Navigator lead workflows and AI message drafting.",
    url: "/pricing"
  }
};

export default function PricingPage() {
  return (
    <main className="pageShell min-w-0 bg-[#f5f7fb] text-ink">
      <MarketingNav />
      <section className="bg-[radial-gradient(circle_at_78%_8%,rgba(22,119,255,.16)_0,transparent_32%),linear-gradient(180deg,#f8fbff,#eef4ff)] py-20 sm:pb-14 sm:pt-28">
        <div className="container">
          <span className="inline-flex text-xs uppercase tracking-[.08em] text-accent-strong">Pricing</span>
          <h1 className="my-5 max-w-[760px] text-5xl leading-[.98] sm:text-7xl">Simple pricing for LinkedIn lead workflows.</h1>
          <p className="max-w-[680px] text-xl leading-8 text-muted">Every package includes the extension and the full manual-first workflow. Choose by monthly AI message capacity, then add more volume when your outreach grows.</p>
        </div>
      </section>
      <section className="min-w-0 bg-white py-20 sm:py-24">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => <Card className={`grid h-full grid-rows-[auto_auto_auto_auto_1fr_auto_auto] gap-5 p-5 ${plan.key === "growth" ? "-translate-y-2 border-blue-200 shadow-[0_24px_80px_rgba(22,119,255,.14)]" : ""}`} key={plan.key}>
              <h3 className="min-h-7 text-xl">{plan.name}</h3>
              <strong className="block text-4xl">{plan.price}<span className="ml-1 text-sm text-muted">/mo</span></strong>
              <p className="min-h-[72px] leading-6 text-muted">{plan.summary}</p>
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                <span className="block text-xs uppercase tracking-[.08em] text-accent-strong">AI messages this month</span>
                <strong className="mt-1 block text-3xl text-ink">0 / {formatLimit(plan.limits.monthlyAiSuggestions)}</strong>
                <div className="grid gap-1 border-t border-blue-100 py-2 leading-6 text-muted"><b className="text-ink">Unlimited</b><span>Sales Navigator context</span></div>
              </div>
              <div className="grid content-start gap-2">
                {plan.features.map((feature) => <p className="m-0 leading-6 text-muted" key={feature}>✓ {feature}</p>)}
              </div>
              <form action="/signup" method="get">
                <input name="plan" type="hidden" value={plan.key} />
                <Button type="submit" variant={plan.key === "growth" ? "primary" : "secondary"}>{plan.cta}</Button>
              </form>
              <p className="m-0 border-t border-slate-100 pt-3 text-sm leading-6 text-muted">{plan.guidance[0]}</p>
            </Card>)}
          </div>
          <Card className="mt-5 grid gap-4 border-blue-100 bg-[#f8fbff] p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <span className="inline-flex text-xs uppercase tracking-[.08em] text-accent-strong">More volume</span>
              <h2 className="my-3 text-3xl">Need more than Growth?</h2>
              <p className="max-w-[780px] leading-7 text-muted">Contact us for a custom monthly AI message allowance when your Sales Navigator workflow needs more volume.</p>
            </div>
            <Button href="mailto:hello@reachlyst.com?subject=Reachlyst%20custom%20AI%20messages" variant="secondary">Contact us</Button>
          </Card>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
