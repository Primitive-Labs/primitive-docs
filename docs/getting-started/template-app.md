# Starting with the Template App

The fastest way to build an app on Primitive is to start from the official template. This guide walks you through creating a new project and running your first app.

## Prerequisites

- **Node.js 18+**
- **GitHub account** with access to [Primitive-Labs/primitive-app-template](https://github.com/Primitive-Labs/primitive-app-template)

### Installing pnpm

This project uses [pnpm](https://pnpm.io/) as its package manager. The easiest way to install pnpm is through Corepack (included with Node.js 16+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Alternatively, see the [pnpm installation guide](https://pnpm.io/installation) for other methods.

## Create Your Repository

1. Go to [primitive-app-template](https://github.com/Primitive-Labs/primitive-app-template) on GitHub
2. Click the green **"Use this template"** button in the upper right
3. Choose a name for your new repository and create it

Then clone your new repo:

```bash
git clone https://github.com/your-username/my-app.git
cd my-app
pnpm install
```

## Create Your App on Primitive

1. Go to the [Primitive Admin Console](https://admin.primitiveapi.com/login)
2. Sign in and click **Create New App**
3. Enter your app's display name
4. Save and note your **App ID**

## Configure Your Environment

Open the `.env` file in your project and update the App ID:

```bash
VITE_APP_ID=your-app-id-here
```

## Run Your App

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser. You should see your app running.

**Congratulations!** You now have a working Primitive app with:
- Real-time data sync
- Local-first data persistence
- A Vue + TypeScript + Tailwind foundation

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
│   ├── components/     # Vue components
│   ├── config/         # App configuration
│   ├── layouts/        # Page layouts
│   ├── lib/            # Business logic
│   ├── models/         # js-bao data models
│   ├── pages/          # Route components
│   └── router/         # Vue Router setup
├── .env                # Environment variables
└── wrangler.toml       # Cloudflare deployment config
```

Key configuration files:

- **`src/config/appConfig.ts`** — App name, document mode, navigation
- **`src/config/envConfig.ts`** — API URLs, App ID, logging
- **`src/models/`** — Your data models (start here!)

## Next Steps

Now that your app is running:

1. **[The Local-First Model](./local-first-model.md)** — Understand how Primitive apps work
2. **[Understanding Documents](./understanding-documents.md)** — Learn about documents and sharing
3. **[Working with Data](./working-with-data.md)** — Create your first data models
4. **[Deploying to Production](./deploying-to-production.md)** — Deploy your app to Cloudflare Workers
