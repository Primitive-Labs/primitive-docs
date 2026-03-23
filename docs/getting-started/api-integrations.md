# API Integrations

Primitive lets you securely proxy requests to external APIs. You configure integrations with the CLI — Primitive stores your API keys server-side so your client code never sees credentials.

## Defining an Integration

Create a TOML config file for each external API:

```toml
# config/integrations/weather-api.toml
[integration]
name = "weather-api"
displayName = "Weather API"
baseUrl = "https://api.weather.com/v1"

[[integration.allowedPaths]]
path = "/forecast/*"
methods = ["GET"]

[[integration.allowedPaths]]
path = "/current"
methods = ["GET"]

[integration.headers]
X-API-Key = "{{ secrets.WEATHER_API_KEY }}"
```

### Key Configuration

- **`baseUrl`** — The external API's base URL
- **`allowedPaths`** — Whitelist of paths and HTTP methods your app can call (wildcards supported)
- **`headers`** — Static headers to include on every request; use <code>&#123;&#123; secrets.KEY &#125;&#125;</code> for credentials
- **`queryParams`** — Static query parameters to include on every request
- **`timeout`** — Request timeout in milliseconds

## Managing Secrets

```bash
# Add a secret (prompts for the value)
primitive integrations secrets add weather-api WEATHER_API_KEY

# List secrets for an integration
primitive integrations secrets list weather-api
```

Secrets are stored securely on the server and are never exposed to your client code.

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

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

const response = await client.integrations.call({
  integrationKey: "weather-api",
  method: "GET",
  path: "/forecast/san-francisco",
  query: { units: "metric" },
});

console.log(response.status);
console.log(response.body);
```

### POST Requests

```typescript
const response = await client.integrations.call({
  integrationKey: "crm-api",
  method: "POST",
  path: "/contacts",
  body: { email: "user@example.com", name: "Alice" },
});
```

### Error Handling

```typescript
import { isJsBaoError } from "js-bao-wss-client";

try {
  const response = await client.integrations.call({
    integrationKey: "crm-api",
    method: "POST",
    path: "/contacts",
    body: { email: "user@example.com" },
  });
} catch (error) {
  if (isJsBaoError(error)) {
    switch (error.code) {
      case "INTEGRATION_NOT_FOUND":
        console.error("Integration not configured");
        break;
      case "INTEGRATION_SECRET_MISSING":
        console.error("API credentials not set up");
        break;
      case "INTEGRATION_PROXY_FAILED":
        console.error("External API error:", error.details);
        break;
    }
  }
}
```

## Using Integrations in Workflows

Integrations can also be called as workflow steps:

```toml
[[steps]]
name = "fetch-weather"
type = "integration.call"
integrationKey = "weather-api"
method = "GET"
path = "/forecast/{{ input.city }}"
```

See [Workflows and Prompts](./workflows-and-prompts.md) for more on workflow steps.

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

- **[Workflows and Prompts](./workflows-and-prompts.md)** — Use integrations in automated workflows
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
