# Primitive

Primitive is a platform designed to work with LLM coding tools — making going from idea to production app as fast and easy as possible. Not demo apps or toys, but real, production-ready applications.

Modern apps need authentication, data storage, real-time sync, file storage, access control, LLM integration, workflow automation, and more. Building each from scratch — or signing up for and configuring a dozen separate services — is weeks of work before you write a line of app logic. Primitive provides an integrated set of well-tested, production-ready services so you can focus on what makes your app unique.

## Why Primitive?

**AI coding tools work best with a solid foundation.** Tools like Claude, Cursor, and Copilot excel at UI and business logic, but struggle with distributed systems, infrastructure plumbing, and service integration. Primitive gives you a complete platform underneath, so your AI assistant can focus on what it's good at — your app.

**One platform, not ten services.** Auth, data sync, file storage, LLM proxying, workflows, analytics — all integrated, all configured through code and CLI. No dashboard hopping, no credential juggling, no glue code between providers.

**Production-ready from day one.** Every service is built for real workloads: offline support, real-time collaboration, fine-grained access control, server-side workflows. You're not building on top of a prototype — you're building on infrastructure that scales.

## Quick Start

The fastest way to get started is the template app:

```bash
npx create-primitive-app my-app
cd my-app
pnpm dev
```

In minutes you'll have a running app with authentication, real-time data sync, file storage, dev tools, and a Vue + TypeScript + Tailwind foundation.

- **[Starting with the Template App](./getting-started/template-app.md)** — Full setup guide and walkthrough
- **[Example Apps](./getting-started/example-apps.md)** — See Primitive in action

## What Primitive Provides

### Authentication
Multiple sign-in methods out of the box — Google OAuth, Magic Link (passwordless email), OTP (email codes), and Passkeys (biometric/WebAuthn). Token management, session handling, and refresh are all handled for you.

### Data Storage

Primitive offers two complementary storage systems:

- **Documents** — Local-first, real-time collaborative data. Your app reads and writes to a local in-browser database; changes sync automatically across devices and users. Great for user-owned data, offline access, and real-time collaboration.

- **Databases** — Server-side structured storage. Define operations (queries, mutations) with fine-grained access control. Great for shared records, cross-user data, admin-controlled content, and server-enforced business rules.

Most apps use one or both — see [Choosing Your Data Model](./getting-started/choosing-your-data-model.md) for guidance.

### Users and Groups
Every user gets a built-in profile (name, email, avatar) managed by the platform. Groups let you organize users into teams, roles, or any relationship — with flexible, expression-based access control that works across both documents and databases.

### Workflows
Server-side multi-step automation pipelines. Chain together LLM calls, data transformations, external API requests, delays, and conditional logic. Define them as TOML config files in your repo. Trigger them from your app, from inbound webhooks, or on a cron schedule.

### Managed Prompts
Version-controlled LLM prompt templates with built-in testing. Define prompt configurations, test them against expected outputs, and use them in workflows or directly from your app.

### Integrations
Securely proxy requests to external APIs. Primitive stores your API keys server-side and handles authentication, so your client code never sees credentials.

### Blob Storage
Upload, download, and manage files (images, PDFs, attachments). Document-scoped blobs inherit document permissions and include offline caching, upload queues, and prefetching. General-purpose blob buckets add TTL tiers, signed URLs, and CEL-based access rules for storage that lives outside a specific document.

### Sharing and Access
Share documents and databases with other users — by user ID, by email (resolves at signup), or with an entire group. Document access requests let users with a link ask for access Google-Docs-style. Member invitations with quotas let regular members bring teammates in without admin involvement.

### Analytics
Automatic lifecycle event tracking (daily active users, session start/end, first edit) plus custom event logging. View metrics in the admin console.

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

- **[Choosing Your Data Model](./getting-started/choosing-your-data-model.md)** — Decide between documents, databases, or both
- **[Working with Documents](./getting-started/working-with-documents.md)** — Deep dive into local-first collaborative data
- **[Working with Databases](./getting-started/working-with-databases.md)** — Deep dive into server-side structured storage
