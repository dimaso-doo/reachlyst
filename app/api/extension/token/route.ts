import { NextResponse } from "next/server";
import { createExtensionToken, getExtensionAccessState, revokeExtensionToken } from "@/lib/extensionTokens";

export async function GET() {
  return NextResponse.json(await getExtensionAccessState());
}

export async function POST() {
  const result = await createExtensionToken();
  if (!result.ok) {
    return NextResponse.json({ error: result.error, message: result.message, access: result.access }, { status: result.status });
  }
  return NextResponse.json({ token: result.token, access: result.access });
}

export async function DELETE() {
  const access = await revokeExtensionToken();
  return NextResponse.json({ access });
}
