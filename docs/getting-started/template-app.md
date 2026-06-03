# Starter Templates

The fastest way to build on Primitive is to start from an official template. Primitive supports multiple platforms as first-class citizens — there's a **web template** (Vue + TypeScript + Tailwind) and an **iOS template** (Swift + SwiftUI). Both give you a working app in minutes: authentication, local-first data storage, real-time sync, and dev tooling. (Templates are optional — the clients are plain libraries; see [Using the Client Directly](./authentication.md#using-the-client-directly).)

| Platform | Template | Stack |
|---|---|---|
| Web | `npx create-primitive-app` | Vue 3 + TypeScript + Tailwind |
| iOS / macOS | `primitive init --platform ios` | Swift + SwiftUI (`PrimitiveApp` package) |

## Web (Vue)

### 1. Create Your App

Run the following command, replacing `my-app` with your desired app name:

```bash
npx create-primitive-app my-app
```

This will:
- Prompt you to sign in to your Primitive account (if not already authenticated)
- Create a new app on the Primitive servers
- Download and configure the template
- Install dependencies (prompting to install pnpm if needed)

### 2. Start Developing!

```bash
cd my-app
pnpm dev
```

Visit `http://localhost:5173` to see your app running.

**Congratulations!** You now have a working Primitive app with:
- Authentication (OAuth, Magic Link, OTP, Passkeys)
- Local-first data storage with real-time sync
- Server-side databases with access control
- Blob storage for files and images
- A Vue + TypeScript + Tailwind foundation
- Built-in dev tools (Document Explorer, Test Harness, Blob Explorer)
- CLI for managing workflows, prompts, integrations, and more

### Push to a Remote Repository (Optional)

`create-primitive-app` automatically initializes a Git repository and creates an initial commit for you. To push to a remote like GitHub:

1. Create a new repository on [GitHub](https://github.com/new) (don't initialize with README, .gitignore, or license)

2. Add the remote and push:

```bash
git remote add origin https://github.com/your-username/my-app.git
git branch -M main
git push -u origin main
```

## iOS (Swift)

Scaffold an iOS app with:

```bash
primitive init --platform ios my-app
```

You get a SwiftUI app built on the `PrimitiveApp` package (the Swift counterpart of `primitive-app`):

- **`PrimitiveAppState`** — owns the `JsBaoClient` lifecycle: loads `primitive.json` (app ID + server URLs), initializes the client, tracks connection state, and opens your documents. Your app subclasses it (the template's `TemplateAppState`) to bind models and open its root document.
- **`AuthGateView`** — wraps your content and walks initializing → login → connecting → connected, presenting `PrimitiveLoginView` (one-time email code, optional Google OAuth) until the user is signed in.
- **`BaoDataLoader`** — reactive data binding for SwiftUI views (the counterpart of the web template's `useJsBaoDataLoader` composable).
- **Debug Inspector** — the iOS counterpart of the web dev tools, registered automatically for typed models.

The app entry is a few lines:

```swift
@main
struct MyApp: App {
  @StateObject private var appState = TemplateAppState()

  var body: some Scene {
    WindowGroup {
      ContentView()              // AuthGateView { … } + appState.initialize()
        .environmentObject(appState)
    }
  }
}
```

For the full walkthrough — running on simulator/device, data modeling and codegen, shipping with Fastlane — see the [Swift Client guide](./swift-client.md).

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

You can also toggle the provider and set allowed origins from the CLI:

```bash
primitive apps update --google-oauth true
primitive apps update --cors-origins "http://localhost:5173"
```

### What's in the Web Template?

The web template gives you a production-ready starting point:

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
│   ├── models/         # js-bao data models (models.toml + auto-generated *.generated.ts)
│   ├── pages/          # Route components
│   ├── router/         # Vue Router setup
│   └── tests/          # Test harness test files
├── docs/               # Agent guides for AI coding assistants
├── .env                # Development environment variables
├── .env.production     # Production environment variables
└── wrangler.toml       # Deployment config
```

Key configuration files:

- **`src/config/envConfig.ts`** — API URLs, App ID, logging, js-bao configuration
- **`src/models/models.toml`** — Your data model schemas (start here! Run `pnpm codegen` after editing to regenerate the TypeScript classes in `*.generated.ts`)
- **`docs/`** — Guides for AI coding assistants working on your project

## Next Steps

Now that your app is running:

1. **[Choosing Your Data Model](./choosing-your-data-model.md)** — Decide between documents, databases, or both
2. **[Working with Documents](./working-with-documents.md)** — Local-first collaborative data
3. **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
4. **[Authentication](./authentication.md)** — Set up sign-in methods
5. **[Dev Tools](./devtools.md)** — Inspect data, manage files, run tests
6. **[Deploying to Production](./deploying-to-production.md)** — Deploy your app to production
