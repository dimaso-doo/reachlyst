import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeLinkedInUrl, readJson, requireExtensionToken, sanitizeText } from "@/lib/mockDb";

const leadSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  salesNavigatorUrl: z.string().optional(),
  snippet: z.string().optional()
});
const schema = z.object({ searchId: z.string(), leads: z.array(leadSchema) });

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const imported = body.leads.map((lead, index) => ({
    id: `mock-lead-${index}`,
    name: sanitizeText(lead.name),
    normalizedLinkedInUrl: normalizeLinkedInUrl(lead.linkedinUrl ?? lead.salesNavigatorUrl ?? lead.name),
    status: "new"
  }));
  return NextResponse.json({ searchId: body.searchId, importedCount: imported.length, leads: imported });
}
