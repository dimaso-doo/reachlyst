# Cognee Development Memory

Reachlyst is configured to use Cognee through Codex MCP as a development memory layer.

## Current status

Cognee Cloud credentials are stored locally outside the repository:

```bash
~/.codex/cognee-cloud.env
```

That file is intentionally not committed. It should contain:

```bash
export COGNEE_BASE_URL="https://your-tenant.aws.cognee.ai"
export COGNEE_SERVICE_URL="https://your-tenant.aws.cognee.ai"
export COGNEE_API_KEY="your-cognee-api-key"
```

The Cloud API connection has been verified against the `default_dataset`, and the Reachlyst memory seed has been stored as a Cognee session entry.

## Codex MCP config

Cognee has been added to the global Codex config:

```toml
[mcp_servers.cognee]
url = "http://localhost:8000/mcp"
```

Codex reads this from:

```bash
~/.codex/config.toml
```

After starting Cognee, restart Codex Desktop or reload the MCP tools so the `cognee` tools become available in new sessions.

## Start Cognee MCP

Cognee must be running on:

```bash
http://localhost:8000/mcp
```

Useful checks:

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
curl -i http://localhost:8000/mcp
codex mcp list
```

When Cognee is healthy, `codex mcp list` should show:

```text
cognee  http://localhost:8000/mcp  enabled
```

For Cognee Cloud, the local MCP server should be started with the Cloud service URL and API key loaded from the local env file:

```bash
set -a
. ~/.codex/cognee-cloud.env
set +a
cognee-mcp --transport http --port 8000
```

If using `uvx`, the equivalent command is:

```bash
set -a
. ~/.codex/cognee-cloud.env
set +a
uvx cognee-mcp --transport http --port 8000
```

If `cognee-mcp` fails to install because of Python build dependencies, use the Cloud REST API flow below until the local MCP package is fixed.

## Cognee Cloud REST fallback

The Cognee Cloud API can be used directly for memory operations:

```bash
set -a
. ~/.codex/cognee-cloud.env
set +a

curl -s "$COGNEE_BASE_URL/api/v1/datasets/" \
  -H "X-Api-Key: $COGNEE_API_KEY"
```

Store a development session entry:

```bash
curl -X POST "$COGNEE_BASE_URL/api/v1/remember/entry" \
  -H "X-Api-Key: $COGNEE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"type":"qa","question":"Reachlyst context","answer":"..."},"dataset_name":"default_dataset","session_id":"codex-reachlyst"}'
```

## What to store

Use Cognee for durable product and engineering context that should survive across sessions:

- Reachlyst business model and pricing decisions
- extension behavior on Sales Navigator search, lead, and messages pages
- dashboard navigation and billing rules
- AI Playbook assumptions
- brand and design rules
- Supabase, Stripe, Vercel, OpenAI integration decisions
- known bugs, tradeoffs, and product decisions

Do not store secrets, API keys, user credentials, Stripe secrets, Supabase service role keys, OAuth secrets, or private LinkedIn data.

## Initial memory seed

The initial Reachlyst project memory lives in:

```bash
docs/reachlyst-cognee-seed.md
```

Once Cognee is running, ingest that file into the default Reachlyst dataset or ask Codex to remember it through Cognee.
