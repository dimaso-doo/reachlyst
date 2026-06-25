import { Badge, Button, Card } from "@/components/ui";
import { getStripePriceId, getWorkspaceSubscription, plans } from "@/lib/stripe";
import styles from "../../marketing.module.css";

export default async function BillingPage() {
  const subscription = await getWorkspaceSubscription();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return <div>
    <h1>Billing</h1>
    <p>Manage the Reachlyst subscription for this workspace.</p>
    <p><Badge tone={subscription?.status === "active" ? "good" : "blue"}>{subscription?.status ?? "No active subscription"}</Badge></p>
    <div className={styles.planGrid}>
      {plans.map((plan) => {
        const configured = Boolean(getStripePriceId(plan.key));
        const current = subscription?.plan === plan.key && subscription?.status !== "canceled";
        return <Card key={plan.key}>
          <h2>{plan.name}</h2>
          <strong>{plan.price}</strong>
          {plan.features.map((feature) => <p key={feature}>{feature}</p>)}
          <form action="/api/stripe/checkout" method="post">
            <input name="plan" type="hidden" value={plan.key} />
            <Button type="submit" variant={current ? "secondary" : "primary"}>{current ? "Current plan" : `Choose ${plan.name}`}</Button>
          </form>
          {!stripeConfigured || !configured ? <small>Stripe price not configured yet.</small> : null}
        </Card>;
      })}
    </div>
    <form action="/api/stripe/portal" method="post">
      <Button type="submit" variant="secondary">Manage or cancel subscription</Button>
    </form>
  </div>;
}
