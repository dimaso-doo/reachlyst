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
            <strong>{plan.price}<span>/mo</span></strong>
            <p className={styles.planSummary}>{plan.summary}</p>
            <div className={styles.limitList}>
              <p><b>{formatLimit(plan.limits.searches)}</b> active search workflows</p>
              <p><b>{formatLimit(plan.limits.leads)}</b> lead scans/mo</p>
              <p><b>{formatLimit(plan.limits.monthlyAiSuggestions)}</b> AI replies/mo</p>
              <p><b>{formatLimit(plan.limits.seats)}</b> workspace user{plan.limits.seats > 1 ? "s" : ""}</p>
            </div>
            {plan.features.map((feature) => <p key={feature}>✓ {feature}</p>)}
            <Button href="/app/billing" variant={plan.key === "growth" ? "primary" : "secondary"}>{plan.cta}</Button>
          </Card>)}</div>
          <Card className={styles.addOns}>
            <span className={styles.eyebrow}>Add-ons</span>
            <h2>Buy more only when volume grows.</h2>
            <p>Growth includes enough capacity for a real Sales Navigator workflow. When you need more, add lead scan packs, AI reply packs, or workspace users without changing the whole account.</p>
            <div>
              <span>Extra lead packs</span>
              <span>Extra AI replies</span>
              <span>Additional users</span>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
