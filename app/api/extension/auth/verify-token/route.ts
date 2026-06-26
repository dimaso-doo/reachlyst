import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";

export async function POST(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    ok: true,
    workspaceId: auth.auth.workspaceId,
    userId: auth.auth.userId,
    scopes: auth.auth.scopes,
    plan: auth.auth.access
  });
}
