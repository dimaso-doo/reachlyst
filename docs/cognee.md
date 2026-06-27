# Cognee Development Memory

Reachlyst is configured to use Cognee through Codex MCP as a development memory layer.

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

## Start Cognee

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

