# Reachlyst Codebase Map For Cognee

This document is intended for Cognee memory. It summarizes the Reachlyst codebase, product constraints, architecture, and development decisions without secrets.

## Repository

- Repository: `reachlyst`
- Local path: `/Users/ps/Documents/05_Reachlyst.com_v2`
- Main development branch: `dev`
- Production URL: `https://reachlyst.com`
- Framework: Next.js App Router, React 19, TypeScript, Tailwind CSS, Framer Motion
- Backend services: Supabase, Stripe, OpenAI, Vercel
- Browser extension: Chrome Extension Manifest V3

## Product Summary

Reachlyst is an AI outreach assistant for LinkedIn Sales Navigator. It helps users work with visible lead context, generate connection invites, generate reply suggestions for accepted connections, and manage extension setup and usage from a dashboard.

Reachlyst is manual-first. It must never become a LinkedIn automation bot. It must not:

- auto-login to LinkedIn
- store LinkedIn credentials
- bypass LinkedIn limits
- auto-connect
- auto-send
- run hidden background scraping
- send LinkedIn messages on behalf of the user

The user always reviews, copies, edits, pastes, and sends manually.

## App Structure

Marketing and auth:

- `app/page.tsx`: one-page marketing homepage with hero, Features, Product screenshots, How it works, Testimonials, Pricing, FAQ, and final CTA.
- `components/MarketingChrome.tsx`: marketing nav/footer with one-page anchor links.
- `app/login/page.tsx`: login page with email and Google login.
- `components/AuthMarketingConsent.tsx`: consent checkbox for promotional email permission.
- `app/signup/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/blog/page.tsx`, `app/pricing/page.tsx`: supporting marketing/legal pages.

Dashboard app:

- `app/app/layout.tsx`: authenticated app shell with fixed sidebar.
- `components/AppSidebarNav.tsx`: sidebar navigation. Current user nav items are Dashboard, AI Playbook, Extension Setup, Billing.
- `app/app/dashboard/page.tsx`: user dashboard with package, usage, progress, trial/package status.
- `app/app/ai-playbook/page.tsx`: AI Playbook trainer page.
- `components/AiPlaybookTrainer.tsx`: AI Playbook chat. Loads/saves the workspace playbook through `/api/ai-playbook` with localStorage as a browser fallback.
- `app/app/extension/page.tsx`: extension setup page.
- `components/ExtensionTokenPanel.tsx`: generates, displays, copies, and revokes extension token/connection key.
- `app/app/billing/page.tsx`: billing/packages.
- `app/app/settings/page.tsx`: profile/settings page. Profile should stay basic; outreach behavior belongs in AI Playbook.
- `app/app/admin/page.tsx`: super admin overview with users, plans, paid amount, package dates, revenue/cost/net boxes, and top subscribers.

Legacy or low-priority app routes still exist for older scaffolding:

- `app/app/leads/page.tsx`
- `app/app/leads/[id]/page.tsx`
- `app/app/messages/page.tsx`
- `app/app/searches/page.tsx`
- `app/app/searches/[id]/page.tsx`

These should not drive marketing language unless revived intentionally.

## Billing And Plans

Plan data lives in `lib/planLimits.ts`.

Current public packages:

- Starter: `$15/month`
- Growth: `$29/month`
- Scale: `$49/month`

Plan logic:

- `free`: dashboard preview, no extension token, upgrade required for extension and AI invite chat.
- `starter`: Chrome extension access, Sales Navigator lead context helper, 1,000 AI replies/month, AI Playbook training, 1 seat.
- `growth`: 3,000 AI replies/month, 3,000 lead scans/month, 1 seat.
- `scale`: 10,000 AI replies/month, 10,000 lead scans/month, up to 3 workspace users.

Pricing should be described around lead scans, AI replies, and workspace seats/users. Do not describe saved searches or message history as core paid features anymore.

Stripe:

- `lib/stripe.ts`: Stripe client, app URL, price ID lookup, subscription sync.
- `app/api/stripe/checkout/route.ts`: creates checkout sessions.
- `app/api/stripe/portal/route.ts`: customer portal.
- `app/api/stripe/webhook/route.ts`: webhook sync.

Important Stripe env vars:

- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_GROWTH_PRICE_ID`
- `STRIPE_SCALE_PRICE_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never commit Stripe secrets.

## Entitlements And Usage

- `lib/entitlements.ts`: active plan, workspace usage, feature checks, capacity checks.
- `requirePlanFeature(feature)`: blocks features behind plan.
- `requirePlanCapacity(resource, additional)`: blocks when plan limit is reached.
- Usage resources: searches, leads, monthly AI suggestions/replies.

Dashboard progress bars should animate left-to-right and counters should count up on page load.

## Extension Tokens And Seats

- Extension tokens are managed in `lib/extensionTokens.ts`.
- API route: `app/api/extension/token/route.ts`.
- UI: `components/ExtensionTokenPanel.tsx`.

Product rule:

- A generated extension token should remain visible until revoked.
- User should be able to copy or revoke it.
- One token should not grant unlimited unpaid usage to everyone.
- Seats control workspace users. Extension token controls a connected Chrome extension device.
- First verified browser can bind the token to that device.

## Chrome Extension

Extension source:

- `extension/manifest.json`
- `extension/content/contentScript.ts`
- `extension/content/contentScript.js`
- `extension/styles/content.css`
- `extension/popup/popup.html`
- `extension/popup/popup.css`
- `extension/popup/popup.js`
- `extension/background/serviceWorker.js`
- `extension/parsers/salesNavigatorParser.ts`
- `extension/parsers/messagesParser.ts`
- tests in `extension/tests/`

