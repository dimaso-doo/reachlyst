import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getWorkspaceSubscription, workspaceId } from "@/lib/stripe";
import { normalizePlan } from "@/lib/planLimits";

type LocalToken = {
  id: string;
  hash: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
};

type LocalTokenDb = {
  tokens: LocalToken[];
};

export type ExtensionAccessState = {
  isPaid: boolean;
  plan: string;
  status: string;
  tokenCount: number;
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
  const isPaid = activeSubscriptionStatus(subscription?.status) && plan !== "free";

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      ?.from("extension_tokens")
      .select("created_at,last_used_at,revoked_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }) ?? { data: [] };
    const activeTokens = (data ?? []).filter((token: { revoked_at?: string | null }) => !token.revoked_at);
    return {
      isPaid,
      plan,
      status,
      tokenCount: activeTokens.length,
      lastTokenCreatedAt: activeTokens[0]?.created_at,
      lastTokenUsedAt: activeTokens.find((token: { last_used_at?: string | null }) => token.last_used_at)?.last_used_at
    };
  }

  const local = readLocalTokens();
  const activeTokens = local.tokens.filter((token) => !token.revokedAt);
  return {
    isPaid: isPaid || process.env.NODE_ENV !== "production",
    plan,
    status,
    tokenCount: activeTokens.length,
    lastTokenCreatedAt: activeTokens[0]?.createdAt,
    lastTokenUsedAt: activeTokens.find((token) => token.lastUsedAt)?.lastUsedAt
  };
}

export async function createExtensionToken(name = "Chrome Extension") {
  const access = await getExtensionAccessState();
  if (!access.isPaid) {
    return {
      ok: false as const,
      status: 402,
      error: "Billing required",
      message: "An active Reachlyst Growth subscription is required to generate an extension token.",
      access
    };
  }

  const token = `rly_${randomBytes(24).toString("base64url")}`;
  const tokenHash = hashToken(token);

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    await supabase
      ?.from("extension_tokens")
      .update({ revoked_at: now() })
      .eq("workspace_id", workspaceId)
      .is("revoked_at", null);
    await supabase?.from("extension_tokens").insert({
      workspace_id: workspaceId,
      token_hash: tokenHash,
      name
    });
  } else {
    const db = readLocalTokens();
    db.tokens.forEach((item) => {
      if (!item.revokedAt) item.revokedAt = now();
    });
    db.tokens.unshift({
      id: `tok_${randomBytes(8).toString("hex")}`,
      hash: tokenHash,
      name,
      createdAt: now()
    });
    writeLocalTokens(db);
  }

  return { ok: true as const, token, access: await getExtensionAccessState() };
}

export async function verifyExtensionToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 20) {
    return { ok: false as const, status: 401, error: "Missing or invalid extension token" };
  }

  const tokenHash = hashToken(trimmed);

  if (hasSupabase()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      ?.from("extension_tokens")
      .select("id,workspace_id,revoked_at")
      .eq("workspace_id", workspaceId)
      .eq("token_hash", tokenHash)
      .maybeSingle() ?? { data: null };

    if (!data || data.revoked_at) {
      return { ok: false as const, status: 401, error: "Missing or invalid extension token" };
    }

    const access = await getExtensionAccessState();
    if (!access.isPaid) {
      return { ok: false as const, status: 402, error: "Billing required", access };
    }

    await supabase?.from("extension_tokens").update({ last_used_at: now() }).eq("id", data.id);
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
    return { ok: false as const, status: 402, error: "Billing required", access };
  }

  existing.lastUsedAt = now();
  writeLocalTokens(db);
  return {
    ok: true as const,
    workspaceId,
    userId: "extension-user",
    access,
    scopes: ["read_visible_linkedin", "write_reachlyst_log", "ai_invite_chat"]
  };
}
