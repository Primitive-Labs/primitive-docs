# Getting Started

Welcome to Primitive! This guide will help you understand the platform and build your first app.

::: tip Explore Example Apps
Want to see Primitive in action? Check out our [Example Apps](./getting-started/example-apps.md) to interactively explore real-time collaboration, document sharing, and other features covered in these docs.
:::

## Quick Start

New to Primitive? Start here:

1. **[Starting with the Template App](./getting-started/template-app.md)** — Create a new project, configure authentication, and run your first app in minutes.

2. **[The Local-First Model](./getting-started/local-first-model.md)** — Understand how Primitive apps work differently from traditional web apps.

3. **[Understanding Documents](./getting-started/understanding-documents.md)** — Learn about documents, sharing, and choosing the right pattern for your app.

4. **[Working with Data](./getting-started/working-with-data.md)** — Define data models and perform create, read, update, and delete operations.

## What is Primitive?

Primitive is a platform for building **local-first web applications**. You define data models in JavaScript, manipulate them on the client, and Primitive handles everything else—syncing data across devices, authenticating users, and enabling real-time collaboration. No APIs to build. No servers to manage. No complex client-server architecture to maintain.

### Why We Built Primitive

**Going from idea to production should be simple.** We wanted to make it really easy to go from an idea to a scalable app in production with minimal server setup and a straightforward programming model. Define objects in JavaScript, manipulate them on the client, and don't worry about what's client-side, what's server-side, or managing a complex tech stack.

**Local-first is fast and responsive.** When your app works with a local database, interactions feel instant. No waiting for network round-trips. No spinners. Changes sync in the background while users keep working.

**Real-time collaboration and sharing are hard.** Lots of apps would benefit from users working together on shared data, but building this well is notoriously difficult—conflict resolution, presence awareness, permissions. Primitive handles these challenges so you don't have to.

**AI coding tools work better with a solid foundation.** Modern AI assistants excel at UI and business logic, but struggle with distributed systems and infrastructure. Primitive gives you a scalable, battle-tested foundation, letting AI tools focus on what they're good at.

**We've built this before—many times.** After building numerous apps, we noticed we were solving the same problems over and over: authentication, analytics, secure blob storage, sharing, billing. Our goal is to provide default answers for all of these product-level concerns out of the box, so more of your time goes into what makes your app unique.

### What Primitive Handles

- **Data sync** — Changes automatically sync between devices and users
- **Authentication** — Google OAuth built in
- **Real-time collaboration** — Multiple users can edit shared data simultaneously
- **Local persistence** — Data is stored locally for instant access with automatic background sync
- **Additional services** — Blob storage, AI, third-party API proxy, analytics, and more coming

You focus on building your product. Primitive handles the infrastructure.

## Prerequisites

Before diving in, you should be comfortable with:

- **JavaScript/TypeScript** — All code runs in the browser
- **Modern web development** — npm/pnpm, Vite, etc.

No backend experience required—that's the point!

## About the Template

Our template app uses **Vue 3** with the Composition API. We chose Vue because it produces cleaner, more maintainable code—particularly when working with AI coding assistants. Vue's straightforward reactivity model avoids the complexity of patterns like React's `useEffect`.

That said, **js-bao and the Primitive client are plain JavaScript libraries** that work with any framework. If you prefer React, Svelte, or vanilla JS, you can use the core libraries directly—you'll just need to set up the integration yourself rather than using our Vue-based `primitive-app` helpers.
