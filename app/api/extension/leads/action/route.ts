import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { saveLeadAction } from "@/lib/store";

const schema = z.object({
  leadId: z.string(),
  action: z.enum(["message_copied", "connect_modal_detected", "invite_likely_sent", "invite_confirmed_if_detected", "skipped", "note_added"]),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  await saveLeadAction(body.leadId, body.action);
  return NextResponse.json({ ok: true, activity: { type: body.action, leadId: body.leadId, createdAt: new Date().toISOString() } });
}
