# JsBaoClientService

Singleton service for managing the JsBaoClient instance in primitive-app.

This service provides a centralized way to initialize, access, and manage
the JsBaoClient throughout your application. It ensures only one client
instance exists and handles lazy initialization.

## Usage

### Initialization (at app startup)

```ts
import { initializeJsBao } from 'primitive-app';

initializeJsBao({
  appId: import.meta.env.VITE_APP_ID,
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  models: [Task, Project], // Your js-bao models
});
```

### Accessing the client

```ts
import { jsBaoClientService } from 'primitive-app';

// In an async context:
const client = await jsBaoClientService.getClientAsync();
const docs = await client.documents.list();
```

### During logout

```ts
await jsBaoClientService.clearClient();
```
