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

### primitive-app — Vue Integration Layer

**What it does:** A lightweight collection of Vue components and composables that make it easier to build apps with js-bao and js-bao-wss-client. It provides building blocks rather than a complete framework, giving you flexibility to structure your app however you want.

**Core:**
- `createPrimitiveApp` — Bootstrap function that sets up Vue, Pinia, router, and js-bao
- `useJsBaoDataLoader` — Composable for reactive data loading with automatic subscriptions
- `useUserStore` — Current user info, auth state, and user preferences

**Authentication Components:**
- `PrimitiveLogin` — Login page with email/passkey/OAuth support
- `PrimitiveLogout` — Logout handling
- `PrimitiveOauthCallback` — OAuth callback page
- `EditProfile` / `PasskeyManagement` — User profile management

**Document Components:**
- `PrimitiveDocumentSwitcher` — Dropdown for switching between documents
- `PrimitiveDocumentList` — Full document management table/list
- `PrimitiveShareDocumentDialog` — Dialog for sharing documents

**Shared Components:**
- `PrimitiveLoadingGate` — Show loading state while data loads
- `PrimitiveUserMenu` / `PrimitiveUserTabItem` — User avatar menus
- `PrimitiveMobileTabBar` — Mobile bottom navigation
- `DeleteConfirmationDialog` — Reusable delete confirmation

**Developer Tools:**
- Debug suite with document debugger and test runner

**Key point:** primitive-app is **entirely optional** and deliberately minimal. You can:
1. **Use the components** — Drop in auth, document, and utility components as needed
2. **Build your own UI** — Use js-bao-wss-client directly for document management
3. **Skip it entirely** — Use js-bao and js-bao-wss-client in any framework

::: tip Flexibility by Design
Unlike opinionated frameworks, primitive-app doesn't dictate your app structure, navigation, or layouts. You decide how to organize documents, build navigation, and structure pages. The components are building blocks you can compose however you want.
:::

::: warning Assumptions
primitive-app assumes you're using:
- **Vue 3** with Composition API
- **Pinia** for state management
- **Tailwind CSS** for styling
- **shadcn-vue** as the component library

If you're using a different stack, use js-bao and js-bao-wss-client directly.
:::

## Choosing Your Integration Level

| Approach | Use When | What You Get |
|----------|----------|--------------|
| **primitive-app + Template** | Starting fresh with Vue, want fastest setup | Bootstrap, components, data loader |
| **Components only** | Using Vue but want full control over structure | Pick specific components as needed |
| **Direct client** | Using React/Svelte/other, or need full control | Maximum flexibility |

### Using primitive-app (Template Approach)

```typescript
// main.ts
import { createPrimitiveApp } from "primitive-app";
import { getJsBaoConfig, getLogLevel } from "@/config/envConfig";
import App from "./App.vue";
import router from "./router/routes";

void createPrimitiveApp({
  mainComponent: App,
  router,
  jsBaoConfig: getJsBaoConfig(),
  logLevel: getLogLevel(),
});
```

### Using Components Selectively

```typescript
// Use specific components without taking everything
import {
  PrimitiveDocumentSwitcher,
  PrimitiveLoadingGate,
  useJsBaoDataLoader,
  useUserStore
} from "primitive-app";

// Build your own app structure using these building blocks
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
import { JsBaoClient } from "js-bao-wss-client";
import { Task } from "./models/Task";

const client = new JsBaoClient({
  apiUrl: "https://api.primitiveapi.com",
  wsUrl: "wss://api.primitiveapi.com",
  appId: "your-app-id",
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

