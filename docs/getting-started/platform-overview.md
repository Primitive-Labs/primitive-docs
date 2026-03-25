# Platform Overview

Primitive is a backend platform for app developers. You focus on your UI and business logic; Primitive provides the backend services — authentication, data storage, real-time sync, file storage, server-side workflows, LLM integration, and more. No APIs to build. No servers to manage.

## Core Services

### Authentication
Multiple sign-in methods out of the box — Google OAuth, Magic Link (passwordless email), OTP (email codes), and Passkeys (biometric/WebAuthn). Token management, session handling, and refresh are all handled for you.

### Data Storage

Primitive offers two complementary storage systems:

- **Documents** — Local-first, real-time collaborative data. Your app reads and writes to a local in-browser database; changes sync automatically across devices and users. Great for user-owned data, offline access, and real-time collaboration.

- **Databases** — Server-side structured storage. Define operations (queries, mutations) with fine-grained access control. Great for shared records, cross-user data, admin-controlled content, and server-enforced business rules.

Most apps use one or both — see [Choosing Your Data Model](./choosing-your-data-model.md) for guidance.

### Users and Groups
Every user gets a built-in profile (name, email, avatar) managed by the platform. Groups let you organize users into teams, roles, or any relationship — with flexible, expression-based access control that works across both documents and databases.

### Workflows
Server-side multi-step automation pipelines. Chain together LLM calls, data transformations, external API requests, delays, and conditional logic. Define them as TOML config files in your repo.

### Managed Prompts
Version-controlled LLM prompt templates with built-in testing. Define prompt configurations, test them against expected outputs, and use them in workflows or directly from your app.

### Integrations
Securely proxy requests to external APIs. Primitive stores your API keys server-side and handles authentication, so your client code never sees credentials.

### Blob Storage
Upload, download, and manage files (images, PDFs, attachments) scoped to documents. Includes offline caching, upload queues, and prefetching.

### Analytics
Automatic lifecycle event tracking (daily active users, session end, network recovery) plus custom event logging. Query metrics via the CLI or REST API.

## Architecture at a Glance

```
┌──────────────────────────────────────────────────┐
│                Your App (Browser)                │
│  ┌──────────┐  ┌─────────┐  ┌────────────────┐  │
│  │  Your UI │◄►│ js-bao  │◄►│ Local Database │  │
│  └──────────┘  └─────────┘  └───────┬────────┘  │
│                                     │            │
│  js-bao-wss-client ◄───────────────►│            │
└──────────────────────────────────────│────────────┘
                                      │
                               Background Sync
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │        Primitive Backend         │
                    │                                  │
                    │  Auth · Sync · Databases          │
                    │  Workflows · Blobs · LLM/API     │
                    │                                  │
                    └─────────────────────────────────┘
```

Your app runs in the browser. The Primitive backend is a managed service that runs on edge infrastructure — you interact with it through the client library and CLI, never directly with the underlying infrastructure.

## The Stack

Primitive provides three libraries that work together:

### js-bao — Data Layer
A JavaScript ORM for defining data models and performing queries. Works with any framework. When used with documents, it reads and writes to a local in-browser database for instant operations.

```typescript
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
```

### js-bao-wss-client — Backend Client
Manages all interaction with the Primitive backend: authentication, document sync, database operations, blob storage, workflows, LLM calls, integrations, and analytics.

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const client = new JsBaoClient({
  apiUrl: "https://api.primitiveapi.com",
  wsUrl: "wss://api.primitiveapi.com",
  appId: "your-app-id",
  models: [Task],
});
```

### primitive-app — Vue Integration
Vue 3 components, services, and dev tools for building Primitive apps. Includes pre-built UI components (forms, tables, dialogs), a singleton client service, and a Vite plugin for development tools (Document Explorer, Test Harness, Blob Explorer).

::: tip Framework Flexibility
js-bao and js-bao-wss-client are plain JavaScript — they work with React, Svelte, Solid, or vanilla JS. The primitive-app package adds Vue-specific helpers, but the core platform is framework-agnostic.
:::

### Primitive CLI
A command-line tool for managing your app's backend configuration. Configure authentication, manage users, define workflows and prompts, set up integrations, and sync configuration as version-controlled TOML files. Also serves as the interface AI coding agents use to manage your app.

## What Runs Where

| Your App (Browser) | Primitive Backend |
|---|---|
| UI rendering and interaction | Authentication and sessions |
| Document data models and queries | Data sync between clients |
| Business logic and validation | Server-side databases |
| Offline data access | Workflow execution |
| | Blob storage |
| | LLM and API proxying |
| | Analytics collection |

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — Decide between documents, databases, or both
- **[Working with Documents](./working-with-documents.md)** — Deep dive into local-first collaborative data
- **[Working with Databases](./working-with-databases.md)** — Deep dive into server-side structured storage
