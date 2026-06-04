# Deploying Primitive apps to production

Each platform ships through its native channel: the **web** template deploys to Cloudflare Workers; the **iOS** template ships through TestFlight and the App Store with Fastlane. This guide is the reference for both deploy paths.

## Web (Cloudflare Workers)

The web template deploys to Cloudflare Workers via `pnpm cf-deploy <environment>`. You need a Cloudflare account with Workers deploy access.

### 1. Configure `wrangler.toml`

Set the worker name and per-environment overrides:

```toml
name = "my-app"

[env.production]
name = "my-app-prod"
```

By default the app deploys to a `*.workers.dev` URL. For a custom domain, add a route under the environment:

```toml
[[env.production.routes]]
pattern = "your-domain.com"
custom_domain = true
```

### 2. Configure `.env.production`

`cf-deploy` reads `.env.{environment}`. For production, `.env.production`:

```bash
# Primitive App ID — same as dev, or a separate production app.
VITE_APP_ID=your_production_app_id

# OAuth redirect URI for the production origin (must match the
# server-side OAuth config; mismatches fail the callback exchange).
VITE_OAUTH_REDIRECT_URI=https://my-app-prod.your-subdomain.workers.dev/oauth/callback
```

### 3. Deploy

```bash
pnpm cf-deploy production
```

The script reads `.env.production`, builds, and deploys to the `[env.production]` worker. Pass extra wrangler flags after `--`:

```bash
pnpm cf-deploy production -- --dry-run
```

### Adding environments

`cf-deploy <name>` generalizes to any environment:

1. Add `[env.<name>]` (and any `[env.<name>.vars]`) to `wrangler.toml`.
2. Create `.env.<name>`.
3. `pnpm cf-deploy <name>`.

```toml
[env.test]
name = "my-app-test"

[env.test.vars]
REFRESH_PROXY_COOKIE_MAX_AGE = "604800"
REFRESH_PROXY_COOKIE_PATH = "/proxy/"
```

The deploy reads `.env.{environment}` and the matching `[env.{environment}]` block.

## iOS (TestFlight and the App Store)

Simulator builds run unsigned. A team ID + Apple Developer account ($99/year) is required only for physical devices, TestFlight, and the App Store.

### 1. Signing and Team ID

The Team ID is the single setting required for device, TestFlight, and App Store builds. Set it in `project.yml`, **never in the Xcode UI** — the xcodeproj is xcodegen output and UI edits are wiped on the next `xcodegen generate`.

