import { Badge, Button, Card } from "@/components/ui";
import { AnimatedUsageBars } from "@/components/AnimatedUsageBars";
import { DashboardReadiness } from "@/components/DashboardReadiness";
import { getPlanSnapshot } from "@/lib/entitlements";
import { getExtensionAccessState } from "@/lib/extensionTokens";
import { getWorkspaceSubscription } from "@/lib/stripe";
import styles from "../dashboard.module.css";

function trialDaysLeft(date?: string | null) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return days > 0 ? days : 0;
}

export default async function DashboardPage() {
  const [snapshot, extensionAccess, subscription] = await Promise.all([getPlanSnapshot(), getExtensionAccessState(), getWorkspaceSubscription()]);
  const daysLeft = subscription?.status === "trialing" ? trialDaysLeft(subscription.current_period_end) : null;
  const usageItems = [
    { label: "Searches", used: snapshot.usage.searches, limit: snapshot.config.limits.searches },
    { label: "Lead scans", used: snapshot.usage.leads, limit: snapshot.config.limits.leads },
    { label: "AI replies", used: snapshot.usage.monthlyAiSuggestions, limit: snapshot.config.limits.monthlyAiSuggestions }
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.hero}>
        <div>
          <Badge tone={snapshot.plan !== "free" ? "good" : "blue"}>{snapshot.config.name} plan</Badge>
          <h1>Dashboard</h1>
          <p>Track your Sales Navigator workspace, plan usage, extension setup, and upgrade options in one place.</p>
        </div>
        <div className={styles.heroActions}>
          <Button href="/app/extension">Extension Setup</Button>
          <Button href="/app/billing" variant="secondary">Billing</Button>
          {snapshot.plan === "free" ? <Button href="/app/billing" variant="secondary">Upgrade package</Button> : null}
        </div>
      </header>

      <section className={styles.topGrid}>
        <Card className={styles.packageCard}>
          <div>
            <span>Current package</span>
            <h2>{snapshot.config.name}</h2>
            <p>{snapshot.config.summary}</p>
          </div>
          <div className={styles.packageMeta}>
            <Badge tone={snapshot.plan !== "free" ? "good" : "blue"}>{subscription?.status ?? "Demo mode"}</Badge>
            {daysLeft !== null ? <strong>{daysLeft} trial day{daysLeft === 1 ? "" : "s"} left</strong> : null}
          </div>
        </Card>

        <Card className={styles.usageCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Plan usage</h2>
              <p>Current usage against the limits included in your package.</p>
            </div>
            <Badge tone={snapshot.plan !== "free" ? "good" : "warn"}>{snapshot.config.name}</Badge>
          </div>
          <AnimatedUsageBars items={usageItems} />
          {snapshot.plan === "free" ? <div className={styles.buyMore}><div><strong>Ready to use the extension?</strong><span>Upgrade to Starter to unlock workspace tokens, lead scans, and AI replies.</span></div><Button href="/app/billing">Upgrade package</Button></div> : null}
        </Card>

        <DashboardReadiness extensionReady={extensionAccess.isPaid && extensionAccess.tokenCount > 0} tokenCount={extensionAccess.tokenCount} />
      </section>
    </div>
  );
}
