import { NextResponse } from "next/server";
import { z } from "zod";
import { chatAboutAiPlaybook } from "@/lib/openai";

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000)
  })).min(1).max(40)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const reply = await chatAboutAiPlaybook(body);
  return NextResponse.json({ reply });
}
