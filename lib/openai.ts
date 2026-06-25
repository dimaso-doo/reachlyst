import OpenAI from "openai";

export type AiLeadInput = {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  campaignContext?: string;
  tone?: string;
  useCase?: string;
  previousMessage?: string;
  variant?: number;
  limit?: number;
};

function fallbackAnalysis(input: AiLeadInput, reason: string) {
  const isAgency = /agency|marketing|seo|ppc|branding|pr/i.test(`${input.company ?? ""} ${input.title ?? ""} ${input.snippet ?? ""} ${input.campaignContext ?? ""}`);
  return {
    fit: isAgency ? "good_fit" : "maybe",
    reason: `${input.name} was scored from visible title/company text and the campaign playbook. ${reason}`,
    confidence: isAgency ? 0.82 : 0.58,
    suggestedConnectionMessage: fallbackInviteMessage(input),
    model: "fallback"
  };
}

function fallbackInviteMessage(input: AiLeadInput) {
  const first = input.name.split(" ")[0];
  const templates = [
    `Hi ${first}, noticed your work${input.company ? ` at ${input.company}` : ""}. Thought it made sense to connect.`,
    `Hi ${first}, I came across your profile${input.company ? ` and ${input.company}` : ""}. Open to connecting here?`,
    `Hi ${first}, saw your background${input.company ? ` with ${input.company}` : ""}. Thought it made sense to connect.`,
    `Hi ${first}, saw your work in marketing and wanted to connect with other operators in the space.`,
    `Hi ${first}, I work on keeping Sales Navigator outreach organized while LinkedIn stays manual. Thought it might be relevant${input.company ? ` for ${input.company}` : ""}.`
  ];
  const index = Math.max(0, ((input.variant ?? 1) - 1) % templates.length);
  return templates[index].slice(0, input.limit ?? 280);
}

function openAiErrorReason(error: unknown) {
  const details = error as { status?: number; code?: string; message?: string };
  if (details.code === "insufficient_quota" || details.status === 429) {
    return "OpenAI quota or billing is not active, so Reachlyst used fallback scoring.";
  }
  return "OpenAI was unavailable, so Reachlyst used fallback scoring.";
}

export async function analyzeLead(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis(input, "Mocked because OPENAI_API_KEY is not set.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return JSON with fit good_fit|maybe|skip, reason, confidence 0-1, suggestedConnectionMessage. The message must be one short sentence under the provided limit, ideally 120-180 characters. Keep it calm, direct, and human. Avoid hype, flattery, emojis, exclamation marks, 'admire', 'love', 'excited', 'looking forward', 'share insights', 'exchange ideas', 'thank you', and 'request'. Do not invent personalization. Follow the provided use case, ICP, tone, and LinkedIn manual-action policy." },
        { role: "user", content: JSON.stringify(input) }
      ]
    });
    return { ...JSON.parse(response.choices[0]?.message.content ?? "{}"), model: "gpt-4o-mini" };
  } catch (error) {
    return fallbackAnalysis(input, openAiErrorReason(error));
  }
}

export async function generateInviteMessage(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) return fallbackInviteMessage(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return JSON with a single field message. Write one short LinkedIn connection invite sentence under the provided character limit, ideally 120-180 characters. Keep it calm, direct, specific, and human. Avoid hype, flattery, emojis, exclamation marks, 'admire', 'love', 'excited', 'looking forward', 'share insights', 'exchange ideas', 'thank you', and 'request'. Do not invent personalization. Do not imply automation." },
        { role: "user", content: JSON.stringify(input) }
      ]
    });
    const parsed = JSON.parse(response.choices[0]?.message.content ?? "{}") as { message?: string };
    return (parsed.message || fallbackInviteMessage(input)).slice(0, input.limit ?? 280);
  } catch {
    return fallbackInviteMessage(input);
  }
}
