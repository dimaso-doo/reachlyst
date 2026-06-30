import { NextResponse } from "next/server";
import { getEarlyAdopterConfig } from "@/lib/admin";
import { getAppUrl, getStripe, getStripePriceId, plans, workspaceId } from "@/lib/stripe";

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "");
  const coupon = String(formData.get("coupon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const planConfig = plans.find((item) => item.key === plan);

  if (plan === "free") return NextResponse.redirect(new URL("/signup", request.url), { status: 303 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  const priceId = getStripePriceId(plan);
  if (!planConfig || !priceId) return NextResponse.json({ error: "Unknown or unconfigured plan" }, { status: 400 });

  const appUrl = getAppUrl();
  const earlyAdopter = getEarlyAdopterConfig();
  const earlyAdopterDiscount =
    earlyAdopter.enabled &&
    earlyAdopter.stripeCouponConfigured &&
    coupon.toLowerCase() === earlyAdopter.code.toLowerCase()
      ? [{ coupon: process.env.STRIPE_EARLY_ADOPTER_COUPON_ID as string }]
      : undefined;
  const fromSignup = origin === "signup";
  const successUrl = fromSignup
    ? `${appUrl}/signup?plan=${encodeURIComponent(plan)}&checkout=success`
    : `${appUrl}/app/billing?checkout=success`;
  const cancelUrl = fromSignup
    ? `${appUrl}/signup?plan=${encodeURIComponent(plan)}&checkout=cancelled`
    : `${appUrl}/app/billing?checkout=cancelled`;
  const customerEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    client_reference_id: workspaceId,
    subscription_data: {
      metadata: { workspaceId, plan, earlyAdopter: earlyAdopterDiscount ? "true" : "false" }
    },
    metadata: { workspaceId, plan, earlyAdopter: earlyAdopterDiscount ? "true" : "false" },
    discounts: earlyAdopterDiscount,
    allow_promotion_codes: !earlyAdopterDiscount
  });

  if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  return NextResponse.redirect(session.url, { status: 303 });
}
