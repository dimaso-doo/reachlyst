import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";

const schema = z.object({
  parserVersion: z.string(),
  extensionVersion: z.string(),
  pageType: z.string(),
  extractedCount: z.number(),
  failures: z.array(z.string()).default([]),
  url: z.string().optional()
});

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  return NextResponse.json({ ok: true, reportId: `parser-${Date.now()}`, received: body });
}
