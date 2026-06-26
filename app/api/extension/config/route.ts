import { NextResponse } from "next/server";
import { getPlanSnapshot } from "@/lib/entitlements";
import { requireExtensionToken } from "@/lib/mockDb";

export async function GET(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const plan = await getPlanSnapshot();
  return NextResponse.json({
    extensionVersion: "0.1.0",
    parserVersion: "2026.06.25",
    enabledHosts: ["https://www.linkedin.com/sales/search/*"],
    inviteCharacterLimit: 280,
    parserReportSampleRate: 1,
    plan: {
      key: plan.plan,
      name: plan.config.name,
      limits: plan.config.limits,
      usage: plan.usage,
      inboxSync: plan.config.included.inboxSync
    }
  });
}
