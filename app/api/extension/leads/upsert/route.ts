import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { importLeads } from "@/lib/store";
import { requirePlanCapacity, requirePlanFeature } from "@/lib/entitlements";

const schema = z.object({
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  salesNavigatorUrl: z.string().optional()
});

export async function POST(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const lead = await readJson(request, schema);
  const feature = await requirePlanFeature("extensionSync");
  if (!feature.ok) return feature.response;
  const capacity = await requirePlanCapacity("leads", 1);
  if (!capacity.ok) return capacity.response;
  const [saved] = await importLeads("manual", [lead]);
  return NextResponse.json(saved);
}
