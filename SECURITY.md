# Security

## Credentials

This repository intentionally contains no Meatlink, Supabase, USDA, FAOSTAT, or OpenAI credentials. Authentication is delegated to the local Codex OAuth vault.

Never commit:

- Meatlink account passwords
- OAuth access or refresh tokens
- Supabase secret or `service_role` keys
- API keys or personal access tokens

If a credential is accidentally committed, revoke and rotate it before removing it from Git history.

## Write boundary

Preview mode is the default. Database writes require `--write`, are limited to public observation records/reviews and unpublished market-insight drafts, and remain subject to Codex approval review.

