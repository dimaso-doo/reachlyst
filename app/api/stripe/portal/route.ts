import { NextResponse } from "next/server";
import { getAppUrl, getStripe, getWorkspaceSubscription } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  const subscription = await getWorkspaceSubscription();
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found yet. Choose a plan first." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${getAppUrl()}/app/billing`
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
