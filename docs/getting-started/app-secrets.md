# App Secrets

Your app's server-side configuration needs credentials — API keys for LLM providers, tokens for external services, signing secrets. **App secrets** are the platform's server-side store for them: set a value once with the CLI, reference it from server-side config as <span v-pre>`{{ secrets.KEY }}`</span>, and the value resolves on the server. Secrets never appear in your repo, your client code, or anything shipped to users.

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

Server-side config refers to a secret as <span v-pre>`{{ secrets.KEY }}`</span>, resolved at the moment the config runs:

| Surface | Where secrets resolve |
|---|---|
| [API Integrations](./api-integrations.md) | `requestConfig.defaultHeaders` and `requestConfig.staticQuery` — resolved when the request is proxied |
| [Workflows](./workflows.md) | Step config templates and CEL expressions (`runIf`), via the `secrets.*` context variable |
| [Databases](./working-with-databases.md) | CEL access expressions on operations and trigger stamp values can read `secrets.*` |

For example, an integration authenticates with a header that names the secret:

```toml
# config/integrations/openai.toml
[requestConfig.defaultHeaders]
Authorization = "Bearer {{secrets.OPENAI_API_KEY}}"
```

## Keep Secrets Server-Side

The point of the store is that secret values only ever exist where the server resolves them:

- **Never inline credentials in TOML** — config files are committed to your repo. Reference <span v-pre>`{{ secrets.KEY }}`</span> instead.
- **Keep credentials in integration config, not workflow steps** — a workflow step's resolved config is recorded on the run, so a secret passed through `request.headers` would appear in step output snapshots. Resolution inside the integration's `defaultHeaders` happens after that snapshot, where it stays invisible. See [`integration.call`](./workflows.md#integration-call).
- **Clients can't read secrets** — there is no client API for secret values; apps only ever see the results of server-side calls that used them.

## Next Steps

- **[API Integrations](./api-integrations.md)** — The most common secret consumer: authenticated calls to external APIs
- **[Workflows](./workflows.md)** — Reference secrets from step templates
- **[Configuring Primitive Services](./configuring-primitive-services.md)** — The sync loop your secret-referencing config travels through
