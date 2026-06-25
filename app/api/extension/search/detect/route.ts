import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";

const schema = z.object({ url: z.string().url(), title: z.string().optional() });

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  return NextResponse.json({ id: "mock-search", name: body.title || "Sales Navigator search", url: body.url, created: false });
}
