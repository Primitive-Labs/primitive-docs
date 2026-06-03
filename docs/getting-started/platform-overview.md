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
Server-side multi-step automation pipelines. Chain together LLM calls, data transformations, external API requests, delays, and conditional logic. Define them as TOML config files in your repo. Trigger them from your app, from inbound webhooks, or on a cron schedule.

### Managed Prompts
Version-controlled LLM prompt templates with built-in testing. Define prompt configurations, test them against expected outputs, and use them in workflows or directly from your app.

### Integrations
Securely proxy requests to external APIs. Primitive stores your API keys server-side and handles authentication, so your client code never sees credentials.

### Blob Storage
Upload, download, and manage files (images, PDFs, attachments). Document-scoped blobs inherit document permissions and include offline caching, upload queues, and prefetching. General-purpose blob buckets add TTL tiers, signed URLs, and CEL-based access rules for storage that lives outside a specific document.

### Sharing and Access
Share documents and databases with other users — by user ID, by email (grants that resolve at signup), or with an entire group. Document access requests let users with a link ask for access Google-Docs-style. Member invitations with quotas let regular members invite teammates without admin involvement.

### Analytics
Automatic lifecycle event tracking (daily active users, session end, network recovery) plus custom event logging. Query metrics via the CLI or REST API.

## The Stack

Your app runs on the user's device — in the browser or on an iPhone. The Primitive Platform is a managed service: you interact with it through the client library, the CLI, and the Admin Console, never directly with the underlying infrastructure.

### The Primitive Platform

A managed backend providing data storage — **documents** (local-first, synced, accessed through models) and **databases** (server-side, accessed through registered operations) — plus the rest of the platform services: authentication, users and groups, blob storage, workflows, managed prompts, integrations, and analytics. No APIs to build, no servers to manage.

### The Client

Your app talks to the platform through a client library — **js-bao-wss-client** for JavaScript (any framework: Vue, React, Svelte, vanilla) and the **Swift client** for iOS. Both expose the same surface: authentication, documents with a local store and background sync, database operations, blobs, workflows, and events.

### CLI and Admin Console

The `primitive` CLI manages your app's backend configuration — auth settings, users, workflows, prompts, integrations — as version-controlled TOML you push with `primitive sync`. It's also the interface AI coding agents use to manage your app. The web [Admin Console](https://admin.primitiveapi.com/login) covers the same ground interactively, plus a few console-only settings (like OAuth client credentials).

### Starter Templates

Optional, but the fastest start: a **web template** (Vue 3 + TypeScript) and an **iOS template** (Swift + SwiftUI), each wrapping the client with login UI, data-binding helpers, and dev tooling. See the [Quick Start](./template-app.md).


## What Runs Where

| Your App (Browser / iOS) | Primitive Backend |
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
