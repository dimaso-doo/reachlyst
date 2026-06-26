import { NextResponse } from "next/server";
import { requireExtensionToken } from "@/lib/mockDb";
import { getDashboardData } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { leads } = await getDashboardData();
  const statuses = Object.fromEntries(
    leads
      .filter((lead) => lead.campaignIds?.includes(id))
      .flatMap((lead) => [lead.linkedinUrl, lead.salesNavigatorUrl, lead.normalizedLinkedInUrl].filter(Boolean).map((url) => [url, lead.status]))
  );
  return NextResponse.json({ searchId: id, statuses });
}
