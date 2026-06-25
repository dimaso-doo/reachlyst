import { Button, Card } from "@/components/ui";
import { plans } from "@/lib/stripe";
import styles from "../../marketing.module.css";

export default function BillingPage() {
  return <div><h1>Billing</h1><p>Stripe subscription scaffold. Add Stripe keys to enable checkout and portal sessions.</p><div className={styles.planGrid}>{plans.map((plan) => <Card key={plan.key}><h2>{plan.name}</h2><strong>{plan.price}</strong>{plan.features.map((feature) => <p key={feature}>{feature}</p>)}<Button>{plan.key === "pro" ? "Current plan" : "Change plan"}</Button></Card>)}</div><Button variant="secondary">Cancel subscription</Button></div>;
}
