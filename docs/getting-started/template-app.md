# Starting with the Template App

The fastest way to build an app on Primitive is to start from the official template. This guide walks you through creating a new project and running your first app.

## Prerequisites

- **Node.js** ^20.19.0 or >=22.12.0

## 1. Create Your App

Run the following command, replacing `my-app` with your desired app name:

```bash
npx create-primitive-app my-app
```

This will:
- Prompt you to sign in to your Primitive account (if not already authenticated)
- Create a new app on the Primitive servers
- Download and configure the template
- Install dependencies (prompting to install pnpm if needed)

## 2. Start Developing!

```bash
cd my-app
pnpm dev
```

Visit `http://localhost:5173` to see your app running.

**Congratulations!** You now have a working Primitive app with:
- Real-time data sync
- Local-first data persistence
- A Vue + TypeScript + Tailwind foundation
- Built-in test harness for browser-based testing
- Document debugger for inspecting your data

## Set Up Git Repository (Optional)

After creating your app, you may want to track it in Git and push to a remote repository.

### Initialize Git

```bash
cd my-app
git init
git add .
git commit -m "Initial commit from primitive-app template"
```

### Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (don't initialize with README, .gitignore, or license)

2. Add the remote and push:

```bash
git remote add origin https://github.com/your-username/my-app.git
git branch -M main
git push -u origin main
```

## Setting Up Google Sign In (Optional)

Google OAuth is optional. If you want to enable Google as a sign-in option for your app, follow these steps.

### 1. Configure Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and create a new OAuth client (Web application type):

| Setting | Value |
|---------|-------|
| Authorized JavaScript origins | `http://localhost:5173` |
| Authorized redirect URIs | `http://localhost:5173/oauth/callback` |

Save and note your **Client ID** and **Client Secret**.

::: tip Production Setup
When deploying to production, you'll add your production domain to these settings alongside localhost.
:::

### 2. Enable Google OAuth in Primitive Admin

**Option A: Using the CLI**

```bash
primitive apps oauth set-google --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

Then add your allowed origins:

```bash
primitive apps origins add http://localhost:5173
```

**Option B: Using the Dashboard**

Go to the [Primitive Admin Console](https://admin.primitiveapi.com/login) and navigate to your app's settings:

1. Open the **Google OAuth** section
2. Enable Google OAuth as a sign-in method
3. Add your **Google Client ID** and **Client Secret** from step 1
4. Add matching origin/callback URLs to match what you configured with Google

## Why Vue?

The template uses Vue 3 because it produces cleaner, more maintainable code—especially when working with AI coding assistants. Vue's straightforward reactivity model avoids the complexity of patterns like React's `useEffect` chains.

::: tip Using Other Frameworks
The core libraries—**js-bao** and **js-bao-wss-client**—are plain JavaScript and work with any framework. If you prefer React, Svelte, Solid, or vanilla JS, you can use these libraries directly. You'll just need to handle the framework integration yourself rather than using our Vue-specific `primitive-app` helpers.
:::

## What's in the Template?

The template gives you a production-ready starting point:

```
my-app/
├── src/
│   ├── assets/         # Static images and assets
│   ├── components/     # Vue components (organized by area)
│   ├── components/ui/  # shadcn-vue base components
│   ├── composables/    # Vue composables
│   ├── config/         # Environment configuration
│   ├── layouts/        # Page layout components
│   ├── lib/            # Business logic (pure TypeScript)
│   ├── models/         # js-bao data models
│   ├── pages/          # Route components
│   ├── router/         # Vue Router setup
│   └── tests/          # Test harness test files
├── docs/               # Agent guides for AI coding assistants
├── .env                # Development environment variables
├── .env.production     # Production environment variables
└── wrangler.toml       # Cloudflare deployment config
```

Key configuration files:

- **`src/config/envConfig.ts`** — API URLs, App ID, logging, js-bao configuration
- **`src/models/`** — Your data models (start here!)
- **`docs/`** — Guides for AI coding assistants working on your project

## Development Workflow

### Code Generation

After creating or modifying js-bao models, run the codegen script to generate TypeScript types and field accessors:

```bash
pnpm codegen
```

This is automatically run when you start the dev server (`pnpm dev`) but should also be run after any model changes.

### Type Checking

Run type checking to catch errors:

```bash
pnpm type-check
```

## Next Steps

Now that your app is running:

1. **[The Local-First Model](./local-first-model.md)** — Understand how Primitive apps work
2. **[Understanding Documents](./understanding-documents.md)** — Learn about documents and sharing
3. **[Working with Data](./working-with-data.md)** — Create your first data models
4. **[Test Harness](./test-harness.md)** — Write browser-based tests for your app
5. **[Document Debugger](./document-debugger.md)** — Inspect and debug your data
6. **[Deploying to Production](./deploying-to-production.md)** — Deploy your app to Cloudflare Workers
