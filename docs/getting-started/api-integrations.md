# API Integrations

Primitive lets you securely proxy requests to external APIs. You configure integrations with the CLI — Primitive stores your API keys server-side so your client code never sees credentials.

## Defining an Integration

Create a TOML config file for each external API:

```toml
# config/integrations/weather-api.toml
[integration]
key = "weather-api"
displayName = "Weather API"
status = "active"

[requestConfig]
baseUrl = "https://api.weather.com/v1"
allowedMethods = ["GET"]
allowedPaths = ["/forecast/*", "/current"]

[requestConfig.defaultHeaders]
X-API-Key = "{{secrets.WEATHER_API_KEY}}"
```

### Key Configuration

- **`integration.key`** — Unique identifier your app uses to call the integration
- **`integration.status`** — Integrations start as `draft`; set `"active"` to make them callable from clients
- **`integration.timeoutMs`** — Request timeout in milliseconds
- **`requestConfig.baseUrl`** — The external API's base URL
- **`requestConfig.allowedMethods`** / **`requestConfig.allowedPaths`** — Whitelist of HTTP methods and paths your app can call (trailing-`*` wildcards supported)
- **`requestConfig.defaultHeaders`** — Headers sent on every request; use <code>&#123;&#123; secrets.KEY &#125;&#125;</code> for credentials or <code>&#123;&#123; vars.KEY &#125;&#125;</code> for non-secret values
- **`requestConfig.staticQuery`** — Query parameters appended to every request

## Referencing Secrets and Vars

Credentials live in your app's secrets store; non-secret config values live in its [vars store](./app-secrets.md#config-vars). Reference either from the integration config the same way — <code>&#123;&#123; secrets.KEY &#125;&#125;</code> or <code>&#123;&#123; vars.KEY &#125;&#125;</code> — for example, an API key in a default header and a non-secret account ID in a query param:

```toml
[requestConfig.defaultHeaders]
Authorization = "Bearer {{secrets.WEATHER_API_KEY}}"

[requestConfig.staticQuery]
account = "{{vars.ACCOUNT_ID}}"
```

Both resolve server-side when the request is proxied and are never exposed to your client code. They diverge in two ways worth knowing: a <code>&#123;&#123; secrets.KEY &#125;&#125;</code> reference is checked when you save the integration — naming a secret that doesn't exist fails the save — while a <code>&#123;&#123; vars.KEY &#125;&#125;</code> reference isn't validated at save time, so a nonexistent var just leaves the literal placeholder unresolved at call time. And request previews and logs redact any value that resolved from a secret, but never one that resolved from a var — vars aren't secret, so they stay visible. Set and manage values with `primitive secrets set` / `primitive vars set`; see [App Secrets](./app-secrets.md) for the full management workflow.

## Syncing Configuration

```bash
# Initialize config directory
primitive sync init

# Push integration config to server
primitive sync push

# Test the integration
primitive integrations test weather-api
```

## Calling from Your App

::: code-group

<<< ../../examples/integrations/integration-call-get.ts#example{ts} [JavaScript]

<<< ../../examples/integrations/integration-call-get.swift#example{swift} [Swift]

:::

### POST Requests

::: code-group

<<< ../../examples/integrations/integration-call.ts#example{ts} [JavaScript]

<<< ../../examples/integrations/integration-call.swift#example{swift} [Swift]

:::

### Error Handling

Failed calls throw a typed error — branch on its code:

::: code-group

<<< ../../examples/integrations/integration-call-errors.ts#example{ts} [JavaScript]

<<< ../../examples/integrations/integration-call-errors.swift#example{swift} [Swift]

:::

## CLI Reference

```bash
primitive integrations list              # List all integrations
primitive integrations create my-api     # Create an integration
primitive integrations get my-api        # View integration details
primitive integrations update my-api     # Update an integration
primitive integrations delete my-api     # Delete an integration
primitive integrations test my-api       # Test the integration
primitive integrations logs my-api       # View recent call logs
```

## The Inbound Half: Webhooks

An integration is the **outbound** half — your app calling a third-party API. Most real integrations also need the **inbound** half: a webhook the provider calls when something happens on their side (a payment succeeds, a repo is pushed), which triggers a workflow. The two are configured separately — the outbound call here, the inbound webhook as a [webhook trigger](./workflows.md#via-inbound-webhooks) on a workflow, with signature verification. Integrating a service like Stripe or GitHub usually means setting up both.

## Next Steps

- **[Workflows](./workflows.md)** — Call integrations from a pipeline with the `integration.call` step, and trigger workflows from [inbound webhooks](./workflows.md#via-inbound-webhooks)
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
