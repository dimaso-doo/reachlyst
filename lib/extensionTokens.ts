import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getWorkspaceSubscription, workspaceId } from "@/lib/stripe";
import { normalizePlan, planCatalog } from "@/lib/planLimits";

type LocalToken = {
  id: string;
  hash: string;
  value?: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  boundDeviceId?: string;
  boundDeviceLabel?: string;
  boundUserAgent?: string;
  boundAt?: string;
};

type LocalTokenDb = {
  tokens: LocalToken[];
};

export type ExtensionAccessState = {
  isPaid: boolean;
  plan: string;
  status: string;
  tokenCount: number;
  seatLimit: number;
  activeToken?: string;
  boundDeviceLabel?: string;
  boundAt?: string;
  lastTokenCreatedAt?: string;
  lastTokenUsedAt?: string;
};

const localTokenPath = process.env.VERCEL
  ? join(tmpdir(), "reachlyst-extension-tokens.json")
  : join(process.cwd(), "data", "reachlyst-extension-tokens.json");

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function now() {
  return new Date().toISOString();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function activeSubscriptionStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}

function readLocalTokens(): LocalTokenDb {
  if (!existsSync(localTokenPath)) return { tokens: [] };
  return JSON.parse(readFileSync(localTokenPath, "utf8")) as LocalTokenDb;
}

function writeLocalTokens(db: LocalTokenDb) {
  mkdirSync(dirname(localTokenPath), { recursive: true });
  writeFileSync(localTokenPath, JSON.stringify(db, null, 2));
}

export async function getExtensionAccessState(): Promise<ExtensionAccessState> {
  const subscription = await getWorkspaceSubscription();
  const plan = normalizePlan(subscription?.plan);
  const status = subscription?.status ?? (process.env.NODE_ENV === "production" ? "inactive" : "local_dev");
  const isPaid = planCatalog[plan].included.extensionSync && (plan === "free" || activeSubscriptionStatus(subscription?.status));
  const seatLimit = planCatalog[plan].limits.seats;

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      ?.from("extension_tokens")
      .select("token_value,created_at,last_used_at,revoked_at,bound_device_label,bound_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }) ?? { data: [] };
    const activeTokens = (data ?? []).filter((token: { revoked_at?: string | null }) => !token.revoked_at);
    const activeToken = activeTokens[0];
    return {
      isPaid,
      plan,
      status,
      tokenCount: activeTokens.length,
      seatLimit,
      activeToken: activeToken?.token_value,
      boundDeviceLabel: activeToken?.bound_device_label,
      boundAt: activeToken?.bound_at,
      lastTokenCreatedAt: activeToken?.created_at,
      lastTokenUsedAt: activeTokens.find((token: { last_used_at?: string | null }) => token.last_used_at)?.last_used_at
    };
  }

  const local = readLocalTokens();
  const activeTokens = local.tokens.filter((token) => !token.revokedAt);
  const activeToken = activeTokens[0];
  return {
    isPaid: isPaid || process.env.NODE_ENV !== "production",
    plan,
    status,
    tokenCount: activeTokens.length,
    seatLimit,
    activeToken: activeToken?.value,
    boundDeviceLabel: activeToken?.boundDeviceLabel,
    boundAt: activeToken?.boundAt,
    lastTokenCreatedAt: activeToken?.createdAt,
    lastTokenUsedAt: activeTokens.find((token) => token.lastUsedAt)?.lastUsedAt
  };
}

