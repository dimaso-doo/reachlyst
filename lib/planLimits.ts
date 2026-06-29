export type BillingPlanKey = "free" | "starter" | "growth";
export type PlanFeature = "extensionSync" | "aiScoring" | "inviteGeneration" | "inboxSync" | "teamSeats";

export const planOrder: BillingPlanKey[] = ["free", "starter", "growth"];

export const planCatalog: Record<BillingPlanKey, {
  name: string;
  price: string;
  priceEnv: string;
  summary: string;
  cta: string;
  features: string[];
  guidance: string[];
  addOns: string[];
  limits: {
    monthlyAiSuggestions: number;
    seats: number;
  };
  included: Record<PlanFeature, boolean>;
}> = {
  free: {
    name: "Free",
    price: "$0",
    priceEnv: "",
    summary: "For using the full Reachlyst workflow with a smaller monthly AI message allowance.",
    cta: "Create workspace",
    features: [
      "Chrome extension access",
      "Unlimited Sales Navigator context",
      "300 AI messages per month",
      "AI Playbook training",
      "Stops AI generation when messages run out"
    ],
    guidance: [
      "Best for testing the full workflow before paying.",
      "Enough to train the Playbook, review leads, and draft a lighter batch of LinkedIn messages."
    ],
    addOns: ["Upgrade when you need more AI messages and heavier monthly usage."],
    limits: { monthlyAiSuggestions: 300, seats: 1 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: false }
  },
  starter: {
    name: "Starter",
    price: "$15",
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    summary: "For one person using Sales Navigator with AI help for search review and manual message writing.",
    cta: "Start Starter",
    features: [
      "Chrome extension access",
      "Unlimited Sales Navigator context",
      "1,000 AI messages per month",
      "AI Playbook training"
    ],
    guidance: [
      "Best for a focused founder or operator using Sales Navigator weekly.",
      "A practical allowance for lead review, invite drafts, replies, and AI strategy chat."
    ],
    addOns: [
      "Extra AI message packs"
    ],
    limits: { monthlyAiSuggestions: 1000, seats: 1 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: false }
  },
  growth: {
    name: "Growth",
    price: "$29",
    priceEnv: "STRIPE_GROWTH_PRICE_ID",
    summary: "For consistent prospecting with more AI message generations each month.",
    cta: "Start Growth",
    features: [
      "Everything in Starter",
      "3,000 AI messages per month",
      "Unlimited Sales Navigator context",
      "Priority AI Playbook refinement"
    ],
    guidance: [
      "Best for consistent prospecting and multiple outreach angles each month.",
      "Built for heavier AI-assisted lead review, replies, follow-ups, and Playbook refinement."
    ],
    addOns: [
      "Extra AI message packs"
    ],
    limits: { monthlyAiSuggestions: 3000, seats: 1 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: false }
  }
};

export const plans = planOrder.map((key) => ({ key, ...planCatalog[key] }));

export function normalizePlan(plan?: string | null): BillingPlanKey {
  if (plan === "starter" || plan === "growth") return plan;
  if (plan === "scale") return "growth";
  if (plan === "pro" || plan === "agency") return "growth";
  return "free";
}

export function minimumPlanFor(feature: PlanFeature): BillingPlanKey {
  return planOrder.find((plan) => planCatalog[plan].included[feature]) ?? "growth";
}

export function formatLimit(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
