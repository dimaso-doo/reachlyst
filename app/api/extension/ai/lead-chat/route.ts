import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";
import { requirePlanCapacity, requirePlanFeature } from "@/lib/entitlements";
import { chatAboutLeadInvite, type LeadInviteChatInput } from "@/lib/openai";
import { applyAiPlaybookToLeadInput, recordAiUsage, saveGeneratedMessage } from "@/lib/store";

export async function POST(request: Request) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Partial<LeadInviteChatInput>;
  const lead = body.lead;
  const messages = (body.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 3000)
    }));

  if (!lead?.name) return NextResponse.json({ error: "Lead is required." }, { status: 400 });
  if (!messages.length) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const feature = await requirePlanFeature("inviteGeneration");
  if (!feature.ok) return feature.response;
  const capacity = await requirePlanCapacity("monthlyAiSuggestions", 1);
  if (!capacity.ok) return capacity.response;

  const enrichedLead = await applyAiPlaybookToLeadInput(lead);
  const reply = await chatAboutLeadInvite({ lead: enrichedLead, messages });
  await saveGeneratedMessage(enrichedLead, reply);
  await recordAiUsage("message_generated");
  return NextResponse.json({ reply });
}
