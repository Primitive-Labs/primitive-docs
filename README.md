# primitive-docs — MOVED

The docs **source** now lives in the [`js-bao-wss`](https://github.com/Primitive-Labs/js-bao-wss) monorepo under [`primitive-docs/`](https://github.com/Primitive-Labs/js-bao-wss/tree/main/primitive-docs) (consolidated in Primitive-Labs/js-bao-wss#1708).

- **Published docs site:** https://primitive-labs.github.io/primitive-docs-site
- **Agent guides** (`primitive guides get`): served from [`Primitive-Labs/primitive-docs-site`](https://github.com/Primitive-Labs/primitive-docs-site) (`main` = production, `alpha` = alpha channel).

This repository is **archived**. Its raw `guides/...` URLs are intentionally preserved (not deleted) so released CLIs (`primitive-admin` ≤ 1.0.55) that fetch guides from `raw.githubusercontent.com/Primitive-Labs/primitive-docs/<branch>/guides/...` keep working against the frozen content. New work happens in the monorepo.