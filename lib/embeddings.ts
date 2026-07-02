import OpenAI from "openai";

const embeddingModel = "text-embedding-3-small";

export async function createEmbedding(text: string) {
  const input = text.replace(/\s+/g, " ").trim().slice(0, 8000);
  if (!input || !process.env.OPENAI_API_KEY) return null;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.embeddings.create({
      model: embeddingModel,
      input
    });
    return response.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}
