# Reachlyst

Read-only LinkedIn Sales Navigator assistant and outreach logbook.

Reachlyst helps users work faster while they stay in control. It does not automate LinkedIn actions: no LinkedIn auto-login, no password storage, no headless browser, no automatic connect, no automatic send, no background scraping, and no bypassing LinkedIn limits.

## Products in this repo

- Next.js SaaS app with App Router, TypeScript, CSS Modules, Framer Motion, Supabase, Stripe, and OpenAI scaffolds.
- Chrome Extension Manifest V3 for visible-page Sales Navigator assistance and read-only message syncing.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

If your shell does not have Node installed, use the Codex bundled runtime or install Node 20+ and pnpm.

## Environment

Add real keys when ready:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_GROWTH_PRICE_ID`
- `STRIPE_EARLY_ADOPTER_COUPON_ID`
- `EARLY_ADOPTER_COUPON_CODE`
- `EARLY_ADOPTER_COUPON_ENABLED`
- `SHOW_DEMO_LOGIN`
- `OPENAI_API_KEY`
- `EXTENSION_TOKEN_PEPPER`

The MVP returns clean mocked data when external keys are missing.

Private demo login is hidden by default. Use `/login?demo=1` locally, or set `SHOW_DEMO_LOGIN=true`.
For early adopters, create a 100% off Stripe coupon, set `STRIPE_EARLY_ADOPTER_COUPON_ID`, then toggle `EARLY_ADOPTER_COUPON_ENABLED=true`.

## Supabase

Run the SQL migration in `supabase/migrations/001_initial_schema.sql`.

The schema includes:

- Workspace isolation with RLS.
- Profiles, workspaces, members, subscriptions, extension tokens.
- Search campaigns, leads, many-to-many `lead_campaigns`.
- AI analyses, generated messages, read-only LinkedIn threads/messages.
- Activities, extension events, parser reports.
- Lead dedupe by `(workspace_id, normalized_linkedin_url)`.

Configure Supabase Auth providers:

- Email/password.
- Google OAuth.

### Production setup helper

After creating a Supabase project, export the required values and run:

```bash
export SUPABASE_ACCESS_TOKEN=your-supabase-access-token
export SUPABASE_PROJECT_REF=your-project-ref
export SUPABASE_DB_PASSWORD=your-database-password
export NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export OPENAI_API_KEY=optional-openai-key
export EXTENSION_TOKEN_PEPPER=change-me-to-a-long-random-secret

./scripts/setup-production.sh
```

The script logs in to Supabase, links the project, pushes migrations, adds Vercel environment variables, and redeploys production. Do not commit these values.

## Stripe

The billing page and `lib/stripe.ts` are scaffolded for Starter, Pro, and Agency plans. Add Stripe price IDs to `.env.local`, then wire checkout and customer portal routes from the existing plan keys.

## OpenAI

`lib/openai.ts` returns mocked analysis without `OPENAI_API_KEY`. With a key present, `/api/extension/ai/analyze` calls OpenAI and returns:

- `fit`: `good_fit`, `maybe`, or `skip`
- short reason
- confidence score
- suggested connection message

## Extension API

All extension calls require the `x-reachlyst-extension-token` header.

Implemented routes:

- `POST /api/extension/auth/verify-token`
- `GET /api/extension/config`
- `POST /api/extension/search/detect`
- `POST /api/extension/search/import-leads`
- `GET /api/extension/search/[id]/statuses`
- `POST /api/extension/leads/upsert`
- `POST /api/extension/leads/action`
- `POST /api/extension/ai/analyze`
- `POST /api/extension/ai/generate-message`
- `POST /api/extension/messages/sync-thread`
- `POST /api/extension/parser/report`

## Chrome extension installation

1. Start the web app with `pnpm dev`.
2. Open Chrome Extensions: `chrome://extensions`.
3. Enable Developer Mode.
4. Choose "Load unpacked".
5. Select the `extension` folder.
6. Open the Reachlyst extension popup.
7. Set API base to `http://localhost:3000`.
8. Paste an extension token from the Reachlyst settings page.
9. Manually open LinkedIn Sales Navigator or LinkedIn Messaging.

The extension never asks for LinkedIn credentials and never stores LinkedIn credentials.

## Safe manual LinkedIn workflow

1. User logs into LinkedIn directly.
2. User manually browses Sales Navigator.
3. Reachlyst reads only visible lead cards and visible threads.
4. Reachlyst adds status badges and a small action button.
5. User may request AI analysis and copy a suggested message.
6. User manually clicks Connect, manually pastes, and manually sends inside LinkedIn.
7. Reachlyst may detect visible user actions and log activity.
8. Reachlyst stores outreach history in its own database.

Reachlyst does not add any LinkedIn send box and cannot send LinkedIn messages.

## Development checks

```bash
pnpm typecheck
pnpm test:extension
pnpm build
```

## GitHub repository

Requested repository:

- Name: `reachlyst`
- Description: `Read-only LinkedIn Sales Navigator assistant and outreach logbook`
- Visibility: private
- Branches: `main` and `dev`
- Active development branch: `dev`

If GitHub CLI is installed and authenticated:

```bash
gh repo create reachlyst --private --description "Read-only LinkedIn Sales Navigator assistant and outreach logbook" --source=. --remote=origin --push
git push -u origin dev
```

If GitHub CLI is not authenticated:

```bash
gh auth login
```

If GitHub CLI is missing:

```bash
brew install gh
gh auth login
```
