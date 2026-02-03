# Primitive Stack Overview

Understanding how the Primitive libraries fit together will help you make the most of the platform. This page explains the three main packages and how they interact.

## The Three Libraries

### js-bao — The Data Layer

**What it does:** js-bao is the ORM (Object-Relational Mapper) for interacting with your data. It handles:

- **Model definitions** — Define schemas for your data types (Task, Project, User, etc.)
- **CRUD operations** — Create, read, update, and delete records
- **Queries** — Filter, sort, paginate, and aggregate data
- **Local database** — All data lives in an in-browser database for instant access

```typescript
// js-bao is pure JavaScript - works anywhere
import { defineModelSchema, BaseModel } from "js-bao";

const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    completed: { type: "boolean", default: false },
  },
});

export class Task extends BaseModel {
  static schema = taskSchema;
}

// Query and manipulate data
const tasks = await Task.query({ completed: false });
```

---

### js-bao-wss-client — The Backend Connection

**What it does:** The client library manages all interaction with the Primitive backend:

- **Authentication** — OAuth flows, token management, offline auth
- **Document management** — Open, close, sync, and share documents
- **Real-time sync** — Keep local data in sync with the server and other users
- **Blob storage** — Upload and download files
- **LLM/AI** — Proxy requests to language models
- **Analytics** — Track events and usage
- **Integrations** — Proxy calls to third-party APIs

```typescript
// js-bao-wss-client is also pure JavaScript
import { JsBaoClient } from "js-bao-wss-client";

const client = new JsBaoClient({
  apiUrl: "https://api.primitiveapi.com",
  wsUrl: "wss://api.primitiveapi.com",
  appId: "your-app-id",
  models: [Task, Project],
});

// Open a document
await client.documents.open(documentId);

// List available documents
const documents = await client.documents.list();

// Make an LLM call
const reply = await client.llm.chat({
  messages: [{ role: "user", content: "Hello!" }],
});
```

---

### primitive-app — Client Service & Dev Tools

**What it does:** primitive-app provides two key things for Vue apps:

**1. JsBao Client Service** — A singleton service for initializing and accessing the js-bao-wss-client:
- `initializeJsBao(config)` — Initialize the client with your app configuration
- `jsBaoClientService` — Access the shared client instance throughout your app

**2. Developer Tools** — A Vite plugin that provides development utilities:
- **Document Explorer** — Inspect and manage documents and records
- **Test Harness** — Run browser-based tests for your app

```typescript
// Initialize the client (in main.ts)
import { initializeJsBao } from "primitive-app";

initializeJsBao({
  appId: import.meta.env.VITE_APP_ID,
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  models: [Task, Project],
});

// Add dev tools to vite.config.ts
import { primitiveDevTools } from "primitive-app/vite";

export default defineConfig({
  plugins: [
    vue(),
    primitiveDevTools({
      appName: "My App",
      testsDir: "src/tests",
    }),
  ],
});
```

### primitive-app-template — Starter Project

**What it provides:** The [primitive-app-template](https://github.com/Primitive-Labs/primitive-app-template) is a complete starter project that includes everything you need to build a Primitive app:

- **Stores** — `useUserStore`, `useSingleDocumentStore`, `useMultiDocumentStore`
- **Composables** — `useJsBaoDataLoader`, `useTheme`
- **Auth Components** — Login, logout, OAuth callback, profile management
- **Document Components** — Document list, switcher, sharing dialog
- **Shared Components** — Loading gates, user menus, dialogs
- **Router** — Auth-guarded routing with `createPrimitiveRouter`

**Key point:** These are **your code to own and modify**. Unlike a library, you copy the template and have full control over every file. This gives you maximum flexibility to customize the app to your needs.

::: tip Start from the Template
For new projects, use the template as your starting point. It provides a production-ready foundation with all the Vue integration already set up.
:::

::: warning Assumptions
The template assumes you're using:
- **Vue 3** with Composition API
- **Pinia** for state management
- **Tailwind CSS** for styling
- **shadcn-vue** as the component library

If you're using a different stack, use js-bao and js-bao-wss-client directly.
:::

## Choosing Your Integration Level

| Approach | Use When | What You Get |
|----------|----------|--------------|
| **Template** | Starting fresh with Vue, want fastest setup | Full app structure, stores, components, data loader |
| **Direct client** | Using React/Svelte/other, or need full control | Maximum flexibility |

### Using the Template (Vue)

The template gives you a complete app structure with local copies of all Vue integration code:

```typescript
// main.ts - standard Vue/Pinia setup
import { createApp } from "vue";
import { createPinia } from "pinia";
import { initializeJsBao } from "primitive-app";
import App from "./App.vue";
import router from "./router/routes";
import { getJsBaoConfig } from "./config/envConfig";
import { useUserStore } from "./stores/userStore";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  
  // Initialize the shared client
  initializeJsBao(getJsBaoConfig());
  
  // Initialize user store
  const userStore = useUserStore();
  await userStore.initialize();
  
  app.use(router);
  app.mount("#app");
}

bootstrap();
```

The template includes stores and composables as local files you own and can modify:

```typescript
// Use your local stores and composables
import { useUserStore } from "@/stores/userStore";
import { useJsBaoDataLoader } from "@/composables/useJsBaoDataLoader";
import { PrimitiveLoadingGate } from "@/components/shared/PrimitiveLoadingGate.vue";

const user = useUserStore();

const { data, initialDataLoaded } = useJsBaoDataLoader({
  subscribeTo: [Task],
  documentReady,
  loadData: async () => {
    const result = await Task.query({ completed: false });
    return { tasks: result.data };
  },
});
```

### Direct Client (Any Framework)

```typescript
// Works in React, Svelte, vanilla JS, etc.
import { initializeClient } from "js-bao-wss-client";
import { Task } from "./models/Task";

const client = await initializeClient({
  apiUrl: "https://api.primitiveapi.com",
  wsUrl: "wss://api.primitiveapi.com",
  appId: "your-app-id",
  oauthRedirectUri: "http://localhost:5173/oauth/callback",
  models: [Task],
});

// Handle auth, documents, and UI yourself
client.on("authStateChanged", (event) => { /* update your UI */ });
await client.documents.open(documentId);
```

## Data Flow

Here's how data flows through the stack:

1. **Your code** creates/queries data using js-bao models
2. **js-bao** reads/writes to the local in-browser database
3. **js-bao-wss-client** syncs changes to the Primitive backend
4. **Backend** broadcasts changes to other connected clients
5. **Other clients** receive updates via js-bao-wss-client
6. **Their js-bao** updates their local database
7. **Their UI** reflects the changes

All of this happens automatically once set up. You just work with your models and let the sync happen in the background.

## Next Steps

- **[Starting with the Template App](./template-app.md)** — Get running with the full stack
- **[Working with Data](./working-with-data.md)** — Learn js-bao in depth
- **[Other Services](./other-services.md)** — Explore blobs, LLM, and more