export async function createExtensionToken(name = "Chrome Extension") {
  const access = await getExtensionAccessState();
  if (!access.isPaid) {
    return {
      ok: false as const,
      status: 402,
      error: "Extension access unavailable",
      message: "Extension access is not available for this workspace.",
      access
    };
  }

  const token = `rly_${randomBytes(24).toString("base64url")}`;
  const tokenHash = hashToken(token);

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data: existing } = await supabase
      ?.from("extension_tokens")
      .select("token_value")
      .eq("workspace_id", workspaceId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() ?? { data: null };
    if (existing?.token_value) {
      return { ok: true as const, token: existing.token_value, access: await getExtensionAccessState() };
    }
    await supabase?.from("extension_tokens").update({ revoked_at: now() }).eq("workspace_id", workspaceId).is("revoked_at", null);
    await supabase?.from("extension_tokens").insert({
      workspace_id: workspaceId,
      token_hash: tokenHash,
      token_value: token,
      name
    });
  } else {
    const db = readLocalTokens();
    const existing = db.tokens.find((item) => !item.revokedAt && item.value);
    if (existing?.value) {
      return { ok: true as const, token: existing.value, access: await getExtensionAccessState() };
    }
    db.tokens.forEach((item) => { if (!item.revokedAt) item.revokedAt = now(); });
    db.tokens.unshift({
      id: `tok_${randomBytes(8).toString("hex")}`,
      hash: tokenHash,
      value: token,
      name,
      createdAt: now()
    });
    writeLocalTokens(db);
  }

  return { ok: true as const, token, access: await getExtensionAccessState() };
}

export async function revokeExtensionToken() {
  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    await supabase?.from("extension_tokens").update({ revoked_at: now() }).eq("workspace_id", workspaceId).is("revoked_at", null);
  } else {
    const db = readLocalTokens();
    db.tokens.forEach((item) => { if (!item.revokedAt) item.revokedAt = now(); });
    writeLocalTokens(db);
  }
  return getExtensionAccessState();
}

export async function verifyExtensionToken(token: string, deviceId?: string, deviceLabel?: string, userAgent?: string) {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 20) {
    return { ok: false as const, status: 401, error: "Missing or invalid extension token" };
  }
  if (!deviceId || deviceId.trim().length < 10) {
    return { ok: false as const, status: 401, error: "Missing extension device id" };
  }

  const tokenHash = hashToken(trimmed);

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      ?.from("extension_tokens")
      .select("id,workspace_id,revoked_at,bound_device_id")
      .eq("workspace_id", workspaceId)
      .eq("token_hash", tokenHash)
      .maybeSingle() ?? { data: null };

    if (!data || data.revoked_at) {
      return { ok: false as const, status: 401, error: "Missing or invalid extension token" };
    }

    const access = await getExtensionAccessState();
    if (!access.isPaid) {
      return { ok: false as const, status: 402, error: "Extension access unavailable", access };
    }

    if (data.bound_device_id && data.bound_device_id !== deviceId) {
      return { ok: false as const, status: 403, error: "This extension token is already connected to another browser. Revoke it in Reachlyst and generate a new connection key." };
    }

    const updates: Record<string, string | null> = { last_used_at: now() };
    if (!data.bound_device_id) {
      updates.bound_device_id = deviceId;
      updates.bound_device_label = deviceLabel || "Chrome extension";
      updates.bound_user_agent = userAgent || null;
      updates.bound_at = now();
    }

    await supabase?.from("extension_tokens").update(updates).eq("id", data.id);
    return {
      ok: true as const,
      workspaceId,
      userId: "extension-user",
      access,
      scopes: ["read_visible_linkedin", "write_reachlyst_log", "ai_invite_chat"]
    };
  }

  const db = readLocalTokens();
  const existing = db.tokens.find((item) => item.hash === tokenHash && !item.revokedAt);
  if (!existing) {
    return { ok: false as const, status: 401, error: "Missing or invalid extension token" };
  }

  const access = await getExtensionAccessState();
  if (!access.isPaid) {
    return { ok: false as const, status: 402, error: "Extension access unavailable", access };
  }
  if (existing.boundDeviceId && existing.boundDeviceId !== deviceId) {
    return { ok: false as const, status: 403, error: "This extension token is already connected to another browser. Revoke it in Reachlyst and generate a new connection key." };
  }

  existing.lastUsedAt = now();
  if (!existing.boundDeviceId) {
    existing.boundDeviceId = deviceId;
    existing.boundDeviceLabel = deviceLabel || "Chrome extension";
    existing.boundUserAgent = userAgent;
    existing.boundAt = now();
  }
  writeLocalTokens(db);
  return {
    ok: true as const,
    workspaceId,
    userId: "extension-user",
    access,
    scopes: ["read_visible_linkedin", "write_reachlyst_log", "ai_invite_chat"]
  };
}
