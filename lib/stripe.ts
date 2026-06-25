import Stripe from "stripe";
import { plans, type BillingPlanKey } from "@/lib/planLimits";
import { getSupabaseServerClient } from "@/lib/supabase";

export const workspaceId = "00000000-0000-4000-8000-000000000001";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export { plans, type BillingPlanKey };

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getStripePriceId(plan: string) {
  const config = plans.find((item) => item.key === plan);
  if (!config) return null;
  if (config.priceEnv === "STRIPE_GROWTH_PRICE_ID") {
    return process.env.STRIPE_GROWTH_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || null;
  }
  return config.priceEnv ? process.env[config.priceEnv] || null : null;
}

export async function getWorkspaceSubscription() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  await supabase.from("workspaces").upsert({ id: workspaceId, name: "Reachlyst Demo Workspace" }, { onConflict: "id" });
  const { data } = await supabase.from("subscriptions").select("*").eq("workspace_id", workspaceId).maybeSingle();
  return data;
}

function planFromPriceId(priceId?: string | null): BillingPlanKey {
  const plan = plans.find((item) => process.env[item.priceEnv] === priceId);
  return (plan?.key ?? "growth") as BillingPlanKey;
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const existing = await getWorkspaceSubscription();
  const priceId = subscription.items.data[0]?.price.id;
  const payload = {
    workspace_id: workspaceId,
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    plan: planFromPriceId(priceId),
    status: subscription.status,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
  };

  if (existing?.id) {
    await supabase.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert(payload);
  }
}
