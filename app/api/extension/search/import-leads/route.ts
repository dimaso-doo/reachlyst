import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { importLeads } from "@/lib/store";

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
  const imported = await importLeads(body.searchId, body.leads);
  return NextResponse.json({ searchId: body.searchId, importedCount: imported.length, leads: imported });
}
