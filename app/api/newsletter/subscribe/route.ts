import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeForNews } from "@/lib/newsletter";

const schema = z.object({
  email: z.string().email().max(240),
  source: z.string().max(80).optional()
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  await subscribeForNews({
    email: body.email,
    source: body.source,
    userAgent: request.headers.get("user-agent")
  });
  return NextResponse.json({ ok: true });
}
