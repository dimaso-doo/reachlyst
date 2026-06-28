# Reachlyst Handoff - 2026-06-28

This handoff captures the useful context from the Codex session on this computer so another computer can continue without needing local Codex chat history.

## Repository State

- Repository: `https://github.com/dimaso-doo/reachlyst.git`
- Active branch: `dev`
- Latest pushed commit before this handoff: `5282cbe Remove placeholder blog page`
- Local working tree was clean before this handoff file was added.

To continue on another computer:

```bash
git clone https://github.com/dimaso-doo/reachlyst.git
cd reachlyst
git checkout dev
git pull origin dev
```

## What Was Done In This Session

- Confirmed the repo is the Reachlyst Next.js app plus Chrome MV3 extension.
- Confirmed `dev` is the active development branch.
- Removed the placeholder `/blog` page because it was only a "coming soon" shell.
- Removed the `Blog` link from the marketing footer.
- Updated Cognee-facing docs so Blog is not treated as a required public footer link until real blog content exists.
- Ran `pnpm typecheck` successfully after adding the Codex bundled Node runtime to `PATH`.
- Committed and pushed the cleanup to GitHub:
  - `5282cbe Remove placeholder blog page`

## Current Product Direction

Reachlyst is a manual-first LinkedIn Sales Navigator assistant, not a LinkedIn sender or automation bot.

Core safety rules:

- Do not auto-login to LinkedIn.
- Do not store LinkedIn credentials.
- Do not bypass LinkedIn limits.
- Do not auto-connect.
- Do not auto-send.
- Do not run hidden background scraping.
- The user reviews, copies, edits, pastes, and sends manually.

Main app areas:

- Dashboard
- AI Playbook
- Extension Setup
- Billing
- Settings/profile
- Super admin overview

The public marketing/footer should include product sections, Pricing, FAQ, Privacy Policy, Terms, and Refund Policy. Do not show Blog until there is real content.

## Cognee Status On This Computer

Cognee is documented in:

- `docs/cognee.md`
- `docs/reachlyst-cognee-seed.md`
- `docs/reachlyst-conversation-memory.md`
- `docs/reachlyst-codebase-map.md`

But this computer does not currently have working Cognee credentials or MCP:

- Missing `~/.codex/cognee-cloud.env`
- Missing `~/.cognee-plugin/config.json`
- Missing `~/.cognee-plugin/api_key.json`
- No `COGNEE_*` env variables found
- `codex mcp list` showed only `node_repl`
- `http://localhost:8000/mcp` did not respond
- Cognee plugin was not installed in this Codex app environment

The previous Cognee setup likely existed only on another computer. To restore it here, copy one of these from the other computer or configure them again:

```bash
~/.codex/cognee-cloud.env
```

or:

```bash
~/.cognee-plugin/config.json
~/.cognee-plugin/api_key.json
```

Then start Cognee MCP or use the REST fallback documented in `docs/cognee.md`.

## LinkedIn Outreach Memory To Add To Cognee Later

The user asked to add a new long-term Cognee memory for LinkedIn outreach. It was not successfully added to real Cognee Cloud because this computer lacks Cognee credentials and an LLM API key.

Dataset name:

```text
reachlyst_linkedin_outreach
```

Suggested node set:

```text
reachlyst, linkedin, outreach, agency_icp, webdev_support_offer
```

Memory summary:

- This is not a LinkedIn sender.
- Do not automate sending LinkedIn invites.
- If 12 LinkedIn connection invites have already been sent today, do not send more that day.
- In that case, prepare messages for tomorrow.
- Prepared messages must not be treated as sent until the user explicitly confirms sending.
- The user reviews, copies, edits, and sends manually.

Target ICP:

- Marketing agencies
- Niche marketing agencies
- Growth marketing companies
- Digital marketing companies
- Boutique marketing agencies
- Advertising and marketing agencies

Offer positioning:

- The user runs a web development/support team helping agencies with white-label WordPress/CMS support, website maintenance, fixes, and overflow development.

Copy style:

- English
- Direct, low-friction, professional
- Short
- No hard sell
- No call request inside the invite
- No long personalization
- No overexplaining

Default invite template:

```text
Hi {FirstName}, I run a web development/support team helping {specific agency type} with white-label WordPress/CMS support, website maintenance, fixes, and overflow development. Thought it would be useful to connect.
```

Approved leads from the current list:

- Adam Loveridge
- Courtney Kostelecky
- Osvaldo Rodriguez
- Larry Deutsch
- Martha Bartlett Piland

Skip for now:

- Franziska Pugh
- Benjamin Rosenfield
- Atishay Jain

Note:

- Atishay Jain was already seen earlier and is not a priority.

Future lead review decision rule:

1. Prefer founders, owners, partners, directors, or senior operators at marketing, advertising, growth, digital, niche, or boutique agencies.
2. Approve leads where the agency likely needs white-label WordPress/CMS support, maintenance, fixes, or overflow development.
3. Generate a short invite using the default template.
4. If the daily send count is already 12, mark the lead as "prepare for tomorrow" instead of "send today."
5. Skip duplicates, previously reviewed low-priority people, and leads that do not clearly match the agency ICP.

## Attempted Cognee Import

A temporary venv was created at:

```bash
/tmp/reachlyst-cognee-venv
```

The installed Cognee package was older and exposed:

- `cognee.add`
- `cognee.cognify`
- `cognee.search`

It did not expose:

- `cognee.remember`
- `cognee.recall`
- `cognee.serve`

Attempted fallback:

```python
await cognee.add(memory, dataset_name="reachlyst_linkedin_outreach")
await cognee.cognify(["reachlyst_linkedin_outreach"])
```

Result:

- `add` loaded data into the temporary local Cognee package database.
- `cognify` failed with `LLM API key is not set.`
- This should not be treated as successful Cloud import.

## Useful Next Steps

1. On the other computer, pull `dev` and read this file.
2. Restore Cognee credentials there or export them here.
3. Add the LinkedIn outreach memory above to Cognee Cloud.
4. Push any updated Cognee docs or memory snapshots back to GitHub.
5. Continue product work from `dev`, not `main`.

