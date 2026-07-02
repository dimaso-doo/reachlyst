import { Badge, Button, Card } from "@/components/ui";
import { AnimatedUsageBars } from "@/components/AnimatedUsageBars";
import { DashboardReadiness } from "@/components/DashboardReadiness";
import { OnboardingWizardOverlay } from "@/components/OnboardingWizardOverlay";
import { SearchAiChat } from "@/components/SearchAiChat";
import { getPlanSnapshot } from "@/lib/entitlements";
import { getExtensionAccessState } from "@/lib/extensionTokens";
import { getAiPlaybook } from "@/lib/store";
import { getWorkspaceSubscription } from "@/lib/stripe";

export default async function DashboardPage() {
  const [snapshot, extensionAccess, subscription, playbook] = await Promise.all([getPlanSnapshot(), getExtensionAccessState(), getWorkspaceSubscription(), getAiPlaybook()]);
  const playbookReady = playbook.status === "ready" && Boolean(playbook.rawNotes.trim());
  const extensionReady = extensionAccess.isPaid && Boolean(extensionAccess.boundAt || extensionAccess.lastTokenUsedAt);
  const packageStatus = snapshot.plan === "free"
    ? "Free plan"
    : subscription?.status === "active" || subscription?.status === "trialing"
      ? "Active subscription"
      : subscription?.status ?? "Demo mode";
  const usageItems = [
    { label: "AI messages", used: snapshot.usage.monthlyAiSuggestions, limit: snapshot.config.limits.monthlyAiSuggestions }
  ];

  return (
    <div className="grid gap-6">
      <OnboardingWizardOverlay initialPlaybookReady={playbookReady} initialExtensionAccess={extensionAccess} />

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
            <Badge tone={snapshot.plan !== "free" ? "good" : "blue"}>{packageStatus}</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Plan usage</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted">AI message usage against the limit included in your package. Sales Navigator context sync is unlimited on every plan.</p>
            </div>
            <Badge tone={snapshot.plan !== "free" ? "good" : "warn"}>{snapshot.config.name}</Badge>
          </div>
          <AnimatedUsageBars items={usageItems} />
          {snapshot.bonusAiMessages > 0 ? <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">Super admin added {snapshot.bonusAiMessages.toLocaleString("en-US")} extra AI messages to this month&apos;s allowance.</p> : null}
          {snapshot.plan === "free" ? <div className="mt-5 grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><strong className="block text-sm font-extrabold text-ink">Free includes the full workflow.</strong><span className="mt-1 block text-sm font-semibold leading-6 text-muted">Use the extension and Sales Navigator context now. Upgrade only when you need more monthly AI messages.</span></div><Button href="/app/billing">Upgrade package</Button></div> : null}
        </Card>

        <DashboardReadiness extensionReady={extensionReady} tokenCount={extensionAccess.tokenCount} />
      </section>

      <SearchAiChat
        mode="create_search"
        title="Reachlyst Ally"
        assistantName="Reachlyst Ally"
        intro="I am here as your LinkedIn outreach ally. Tell me what you are trying to sell, who you want to reach, or where the workflow feels stuck, and I will help you shape the next move."
        description="A freer strategy chat for positioning, ICP, Sales Navigator searches, message angles, replies, and the next best move."
        placeholder="Ask about ICP, positioning, Sales Navigator searches, invite angles, replies, follow-ups, or what to do next..."
        context="Dashboard ally chat for broader LinkedIn outreach strategy, ICP, positioning, message direction, and next steps."
      />
    </div>
  );
}
