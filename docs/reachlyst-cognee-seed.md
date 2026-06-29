# Reachlyst Project Memory Seed

Reachlyst is an AI outreach assistant for LinkedIn Sales Navigator. It helps users research visible lead context, generate connection invites, generate reply suggestions on accepted-message threads, and manage a small workspace around outreach preparation.

## Product Positioning

Reachlyst is not a LinkedIn automation bot. It is a manual-first assistant. It must not auto-login to LinkedIn, store LinkedIn credentials, bypass LinkedIn limits, auto-connect, auto-send, or run headless background scraping. The user stays in control and manually sends all LinkedIn actions.

## Core Extension Behavior

On Sales Navigator leads and searches, the extension should behave as an invite and lead-context assistant. It reads visible context, shows a Reachlyst R button beside LinkedIn actions, opens a floating chat, and can generate invite copy, fit notes, and profile analysis when the user asks.

On Sales Navigator or LinkedIn messages, the extension should behave as a reply assistant. It should read visible conversation context when available and suggest replies or follow-ups for accepted connections. It should not claim it can see hidden/private data beyond visible page context.

The floating chat should use the blue Reachlyst R logo, have minimize and close controls, copy buttons that switch to copied state, and a Send on Enter switch that is blue when enabled and gray when disabled.

## Dashboard

The app dashboard should be focused and simple. Main user areas are Dashboard, AI Playbook, Extension Setup, Billing, and profile/settings. Super admin should only show user overview, current packages, paid amount, package end date, monthly revenue, monthly costs, monthly net, user count, and top subscribers.

Dashboard usage should show progress bars for lead scans, AI replies, trial days, seats or extension readiness where relevant. Progress bars should animate left-to-right and counters should count up on page load.

## AI Playbook

AI Playbook is where the user trains Reachlyst on their business. It should ask what the user sells, what leads they want, what messages should sound like, what tone to use, and what objections or fit signals matter. Once trained, the app should show a ready/trained badge.

## Extension Setup and Seats

Extension tokens should map to controlled access. A generated token should stay visible until revoked, with copy and revoke actions. One token should not allow unlimited free usage by everyone. Seats and device binding should be considered when controlling extension access.

## Pricing

Current intended monthly packages:

- Starter: $15/month
- Growth: $29/month
- Scale: $49/month

Pricing is based around lead scans, AI replies, and workspace users/seats. Reachlyst no longer uses saved searches or message history as core paid features in the marketing language. The product is centered on Sales Navigator context help, invite generation, reply suggestions, AI Playbook, and usage controls.

## Branding and Design

Use IBM Plex Sans globally. Reachlyst branding uses a blue R mark. The marketing website is a one-page landing page with anchor navigation to Features, Product, How it works, Pricing, and FAQ. Product screenshots should explain the extension and workspace clearly.

Avoid overly generic SaaS visuals. Prefer real product UI, concise copy, dark navy marketing background, blue accents, and clean readable cards. Ensure responsive behavior, no horizontal overflow, and usable mobile navigation.

## Infrastructure

The app uses Next.js App Router, TypeScript, Tailwind, Supabase, Stripe, OpenAI, Vercel, and a Chrome Extension Manifest V3. Development branch is `dev`. Production is deployed to Vercel and aliased to `https://reachlyst.com`.

## Safety

Never commit secrets. Important secrets include OpenAI API keys, Supabase service role keys, Stripe secret keys, Stripe webhook secrets, Google OAuth secrets, and extension token pepper values.

