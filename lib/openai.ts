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
};

export async function analyzeLead(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) {
    const isAgency = /agency|marketing|seo|ppc|branding|pr/i.test(`${input.company ?? ""} ${input.title ?? ""} ${input.snippet ?? ""} ${input.campaignContext ?? ""}`);
    return {
      fit: isAgency ? "good_fit" : "maybe",
      reason: `${input.name} was scored from visible title/company text and the campaign playbook. Mocked because OPENAI_API_KEY is not set.`,
      confidence: isAgency ? 0.82 : 0.58,
      suggestedConnectionMessage: `Hi ${input.name.split(" ")[0]}, noticed your work${input.company ? ` at ${input.company}` : ""}. Thought it would be useful to connect.`
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return JSON with fit good_fit|maybe|skip, reason, confidence 0-1, suggestedConnectionMessage under 280 chars. Be concise, human, non-spammy, and do not invent personalization. Follow the provided use case, ICP, tone, and LinkedIn manual-action policy." },
      { role: "user", content: JSON.stringify(input) }
    ]
  });
  return JSON.parse(response.choices[0]?.message.content ?? "{}");
}
