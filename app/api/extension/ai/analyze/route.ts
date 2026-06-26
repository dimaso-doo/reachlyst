import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeLead } from "@/lib/openai";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { saveAnalysis } from "@/lib/store";
import { requirePlanCapacity, requirePlanFeature } from "@/lib/entitlements";

const schema = z.object({ name: z.string(), title: z.string().optional(), company: z.string().optional(), location: z.string().optional(), linkedinUrl: z.string().optional(), salesNavigatorUrl: z.string().optional(), snippet: z.string().optional(), campaignContext: z.string().optional(), tone: z.string().optional(), useCase: z.string().optional() });

export async function POST(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const feature = await requirePlanFeature("aiScoring");
  if (!feature.ok) return feature.response;
  const capacity = await requirePlanCapacity("monthlyAiSuggestions", 1);
  if (!capacity.ok) return capacity.response;
  const result = await analyzeLead(body);
  await saveAnalysis(body, result);
  return NextResponse.json({ ...result, usage: { model: result.model ?? (process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock"), inputTokens: 0, outputTokens: 0, costEstimate: 0 } });
}
