import { NextResponse } from "next/server";
import { getAppUrl, getStripe, getStripePriceId, plans, workspaceId } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "");
  const planConfig = plans.find((item) => item.key === plan);
  const priceId = getStripePriceId(plan);

  if (!planConfig || !priceId) return NextResponse.json({ error: "Unknown or unconfigured plan" }, { status: 400 });

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app/billing?checkout=success`,
    cancel_url: `${appUrl}/app/billing?checkout=cancelled`,
    client_reference_id: workspaceId,
    subscription_data: {
      metadata: { workspaceId, plan }
    },
    metadata: { workspaceId, plan },
    allow_promotion_codes: true
  });

  if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  return NextResponse.redirect(session.url, { status: 303 });
}
