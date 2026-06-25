import OpenAI from "openai";

export type AiLeadInput = {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  campaignContext?: string;
};

export async function analyzeLead(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      fit: "good_fit",
      reason: `${input.name} appears relevant based on title and campaign context. Mocked because OPENAI_API_KEY is not set.`,
      confidence: 0.74,
      suggestedConnectionMessage: `Hi ${input.name.split(" ")[0]}, noticed your work at ${input.company ?? "your company"}. Thought it would be useful to connect.`
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return JSON with fit good_fit|maybe|skip, reason, confidence 0-1, suggestedConnectionMessage under 280 chars. Be concise, human, non-spammy, and do not invent personalization." },
      { role: "user", content: JSON.stringify(input) }
    ]
  });
  return JSON.parse(response.choices[0]?.message.content ?? "{}");
}
