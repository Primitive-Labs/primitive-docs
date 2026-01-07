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
import { defineModelSchema, BaseModel, attachAndRegisterModel } from "js-bao";

const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    completed: { type: "boolean", default: false },
  },
});

class Task extends BaseModel {}
attachAndRegisterModel(Task, taskSchema);

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
import { initializeClient } from "js-bao-wss-client";

const client = await initializeClient({
  apiUrl: "https://api.primitiveapi.com",
  wsUrl: "wss://api.primitiveapi.com",
  appId: "your-app-id",
  models: [Task, Project],
});

// Open a document
const { doc } = await client.documents.open(documentId);

// Upload a file
const blobs = client.document(documentId).blobs();
await blobs.upload(fileData, { filename: "photo.jpg" });

// Make an LLM call
const reply = await client.llm.chat({
  messages: [{ role: "user", content: "Hello!" }],
});
```

---

### primitive-app — Vue Integration Layer

**What it does:** A collection of Pinia stores and Vue components that make it easier to build apps with js-bao and js-bao-wss-client:

**Stores (reactive state):**
- `useUserStore` — Current user, auth state, preferences
- `useSingleDocumentStore` / `useMultiDocumentStore` — Document management
- `useAppConfigStore` — App configuration
- `useNavigationStore` — Sidebar and navigation state
- `useBreadcrumbsStore` — Breadcrumb trail

**UI Components:**
- Authentication — Login, logout, OAuth callback handling
- Navigation — Sidebar, bottom nav, user menu, breadcrumbs
- Documents — Document switcher, sharing dialog, management UI
- Layouts — App shell, login layout, static page layout

**Router Helpers:**
- Auth guards — Protect routes based on authentication
- Breadcrumb generation — Automatic breadcrumb trails from route metadata

**Key point:** primitive-app is **entirely optional**. You can:
1. **Use everything** — Stores, components, and layouts for the fastest start
2. **Use only stores** — Get reactive state without our UI components
3. **Use selectively** — Pick specific components (e.g., just the auth flow)
4. **Skip it entirely** — Use js-bao and js-bao-wss-client directly in any framework

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
| **Full primitive-app** | Starting fresh with Vue, want fastest setup | Stores + UI + routing helpers |
| **Stores only** | Using Vue but want custom UI | Reactive state, no UI opinions |
| **Direct client** | Using React/Svelte/other, or need full control | Maximum flexibility |

### Full primitive-app (Template Approach)

```typescript
// main.ts
import { createPrimitiveApp } from "primitive-app";

void createPrimitiveApp({
  mainComponent: App,
  router,
  getAppConfig,
  getJsBaoConfig,
  // Everything wired up for you
});
```

### Stores Only

```typescript
// Use stores without primitive-app UI components
import { useUserStore, useSingleDocumentStore } from "primitive-app";

const user = useUserStore();
const docStore = useSingleDocumentStore();

// Build your own UI with the reactive state
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
  models: [Task],
});

// Handle auth, documents, and UI yourself
client.on("auth-success", () => { /* update your UI */ });
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

