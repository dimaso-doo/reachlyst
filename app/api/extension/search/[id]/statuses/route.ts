import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  return NextResponse.json({ searchId: id, statuses: { "https://www.linkedin.com/in/maya-novak": "good_fit" } });
}
