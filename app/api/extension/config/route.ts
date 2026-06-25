import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";

export async function GET(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    extensionVersion: "0.1.0",
    parserVersion: "2026.06.25",
    enabledHosts: ["https://www.linkedin.com/sales/*", "https://www.linkedin.com/messaging/*"],
    inviteCharacterLimit: 280,
    parserReportSampleRate: 1
  });
}
