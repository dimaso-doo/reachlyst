import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeLinkedInUrl, readJson, requireExtensionToken, sanitizeText } from "@/lib/mockDb";

const schema = z.object({
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  salesNavigatorUrl: z.string().optional()
});

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const lead = await readJson(request, schema);
  return NextResponse.json({ id: "mock-lead", name: sanitizeText(lead.name), normalizedLinkedInUrl: normalizeLinkedInUrl(lead.linkedinUrl ?? lead.salesNavigatorUrl ?? lead.name), status: "new" });
}
