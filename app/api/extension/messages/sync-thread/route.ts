import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken, sanitizeText } from "@/lib/mockDb";
import { saveThread } from "@/lib/store";

const schema = z.object({
  leadId: z.string().optional(),
  threadUrl: z.string().optional(),
  source: z.enum(["linkedin_messages", "sales_inbox"]),
  messages: z.array(z.object({ senderType: z.enum(["user", "lead", "unknown"]), body: z.string(), sentAt: z.string().optional() }))
});

export async function POST(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  await saveThread(body);
  return NextResponse.json({ ok: true, syncedCount: body.messages.length, replyDetected: body.messages.some((message) => message.senderType === "lead"), messages: body.messages.map((message) => ({ ...message, body: sanitizeText(message.body), syncedAt: new Date().toISOString() })) });
}
