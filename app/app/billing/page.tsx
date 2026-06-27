import { Badge, Button, Card } from "@/components/ui";
import { getPlanSnapshot } from "@/lib/entitlements";
import { formatLimit } from "@/lib/planLimits";
import { getStripePriceId, getWorkspaceSubscription, plans } from "@/lib/stripe";

export default async function BillingPage() {
  const subscription = await getWorkspaceSubscription();
  const snapshot = await getPlanSnapshot();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const trialDaysLeft = subscription?.status === "trialing" && subscription.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000))
    : null;
  const billingStatus = trialDaysLeft !== null ? `Trial: ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left` : subscription?.status === "active" ? "Active subscription" : subscription?.status ?? "No active plan";

  return <div className="grid gap-5">
    <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">Current plan</span>
        <h1 className="mt-2 text-3xl font-extrabold leading-none text-ink">{snapshot.config.name}</h1>
      </div>
      <Badge tone={trialDaysLeft !== null ? "warn" : subscription?.status === "active" ? "good" : "blue"}>{billingStatus}</Badge>
    </Card>
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const configured = Boolean(getStripePriceId(plan.key));
        const current = snapshot.plan === plan.key && subscription?.status !== "canceled";
        return <Card className={`grid gap-4 p-6 ${current ? "border-blue-200 shadow-reachlyst" : ""}`} key={plan.key}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-ink">{plan.name}</h2>
            {current ? <Badge tone="good">Current</Badge> : null}
          </div>
          <strong className="block text-4xl font-extrabold leading-none text-ink">{plan.price}<span className="ml-1 text-sm font-bold text-muted">/mo</span></strong>
          <p className="min-h-16 text-sm font-semibold leading-6 text-muted">{plan.summary}</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="flex items-center justify-between gap-3 py-2 text-sm font-semibold text-muted"><b className="text-ink">{formatLimit(plan.limits.searches)}</b> searches</p>
            <p className="flex items-center justify-between gap-3 border-t border-slate-200 py-2 text-sm font-semibold text-muted"><b className="text-ink">{formatLimit(plan.limits.leads)}</b> lead scans/mo</p>
            <p className="flex items-center justify-between gap-3 border-t border-slate-200 py-2 text-sm font-semibold text-muted"><b className="text-ink">{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI replies/mo</p>
            <p className="flex items-center justify-between gap-3 border-t border-slate-200 py-2 text-sm font-semibold text-muted"><b className="text-ink">{formatLimit(plan.limits.seats)}</b> workspace user{plan.limits.seats > 1 ? "s" : ""}</p>
          </div>
          <div className="grid gap-2">
            {plan.features.map((feature) => <p className="text-sm font-semibold leading-6 text-muted" key={feature}>{feature}</p>)}
          </div>
          <form action="/api/stripe/checkout" method="post">
            <input name="plan" type="hidden" value={plan.key} />
            <Button type="submit" variant={current ? "secondary" : "primary"}>{current ? "Current plan" : `Choose ${plan.name}`}</Button>
          </form>
          {!stripeConfigured || !configured ? <small className="text-xs font-bold text-amber-700">Stripe price not configured yet.</small> : null}
        </Card>;
      })}
    </div>
  </div>;
}
