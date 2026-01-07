# Getting Started

Welcome to Primitive! This guide will help you understand the platform and build your first app.

## Quick Start

New to Primitive? Start here:

1. **[Primitive Stack Overview](./getting-started/stack-overview.md)** — Understand how js-bao, js-bao-wss-client, and primitive-app work together.

2. **[Starting with the Template App](./getting-started/template-app.md)** — Create a new project, configure authentication, and run your first app in minutes.

3. **[The Local-First Model](./getting-started/local-first-model.md)** — Understand how Primitive apps work differently from traditional web apps.

4. **[Understanding Documents](./getting-started/understanding-documents.md)** — Learn about documents, sharing, and choosing the right pattern for your app.

5. **[Working with Data](./getting-started/working-with-data.md)** — Define data models and perform create, read, update, and delete operations.

## Additional Topics

- **[Other Services](./getting-started/other-services.md)** — Blob storage, AI integration, third-party APIs, analytics, and waitlist features.

- **[Is Primitive Right for You?](./getting-started/good-and-bad-apps.md)** — Understand where Primitive shines and where it might not be the best fit.

## What is Primitive?

Primitive is a platform for building **local-first web applications**. You define data models in JavaScript, manipulate them on the client, and Primitive handles everything else—syncing data across devices, authenticating users, enabling real-time collaboration, and working offline. No APIs to build. No servers to manage. No complex client-server architecture to maintain.

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
- **Offline support** — Apps work without an internet connection
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
