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
- **`requestConfig.defaultHeaders`** — Headers sent on every request; use <code>&#123;&#123; secrets.KEY &#125;&#125;</code> for credentials
- **`requestConfig.staticQuery`** — Query parameters appended to every request

## Referencing Secrets in Integrations

Credentials live in your app's secrets store. Reference one from the integration config with <code>&#123;&#123; secrets.KEY &#125;&#125;</code> — for example, an API key in a default header:

```toml
[requestConfig.defaultHeaders]
Authorization = "Bearer {{ secrets.WEATHER_API_KEY }}"
```

The value resolves server-side when the request is proxied and is never exposed to your client code. Set and manage the value with `primitive secrets set` — see [App Secrets](./app-secrets.md) for the full management workflow.

## Syncing Configuration

```bash
# Initialize config directory
primitive sync init --dir ./config

# Push integration config to server
primitive sync push --dir ./config

# Test the integration
primitive integrations test weather-api
```

## Calling from Your App

::: code-group

```typescript [JavaScript]
const response = await client.integrations.call({
  integrationKey: "weather-api",
  method: "GET",
  path: "/forecast/san-francisco",
  query: { units: "metric" },
});
console.log(response.status, response.body);
```

```swift [Swift]
let response = try await client.integrations.call(IntegrationCallRequest(
  integrationKey: "weather-api",
  method: "GET",
  path: "/forecast/san-francisco",
  query: ["units": "metric"]
))
```

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

## Next Steps

- **[Workflows](./workflows.md)** — Call integrations from a pipeline with the `integration.call` step
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
