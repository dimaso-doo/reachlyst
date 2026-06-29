import { Badge, Button, Card } from "@/components/ui";
import { AnimatedUsageBars } from "@/components/AnimatedUsageBars";
import { DashboardReadiness } from "@/components/DashboardReadiness";
import { getPlanSnapshot } from "@/lib/entitlements";
import { getExtensionAccessState } from "@/lib/extensionTokens";
import { getWorkspaceSubscription } from "@/lib/stripe";

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
    <div className="grid gap-6">
      <header className="grid gap-5 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-reachlyst lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <Badge tone={snapshot.plan !== "free" ? "good" : "blue"}>{snapshot.config.name} plan</Badge>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-ink">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-[15px] font-semibold leading-7 text-muted">Track your Sales Navigator workspace, plan usage, extension setup, and upgrade options in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button href="/app/extension">Extension Setup</Button>
          <Button href="/app/billing" variant="secondary">Billing</Button>
          {snapshot.plan === "free" ? <Button href="/app/billing" variant="secondary">Upgrade package</Button> : null}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <Card className="col-span-full grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-accent-strong">Current package</span>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">{snapshot.config.name}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-muted">{snapshot.config.summary}</p>
          </div>
          <div className="grid gap-2 lg:justify-items-end">
            <Badge tone={snapshot.plan !== "free" ? "good" : "blue"}>{subscription?.status ?? "Demo mode"}</Badge>
            {daysLeft !== null ? <strong className="text-sm font-extrabold text-emerald-700">{daysLeft} trial day{daysLeft === 1 ? "" : "s"} left</strong> : null}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Plan usage</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted">Current usage against the limits included in your package.</p>
            </div>
            <Badge tone={snapshot.plan !== "free" ? "good" : "warn"}>{snapshot.config.name}</Badge>
          </div>
          <AnimatedUsageBars items={usageItems} />
          {snapshot.plan === "free" ? <div className="mt-5 grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><strong className="block text-sm font-extrabold text-ink">Ready to use the extension?</strong><span className="mt-1 block text-sm font-semibold leading-6 text-muted">Upgrade to Starter to unlock workspace tokens, lead scans, and AI replies.</span></div><Button href="/app/billing">Upgrade package</Button></div> : null}
        </Card>

        <DashboardReadiness extensionReady={extensionAccess.isPaid && extensionAccess.tokenCount > 0} tokenCount={extensionAccess.tokenCount} />
      </section>
    </div>
  );
}