1. Team ID: [developer.apple.com/account](https://developer.apple.com/account) → Membership Details (10 chars, e.g. `2J4V27W63D`).
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

### 2. Run on a physical iPhone / iPad

```bash
./run-ios.sh --device
```

Requires a paired device over USB — verify with `xcrun devicectl list devices` (shows `paired`). The script auto-picks the first paired device, builds with `-allowProvisioningUpdates` (Xcode requests provisioning profiles for you), installs via `devicectl`, and launches with `--console` so `print` / NSLog stream to the terminal. Needs `DEVELOPMENT_TEAM` set (step 1).

### 3. Install Fastlane

The iOS template doesn't ship Fastlane by default — a few minutes to add, and you get one-command TestFlight / App Store builds, internal-tester provisioning, and version bumping.

Add a `Gemfile` at the project root:

```ruby
source "https://rubygems.org"
gem "fastlane"
```

Then:

```bash
bundle install
bundle exec fastlane init   # pick "manual setup" when prompted
```

Fastlane creates `fastlane/Appfile` and `fastlane/Fastfile`.

`fastlane/Appfile`:

```ruby
app_identifier "com.yourcompany.myapp"  # must match PRODUCT_BUNDLE_IDENTIFIER in project.yml
team_id "2J4V27W63D"                    # same Team ID as DEVELOPMENT_TEAM
```

### 4. App Store Connect API Key

`upload_to_testflight` and `upload_to_app_store` authenticate with an App Store Connect API key — username/password no longer works for upload.

1. [App Store Connect → Users and Access → Integrations → API Keys](https://appstoreconnect.apple.com/access/integrations/api) → create a key with role **App Manager**.
2. Download the `.p8` (one-time download) to `fastlane/api_key.p8`. **Gitignore it** — it's a private key; leaking it lets anyone upload builds as your team.
3. Note the **Key ID** and **Issuer ID**.
4. Add `.env` next to `fastlane/`:

   ```bash
   ASC_KEY_ID=ABC123XYZ
   ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
   ASC_KEY_PATH=./fastlane/api_key.p8
   ```

Gitignore `fastlane/api_key.p8` and `.env`.

### 5. Fastfile

`beta` → TestFlight, `release` → App Store review, `add_testers` → invite internal testers without the App Store Connect UI, `bump` → version/build numbers.

```ruby
default_platform(:ios)

def load_api_key
  app_store_connect_api_key(
    key_id: ENV["ASC_KEY_ID"],
    issuer_id: ENV["ASC_ISSUER_ID"],
    key_filepath: ENV["ASC_KEY_PATH"] || "./fastlane/api_key.p8",
    in_house: false
  )
end

def current_version
  yml = File.read("../project.yml")
  v = yml.match(/MARKETING_VERSION:\s*"?([^"\n]+)"?/)&.captures&.first || "1.0"
  b = yml.match(/CURRENT_PROJECT_VERSION:\s*"?([^"\n]+)"?/)&.captures&.first || "1"
  { version: v, build: b.to_i }
end

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    api_key = load_api_key
    changelog_path = File.expand_path("changelog.txt", __dir__)
    changelog = File.exist?(changelog_path) ? File.read(changelog_path).strip : nil

    build_app(
      project: "MyApp.xcodeproj",
      scheme: "MyApp_iOS",
      destination: "generic/platform=iOS",
      export_method: "app-store",
      export_options: { signingStyle: "automatic" },
      xcargs: "-allowProvisioningUpdates",
      output_directory: ".build/archives",
      output_name: "MyApp-iOS.ipa",
      clean: true,
    )

    upload_to_testflight(
      api_key: api_key,
      skip_waiting_for_build_processing: true,
      skip_submission: true,
      changelog: changelog,
    )
  end

  desc "Build and submit to App Store review"
  lane :release do
    api_key = load_api_key

    build_app(
      project: "MyApp.xcodeproj",
      scheme: "MyApp_iOS",
      destination: "generic/platform=iOS",
      export_method: "app-store",
      export_options: { signingStyle: "automatic" },
      xcargs: "-allowProvisioningUpdates",
      output_directory: ".build/archives",
      output_name: "MyApp-iOS.ipa",
      clean: true,
    )

    upload_to_app_store(
      api_key: api_key,
      skip_metadata: true,
      skip_screenshots: true,
      precheck_include_in_app_purchases: false,
    )
  end

  desc "Add emails as internal TestFlight testers"
  lane :add_testers do |options|
    api_key = load_api_key
    emails = (options[:emails] || "").split(",").map(&:strip).reject(&:empty?)
    UI.user_error!('Pass emails: fastlane ios add_testers emails:"a@x.com,b@y.com"') if emails.empty?

    emails.each do |email|
      pilot(
        api_key: api_key,
        app_identifier: "com.yourcompany.myapp",
        email: email,
        first_name: email.split("@").first,
        last_name: "Tester",
      )
    end
  end
end

desc "Bump version (type: major, minor, patch)"
lane :bump do |options|
  type = (options[:type] || "patch").to_s
  v = current_version
  parts = v[:version].split(".").map(&:to_i)
  parts.push(0) while parts.length < 3
  case type
  when "major" then parts[0] += 1; parts[1] = 0; parts[2] = 0
  when "minor" then parts[1] += 1; parts[2] = 0
  when "patch" then parts[2] += 1
  end
  new_version = parts.join(".")
  new_build = v[:build] + 1

  yml = File.read("../project.yml")
  yml.gsub!(/MARKETING_VERSION:\s*"?[^"\n]+"?/, "MARKETING_VERSION: \"#{new_version}\"")
  yml.gsub!(/CURRENT_PROJECT_VERSION:\s*"?[^"\n]+"?/, "CURRENT_PROJECT_VERSION: \"#{new_build}\"")
  File.write("../project.yml", yml)
  sh("xcodegen generate --quiet")
  UI.success("#{v[:version]} (#{v[:build]}) → #{new_version} (#{new_build})")
end
```

### 6. Register the app on App Store Connect (one-time)

Done once per app, before the first upload.

1. [App Store Connect → Apps → +](https://appstoreconnect.apple.com/apps) → New App.
2. Pick **iOS**; set name, primary language, bundle ID (must match `PRODUCT_BUNDLE_IDENTIFIER` in `project.yml` — register a missing ID at [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers/list)), SKU (any unique string).
3. Choose **Full Access**.

### 7. Ship a TestFlight build

```bash
bundle exec fastlane bump type:patch      # bumps version + build, regenerates xcodeproj
bundle exec fastlane ios beta             # archives, exports, uploads
```

Internal testers (via `add_testers` or the App Store Connect UI) get builds immediately — no review. External testers / groups need a one-time Beta App Review per major version. The first upload takes 10–20 min between Fastlane finishing and the build appearing in TestFlight (Apple processes the binary + export compliance); subsequent uploads ~5 min.

### 8. Submit to the App Store

```bash
bundle exec fastlane bump type:minor
bundle exec fastlane ios release
```

`upload_to_app_store` uploads + submits for review. The lane sets `skip_metadata: true` / `skip_screenshots: true` — fill in description, screenshots, keywords, age rating, and privacy answers in App Store Connect before the build can be reviewed. Once metadata is complete and the build is processed, review typically takes 24–72 hours.

### CI

Both `./run-ios.sh` and `bundle exec fastlane ios beta` run in GitHub Actions on a macOS runner. Base64-encode `api_key.p8` into a secret and decode it before the lane runs.
