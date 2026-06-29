import { NextResponse } from "next/server";
import { getPlanSnapshot } from "@/lib/entitlements";

export async function GET() {
  const snapshot = await getPlanSnapshot();
  return NextResponse.json({
    plan: snapshot.plan,
    name: snapshot.config.name,
    usage: snapshot.usage,
    limits: snapshot.config.limits,
    bonusAiMessages: snapshot.bonusAiMessages
  }, { headers: { "cache-control": "no-store" } });
}
