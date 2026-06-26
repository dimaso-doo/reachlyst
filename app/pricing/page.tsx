/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { formatLimit } from "@/lib/planLimits";
import { plans } from "@/lib/stripe";
import styles from "../marketing.module.css";

export default function PricingPage() {
  return (
    <main className="pageShell">
      <nav className={styles.nav}><div className="container"><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><div><Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/login">Login</Link><Button href="/signup">Sign up</Button></div></div></nav>
      <section className={styles.pricingHero}>
        <div className="container">
          <span className={styles.eyebrow}>Pricing</span>
          <h1>Simple pricing for LinkedIn lead workflows.</h1>
          <p>Start with the dashboard. Upgrade to activate the Chrome extension, AI invite chat, and usage-based outreach logging.</p>
        </div>
      </section>
      <section className={styles.pricing}>
        <div className="container">
          <div className={styles.planGrid}>{plans.map((plan) => <Card className={plan.key === "growth" ? styles.featuredPlan : ""} key={plan.key}>
            <h3>{plan.name}</h3>
            <strong>{plan.price}{plan.key === "growth" ? <span>/mo</span> : null}</strong>
            <p className={styles.planSummary}>{plan.summary}</p>
            <div className={styles.limitList}>
              <p><b>{formatLimit(plan.limits.searches)}</b> searches</p>
              <p><b>{formatLimit(plan.limits.leads)}</b> leads</p>
              <p><b>{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI suggestions/mo</p>
              <p><b>{formatLimit(plan.limits.seats)}</b> seat{plan.limits.seats > 1 ? "s" : ""}</p>
            </div>
            {plan.features.map((feature) => <p key={feature}>✓ {feature}</p>)}
            <p>{plan.included.inboxSync ? "✓ Read-only message sync" : "Upgrade for read-only message sync"}</p>
            <Button href={plan.key === "free" ? "/signup" : "/app/billing"} variant={plan.key === "growth" ? "primary" : "secondary"}>{plan.cta}</Button>
          </Card>)}</div>
          <Card className={styles.addOns}>
            <span className={styles.eyebrow}>Add-ons</span>
            <h2>Buy more only when volume grows.</h2>
            <p>Growth includes enough capacity for a real outbound workflow. When you need more, add lead packs, AI suggestion packs, or seats without changing the whole account.</p>
            <div>
              <span>Extra lead packs</span>
              <span>Extra AI suggestions</span>
              <span>Additional seats</span>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
