/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase";

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
  searches: number;
  leads: number;
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

  const [authResult, profilesResult, membersResult, workspacesResult, subscriptionsResult, searchesResult, leadsResult, tokensResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
    supabase.from("profiles").select("id,email,full_name,created_at"),
    supabase.from("workspace_members").select("workspace_id,user_id,role"),
    supabase.from("workspaces").select("id,name,owner_id,created_at"),
    supabase.from("subscriptions").select("workspace_id,plan,status,current_period_end"),
    supabase.from("search_campaigns").select("id,workspace_id"),
    supabase.from("leads").select("id,workspace_id"),
    supabase.from("extension_tokens").select("id,workspace_id,revoked_at")
  ]);

  const authUsers = authResult.data?.users ?? [];
  const profiles = profilesResult.data ?? [];
  const members = membersResult.data ?? [];
  const workspaces = workspacesResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const searches = searchesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const tokens = tokensResult.data ?? [];

  const users = (authUsers.length ? authUsers : profiles).map((user: any) => {
    const profile = profiles.find((item: any) => item.id === user.id);
    const member = members.find((item: any) => item.user_id === user.id);
    const workspace = workspaces.find((item: any) => item.id === member?.workspace_id || item.owner_id === user.id);
    const subscription = subscriptions.find((item: any) => item.workspace_id === workspace?.id);
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
      searches: searches.filter((item: any) => item.workspace_id === workspace?.id).length,
      leads: leads.filter((item: any) => item.workspace_id === workspace?.id).length,
      extensionTokens: tokens.filter((item: any) => item.workspace_id === workspace?.id && !item.revoked_at).length
    };
  });

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
        createdAt: new Date().toISOString(),
        workspace: "Reachlyst Demo Workspace",
        role: "owner",
        plan: "growth",
        status: "local",
        searches: 0,
        leads: 0,
        extensionTokens: 1
      }
    ],
    stats: { users: 1, workspaces: 1, searches: 0, leads: 0, activeSubscriptions: 0 },
    earlyAdopter: getEarlyAdopterConfig()
  };
}
