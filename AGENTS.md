# Meatlink Analytical Engine guardrails

- Use only public external market information and primary official sources.
- Never access or disclose Meatlink internal inventory, stock, orders, RFQs, prices, users, buyer/vendor identities, or private locations.
- Never infer a current provincial beef price from CPI, unrelated food inflation, national figures, or historical statistics.
- Every insight must have equivalent Bahasa Indonesia and English title/body fields.
- Record source URL, publication/observation date, unit, geographic scope, and limitations.
- Check for duplicate observations and insights before writes.
- `create_market_insight` may create drafts only. Never publish automatically.
- Never store OAuth tokens, passwords, API keys, Supabase service-role keys, or copied credentials in this repository or logs.

