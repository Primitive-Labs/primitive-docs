# Environment Variables

Primitive apps use Vite environment variables (prefixed with `VITE_`) for configuration. These are defined in `.env` (development) and `.env.production` (production) files.

## Required Variables

### `VITE_APP_ID`

- **Type**: `string`
- **Purpose**: Your Primitive App ID from the admin console.
- **Example**: `VITE_APP_ID=01KFEV1VGXA12625JEQKNDAXVH`

### `VITE_API_URL`

- **Type**: `string`
- **Purpose**: The Primitive API server URL.
- **Development**: `https://js-bao-wss-test.adriangraham.workers.dev`
- **Production**: `https://primitiveapi.com`

### `VITE_WS_URL`

- **Type**: `string`
- **Purpose**: The Primitive WebSocket server URL for real-time sync.
- **Development**: `wss://js-bao-wss-test.adriangraham.workers.dev`
- **Production**: `wss://primitiveapi.com`

### `VITE_OAUTH_REDIRECT_URI`

- **Type**: `string`
- **Purpose**: The OAuth callback URL for your app. Must match what's configured in the Primitive Admin console and your OAuth provider.
- **Development**: `http://localhost:5173/oauth/callback`
- **Production**: `https://your-domain.com/oauth/callback`

### `VITE_BASE_URL`

- **Type**: `string`
- **Purpose**: Base URL for your application. Used for generating links in document invitations and other places.
- **Development**: `http://localhost:5173`
- **Production**: `https://your-domain.com`

## Optional Variables

### `VITE_ENABLE_AUTH_PROXY`

- **Type**: `"true" | "false"`
- **Default**: `"false"`
- **Purpose**: Enable the OAuth proxy for production deployments. Typically disabled for development and enabled in production.

### `VITE_LOG_LEVEL`

- **Type**: `"debug" | "info" | "warn" | "error"`
- **Default**: `"info"`
- **Purpose**: Controls the logging verbosity. Your app reads this and passes it to `createPrimitiveApp({ logLevel })`.
- **Recommendation**: Use `"info"` or `"debug"` for development, `"warn"` for production.


