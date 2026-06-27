# Reachlyst Conversation Memory

This document captures the extended product and engineering decisions from the Reachlyst build conversation. It is intended for Cognee memory and must not contain secrets, API keys, OAuth secrets, private LinkedIn data, or payment credentials.

## Product Identity

Reachlyst is an AI outreach assistant for LinkedIn Sales Navigator. It is not a LinkedIn automation bot, not a CRM replacement, and not a scraping system. Its value is helping a user make better manual outreach decisions while they stay in control.

Core promise:

- understand visible Sales Navigator lead context
- help decide whether a lead is relevant
- generate concise connection invite suggestions
- generate reply and follow-up suggestions on accepted-message threads
- train a workspace-level AI Playbook from the user's business context
- manage extension access, billing, package usage, and admin visibility

Manual-first constraints:

- never auto-login to LinkedIn
- never store LinkedIn credentials
- never bypass LinkedIn limits
- never auto-connect
- never auto-send
- never run hidden background scraping
- never imply that Reachlyst can see hidden/private LinkedIn data

The user reviews, edits, copies, pastes, and sends manually.

## Business Model Decisions

The product moved away from saved searches and message history as paid-feature language. Pricing should be described around:

- AI replies/suggestions
- lead scans
- extension access
- AI Playbook
- seats/workspace users

Current public packages:

- Starter: 15 USD/month, 1,000 AI replies/month, Chrome extension access, Sales Navigator lead context helper, AI Playbook training, 1 seat.
- Growth: 29 USD/month, 3,000 AI replies/month, 3,000 lead scans/month, 1 seat, priority AI Playbook refinement.
- Scale: 49 USD/month, 10,000 AI replies/month, 10,000 lead scans/month, up to 3 workspace users.

The pricing should feel affordable for a Chrome extension and lightweight AI assistant. Earlier ideas around 49 USD for the entry plan were considered too high.

Stripe is used for subscriptions and checkout. Reachlyst needs Terms and Conditions, Privacy Policy, and Refund Policy because it accepts payment.

## Authentication And Credentials

Google login works through OAuth/session handling. Reachlyst does not collect or store the user's Google password. The browser remains logged in through secure session cookies or tokens managed by the auth provider.

LinkedIn credentials are never requested. The extension only uses visible page context from the user's own browser session.

## Dashboard Decisions

Main user navigation:

- Dashboard
- AI Playbook
- Extension Setup
- Billing
- Profile/settings via user area

Removed or deprioritized nav items:

- Leads
- Messages
- Searches
- old Billing/Profile sidebar clutter where inappropriate

Dashboard should show:

- current package/trial state
- usage progress bars for plan limits
- animated progress bars and counters
- extension setup status
- AI Playbook training status
- CTA to billing where relevant

Profile/settings should stay basic:

- user name
- email
- optional phone number
- simple account details

Outreach behavior should not live in Profile; it belongs in AI Playbook.

Admin page should be visible only as an app admin/super admin area and focus on:

- number of users
- users list
- current plan/package per user
- amount paid so far
- package period/end date
- monthly revenue
- monthly costs
- monthly net
- strongest/top subscribers

Admin should not include unnecessary sidebar items.

## Extension Setup, Tokens, Seats

Extension tokens are not the same thing as seats.

- A seat is a paid workspace user allowance.
- An extension token is a device/extension access credential for connecting a browser extension to a workspace.

One token should not allow unlimited unpaid usage by everyone. The system should support controlled token access and device binding. Once generated, a token should remain visible until revoked, with copy and revoke actions. The dashboard should not show confusing counts such as "8 active tokens" unless the product explains what they mean. The preferred flow is one clear active token/connection key with copy and revoke.

## Chrome Extension Behavior

The extension has different behavior depending on page type.

On Sales Navigator leads/searches:

- parse visible lead cards
- show a blue Reachlyst R action button aligned with LinkedIn action icons
- open floating Reachlyst chat for the selected lead
- generate connection invite suggestions
- allow profile/fit analysis when the user asks
- use visible Sales Navigator context and AI Playbook context
- if profile context is visible, use it to assess Good fit / Maybe / Skip and suggest relevant outreach angles
- keep the user in control

On LinkedIn/Sales Navigator messages:

- parse visible message threads
- treat selected person as an accepted connection
- open floating chat in the bottom-right
- use visible conversation context to generate replies or follow-ups
- do not say "I cannot see the conversation" when conversation context is actually present
- generate reply suggestions, not connection invites

Extension chat UI rules:

