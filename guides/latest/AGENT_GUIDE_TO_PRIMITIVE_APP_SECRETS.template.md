# Agent Guide to Primitive App Secrets

Guidelines for AI agents managing credentials in Primitive apps. App secrets are the platform's server-side store for API keys, tokens, and other credentials referenced from backend config as `{{secrets.KEY}}`. Values resolve only on the server — they never appear in the repo, client code, or anything shipped to users. **Config vars** (below) are the non-secret twin of the same mechanism.

## CLI

```bash
primitive secrets set OPENAI_API_KEY --value sk-... --summary "OpenAI production key"
primitive secrets set OPENAI_API_KEY --value sk-new...    # same key = update in place
primitive secrets list                                     # keys + summaries; values never shown
primitive secrets delete OPENAI_API_KEY
```

- **Write-only**: a value can be overwritten or deleted but never read back. Always pass `--summary` so keys stay identifiable.
- **Per-app scope**: secrets belong to one app, so each environment (dev/staging/prod) keeps its own values — target with the global `--env <name>` flag or `--app <app-id>`.

## Where `{{secrets.KEY}}` resolves

| Surface | Fields | When resolved |
|---|---|---|
| Integrations | `requestConfig.defaultHeaders`, `requestConfig.staticQuery` | Per request, when the proxy executes the call |
| Workflows | Any step-config template string; CEL contexts (`runIf`, `switch` `when`) expose `secrets.*` | Just before the step runs |
| Inbound webhooks | A webhook's `signingSecret` | Server-side, immediately before HMAC verification of an incoming event. Referenced key must exist at create/update; **fails closed** with a `401` (`rejectionReason: secret_unresolved`) if unresolvable at delivery |
| Databases | Operation `access` / per-param `access` CEL; trigger stamp `value` CEL | When the operation executes (secrets load only when the expression references `secrets.`) |

Write the reference without inner spaces — `{{secrets.KEY}}`, uppercase key, max 64 chars. Integration and webhook fields resolve exactly that form (a spaced `{{ secrets.KEY }}` is left as literal text there); workflow step templates additionally accept the spaced form.

**The CEL `secrets.*` variable is declared-only.** In a CEL expression (workflow `runIf` / `switch` `when`, a database operation or per-param `access` rule, a trigger stamp `value`), `secrets.*` binds **only** the keys the owning config declares in a top-level `secrets = ["KEY", ...]` manifest — on the database or collection type config, or the workflow definition. An undeclared `secrets.KEY` is absent at evaluation, so a rule that reads it denies closed. The `{{secrets.KEY}}` template form (the rows above) is unaffected: it resolves any set key.

There is no client-side surface: apps cannot read secret values through any API.

Integration templates only match uppercase keys — `{{secrets.MY_KEY}}` with `[A-Z][A-Z0-9_]`, max 64 chars. Stick to `UPPER_SNAKE_CASE` keys everywhere.

## Rules

1. **Never inline a credential in TOML** — config files are committed. Reference `{{secrets.KEY}}` and set the value with the CLI.
2. **Resolve secrets in integration config, not workflow step config.** A workflow step's resolved config is recorded in the run's step output snapshots — a secret templated into `request.headers` becomes readable in run detail. Secrets in the integration's `defaultHeaders`/`staticQuery` resolve after that snapshot and stay invisible. (See the integrations guide.)
3. **Rotation is an overwrite**: `primitive secrets set KEY --value <new>` takes effect on the next resolution — no config push needed, since config references the key, not the value.
4. After changing which keys exist, re-check references: an unresolved `{{secrets.MISSING}}` in a workflow renders the missing-path sentinel (or fails the step under `strict = true`); an integration header referencing a deleted key sends the unresolved placeholder upstream.

## Config Vars

The non-secret twin of app secrets: same key format (`^[A-Z][A-Z0-9_]{0,63}$`), same 2 KB value cap, same 100-per-app limit, same declared-only CEL binding — minus masking. Use a var for a plaintext app-wide scalar a rule needs to compare against (a platform-assigned group ID, say); use a secret for anything that grants access to an external system.

```bash
primitive vars set ADMIN_GROUP_ID --value grp_01ABC --summary "Admins group id"
primitive vars list          # values ARE shown — vars are not secret
primitive vars delete ADMIN_GROUP_ID
```

Declare a var for CEL access the same way as a secret, in the owning config's top-level manifest:

```toml
vars = ["ADMIN_GROUP_ID"]
```

A rule reads it as `vars.<KEY>`, bound only to declared keys — an undeclared `vars.KEY` is absent at evaluation (denies closed), exactly like `secrets.*`. Vars bind everywhere `secrets.*` does: workflow CEL contexts (`runIf`, `switch` `when`, predicate expressions on batch/collect steps), database operation `access`/per-param `access`, and trigger stamp `value` expressions — forwarded to the same evaluation sites `secrets.*` reaches, including a database's trigger CEL on the DO. There is no `{{vars.KEY}}` template-resolution form (vars are CEL-only, unlike secrets which also resolve in integration/webhook templates) and no client-side read API — `primitive vars list`/the admin API are the only read surfaces.

## Related guides

- **integrations** — the most common secret consumer (auth headers, static query params)
- **workflows** — `secrets.*` / `vars.*` in the template/CEL context
- **databases** — `secrets.*` / `vars.*` in operation access rules and trigger stamps
- **configuration** — the sync loop that carries secret- and var-referencing TOML
