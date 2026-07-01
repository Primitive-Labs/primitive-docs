# Agent Guide to Primitive App Secrets

Guidelines for AI agents managing credentials in Primitive apps. App secrets are the platform's server-side store for API keys, tokens, and other credentials referenced from backend config as `{{ secrets.KEY }}`. Values resolve only on the server — they never appear in the repo, client code, or anything shipped to users.

## CLI

```bash
primitive secrets set OPENAI_API_KEY --value sk-... --summary "OpenAI production key"
primitive secrets set OPENAI_API_KEY --value sk-new...    # same key = update in place
primitive secrets list                                     # keys + summaries; values never shown
primitive secrets delete OPENAI_API_KEY
```

- **Write-only**: a value can be overwritten or deleted but never read back. Always pass `--summary` so keys stay identifiable.
- **Per-app scope**: secrets belong to one app, so each environment (dev/staging/prod) keeps its own values — target with the global `--env <name>` flag or `--app <app-id>`.

## Where `{{ secrets.KEY }}` resolves

| Surface | Fields | When resolved |
|---|---|---|
| Integrations | `requestConfig.defaultHeaders`, `requestConfig.staticQuery` | Per request, when the proxy executes the call |
| Workflows | Any step-config template string; CEL contexts (`runIf`, `switch` `when`) expose `secrets.*` | Just before the step runs |
| Inbound webhooks | A webhook's `signingSecret` (a `{{secrets.KEY}}` reference — the tighter no-space form) | Server-side, immediately before HMAC verification of an incoming event. Referenced key must exist at create/update; **fails closed** with a `401` (`rejectionReason: secret_unresolved`) if unresolvable at delivery |
| Databases | Operation `access` / per-param `access` CEL; trigger stamp `value` CEL | When the operation executes (secrets load only when the expression references `secrets.`) |

There is no client-side surface: apps cannot read secret values through any API.

Integration templates only match uppercase keys — `{{secrets.MY_KEY}}` with `[A-Z][A-Z0-9_]`, max 64 chars. Stick to `UPPER_SNAKE_CASE` keys everywhere.

## Rules

1. **Never inline a credential in TOML** — config files are committed. Reference `{{ secrets.KEY }}` and set the value with the CLI.
2. **Resolve secrets in integration config, not workflow step config.** A workflow step's resolved config is recorded in the run's step output snapshots — a secret templated into `request.headers` becomes readable in run detail. Secrets in the integration's `defaultHeaders`/`staticQuery` resolve after that snapshot and stay invisible. (See the integrations guide.)
3. **Rotation is an overwrite**: `primitive secrets set KEY --value <new>` takes effect on the next resolution — no config push needed, since config references the key, not the value.
4. After changing which keys exist, re-check references: an unresolved `{{ secrets.MISSING }}` in a workflow renders the missing-path sentinel (or fails the step under `strict = true`); an integration header referencing a deleted key sends the unresolved placeholder upstream.

## Related guides

- **integrations** — the most common consumer (auth headers, static query params)
- **workflows** — `secrets.*` in the template/CEL context
- **databases** — `secrets.*` in operation access rules and trigger stamps
- **configuration** — the sync loop that carries secret-referencing TOML
