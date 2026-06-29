/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase";
import { getStripe, plans } from "@/lib/stripe";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  workspace?: string;
  role?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  paidSoFarCents: number;
  monthlyRevenueCents: number;
};

export type AdminSnapshot = {
  users: AdminUser[];
  stats: {
    users: number;
    monthlyRevenueCents: number;
    monthlyCostsCents: number;
    monthlyProfitCents: number;
  };
  topSubscribers: AdminUser[];
};

export function getEarlyAdopterConfig() {
  return {
    code: process.env.EARLY_ADOPTER_COUPON_CODE || "REACHLYSTEARLY",
    enabled: process.env.EARLY_ADOPTER_COUPON_ENABLED === "true",
    stripeCouponConfigured: Boolean(process.env.STRIPE_EARLY_ADOPTER_COUPON_ID)
  };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !process.env.SUPABASE_SERVICE_ROLE_KEY) return getLocalAdminSnapshot();

  const [authResult, profilesResult, membersResult, workspacesResult, subscriptionsResult, analysesResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    supabase.from("profiles").select("id,email,full_name,created_at"),
    supabase.from("workspace_members").select("workspace_id,user_id,role"),
    supabase.from("workspaces").select("id,name,owner_id,created_at"),
    supabase.from("subscriptions").select("workspace_id,plan,status,current_period_end,stripe_customer_id,created_at"),
    supabase.from("ai_analyses").select("cost_estimate,created_at")
  ]);

  const authUsers = authResult.data?.users ?? [];
  const profiles = profilesResult.data ?? [];
  const members = membersResult.data ?? [];
  const workspaces = workspacesResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const analyses = analysesResult.data ?? [];

  const users = await Promise.all((authUsers.length ? authUsers : profiles).map(async (user: any) => {
    const profile = profiles.find((item: any) => item.id === user.id);
    const member = members.find((item: any) => item.user_id === user.id);
    const workspace = workspaces.find((item: any) => item.id === member?.workspace_id || item.owner_id === user.id);
    const subscription = subscriptions.find((item: any) => item.workspace_id === workspace?.id);
    const monthlyRevenueCents = subscription?.status === "active" ? planMonthlyCents(subscription.plan) : 0;

    return {
      id: user.id,
      email: user.email ?? profile?.email ?? "Unknown",
      name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      workspace: workspace?.name,
      role: member?.role ?? (workspace?.owner_id === user.id ? "owner" : "member"),
      plan: subscription?.plan ?? "free",
      status: subscription?.status ?? "inactive",
      currentPeriodEnd: subscription?.current_period_end,
      paidSoFarCents: await getCustomerSpendCents(subscription?.stripe_customer_id),
      monthlyRevenueCents
    };
  }));

  if (!users.length) return getLocalAdminSnapshot();

  const monthlyRevenueCents = users.reduce((total, user) => total + user.monthlyRevenueCents, 0);
  const monthlyCostsCents = estimatedMonthlyCostsCents(analyses);
  const topSubscribers = [...users]
    .sort((a, b) => b.paidSoFarCents - a.paidSoFarCents || b.monthlyRevenueCents - a.monthlyRevenueCents)
    .slice(0, 5);

  return {
    users,
    stats: {
      users: users.length,
      monthlyRevenueCents,
      monthlyCostsCents,
      monthlyProfitCents: monthlyRevenueCents - monthlyCostsCents
    },
    topSubscribers
  };
}

function getLocalAdminSnapshot(): AdminSnapshot {
  const users = [
    {
      id: "local-owner",
      email: "demo@reachlyst.local",
      name: "Predrag",
      workspace: "Reachlyst Demo Workspace",
      role: "owner",
      plan: "growth",
      status: "local",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      paidSoFarCents: 8700,
      monthlyRevenueCents: 2900
    }
  ];
  const monthlyCostsCents = Number(process.env.ADMIN_MONTHLY_COST_CENTS ?? 3000);
  return {
    users,
    stats: {
      users: users.length,
      monthlyRevenueCents: 2900,
      monthlyCostsCents,
      monthlyProfitCents: 2900 - monthlyCostsCents
    },
    topSubscribers: users
  };
}

function planMonthlyCents(plan?: string | null) {
  const config = plans.find((item) => item.key === plan);
  if (!config) return 0;
  return Math.round(Number(config.price.replace(/[^0-9.]/g, "")) * 100);
}

function estimatedMonthlyCostsCents(analyses: any[]) {
  const fixedCosts = Number(process.env.ADMIN_MONTHLY_COST_CENTS ?? 3000);
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const aiCosts = analyses
    .filter((item) => String(item.created_at ?? "").startsWith(monthPrefix))
    .reduce((total, item) => total + Math.round(Number(item.cost_estimate ?? 0) * 100), 0);
  return fixedCosts + aiCosts;
}

async function getCustomerSpendCents(customerId?: string | null) {
  if (!customerId) return 0;
  const stripe = getStripe();
  if (!stripe) return 0;

  try {
    const invoices = await stripe.invoices.list({ customer: customerId, status: "paid", limit: 100 });
    return invoices.data.reduce((total, invoice) => total + (invoice.amount_paid ?? 0), 0);
  } catch {
    return 0;
  }
}
