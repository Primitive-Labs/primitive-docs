# Starting with the Template App

The fastest way to build an app on Primitive is to start from the official template. This guide walks you through creating a new project and running your first app.

## Prerequisites

- **Node.js** ^20.19.0 or >=22.12.0
- **GitHub account** (to create your own repository from the template)

## 1. Create Your Repository

1. Go to [primitive-app-template](https://github.com/Primitive-Labs/primitive-app-template) on GitHub
2. Click the green **"Use this template"** button in the upper right
3. Choose a name for your new repository and create it

## 2. Install pnpm

This project uses [pnpm](https://pnpm.io/) as its package manager. The easiest way to install pnpm is through Corepack (included with Node.js 16+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Alternatively, see the [pnpm installation guide](https://pnpm.io/installation) for other methods.

## 3. Install the Primitive CLI

The `primitive-admin` CLI tool provides command-line access to the Primitive Admin server for managing your app. Install it globally:

```bash
npm install -g primitive-admin
```

Once installed, authenticate with your Primitive account:

```bash
primitive login
```

This will open a browser window for you to sign in. After signing in, you can verify your authentication:

```bash
primitive whoami
```

## 4. Clone Your Repository

```bash
git clone https://github.com/your-username/my-app.git
cd my-app
```

## 5. Install Dependencies

```bash
pnpm install
```

## 6. Create Your App on Primitive

You need to create an app in the Primitive Admin system to get an **App ID** for your project.

**Option A: Using the CLI (Recommended)**

```bash
primitive apps create "My New App"
```

This will output your new **App ID**. You can also list your apps at any time:

```bash
primitive apps list
```

**Option B: Using the Dashboard**

Go to the [Primitive Admin Console](https://admin.primitiveapi.com/login) and create a new app through the web interface. Make note of your **App ID**.

## 7. Configure Your Environment

Open the `.env` file in your project and update the App ID:

```bash
VITE_APP_ID=your-app-id-here
```

## 8. Run Your App

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser. You should see your app running.

**Congratulations!** You now have a working Primitive app with:
- Real-time data sync
- Local-first data persistence
- A Vue + TypeScript + Tailwind foundation
- Built-in test harness for browser-based testing
- Document debugger for inspecting your data

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
