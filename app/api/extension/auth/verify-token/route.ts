import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, workspaceId: "mock-workspace", userId: "mock-user", scopes: ["read_visible_linkedin", "write_reachlyst_log"] });
}
