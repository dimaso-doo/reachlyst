import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiPlaybook, resetAiPlaybook, saveAiPlaybook } from "@/lib/store";

const schema = z.object({
  rawNotes: z.string().min(1).max(8000),
  status: z.enum(["not_trained", "ready"]).optional(),
  offer: z.string().max(1000).optional(),
  icp: z.string().max(1000).optional(),
  tone: z.string().max(400).optional(),
  cta: z.string().max(400).optional(),
  defaultMessageTypes: z.array(z.string().max(120)).max(10).optional()
});

export async function GET() {
  const playbook = await getAiPlaybook();
  return NextResponse.json({ playbook }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const playbook = await saveAiPlaybook(body);
  return NextResponse.json({ playbook });
}

export async function DELETE() {
  const playbook = await resetAiPlaybook();
  return NextResponse.json({ playbook });
}
