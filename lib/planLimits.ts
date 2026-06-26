export type BillingPlanKey = "free" | "starter" | "growth" | "scale";
export type PlanFeature = "extensionSync" | "aiScoring" | "inviteGeneration" | "inboxSync" | "teamSeats";

export const planOrder: BillingPlanKey[] = ["starter", "growth", "scale"];

export const planCatalog: Record<BillingPlanKey, {
  name: string;
  price: string;
  priceEnv: string;
  summary: string;
  cta: string;
  features: string[];
  addOns: string[];
  limits: {
    searches: number;
    leads: number;
    monthlyAiSuggestions: number;
    seats: number;
  };
  included: Record<PlanFeature, boolean>;
}> = {
  free: {
    name: "Free",
    price: "$0",
    priceEnv: "",
    summary: "Create an account, view the dashboard, and choose a paid package when you are ready to use the Chrome extension.",
    cta: "Start free",
    features: [
      "Dashboard preview",
      "Billing setup",
      "No Chrome extension token",
      "Upgrade to activate AI invite chat"
    ],
    addOns: ["Upgrade when you need lead scans, AI replies, and Chrome extension access."],
    limits: { searches: 0, leads: 0, monthlyAiSuggestions: 0, seats: 1 },
    included: { extensionSync: false, aiScoring: false, inviteGeneration: false, inboxSync: false, teamSeats: false }
  },
  starter: {
    name: "Starter",
    price: "$15",
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    summary: "For one person using Sales Navigator with AI help for search review and manual message writing.",
    cta: "Start Starter",
    features: [
      "Chrome extension access",
      "Sales Navigator lead context helper",
      "1,000 AI replies per month",
      "AI Playbook training"
    ],
    addOns: [
      "Extra AI reply packs",
      "Extra lead scan packs"
    ],
    limits: { searches: 10, leads: 1000, monthlyAiSuggestions: 1000, seats: 1 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: false }
  },
  growth: {
    name: "Growth",
    price: "$29",
    priceEnv: "STRIPE_GROWTH_PRICE_ID",
    summary: "For consistent prospecting with more lead scans and message generations each month.",
    cta: "Start Growth",
    features: [
      "Everything in Starter",
      "3,000 AI replies per month",
      "3,000 lead scans per month",
      "Priority AI Playbook refinement"
    ],
    addOns: [
      "Extra AI reply packs",
      "Extra lead scan packs"
    ],
    limits: { searches: 25, leads: 3000, monthlyAiSuggestions: 3000, seats: 1 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: false }
  },
  scale: {
    name: "Scale",
    price: "$49",
    priceEnv: "STRIPE_SCALE_PRICE_ID",
    summary: "For heavier Sales Navigator usage, small teams, or founders running several prospecting angles.",
    cta: "Start Scale",
    features: [
      "Everything in Growth",
      "10,000 AI replies per month",
      "10,000 lead scans per month",
      "Up to 3 workspace users"
    ],
    addOns: [
      "Extra AI reply packs",
      "Extra lead scan packs",
      "Additional workspace users"
    ],
    limits: { searches: 75, leads: 10000, monthlyAiSuggestions: 10000, seats: 3 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: false, teamSeats: true }
  }
};

export const plans = planOrder.map((key) => ({ key, ...planCatalog[key] }));

export function normalizePlan(plan?: string | null): BillingPlanKey {
  if (plan === "starter" || plan === "growth" || plan === "scale") return plan;
  if (plan === "pro" || plan === "agency") return "scale";
  return "free";
}

export function minimumPlanFor(feature: PlanFeature): BillingPlanKey {
  return planOrder.find((plan) => planCatalog[plan].included[feature]) ?? "growth";
}

export function formatLimit(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
