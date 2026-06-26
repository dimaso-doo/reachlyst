import { Badge, Button, Card } from "@/components/ui";
import { getPlanSnapshot } from "@/lib/entitlements";
import { formatLimit } from "@/lib/planLimits";
import { getStripePriceId, getWorkspaceSubscription, plans } from "@/lib/stripe";
import styles from "../../marketing.module.css";

export default async function BillingPage() {
  const subscription = await getWorkspaceSubscription();
  const snapshot = await getPlanSnapshot();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return <div>
    <h1>Billing</h1>
    <p>Manage the Reachlyst subscription for this workspace.</p>
    <p><Badge tone={subscription?.status === "active" ? "good" : "blue"}>{snapshot.config.name} plan</Badge> <Badge tone={subscription?.status === "active" ? "good" : "blue"}>{subscription?.status ?? "Demo mode"}</Badge></p>
    <Card className={styles.billingUsage}>
      <h2>Current usage</h2>
      <p>{snapshot.usage.searches} / {formatLimit(snapshot.config.limits.searches)} searches</p>
      <p>{snapshot.usage.leads} / {formatLimit(snapshot.config.limits.leads)} leads</p>
      <p>{snapshot.usage.monthlyAiSuggestions} / {formatLimit(snapshot.config.limits.monthlyAiSuggestions)} AI suggestions this month</p>
      <p>{snapshot.config.included.inboxSync ? "Read-only inbox sync included" : "Read-only inbox sync requires Pro"}</p>
    </Card>
    <div className={styles.billingPlanGrid}>
      {plans.map((plan) => {
        const configured = Boolean(getStripePriceId(plan.key));
        const current = snapshot.plan === plan.key && subscription?.status !== "canceled";
        return <Card key={plan.key}>
          <h2>{plan.name}</h2>
          <strong>{plan.price}{plan.key === "growth" ? <span>/mo</span> : null}</strong>
          <p className={styles.planSummary}>{plan.summary}</p>
          <div className={styles.limitList}>
            <p><b>{formatLimit(plan.limits.searches)}</b> searches</p>
            <p><b>{formatLimit(plan.limits.leads)}</b> leads</p>
            <p><b>{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI suggestions/mo</p>
            <p><b>{formatLimit(plan.limits.seats)}</b> seat{plan.limits.seats > 1 ? "s" : ""}</p>
          </div>
          {plan.features.map((feature) => <p key={feature}>{feature}</p>)}
          {plan.key === "free" ? <Button href="/app/dashboard" variant={current ? "secondary" : "ghost"}>{current ? "Current plan" : "Use Free"}</Button> : <form action="/api/stripe/checkout" method="post">
            <input name="plan" type="hidden" value={plan.key} />
            <Button type="submit" variant={current ? "secondary" : "primary"}>{current ? "Current plan" : `Choose ${plan.name}`}</Button>
          </form>}
          {plan.key !== "free" && (!stripeConfigured || !configured) ? <small>Stripe price not configured yet.</small> : null}
        </Card>;
      })}
    </div>
    <form action="/api/stripe/portal" method="post">
      <Button type="submit" variant="secondary">Manage or cancel subscription</Button>
    </form>
  </div>;
}
