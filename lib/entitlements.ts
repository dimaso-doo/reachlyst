import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/store";
import { getWorkspaceSubscription } from "@/lib/stripe";
import { formatLimit, minimumPlanFor, normalizePlan, planCatalog, type BillingPlanKey, type PlanFeature } from "@/lib/planLimits";

export type WorkspaceUsage = {
  searches: number;
  leads: number;
  monthlyAiSuggestions: number;
};

export async function getActivePlan(): Promise<BillingPlanKey> {
  const subscription = await getWorkspaceSubscription();
  if (!subscription || subscription.status === "canceled" || subscription.status === "incomplete_expired") return "free";
  return normalizePlan(subscription.plan);
}

export async function getWorkspaceUsage(): Promise<WorkspaceUsage> {
  const data = await getDashboardData();
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyAiSuggestions = data.activities.filter((activity) => {
    const createdAt = activity.createdAt ?? "";
    return createdAt.startsWith(monthPrefix) && ["ai_analyzed", "message_generated"].includes(activity.type ?? "");
  }).length;

  return {
    searches: data.searches.length,
    leads: data.leads.length,
    monthlyAiSuggestions
  };
}

export async function getPlanSnapshot() {
  const [plan, usage] = await Promise.all([getActivePlan(), getWorkspaceUsage()]);
  return { plan, config: planCatalog[plan], usage };
}

export async function requirePlanFeature(feature: PlanFeature) {
  const plan = await getActivePlan();
  if (planCatalog[plan].included[feature]) return { ok: true as const, plan };
  const requiredPlan = minimumPlanFor(feature);
  return {
    ok: false as const,
    response: NextResponse.json({
      error: "Upgrade required",
      message: `${planCatalog[requiredPlan].name} is required for this feature.`,
      currentPlan: plan,
      requiredPlan
    }, { status: 402 })
  };
}

export async function requirePlanCapacity(resource: keyof WorkspaceUsage, additional = 0) {
  const { plan, usage } = await getPlanSnapshot();
  const limit = planCatalog[plan].limits[resource];
  const nextUsage = usage[resource] + additional;
  if (nextUsage <= limit) return { ok: true as const, plan, usage, limit };

  const nextPlan = "growth";
  const label = resource === "monthlyAiSuggestions" ? "AI suggestions this month" : resource;
  return {
    ok: false as const,
    response: NextResponse.json({
      error: "Plan limit reached",
      message: `Your ${planCatalog[plan].name} plan includes ${formatLimit(limit)} ${label}. Upgrade to continue.`,
      currentPlan: plan,
      suggestedPlan: nextPlan,
      usage: usage[resource],
      limit
    }, { status: 402 })
  };
}
