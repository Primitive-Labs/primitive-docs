# App Secrets

Your app's server-side configuration needs credentials — API keys for LLM providers, tokens for external services, signing secrets. **App secrets** are the platform's server-side store for them: set a value once with the CLI, reference it from server-side config as <span v-pre>`{{secrets.KEY}}`</span>, and the value resolves on the server. Secrets never appear in your repo, your client code, or anything shipped to users.

## Managing Secrets

```bash
# Create or update a secret
primitive secrets set OPENAI_API_KEY --value sk-... --summary "OpenAI production key"

# List secrets (values are never shown)
primitive secrets list

# Delete a secret
primitive secrets delete OPENAI_API_KEY
```

Secrets are write-only: once set, a value can be overwritten or deleted but never read back — `list` shows keys and summaries only. Use `--summary` so you can tell keys apart later.

Secrets are scoped to an app, so each of your [environments](./primitive-cli.md#named-environments) (dev, staging, production) keeps its own values — set the production key with `--env prod` and the development key with `--env dev`.

## Referencing Secrets

Server-side config refers to a secret as <span v-pre>`{{secrets.KEY}}`</span>, resolved at the moment the config runs:

| Surface | Where secrets resolve |
|---|---|
| [API Integrations](./api-integrations.md) | `requestConfig.defaultHeaders` and `requestConfig.staticQuery` — resolved when the request is proxied |
| [Workflows](./workflows.md) | Step config templates and CEL expressions (`runIf`), via the `secrets.*` context variable |
| [Inbound webhooks](./workflows.md#via-inbound-webhooks) | A webhook's `signingSecret` — resolved server-side when an incoming event is verified |
| [Databases](./working-with-databases.md) | CEL access expressions on operations and trigger stamp values can read `secrets.*` |

::: warning The CEL `secrets.*` variable is declared-only
The <span v-pre>`{{secrets.KEY}}`</span> template form (integration headers, webhook `signingSecret`, step-config templates) resolves any secret you have set. The `secrets.*` variable **in a CEL expression** — a workflow `runIf`, a database operation's access rule, or a trigger's stamp value — binds only the secrets that config **declares**. List them in the owning config's TOML (a database or collection type config, or a workflow definition):

```toml
secrets = ["STRIPE_KEY"]
```

An undeclared `secrets.KEY` is absent when the rule evaluates, so a rule that reads it denies. Declare every secret a CEL rule needs.
:::

For example, an integration authenticates with a header that names the secret:

```toml
# config/integrations/openai.toml
[requestConfig.defaultHeaders]
Authorization = "Bearer {{secrets.OPENAI_API_KEY}}"
```

## Keep Secrets Server-Side

The point of the store is that secret values only ever exist where the server resolves them:

- **Never inline credentials in TOML** — config files are committed to your repo. Reference <span v-pre>`{{secrets.KEY}}`</span> instead.
- **Keep credentials in integration config, not workflow steps** — a workflow step's resolved config is recorded on the run, so a secret passed through `request.headers` would appear in step output snapshots. Resolution inside the integration's `defaultHeaders` happens after that snapshot, where it stays invisible. See [`integration.call`](./workflows.md#integration-call).
- **Clients can't read secrets** — there is no client API for secret values; apps only ever see the results of server-side calls that used them.

## Config Vars

Not every server-side value is a credential. **Config vars** are the non-secret twin of app secrets: the same key format, the same per-app limit, and the same declare-and-bind path into CEL rules — but the values are plaintext. Use a var for something like a platform-assigned group ID that a rule needs to compare against; use a secret for anything that grants access to an external system.

```bash
# Create or update a var
primitive vars set ADMIN_GROUP_ID --value grp_01ABC --summary "Admins group id"

# List vars (values are shown — vars are not secret)
primitive vars list

# Delete a var
primitive vars delete ADMIN_GROUP_ID
```

Unlike secrets, vars are readable: `list` shows every value, and a var may appear unmasked in debug traces. Never store a credential in a var. Vars (like secrets) can also be managed from the [Admin Console](./admin-console.md), where their values display in plain text.

## Syncing Config Vars

Unlike secrets — which never appear in TOML — config vars are part of the [sync loop](./configuring-primitive-services.md#the-sync-loop): `primitive sync pull` writes every var to a flat `vars.toml` at the root of the sync directory, sibling to `app.toml`:

```toml
# Per-environment non-secret config vars.
# Bind as {{ vars.KEY }} in workflow/integration config and vars.* in CEL rules.
# Values are checked into the repo and NOT secret — never put a credential
# here; use `primitive secrets` for that.

ADMIN_GROUP_ID = "grp_01ABC"
API_HOST = "https://api.example.com"
```

Edit `vars.toml` and run `primitive sync push` to apply changes: a changed value upserts, and removing a key from the file deletes that var on the server. `primitive sync diff` reports added, removed, and modified vars like any other synced entity. If a var changed on the server since your last pull — someone edited it from the Admin Console, say — `sync push` reports a conflict for that key and exits without applying the change; re-pull to reconcile, or pass `--force` to overwrite the server unconditionally.

## Referencing Vars

Beyond the CEL path below, a var also resolves as a template — the same <span v-pre>`{{ vars.KEY }}`</span> form as <span v-pre>`{{secrets.KEY}}`</span>, everywhere a secrets template resolves: integration `defaultHeaders`/`staticQuery` and workflow step config. See [API Integrations](./api-integrations.md#referencing-secrets-and-vars) for the integration-template usage.

::: tip Vars are visible where secrets are hidden
A var resolved into a template is never redacted — logs and request previews show its value, since vars aren't secret. And a <span v-pre>`{{vars.KEY}}`</span> reference to a var key that doesn't exist isn't checked when you save the config; it's left as a literal unresolved placeholder at call time, unlike a <span v-pre>`{{secrets.KEY}}`</span> reference to a missing secret, which fails the save.
:::

::: warning The CEL `vars.*` variable is declared-only
A CEL rule reads a var as `vars.<KEY>`, bound only to the keys the owning config **declares** — the same declared-only discipline as `secrets.*`. List them in the owning config's TOML alongside any declared secrets:

```toml
vars = ["ADMIN_GROUP_ID"]
```

An undeclared `vars.KEY` is absent when the rule evaluates, so a rule that reads it denies.
:::

A rule then reads the declared var like any other CEL variable:

```toml novalidate
access = "isMemberOf('team', vars.ADMIN_GROUP_ID)"
```

## Next Steps

- **[API Integrations](./api-integrations.md)** — The most common secret and var consumer: authenticated calls to external APIs
- **[Workflows](./workflows.md)** — Reference secrets and vars from step templates
- **[Configuring Primitive Services](./configuring-primitive-services.md)** — The sync loop your secret- and var-referencing config travels through