- use the blue Reachlyst R logo
- show only person name and company/profile context line where available
- include minimize and close controls in the top-right
- minimize to a compact header
- close fully when close is clicked
- assistant message copy button should change to "Copied" after click
- Send on Enter should be a switch, blue when on and gray when off
- on lead/search pages button text should fit invite generation
- on message pages button text should fit reply generation

## AI Playbook

AI Playbook is the central training layer for extension AI behavior. It should be a real conversation, not a static form or generic confirmation.

It should learn:

- what the user sells
- who the ideal lead is
- role, industry, company size, geography
- good-fit signals
- maybe-fit signals
- skip/disqualifier rules
- tone
- words and styles to avoid
- CTA preference
- connection invite style
- accepted-connection reply style
- follow-up style
- examples of good and bad leads

Once trained, AI Playbook should show Ready/Trained status. It is persisted in the backend through `/api/ai-playbook` and stored in the `ai_playbooks` table. Extension AI routes should inject this central playbook into invite generation, reply chat, and lead analysis.

The Playbook chat should guide the user to useful conclusions by asking one strong next question at a time and summarizing concrete rules. It should avoid generic replies like "great, captured this" unless it includes actual practical conclusions.

## AI Behavior

The AI must be allowed to discuss and analyze a lead when the user asks for profile analysis, fit, relevance, or better outreach angle. It should not be artificially limited to only rewriting a message.

Allowed in scope:

- lead fit analysis
- visible profile context analysis
- visible conversation/thread analysis
- invite copy
- reply copy
- follow-up copy
- outreach tone
- personalization boundaries
- "why this lead is relevant or not"
- suggestions for better targeting

Not allowed:

- auto-send
- auto-connect
- scraping hidden/private data
- pretending to know facts not visible
- unrelated general chatbot behavior

AI should say when confidence is limited because only basic card context is available.

## Marketing Site

Marketing page should be a one-page site with navigation anchors:

- Features
- Product screenshots
- How it works
- Pricing
- FAQ

Marketing should use real screenshots of extension states and dashboard where possible so buyers understand the product.

Hero should clearly say Reachlyst is an AI outreach assistant for LinkedIn Sales Navigator. It should avoid language suggesting automation.

Feature language should include:

- Lead context chat
- Invite generation
- Reply suggestions
- AI Playbook
- Extension setup
- Usage controls
- Search workflow support
- Manual-first safety

Marketing, dashboard, and app should use IBM Plex Sans.

Footer should link to Privacy Policy, Terms and Conditions, Refund Policy, Blog, Pricing, FAQ, and product sections.

The product should have a clean 404 page.

## Legal Pages

Because Reachlyst accepts Stripe payments, it needs:

- Terms and Conditions
- Privacy Policy
- Refund Policy

Legal text should cover:

- subscription billing
- cancellation
- refund review window
- Stripe processing
- AI output disclaimers
- manual-first LinkedIn responsibility
- no LinkedIn credential storage
- Google OAuth/session behavior
- visible page context
- AI processing
- marketing email consent
- data retention
- security

Legal pages are product drafts and should be reviewed by counsel.

## Design Preferences

Use Tailwind for frontend styling. Avoid mixed/old styling that creates inconsistent layouts.

UI should be practical, modern, and not overly decorative. Avoid huge unnecessary cards in dashboard tools. Buttons should keep readable hover states and not turn gray text on blue hover.

Switches should be compact and aligned, not oversized checkboxes.

Progress bars should animate left-to-right on load and counters should count up.

Sidebar in app should be fixed, full height, and responsive for smaller screens.

Logo should use the blue Reachlyst R mark consistently in favicon, dashboard, login, marketing, and extension chat/action buttons.

## Current Engineering Architecture

Stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- OpenAI
- Vercel
- Chrome Extension Manifest V3

Important routes:

- `/app/dashboard`
- `/app/ai-playbook`
- `/app/extension`
- `/app/billing`
- `/app/admin`
- `/api/ai-playbook`
- `/api/ai-playbook/chat`
- `/api/extension/ai/analyze`
- `/api/extension/ai/generate-message`
- `/api/extension/ai/lead-chat`
- `/api/extension/token`
- `/api/stripe/checkout`
- `/api/stripe/portal`
- `/api/stripe/webhook`

Important storage:

- `ai_playbooks` for central AI Playbook
- `extension_tokens` for extension connection/device binding
- subscriptions and usage logic for plan limits
- generated messages and AI analyses for suggestion logs

Cognee is used as development memory for product and engineering context. Do not store secrets in Cognee.
