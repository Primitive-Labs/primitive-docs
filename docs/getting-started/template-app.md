# Quick Start

The fastest way to build on Primitive is to start from an official template. Primitive supports multiple platforms as first-class citizens — there's a **web template** (Vue + TypeScript + Tailwind) and an **iOS template** (Swift + SwiftUI). Both give you a working app in minutes: authentication, local-first data storage, real-time sync, and dev tooling. (Templates are optional — the clients are plain libraries; see [Using the Client Directly](./authentication.md#using-the-client-directly).)

## 1. Create Your App

Run the installer, replacing `my-app` with your desired app name:

```bash
npx create-primitive-app my-app
```

It asks which platform you're building for — web or iOS — or pass `--platform web` / `--platform ios` to skip the prompt. (Building for iOS requires macOS with Xcode 15+ and `brew install xcodegen`; an Apple Developer account is only needed for physical devices, TestFlight, and the App Store — the simulator runs unsigned.)

The installer will:

- Prompt you to sign in to your Primitive account (if not already authenticated)
- Create a new app on the Primitive servers
- Download and configure the platform's template
- Initialize a Git repository and create an initial commit
- Install dependencies (`pnpm` for web, `swift package resolve` for iOS)

## 2. Run It

::: code-group

```bash [Web (Vue)]
cd my-app
pnpm dev
# → http://localhost:5173
```

```bash [iOS (SwiftUI)]
cd my-app
./run-ios.sh
# regenerates the Xcode project, runs model codegen, builds, and
# launches the simulator (./run-ios.sh --device targets a real iPhone —
# see Deploying to Production for signing)
```

:::

**Congratulations!** You now have a working Primitive app with:

- Authentication with a drop-in login flow (OAuth, Magic Link, OTP, and Passkeys on web; one-time email code, Google and Apple sign-in, and Passkeys on iOS)
- Local-first data storage with real-time sync
- Server-side databases with access control
- Blob storage for files and images
- Built-in dev tools (Document Explorer, Test Harness, and Blob Explorer on web; the Debug Inspector on iOS)
- CLI for managing workflows, prompts, integrations, and more

## 3. Push to a Remote Repository (Optional)

The scaffold initializes a Git repository and creates an initial commit for you. To push to a remote like GitHub:

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

Go to the [Primitive Admin Console](https://admin.primitiveapi.com) and navigate to your app's settings:

1. Open the **Google OAuth** section
2. Enable Google OAuth as a sign-in method
3. Add your **Google Client ID** and **Client Secret** from step 1
4. Add matching origin/callback URLs to match what you configured with Google

You can also toggle the provider and set allowed origins from the CLI:

```bash
primitive apps update --google-oauth true
primitive apps update --cors-origins "http://localhost:5173"
```

## What's in the Template?

Both templates are production-ready starting points with the same shape: app config, data model schemas with codegen, UI scaffolding around the platform's login flow, and agent guides for AI coding assistants.

::: code-group

```text [Web (Vue)]
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

```text [iOS (SwiftUI)]
my-app/
├── Sources/PrimitiveAppTemplate/
│   ├── PrimitiveAppTemplateApp.swift   # @main entry — owns the app state
│   ├── TemplateAppState.swift          # PrimitiveAppState subclass: client lifecycle, documents
│   ├── Views/                          # SwiftUI views (ContentView wraps AuthGateView)
│   └── Models/
│       ├── models.toml                 # Your data model schemas
│       └── Generated/                  # swift-bao-codegen output
├── docs/                               # Agent guides for AI coding assistants
├── Package.swift                       # SwiftPM manifest (pulls in PrimitiveApp)
├── primitive.json                      # App ID + server URLs — bundled and read at launch
├── project.yml                         # xcodegen source of truth — edit this, regenerate the xcodeproj
├── run-ios.sh                          # Build + launch (simulator or device)
└── fastlane/                           # TestFlight + App Store lanes
```

:::

Key configuration files:

| | Web (Vue) | iOS (SwiftUI) |
|---|---|---|
| App config | `src/config/envConfig.ts` (API URLs, App ID) | `primitive.json` (App ID + server URLs) |
| Data models (start here!) | `src/models/models.toml` — run `pnpm codegen` after editing | `Sources/…/Models/models.toml` — codegen is wired into both build paths |
| Agent guides | `docs/` | `docs/` |

On iOS, the `PrimitiveApp` package does the heavy lifting: `PrimitiveAppState` owns the `JsBaoClient` lifecycle (your app subclasses it, like the template's `TemplateAppState`), `AuthGateView` presents `PrimitiveLoginView` until the user is signed in and connected, and `BaoDataLoader` binds queries to SwiftUI views — the counterparts of the web template's client service, `PrimitiveLogin`, and `useJsBaoDataLoader`. `appState.initialize()` reads `primitive.json`, creates the client, attaches the auth manager, and in dev mode auto-signs you in with your CLI token from `~/.primitive/credentials.json` so you don't log in on every rebuild.

## Next Steps

Now that your app is running:

1. **[Choosing Your Data Model](./choosing-your-data-model.md)** — Decide between documents, databases, or both
2. **[Working with Documents](./working-with-documents.md)** — Local-first collaborative data
3. **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
4. **[Authentication](./authentication.md)** — Set up sign-in methods
5. **[Dev Tools](./devtools.md)** — Inspect data, manage files, run tests
6. **[Deploying to Production](./deploying-to-production.md)** — Deploy your app to production
