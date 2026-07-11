# Deploying to Production

Each platform ships through its native channel: the web template deploys to Cloudflare Workers, and the iOS template ships through TestFlight and the App Store with Fastlane.

## Web (Cloudflare Workers)

The web template deploys to Cloudflare Workers. You'll need a Cloudflare account with access to deploy Workers.

### 1. Configure wrangler.toml

Edit `wrangler.toml` to set your worker name:

```toml
name = "my-app"

[env.production]
name = "my-app-prod"
```

By default, your app will be deployed to a `*.workers.dev` URL. To use a custom domain, uncomment and edit the routes section:

```toml
[[env.production.routes]]
pattern = "your-domain.com"
custom_domain = true
```

### 2. Configure .env.production

Edit `.env.production` with your production settings:

```bash
# Your Primitive App ID (can be the same as development or a separate production app)
VITE_APP_ID=your_production_app_id

# OAuth redirect URI for your production domain
VITE_OAUTH_REDIRECT_URI=https://my-app-prod.your-subdomain.workers.dev/oauth/callback
```

### 3. Deploy

```bash
pnpm cf-deploy production
```

The deploy script reads `.env.production`, builds the project, and deploys to Cloudflare Workers.

To pass additional flags to wrangler, use `--` followed by the flags:

```bash
pnpm cf-deploy production -- --dry-run
```

### Adding More Environments

You can add additional environments (e.g., test, staging) by:

1. **Adding a section to wrangler.toml:**

```toml
[env.test]
name = "my-app-test"

[env.test.vars]
REFRESH_PROXY_COOKIE_MAX_AGE = "604800"
REFRESH_PROXY_COOKIE_PATH = "/proxy/"
```

2. **Creating a corresponding .env file** (e.g., `.env.test`)

3. **Deploying:**

```bash
pnpm cf-deploy test
```

The deploy script reads from `.env.{environment}` and uses `[env.{environment}]` from wrangler.toml.

## iOS (TestFlight and the App Store)

Simulator builds run unsigned — you need an Apple Developer account ($99/year) and a team ID only for physical devices, TestFlight, and the App Store.

### 1. Signing and Team ID

1. Find your team ID at [developer.apple.com/account](https://developer.apple.com/account) → Membership Details (10 characters, e.g. `2J4V27W63D`).
2. Edit `project.yml`:

   ```yaml
   settings:
     base:
       DEVELOPMENT_TEAM: "2J4V27W63D"
       CODE_SIGN_STYLE: Automatic
   ```

3. Regenerate the xcodeproj:

   ```bash
   xcodegen generate
   ```

After that, device installs and archives both work.

With signing set up, `./run-ios.sh --device` installs directly on a paired iPhone — see [Run It](./template-app.md#_2-run-it) on the Quick Start page.

### 2. Set up Fastlane

The iOS template **ships Fastlane** — the project already has a root `Gemfile`, plus `fastlane/Appfile`, `fastlane/Fastfile`, and `fastlane/.env.example`. That gets you one-command builds to TestFlight and the App Store, plus version bumping. Install the gem:

```bash
bundle install
```

`fastlane/Appfile` is generic — it reads the app identifier and Team ID from `project.yml` at runtime, so there's nothing to edit there. Set the Team ID with `primitive apple set-team-id <id>`, which writes `DEVELOPMENT_TEAM` in `project.yml`.

### 4. App Store Connect API Key

The lanes below authenticate with App Store Connect using an API key.

1. Go to [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api).
2. Create a new key with role **App Manager**.
3. Download the `.p8` file (you can only download it once) and save it to `fastlane/api_key.p8`.
4. Note the **Key ID** and **Issuer ID** from the same page.
5. Copy the shipped template and fill in the three values:

   ```bash
   cp fastlane/.env.example fastlane/.env
   ```

   ```bash
   # fastlane/.env
   ASC_KEY_ID=ABC123XYZ
   ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
   ASC_KEY_PATH=./fastlane/api_key.p8
   ```

::: warning Don't commit the key
Add `fastlane/api_key.p8` and `fastlane/.env` to `.gitignore`. The `.p8` is a private key — leaking it lets anyone upload builds as your team.
:::

If you run a lane before these are set, the Fastfile prints the exact setup steps and stops.

### 5. The shipped lanes

You don't write the Fastfile — the template ships it, parameterized off `project.yml` so it works for any app. List the lanes with `bundle exec fastlane lanes`:

| Lane | What it does |
|------|--------------|
| `fastlane ios beta` | Archive, export, and upload an iOS build to TestFlight |
| `fastlane ios release` | Archive, export, and submit an iOS build to App Store review (sets `skip_metadata` / `skip_screenshots`) |
| `fastlane mac beta` | Upload a macOS build to TestFlight |
| `fastlane mac dmg` | Build a notarized DMG for direct distribution |
| `fastlane bump type:patch` | Bump the marketing + build version in `project.yml` and regenerate the xcodeproj (`major` / `minor` / `patch`) |
| `fastlane status` | Print the app version, bundle ID, Team ID, signing certificates, and whether the API key is configured |

Each build lane reads the Team ID from `project.yml` (it stops with the `primitive apple set-team-id` fix if it's unset) and loads the API key from `fastlane/.env`. The lanes export with automatic signing and `-allowProvisioningUpdates`, so Xcode requests the provisioning profiles for you.

### 6. Register the App on App Store Connect

You only do this once per app, before the first upload.

1. Go to [App Store Connect → Apps → +](https://appstoreconnect.apple.com/apps) → New App.
2. Pick **iOS**, set name, primary language, bundle ID (the dropdown shows IDs you've registered — if yours is missing, create it at [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers/list)), SKU (any unique string).
3. Choose **Full Access**.

### 7. Ship a TestFlight Build

```bash
bundle exec fastlane bump type:patch      # bumps version + build number, regenerates xcodeproj
bundle exec fastlane ios beta             # archives, exports, uploads
```

A first upload takes 10–20 minutes between "Fastlane finished" and the build appearing in TestFlight (Apple processes the binary, runs export compliance, etc.). Subsequent uploads are usually 5 minutes.

Internal testers (added in the App Store Connect UI under TestFlight) get builds immediately — no separate review. External testers and groups need a one-time Beta App Review per major version.

### 8. Submit to the App Store

```bash
bundle exec fastlane bump type:minor      # if you want to ship a real new version
bundle exec fastlane ios release
```

`upload_to_app_store` uploads the binary and submits it for review. The lane above sets `skip_metadata: true` and `skip_screenshots: true` — fill those in manually in App Store Connect (description, screenshots, keywords, age rating, privacy answers) before the build can actually be reviewed. Once metadata is complete and the build is processed, the review queue takes 24–72 hours typically.

::: tip CI
Both `./run-ios.sh` and `bundle exec fastlane ios beta` work in GitHub Actions on a macOS runner. Base64-encode `api_key.p8` into a secret and decode it before the lane runs.
:::
