import { NextResponse } from "next/server";
import { requirePlanCapacity, requirePlanFeature } from "@/lib/entitlements";
import { adviseOnSearch, type SearchAdvisorInput } from "@/lib/openai";
import { buildReachlystRagContext } from "@/lib/rag";
import { recordAiUsage } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SearchAdvisorInput>;
  const messages = (body.messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 4000)
    }));

  if (!body.mode || !["create_search", "train_search"].includes(body.mode)) {
    return NextResponse.json({ error: "Invalid chat mode." }, { status: 400 });
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
      body.mode,
      body.searchName,
      body.searchUrl,
      body.context,
      messages.map((message) => `${message.role}: ${message.content}`).join("\n")
    ].filter(Boolean).join("\n"),
    searchName: body.searchName,
    limit: 8
  });

  const reply = await adviseOnSearch({
    mode: body.mode,
    searchName: body.searchName,
    searchUrl: body.searchUrl,
    context: body.context,
    messages,
    ragContext
  });
  await recordAiUsage("message_generated");

  return NextResponse.json({ reply });
}
