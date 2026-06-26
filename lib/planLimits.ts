export type BillingPlanKey = "free" | "growth";
export type PlanFeature = "extensionSync" | "aiScoring" | "inviteGeneration" | "inboxSync" | "teamSeats";

export const planOrder: BillingPlanKey[] = ["free", "growth"];

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
    summary: "Create an account, view the dashboard, and upgrade when you are ready to use the Chrome extension.",
    cta: "Start free",
    features: [
      "Dashboard preview",
      "Billing setup",
      "No Chrome extension token",
      "Upgrade to activate AI invite chat"
    ],
    addOns: ["Upgrade when you need more leads, AI suggestions, or inbox sync."],
    limits: { searches: 0, leads: 0, monthlyAiSuggestions: 0, seats: 1 },
    included: { extensionSync: false, aiScoring: false, inviteGeneration: false, inboxSync: false, teamSeats: false }
  },
  growth: {
    name: "Growth",
    price: "$49",
    priceEnv: "STRIPE_GROWTH_PRICE_ID",
    summary: "One paid workspace for serious Sales Navigator outreach, with usage add-ons as you scale.",
    cta: "Start Growth",
    features: [
      "Unlimited active workflow setup",
      "5,000 saved leads included",
      "1,000 AI suggestions per month",
      "Read-only message sync"
    ],
    addOns: [
      "Extra lead packs",
      "Extra AI suggestion packs",
      "Additional workspace seats"
    ],
    limits: { searches: 25, leads: 5000, monthlyAiSuggestions: 1000, seats: 3 },
    included: { extensionSync: true, aiScoring: true, inviteGeneration: true, inboxSync: true, teamSeats: true }
  }
};

export const plans = planOrder.map((key) => ({ key, ...planCatalog[key] }));

export function normalizePlan(plan?: string | null): BillingPlanKey {
  if (plan === "growth" || plan === "pro" || plan === "agency") return "growth";
  return "free";
}

export function minimumPlanFor(feature: PlanFeature): BillingPlanKey {
  return planOrder.find((plan) => planCatalog[plan].included[feature]) ?? "growth";
}

export function formatLimit(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
