# JsBaoClientService

Singleton service for managing the JsBaoClient instance.

This service provides a centralized way to initialize, access, and manage
the JsBaoClient throughout your application. It ensures only one client
instance exists and handles lazy initialization.

## Usage

### Initializing at App Startup

Call `initializeJsBao` once at application startup (typically in `main.ts`) before mounting your app:

```ts
import { createApp } from "vue";
import { initializeJsBao, setPrimitiveAppLogLevel } from "primitive-app";
import App from "./App.vue";
import { allModels } from "@/models";

async function bootstrap() {
  // Optional: Set log level for debugging
  setPrimitiveAppLogLevel("debug");

  // Initialize js-bao with your configuration
  initializeJsBao({
    appId: import.meta.env.VITE_APP_ID,
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
    oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    models: allModels,
    auth: {
      persistJwtInStorage: true,
    },
  });

  const app = createApp(App);
  app.mount("#app");
}

bootstrap();
```

### Configuration Options

Required fields:
- `appId` - Your application ID from the Primitive Admin console
- `apiUrl` - The API endpoint URL (e.g., `https://api.primitive.dev`)
- `wsUrl` - The WebSocket endpoint URL (e.g., `wss://ws.primitive.dev`)
- `oauthRedirectUri` - The OAuth callback URL for your app
- `models` - Array of all js-bao model classes your app uses

Optional fields:
- `auth.persistJwtInStorage` - Whether to persist auth tokens in localStorage (default: `false`)
- `auth.refreshProxy` - Configuration for token refresh proxy (for enhanced security)
- `logLevel` - Client logging level
- `blobUploadConcurrency` - Max concurrent blob uploads

### Accessing the Client

After initialization, use `jsBaoClientService` to access the client:

```ts
import { jsBaoClientService } from "primitive-app";

// Get the client instance (creates it if needed)
const client = await jsBaoClientService.getClientAsync();

// Use client methods
await client.auth.signIn();
const docs = await client.documents.list();
```

### Environment Variables

Set these in your `.env` file:

```
VITE_APP_ID=your-app-id
VITE_API_URL=https://api.primitive.dev
VITE_WS_URL=wss://ws.primitive.dev
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_LOG_LEVEL=warn
```
