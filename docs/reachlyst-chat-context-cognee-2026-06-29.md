# Reachlyst Chat Context For Cognee - 2026-06-29

This file compresses the recent Codex/User conversation into durable product
memory for Cognee. It is not a verbatim chat export, and it intentionally
omits secrets, credentials, private LinkedIn data, and generated build output.

## Conversation Direction

The user wanted to continue Reachlyst from a Cognee handoff, align local files
with the last good online/Vercel/Supabase version, and then polish the product
step by step toward launch.

The user speaks Serbian/BCS during product work. The preferred collaboration
style is direct, iterative, and practical: make the change, verify locally, and
report when done.

## Major Decisions Made In This Chat

### Font And Typography

The old font felt too clumsy. The user chose Inter everywhere.

Current typography:

- use Inter globally
- body text weight 400
- headings around 600
- dashboard chat and extension chat should also use Inter
- normal text in chats should stay 400 weight

### Marketing Page Direction

The user liked the modern feel of passion.io and asked to redesign Reachlyst
in that spirit while keeping Reachlyst's existing text/content.

Design decisions:

- use white/off-white backgrounds and shades of white
- remove dark marketing section backgrounds
- navigation should also be light
- sections should be full-width from edge to edge
- content container can remain for readability, but sections themselves should
  not look cut off on the left
- widen the marketing page container/responsive content area
- add faster moving blue blur/aurora animation in the hero
- keep design modern, clean, and not overdecorated

The user rejected feature-box background animations and asked for simpler cards.
Final direction:

- remove animated backgrounds/watermarks from feature boxes
- use simple static line icons
- keep feature cards equal and clean
- product screenshots/use cases should be visually balanced, not one huge card
  plus two smaller ones

### How It Works Section

The user wanted:

- title on the left
- cards on the right
- cards that load/stack on scroll
- more vertical spacing between stack cards at first
- then less excess space before the next section
- smaller card titles, text, and icons
- stronger H2 line-height overall

### Hero And Demo Area

The user noticed duplicated "create workspace" content and asked to remove the
right-side hero box entirely.

The hero should instead use a larger video/demo-like element that communicates
LinkedIn Sales Navigator plus an AI chat that recommends whom to contact and
how.

### Logo And Icons

The user supplied a Reachlyst SVG logo from:

```text
/Users/ps/Desktop/Sotonici_Dokumenti/reachlyst_logo.svg
```

Logo direction:

- on light backgrounds: dark wordmark and blue icon
- on dark backgrounds: icon and text fully white
- replace logo everywhere: marketing navigation, dashboard, extension, and the
  small icon beside leads in Sales Navigator
- icons should be line icons and visually consistent with the logo

### Auth Pages

The user asked for a Back button from login/register/signup to home.

Final direction:

- fixed top-left button on the whole screen
- left arrow icon
- goes to `/`
- not inside the auth card

### Billing And Packages

The user wanted a Free plan, but clarified there is no "free trial".

Final package model:

- Free: $0, permanent free plan, 300 AI messages
- Starter: $15
- Growth: $29
- only three visible pricing cards
- contact block under the plans for users who need more

Free must include the extension and the same workflow as paid packages. The AI
stops when the user runs out of messages.

The user asked to remove searches from packages because searches are a leftover
from the old idea. Lead scans should also be removed as visible billing limits
if they do not consume real AI resources.

Current metering:

- focus on AI messages
- show usage as `used / limit`, e.g. `8 / 3,000`
- sidebar should show remaining/used AI messages subtly
- super admin should be able to add extra AI messages to users

The user asked that pricing cards have aligned heights, centered badges, better
copy so they do not feel empty, and "Unlimited" copy stacked cleanly.

### AI Playbook And Training Readiness

The user asked whether AI Playbook can have a progress bar that estimates when
AI is trained enough for the extension to work well.

Final direction:

- use a subtle readiness/progress indicator
- avoid taking too much vertical space
- help users understand how to reach 100%
- guide them to fill offer, ICP, buying signals, tone, and CTA
- remove "exclusions" entirely from the user-facing Playbook experience

The user asked what "Extension ready 85%" means. The intended answer:

- the extension can already help, but quality improves as training context is
  completed
- 100% should feel attainable by filling the key context sections

### AI Behavior And UX

The dashboard AI felt too stiff. The user wants it to be freer and more like a
friendly ally.

Current AI behavior goals:

- friendly, clear, practical
- less robotic confirmation
- concise welcome text
- ready to start training
- better pacing so answers do not feel instant and hard to follow
- if live website browsing is unavailable, the AI should say it cannot browse
  and ask for pasted context or use available data

The user observed wrong answers when asking the AI to inspect dimaso.co. The
likely reason is that the AI was not actually online/browsing, so it should not
pretend it checked a site.

### Extension And Dashboard Chat

The user asked:

- use Inter in dashboard chat and extension chat
- text should be weight 400
- Send on Enter toggle should be 40px wide
- when clicked, the white circle must stay centered and not jump

### Admin And Super Admin

The user asked for links to marketing, admin, and super admin, and asked how to
reach super admin.

Important routes:

- `/`
- `/app`
- `/app/admin`
- `/app/billing`
- `/app/ai-playbook`
- `/login`
- `/signup`

Super admin should have the white logo wherever the background is dark.

### Current Development Practice

The user wants changes pushed and organized when ready, but before pushing or
making final commits, preserve the last known good online version and avoid
losing working state.

When verifying UI, use localhost:

```text
http://localhost:3000
```

Current checks that should be run after substantial code edits:

- `pnpm typecheck`
- `pnpm test:extension`
- `pnpm build`

## Stale Concepts From Earlier Memory

Cognee should downgrade or ignore these old ideas:

- IBM Plex Sans
- dark navy marketing as dominant style
- saved searches
- metered searches
- metered lead scans
- old Scale visible package card
- workspace users as main package copy
- exclusions/disqualifiers as required AI Playbook UI
- feature-card background animations
- "Start free" copy if it implies a trial instead of the permanent Free plan

