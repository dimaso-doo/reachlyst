/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  lastSignInAt?: string;
  workspace?: string;
  role?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  moneySpentCents: number;
  searches: number;
  leads: number;
  aiSuggestions: number;
  aiTokens: number;
  messagesSynced: number;
  extensionTokens: number;
};

export type AdminSnapshot = {
  users: AdminUser[];
  stats: {
    users: number;
    workspaces: number;
    searches: number;
    leads: number;
    activeSubscriptions: number;
  };
  earlyAdopter: {
    code: string;
    enabled: boolean;
    stripeCouponConfigured: boolean;
  };
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

  const [authResult, profilesResult, membersResult, workspacesResult, subscriptionsResult, searchesResult, leadsResult, analysesResult, generatedResult, messagesResult, tokensResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    supabase.from("profiles").select("id,email,full_name,created_at"),
    supabase.from("workspace_members").select("workspace_id,user_id,role"),
    supabase.from("workspaces").select("id,name,owner_id,created_at"),
    supabase.from("subscriptions").select("workspace_id,plan,status,current_period_end,stripe_customer_id,created_at"),
    supabase.from("search_campaigns").select("id,workspace_id"),
    supabase.from("leads").select("id,workspace_id"),
    supabase.from("ai_analyses").select("id,workspace_id,input_tokens,output_tokens,cost_estimate"),
    supabase.from("generated_messages").select("id,workspace_id"),
    supabase.from("linkedin_messages").select("id,workspace_id"),
    supabase.from("extension_tokens").select("id,workspace_id,revoked_at")
  ]);

  const authUsers = authResult.data?.users ?? [];
  const profiles = profilesResult.data ?? [];
  const members = membersResult.data ?? [];
  const workspaces = workspacesResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const searches = searchesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const analyses = analysesResult.data ?? [];
  const generated = generatedResult.data ?? [];
  const messages = messagesResult.data ?? [];
  const tokens = tokensResult.data ?? [];

  const users = await Promise.all((authUsers.length ? authUsers : profiles).map(async (user: any) => {
    const profile = profiles.find((item: any) => item.id === user.id);
    const member = members.find((item: any) => item.user_id === user.id);
    const workspace = workspaces.find((item: any) => item.id === member?.workspace_id || item.owner_id === user.id);
    const subscription = subscriptions.find((item: any) => item.workspace_id === workspace?.id);
    const workspaceSearches = searches.filter((item: any) => item.workspace_id === workspace?.id);
    const workspaceLeads = leads.filter((item: any) => item.workspace_id === workspace?.id);
    const workspaceAnalyses = analyses.filter((item: any) => item.workspace_id === workspace?.id);
    const workspaceGenerated = generated.filter((item: any) => item.workspace_id === workspace?.id);
    const workspaceMessages = messages.filter((item: any) => item.workspace_id === workspace?.id);
    const workspaceTokens = tokens.filter((item: any) => item.workspace_id === workspace?.id && !item.revoked_at);

    return {
      id: user.id,
      email: user.email ?? profile?.email ?? "Unknown",
      name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      createdAt: user.created_at ?? profile?.created_at,
      lastSignInAt: user.last_sign_in_at,
      workspace: workspace?.name,
      role: member?.role ?? (workspace?.owner_id === user.id ? "owner" : "member"),
      plan: subscription?.plan ?? "free",
      status: subscription?.status ?? "inactive",
      currentPeriodEnd: subscription?.current_period_end,
      moneySpentCents: await getCustomerSpendCents(subscription?.stripe_customer_id),
      searches: workspaceSearches.length,
      leads: workspaceLeads.length,
      aiSuggestions: workspaceAnalyses.length + workspaceGenerated.length,
      aiTokens: workspaceAnalyses.reduce((total: number, item: any) => total + Number(item.input_tokens ?? 0) + Number(item.output_tokens ?? 0), 0),
      messagesSynced: workspaceMessages.length,
      extensionTokens: workspaceTokens.length
    };
  }));

  if (!users.length) return getLocalAdminSnapshot();

  return {
    users,
    stats: {
      users: users.length,
      workspaces: workspaces.length,
      searches: searches.length,
      leads: leads.length,
      activeSubscriptions: subscriptions.filter((item: any) => item.status === "active" || item.status === "trialing").length
    },
    earlyAdopter: getEarlyAdopterConfig()
  };
}

function getLocalAdminSnapshot(): AdminSnapshot {
  return {
    users: [
      {
        id: "local-owner",
        email: "demo@reachlyst.local",
        name: "Predrag",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 46).toISOString(),
        lastSignInAt: new Date().toISOString(),
        workspace: "Reachlyst Demo Workspace",
        role: "owner",
        plan: "growth",
        status: "local",
        moneySpentCents: 14700,
        searches: 3,
        leads: 428,
        aiSuggestions: 92,
        aiTokens: 18400,
        messagesSynced: 37,
        extensionTokens: 1
      }
    ],
    stats: { users: 1, workspaces: 1, searches: 0, leads: 0, activeSubscriptions: 0 },
    earlyAdopter: getEarlyAdopterConfig()
  };
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