Extension version in `contentScript.ts`: `0.1.4`.
Parser version in `contentScript.ts`: `2026.06.26`.

### Extension Behavior By Page Type

On Sales Navigator lead/search pages:

- Parse visible lead cards.
- Show a blue Reachlyst R action button aligned with LinkedIn action icons.
- Open floating Reachlyst chat for selected lead.
- Generate connection invite suggestions.
- Allow profile/fit analysis when the user asks for it.
- Use visible page context and, when relevant, fetch profile context from visible authenticated Sales Navigator pages.
- Keep actions manual. The user copies and sends.

On LinkedIn/Sales Navigator message pages:

- Parse visible message thread.
- Treat selected person as an accepted connection.
- Open floating Reachlyst chat in bottom-right.
- Use visible conversation context to generate replies/follow-ups.
- Do not claim access to hidden data. It can only use visible messages/context.
- Generate reply suggestions, not invites.

### Extension Chat UI Rules

The floating chat should:

- use the blue Reachlyst R logo in the header
- show person name and company/profile context line
- have minimize and close controls in the top-right
- minimize to a compact header
- fully close when close is clicked
- show copy buttons for assistant messages
- turn copy button into `Copied` state when clicked
- have `Generate invite` on lead/search pages
- have `Generate reply` on messages pages
- include `Send on Enter` as a switch: blue when enabled, gray when disabled
- keep AI suggestions manual-first

## Extension APIs

All extension API calls require `x-reachlyst-extension-token`.

Implemented extension routes:

- `POST /api/extension/auth/verify-token`
- `GET /api/extension/config`
- `POST /api/extension/search/detect`
- `POST /api/extension/search/import-leads`
- `GET /api/extension/search/[id]/statuses`
- `POST /api/extension/leads/upsert`
- `POST /api/extension/leads/action`
- `POST /api/extension/ai/analyze`
- `POST /api/extension/ai/generate-message`
- `POST /api/extension/ai/lead-chat`
- `POST /api/extension/messages/sync-thread`
- `POST /api/extension/parser/report`
- `GET/POST/DELETE /api/extension/token`

## AI Routes

- `app/api/ai-playbook/route.ts`: app-side AI Playbook load/save endpoint.
- `app/api/ai/lead-invite-chat/route.ts`: app-side lead invite chat.
- `app/api/ai/search-chat/route.ts`: app-side search chat.
- `app/api/extension/ai/analyze/route.ts`: extension AI fit analysis.
- `app/api/extension/ai/generate-message/route.ts`: extension message generation.
- `app/api/extension/ai/lead-chat/route.ts`: extension lead chat and profile/context reasoning.
- `lib/openai.ts`: OpenAI integration and mocked fallback when `OPENAI_API_KEY` is missing.
- `lib/store.ts`: `getAiPlaybook`, `saveAiPlaybook`, and `applyAiPlaybookToLeadInput` persist the trained playbook and inject it into extension AI prompts.

AI behavior:

- Suggest concise, human copy.
- Use AI Playbook context when available. Extension invite generation, reply chat, and fit analysis should all receive the central workspace playbook before OpenAI is called.
- Avoid fake personalization.
- Do not invent LinkedIn facts.
- Clearly separate visible context from inference.

## Supabase

Supabase helpers:

- `lib/supabase.ts`
- `lib/supabaseAuth.ts`
- `lib/store.ts`
- `lib/mockDb.ts`

Migrations:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_marketing_consent.sql`
- `supabase/migrations/003_extension_token_device_binding.sql`

Schema includes:

- profiles
- workspaces
- workspace members
- subscriptions
- extension tokens
- search campaigns
- leads
- lead campaigns
- AI analyses
- generated messages
- LinkedIn threads/messages as read-only synced context
- activities
- extension events
- parser reports

Never commit Supabase service role keys or database passwords.

## Marketing Website

Marketing website is a one-page landing page.

Main navigation anchors:

- Features
- Product
- How it works
- Pricing
- FAQ

Product screenshot assets:

- `public/product-screenshots/lead.png`
- `public/product-screenshots/messages.png`
- `public/product-screenshots/dashboard.png`

Marketing should explain:

- AI outreach assistant for LinkedIn Sales Navigator
- lead context chat
- invite generation
- reply suggestions
- AI Playbook
- extension setup
- usage controls
- manual-first safety

Avoid describing old saved-search/message-history workflows as the primary value prop.

## Design Rules

- Use IBM Plex Sans globally.
- Use Tailwind for app/marketing UI.
- Use blue Reachlyst R mark.
- Dark navy marketing background with blue accents.
- No horizontal overflow.
- Mobile responsive navigation is required.
- Blue buttons must keep white text on hover.
- Dashboard sidebar should be fixed and full height.
- Avoid decorative blobs/orbs.
- Use product UI/screenshots over generic abstract visuals.

## Cognee

Cognee is configured for development memory.

- Cognee Codex plugin installed from `topoteretes/cognee-integrations`.
- Hooks are enabled.
- Local plugin config lives outside repo in `~/.cognee-plugin/`.
- Cognee statusline should show `cognee: agent_sessions · cloud`.
- Use Cognee to remember product rules, engineering decisions, architecture, and open issues.
- Do not ingest secrets, private keys, `.env.local`, OAuth secrets, Stripe secrets, Supabase service role keys, or private LinkedIn data.

## Development Checks

Use these before shipping code:

```bash
pnpm typecheck
pnpm test:extension
pnpm build
```

For frontend changes, verify visually in browser across desktop and mobile.

For production:

- push to GitHub branch `dev`
- deploy with Vercel production when app behavior changes
- documentation-only Cognee changes do not require Vercel deploy
