import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const plans = [
  { name: "Starter", price: "$19", key: "starter", features: ["Manual lead logbook", "Visible lead import", "Basic AI suggestions"] },
  { name: "Pro", price: "$49", key: "pro", features: ["Fit scoring", "Message generation", "Inbox read-only sync", "Timeline history"] },
  { name: "Agency", price: "$149", key: "agency", features: ["Workspace members", "Higher usage limits", "Team reporting"] }
];
