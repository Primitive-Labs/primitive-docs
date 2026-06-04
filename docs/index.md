# Primitive

Primitive is a backend platform designed to take you from idea to production app as fast as possible — and to work hand-in-hand with AI coding tools along the way. Not demo apps or toys: real applications with authentication, synced data, file storage, access control, LLM-powered automation, and analytics.

You focus on your UI and business logic. Primitive provides everything behind it — no APIs to build, no servers to manage.

## From Idea to Production

A Primitive app's whole lifecycle fits in a handful of commands:

1. **Scaffold** — one command gives you a running app, web or iOS, with sign-in, synced data, and dev tools already wired up.
2. **Add your data** — flexible, fast, scalable data persistence with real-time sync, sharing, and access control built in. No backend code to write.
3. **Add backend behavior** — workflows, managed prompts, API integrations, and scheduled jobs, all configured as code that lives in your repo.
4. **Ship** — the web template deploys with one command; the iOS template ships through TestFlight and the App Store.

The [Quick Start](./getting-started/template-app.md) walks through it, or see Primitive in action in the [Example Apps](./getting-started/example-apps.md).

## Why Primitive?

**Real-time, collaborative data is the default, not an add-on.** Documents are local-first: your app reads and writes a local store for instant interactions, and changes sync automatically across devices and collaborators with conflict-free merging. Alongside them, server-side databases give you fine-grained access control and server-enforced rules. Most platforms make you choose — or bolt sync on later. Primitive gives you both, designed to work together.

**One backend, every platform.** Web and iOS are first-class citizens with matching client libraries, matching templates, and one shared data schema. Concepts carry over directly — learn documents, databases, and sharing once, then build for whichever platform your users are on.

**Built for AI-assisted development.** Tools like Claude and Cursor excel at UI and business logic but struggle with infrastructure plumbing. Primitive's entire backend is operated through the CLI as version-controlled configuration in your repo — exactly the interface coding agents are good at. Agent guides ship with every template, the CLI serves reference docs to your assistant on demand, and a Claude Code skill teaches it platform best practices. Your agent can configure auth, define workflows, and wire up integrations without you touching a dashboard.

**One platform, not ten services.** Auth, data sync, file storage, LLM workflows, integrations, analytics — integrated, consistent, and configured in one place. No dashboard hopping, no credential juggling, no glue code between providers. Every service is built for real workloads: real-time collaboration, fine-grained access control, server-side automation.

## What Primitive Provides

### Authentication
Multiple sign-in methods out of the box — Google OAuth, Magic Link (passwordless email), OTP (email codes), and Passkeys (biometric sign-in). Token management, session handling, and refresh are all handled for you.

### Data Storage

Primitive offers two complementary storage systems:

- **Documents** — Local-first, real-time collaborative data. Your app reads and writes a local database on the device; changes sync automatically across devices and users. Great for user-owned data and real-time collaboration.

- **Databases** — Server-side structured storage. Define operations (queries, mutations) with fine-grained access control. Great for shared records, cross-user data, admin-controlled content, and server-enforced business rules.

Most apps use one or both — see [Choosing Your Data Model](./getting-started/choosing-your-data-model.md) for guidance.

### Users and Groups
Every user gets a built-in profile (name, email, avatar) managed by the platform. Groups let you organize users into teams, roles, or any relationship — with flexible, expression-based access control that works across both documents and databases.

### Workflows
Server-side multi-step automation pipelines. Chain together LLM calls, data transformations, external API requests, delays, and conditional logic — defined as configuration in your repo. Trigger them from your app, from inbound webhooks, or on a cron schedule.

### Managed Prompts
Version-controlled LLM prompt templates with built-in testing. Define prompt configurations, test them against expected outputs, and use them in workflows or directly from your app.

### Integrations
Securely proxy requests to external APIs. Primitive stores your API keys server-side and handles authentication, so your client code never sees credentials.

### Blob Storage
Upload, download, and manage files (images, PDFs, attachments). Document-scoped blobs inherit document permissions; general-purpose blob buckets add TTL tiers, signed URLs, and expression-based access rules for storage that lives outside a specific document.

### Sharing and Access
Share documents and databases with other users — by user ID, by email (resolves at signup), or with an entire group. Document access requests let users with a link ask for access Google-Docs-style. Member invitations with quotas let regular members bring teammates in without admin involvement.

### Analytics
Automatic lifecycle event tracking (daily active users, session activity, feature usage) plus custom event logging. Read metrics back from the Admin Console, the CLI, or workflow steps.

## How It Fits Together

Your app runs on the user's device — in the browser or on an iPhone — and talks to the platform through a client library that exposes the same features in JavaScript (any framework) and Swift. Optional starter templates for web (Vue) and iOS (SwiftUI) wrap the client with login UI, data-binding helpers, and dev tooling — the fastest start, covered in the [Quick Start](./getting-started/template-app.md).

The Primitive Platform itself is a managed service. You operate your app's backend through the CLI — as version-controlled configuration that lives in your repo, and the interface AI coding agents use — or interactively through the web [Admin Console](https://admin.primitiveapi.com/login). You never touch the underlying infrastructure.

## Next Steps

- **[Quick Start](./getting-started/template-app.md)** — A running app, web or iOS, in minutes
- **[Choosing Your Data Model](./getting-started/choosing-your-data-model.md)** — Decide between documents, databases, or both
- **[Working with Documents](./getting-started/working-with-documents.md)** — Local-first collaborative data
- **[Working with Databases](./getting-started/working-with-databases.md)** — Server-side structured storage
