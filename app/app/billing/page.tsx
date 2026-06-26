import { Badge, Button, Card } from "@/components/ui";
import { getPlanSnapshot } from "@/lib/entitlements";
import { formatLimit } from "@/lib/planLimits";
import { getStripePriceId, getWorkspaceSubscription, plans } from "@/lib/stripe";
import styles from "../../marketing.module.css";

export default async function BillingPage() {
  const subscription = await getWorkspaceSubscription();
  const snapshot = await getPlanSnapshot();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const trialDaysLeft = subscription?.status === "trialing" && subscription.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000))
    : null;
  const billingStatus = trialDaysLeft !== null ? `Trial: ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left` : subscription?.status === "active" ? "Active subscription" : subscription?.status ?? "No active plan";

  return <div className={styles.billingOnlyPlans}>
    <Card className={styles.billingStatusCard}>
      <div>
        <span>Current plan</span>
        <h1>{snapshot.config.name}</h1>
      </div>
      <Badge tone={trialDaysLeft !== null ? "warn" : subscription?.status === "active" ? "good" : "blue"}>{billingStatus}</Badge>
    </Card>
    <div className={styles.billingPlanGrid}>
      {plans.map((plan) => {
        const configured = Boolean(getStripePriceId(plan.key));
        const current = snapshot.plan === plan.key && subscription?.status !== "canceled";
        return <Card key={plan.key}>
          <h2>{plan.name}</h2>
          <strong>{plan.price}<span>/mo</span></strong>
          <p className={styles.planSummary}>{plan.summary}</p>
          <div className={styles.limitList}>
            <p><b>{formatLimit(plan.limits.searches)}</b> searches</p>
            <p><b>{formatLimit(plan.limits.leads)}</b> lead scans/mo</p>
            <p><b>{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI replies/mo</p>
            <p><b>{formatLimit(plan.limits.seats)}</b> workspace user{plan.limits.seats > 1 ? "s" : ""}</p>
          </div>
          {plan.features.map((feature) => <p key={feature}>{feature}</p>)}
          <form action="/api/stripe/checkout" method="post">
            <input name="plan" type="hidden" value={plan.key} />
            <Button type="submit" variant={current ? "secondary" : "primary"}>{current ? "Current plan" : `Choose ${plan.name}`}</Button>
          </form>
          {!stripeConfigured || !configured ? <small>Stripe price not configured yet.</small> : null}
        </Card>;
      })}
    </div>
  </div>;
}
