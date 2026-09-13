# Meatlink Analytical Engine

A guarded Codex agent runner that researches public beef-market signals and creates bilingual Meatlink sourcing-insight drafts.

The engine uses Meatlink's authenticated MCP server and Codex's web research. It deliberately excludes all Meatlink marketplace inventory, order, RFQ, user, buyer, vendor, private-location, and internal-price data.

## What it does

1. Checks existing insights to prevent duplicates.
2. Retrieves public FAOSTAT/USDA context through Meatlink.
3. Verifies current Indonesian signals against primary official sources.
4. Records and reviews traceable public-market observations.
5. Produces equivalent Bahasa Indonesia and English articles.
6. Creates unpublished drafts for an administrator to review.

Preview mode is the default and performs no database writes.

## Requirements

- Node.js 22 or newer
- Codex CLI installed and signed in
- Meatlink MCP configured with the exact non-redirecting URL
- A Meatlink account authorized to create market-insight drafts

## Setup

```powershell
npm install
codex mcp add meatlink --url https://meatlink.id/mcp
codex mcp login meatlink
```

Complete the Meatlink OAuth consent in your browser. Never paste a Meatlink password, OAuth token, or Supabase service-role key into this repository.

Verify the connection:

```powershell
codex mcp list
```

The `meatlink` row must show `enabled` and `OAuth`.

## Run safely

Preview two proposed articles without writing:

```powershell
npx --no-install tsx src/index.ts --dry-run --regions="Jawa Timur,Sulawesi Selatan" --period="September 2026"
```

Create two unpublished drafts:

```powershell
npx --no-install tsx src/index.ts --write --regions="Jawa Timur,Sulawesi Selatan" --count=2 --period="September 2026"
```

For the default two regions, `npm run preview` and `npm run generate -- --write` are convenient shortcuts.

Supported options:

- `--regions`: comma-separated Indonesian provinces or market regions
- `--count`: number of articles, from 1 to 10 and no larger than the region list
- `--period`: article period label
- `--dry-run`: explicit preview mode
- `--write`: allow verified public observations and draft insight writes

Environment overrides:

- `MEATLINK_REGIONS`
- `MEATLINK_ARTICLE_COUNT`
- `MEATLINK_MCP_NAME` (default: `meatlink`)
- `CODEX_CLI_PATH`

## Automation boundary

This runner is suitable for a local Codex automation on a machine whose Meatlink OAuth session is available. The included GitHub Actions workflow runs tests only.

Do not schedule draft generation on a hosted GitHub runner using a superadmin password, Supabase `service_role` key, or copied short-lived OAuth token. Fully unattended cloud execution should wait for a dedicated, revocable, least-privilege Meatlink service-authentication mechanism.

If a run reports `OAuth refresh failed`, reconnect locally with `codex mcp login meatlink` before retrying. The engine detects this condition and stops instead of continuing with incomplete market data.

## Development

```powershell
npm run check
```
