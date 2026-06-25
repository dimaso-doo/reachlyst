import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeLead } from "@/lib/openai";
import { readJson, requireExtensionToken } from "@/lib/mockDb";

const schema = z.object({ name: z.string(), title: z.string().optional(), company: z.string().optional(), location: z.string().optional(), snippet: z.string().optional(), campaignContext: z.string().optional() });

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const result = await analyzeLead(body);
  return NextResponse.json({ ...result, usage: { model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock", inputTokens: 0, outputTokens: 0, costEstimate: 0 } });
}
