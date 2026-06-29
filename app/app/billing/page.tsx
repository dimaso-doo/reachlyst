import { Badge, Button, Card } from "@/components/ui";
import { getPlanSnapshot } from "@/lib/entitlements";
import { formatLimit } from "@/lib/planLimits";
import { getStripePriceId, getWorkspaceSubscription, plans } from "@/lib/stripe";

export default async function BillingPage() {
  const subscription = await getWorkspaceSubscription();
  const snapshot = await getPlanSnapshot();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const billingStatus = snapshot.plan === "free"
    ? "Free plan"
    : subscription?.status === "active" || subscription?.status === "trialing"
      ? "Active subscription"
      : subscription?.status ?? "No active plan";

  return <div className="grid gap-5">
    <Card className="flex flex-wrap items-center justify-between gap-4 border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6">
      <div>
        <span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">Current plan</span>
        <h1 className="mt-2 text-3xl font-extrabold leading-none text-ink">{snapshot.config.name}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Every package includes the Chrome extension and unlimited Sales Navigator context. Only AI outreach assists are metered.</p>
      </div>
      <Badge tone={snapshot.plan !== "free" && (subscription?.status === "active" || subscription?.status === "trialing") ? "good" : "blue"}>{billingStatus}</Badge>
    </Card>
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const configured = Boolean(getStripePriceId(plan.key));
        const current = snapshot.plan === plan.key && subscription?.status !== "canceled";
        const highlighted = plan.key === "growth";
        const usedMessages = current ? snapshot.usage.monthlyAiSuggestions : 0;
        return <Card className={`relative grid h-full grid-rows-[auto_auto_auto_auto_auto_1fr_auto_auto] gap-5 overflow-hidden p-6 ${current ? "border-blue-300 shadow-reachlyst" : highlighted ? "border-blue-200 shadow-[0_22px_70px_rgba(22,119,255,.12)]" : ""}`} key={plan.key}>
          <div className="flex min-h-12 items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-ink">{plan.name}</h2>
            <div className="flex flex-wrap justify-end gap-2">
              {highlighted ? <span className="inline-flex min-h-7 items-center justify-center rounded-full bg-blue-600 px-3 py-1 text-center text-xs font-extrabold leading-none text-white">Popular</span> : null}
              {current ? <Badge tone="good">Current</Badge> : plan.key === "free" ? <Badge tone="blue">Full access</Badge> : null}
            </div>
          </div>
          <strong className="block text-4xl font-extrabold leading-none text-ink">{plan.price}<span className="ml-1 text-sm font-bold text-muted">/mo</span></strong>
          <p className="min-h-[72px] text-sm font-semibold leading-6 text-muted">{plan.summary}</p>
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
            <span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">AI messages this month</span>
            <strong className="mt-1 block text-3xl font-extrabold leading-none text-ink">{formatLimit(usedMessages)} / {formatLimit(plan.limits.monthlyAiSuggestions)}</strong>
            <div className="mt-3 grid gap-1 border-t border-blue-100 pt-3 text-sm font-semibold text-muted">
              <b className="text-ink">Unlimited</b>
              <span>Sales Navigator context</span>
            </div>
          </div>
          <div className="grid min-h-[104px] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {plan.guidance.map((line) => <p className="m-0 text-sm font-semibold leading-6 text-muted" key={line}>{line}</p>)}
          </div>
          <div className="grid content-start gap-2">
            {plan.features.map((feature) => <p className="flex gap-2 text-sm font-semibold leading-6 text-muted" key={feature}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{feature}</p>)}
          </div>
          <form action="/api/stripe/checkout" method="post">
            <input name="plan" type="hidden" value={plan.key} />
            <Button type="submit" variant={current ? "secondary" : "primary"}>{current ? "Current plan" : `Choose ${plan.name}`}</Button>
          </form>
          {plan.key !== "free" && (!stripeConfigured || !configured) ? <small className="text-xs font-bold text-amber-700">Stripe price not configured yet.</small> : null}
        </Card>;
      })}
    </div>
    <Card className="grid gap-4 border-blue-100 bg-blue-50/70 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div>
        <h2 className="text-xl font-extrabold text-ink">Need more AI messages?</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">If your Sales Navigator workflow needs more volume than Growth, contact us and we will set up a custom monthly allowance.</p>
      </div>
      <Button href="mailto:hello@reachlyst.com?subject=Reachlyst%20custom%20AI%20messages" variant="secondary">Contact us</Button>
    </Card>
  </div>;
}
