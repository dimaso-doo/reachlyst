# Reachlyst Current Cognee Handoff - 2026-06-29

This is the current source of truth for Reachlyst memory. It supersedes older
Cognee/project notes that mention IBM Plex Sans, dark marketing sections, saved
searches as a paid feature, metered lead scans, Scale as a visible package,
or AI Playbook exclusions/disqualifiers as a required setup field.

## Current Product Identity

Reachlyst is a manual-first AI outreach copilot for LinkedIn Sales Navigator.
It helps a user understand visible lead context, decide who is worth contacting,
and write better LinkedIn invites, replies, and follow-ups.

Reachlyst is not a LinkedIn automation bot, not a sender, not a credential
collector, and not a hidden scraping system.

Core product promise:

- train Reachlyst on the user's offer, ICP, buying signals, tone, and CTA
- use that training in the dashboard and browser extension
- help with lead fit, outreach angle, invite copy, replies, and follow-ups
- keep the user fully in control of what gets sent

Manual-first safety rules:

- do not auto-login to LinkedIn
- do not store LinkedIn credentials
- do not bypass LinkedIn limits
- do not auto-connect
- do not auto-send
- do not run hidden background scraping
- do not imply Reachlyst can see private or hidden LinkedIn data

The user reviews, edits, copies, pastes, and sends manually.

## Current Business Model

Reachlyst pricing is based on AI message capacity, not saved searches, lead
scans, or message-history storage.

Visible packages:

- Free: $0/month, full workflow access, limited to 300 AI messages
- Starter: $15/month, 1 seat, larger AI message allowance
- Growth: $29/month, 1 seat, highest standard AI message allowance

All standard packages should include the extension and the same core workflow.
The Free package should not be called a free trial. It is a free plan that stops
AI generation when the monthly AI message allowance is exhausted.

Additional seats can be offered as an add-on, but the visible package pricing
should communicate the base price for one seat.

Do not use these concepts as current billing language:

- searches
- saved searches
- lead scans as a paid limit
- workspace users as visible plan copy
- Scale as one of the three visible cards

Usage should be shown as AI message consumption in a format such as
`8 / 3,000`.

Super admin should be able to grant extra AI messages to users.

## Current AI Playbook

AI Playbook is the user's training area. It should feel like a friendly ally,
not a rigid form.

The readiness model should guide users toward 100% setup by collecting:

- offer
- ICP
- buying signals
- tone
- CTA

The Playbook should not ask for or display "exclusions", "who to skip", or
old disqualifier fields as required sections. Those older concepts may exist in
legacy code or old memory, but they are not current product UI.

The progress/readiness indicator should be subtle and space-efficient. Users
should understand that 85% means the extension can already help, but 100% means
they have filled the key training inputs well enough for stronger suggestions.

The AI should answer like a helpful outreach ally: clear, practical, friendly,
and specific. If it cannot browse the live internet, it should say so and ask
the user to paste context or use available page context.

## Current Dashboard And App

Main authenticated app areas:

- Dashboard
- AI Playbook
- Extension Setup
- Billing
- Settings
- Super Admin for privileged admins

Dashboard chat should be positioned as Reachlyst Ally: a friendly outreach
strategy assistant, not a strict command bot.

The sidebar should show remaining AI messages subtly, using the same
`used / limit` style as billing.

Login and signup should have a fixed top-left back-to-home button with a left
arrow.

Dashboard, login, billing, settings, and other app pages should use white or
off-white backgrounds, unless a dark area is specifically required.

Where a dark background is used, the Reachlyst logo should be fully white:
white icon and white text.

## Current Extension Behavior

The Chrome extension is part of every package, including Free. Free users keep
extension access but AI generation stops when their AI messages are exhausted.

On LinkedIn Sales Navigator lead/search pages:

- read visible context only
- show the Reachlyst logo/button near leads
- open a floating chat for the selected lead
- help assess fit and suggest outreach angles
- generate connection invite copy when appropriate

On LinkedIn or Sales Navigator messages:

- read visible conversation context when available
- generate reply and follow-up suggestions
- do not generate connection invites for accepted-message threads

The extension should use Inter, normal text weight 400, and a clean line-icon
visual style consistent with the logo.

The Send on Enter toggle in chat should stay stable at 40px width and keep the
white inner circle centered when toggled.

## Current Brand And Visual System

Use Inter everywhere. Normal text should be font-weight 400. Headings should
generally use font-weight 600.

The Reachlyst logo should use a dark wordmark and a blue icon on light
backgrounds. On dark backgrounds, both icon and wordmark should be white.

Current marketing direction:

- white/off-white section backgrounds
- no dark section backgrounds on the marketing page
- full-bleed sections from edge to edge
- wider responsive content than the old narrow container
- modern clean layout inspired by passion.io, but with Reachlyst content
- no duplicate "create workspace" box in the hero
- hero should feature a larger demo/video-style area
- hero blue blur/aurora should animate faster
- no overbearing decorative backgrounds

Current marketing page sections:

- Hero
- Features
- Product screenshots/use cases
- How it works
- Pricing
- FAQ

Features currently use four equal cards with simple static line icons. Do not
use the previously attempted animated/watermark backgrounds in feature cards.

Product screenshots should be balanced as three equal use-case/browser-style
cards, visually similar to the hero demo area. Avoid one huge screenshot and
two small ones.

How it works should have the heading on the left and cards on the right that
stack/reveal during scroll. The vertical space should be polished and not leave
too much empty distance before the next section.

H2 headings should have a more generous line-height than the compressed older
version.

## Current Copy And UX Decisions From Conversation

Do not use "Start free" if the product does not communicate a free trial. Use
language consistent with a permanent Free plan.

Free plan copy should make clear that the user gets the same workflow and
extension, limited by monthly AI messages.

Monthly AI messages can be reframed as outreach value, such as AI-powered
LinkedIn conversations, AI outreach messages, or AI-assisted replies/invites,
rather than cold technical quota copy.

Badges such as Current and Popular should be visually centered and should not
stack awkwardly.

Pricing cards should be equal height and should not look empty. Add concise
supporting copy where necessary.

Below the three visible plans, include a contact option for users who need more
AI messages or a larger setup.

## Current Stack

The project is a Next.js App Router application with TypeScript and Tailwind,
plus a Chrome Manifest V3 extension.

Core services/integrations:

- Supabase for auth/data
- Stripe for billing
- OpenAI for AI behavior
- Vercel for deployment
- Cognee for development memory

The local development URL is usually:

```text
http://localhost:3000
```

Useful routes:

- `/`
- `/login`
- `/signup`
- `/app`
- `/app/ai-playbook`
- `/app/billing`
- `/app/settings`
- `/app/admin`

## What Older Cognee Memory Should Treat As Stale

The following older memory items should be ignored unless the user explicitly
asks to revisit them:

- IBM Plex Sans as the global font
- dark marketing page backgrounds
- dark navy as the dominant marketing look
- searches or saved searches as current package value
- lead scans as a visible paid limit
- Scale as one of the three visible pricing cards
- AI Playbook exclusions/disqualifiers as a required field
- old messaging that makes Reachlyst sound like scraping or automation
- old feature-card animated backgrounds/watermarks

## Current Verification Snapshot

Recent local checks passed after the latest homepage cleanup:

- `pnpm typecheck`
- `pnpm test:extension`
- `pnpm build`

Recent browser verification showed:

- hero aurora animation duration around 7 seconds
- feature animated elements removed
- four feature cards with static icon boxes
- three balanced product use-case cards
- no horizontal overflow

