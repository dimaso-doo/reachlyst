import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";

const schema = z.object({ name: z.string(), company: z.string().optional(), title: z.string().optional(), campaignContext: z.string().optional(), limit: z.number().optional() });

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const first = body.name.split(" ")[0];
  const message = `Hi ${first}, noticed your work${body.company ? ` at ${body.company}` : ""}. Thought it would be useful to connect.`;
  return NextResponse.json({ message: message.slice(0, body.limit ?? 280), storedAsSuggestion: true });
}
