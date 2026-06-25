import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { saveGeneratedMessage } from "@/lib/store";

const schema = z.object({
  name: z.string(),
  company: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
  salesNavigatorUrl: z.string().optional(),
  campaignContext: z.string().optional(),
  tone: z.string().optional(),
  useCase: z.string().optional(),
  previousMessage: z.string().optional(),
  variant: z.number().optional(),
  limit: z.number().optional()
});

const templates = [
  (first: string, company?: string) => `Hi ${first}, noticed your work${company ? ` at ${company}` : ""}. Thought it would be useful to connect.`,
  (first: string, company?: string) => `Hi ${first}, I came across your profile${company ? ` and ${company}` : ""}. Open to connecting here?`,
  (first: string, company?: string) => `Hi ${first}, your background${company ? ` with ${company}` : ""} caught my eye. Thought it made sense to connect.`,
  (first: string) => `Hi ${first}, saw your work in marketing and wanted to connect with other operators in the space.`,
  (first: string, company?: string) => `Hi ${first}, I help keep Sales Navigator outreach organized without automating LinkedIn. Thought it could be relevant${company ? ` for ${company}` : ""}.`
];

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const first = body.name.split(" ")[0];
  const index = Math.max(0, ((body.variant ?? 1) - 1) % templates.length);
  const message = templates[index](first, body.company);
  await saveGeneratedMessage(body, message);
  return NextResponse.json({ message: message.slice(0, body.limit ?? 280), storedAsSuggestion: true });
}
