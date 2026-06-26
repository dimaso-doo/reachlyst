import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyExtensionToken } from "@/lib/extensionTokens";

export const extensionAuthHeader = "x-reachlyst-extension-token";

export async function requireExtensionToken(request: Request) {
  const token = request.headers.get(extensionAuthHeader) ?? "";
  const auth = await verifyExtensionToken(token);
  if (!auth.ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: auth.error, access: "access" in auth ? auth.access : undefined }, { status: auth.status })
    };
  }
  return { ok: true as const, token, auth };
}

export async function readJson<T extends z.ZodTypeAny>(request: Request, schema: T) {
  const json = await request.json().catch(() => ({}));
  return schema.parse(json) as z.infer<T>;
}

export function sanitizeText(value: unknown) {
  return String(value ?? "").replace(/<[^>]*>/g, "").trim().slice(0, 5000);
}

export function normalizeLinkedInUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
