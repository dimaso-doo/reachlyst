import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireExtensionToken } from "@/lib/mockDb";
import { searches } from "@/data/mock";
import { upsertSearch } from "@/lib/store";

const schema = z.object({ url: z.string().url(), title: z.string().optional() });

export async function POST(request: Request) {
  const auth = requireExtensionToken(request);
  if (!auth.ok) return auth.response;
  const body = await readJson(request, schema);
  const decoded = decodeURIComponent(body.url).toLowerCase();
  const match = searches.find((search) => decoded.includes(search.id.replace("-", " ")) || decoded.includes("marketing agency") && search.id === "agency" || decoded.includes("saas") && search.id === "saas-founders" || decoded.includes("revops") && search.id === "revops");
  const campaign = match ?? searches[2];
  const saved = await upsertSearch({ id: campaign.id, name: campaign.name || body.title, url: body.url });
  return NextResponse.json({
    id: saved.id,
    name: saved.name || body.title || "Sales Navigator search",
    url: body.url,
    created: false,
    aiPlaybook: {
      useCase: campaign.aiUseCase,
      icp: campaign.aiIcp,
      offer: campaign.aiOffer,
      tone: campaign.aiTone,
      instructions: campaign.aiInstructions
    }
  });
}
