import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { generateInviteMessage } from "@/lib/openai";
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

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const message = await generateInviteMessage(body);
  await saveGeneratedMessage(body, message);
  return NextResponse.json({ message: message.slice(0, body.limit ?? 280), storedAsSuggestion: true });
}
