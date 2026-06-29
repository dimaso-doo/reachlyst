import { NextResponse } from "next/server";
import { requirePlanCapacity, requirePlanFeature } from "@/lib/entitlements";
import { chatAboutLeadInvite, type LeadInviteChatInput } from "@/lib/openai";
import { buildReachlystRagContext } from "@/lib/rag";
import { recordAiUsage } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LeadInviteChatInput>;
  const lead = body.lead;
  const messages = (body.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 3000)
    }));

  if (!lead?.name) {
    return NextResponse.json({ error: "Lead is required." }, { status: 400 });
  }

  if (!messages.length) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const feature = await requirePlanFeature("inviteGeneration");
  if (!feature.ok) return feature.response;
  const capacity = await requirePlanCapacity("monthlyAiSuggestions", 1);
  if (!capacity.ok) return capacity.response;

  const ragContext = await buildReachlystRagContext({
    query: [
      JSON.stringify(lead),
      messages.map((message) => `${message.role}: ${message.content}`).join("\n")
    ].join("\n"),
    leadName: lead.name,
    leadCompany: lead.company,
    limit: 8
  });

  const reply = await chatAboutLeadInvite({ lead, messages, ragContext });
  await recordAiUsage("message_generated");
  return NextResponse.json({ reply });
}
