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

### 2. Run on a Physical iPhone / iPad

```bash
./run-ios.sh --device
```

You need a paired iPhone connected over USB (run `xcrun devicectl list devices` to verify it shows up as `paired`). The script auto-picks the first paired device, builds with `-allowProvisioningUpdates` (so Xcode requests provisioning profiles for you), installs via `devicectl`, and launches with `--console` so `print` and NSLog output stream to your terminal.

### 3. Install Fastlane

The iOS template doesn't include Fastlane by default — it's a few minutes to add and you get one-command builds to TestFlight, internal tester provisioning, and version bumping in the bargain.

Add a `Gemfile` to your project root:

```ruby
source "https://rubygems.org"
gem "fastlane"
```

Then:

```bash
bundle install
bundle exec fastlane init
```

Pick **manual setup** when asked. Fastlane creates `fastlane/Appfile` and `fastlane/Fastfile`.

`fastlane/Appfile`:

```ruby
app_identifier "com.yourcompany.myapp"  # must match PRODUCT_BUNDLE_IDENTIFIER in project.yml
team_id "2J4V27W63D"                    # same Team ID as DEVELOPMENT_TEAM
```

### 4. App Store Connect API Key

The lanes below authenticate with App Store Connect using an API key (not a username / password — the username path no longer works for upload).

1. Go to [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api).
2. Create a new key with role **App Manager**.
3. Download the `.p8` file (you can only download it once) and save it to `fastlane/api_key.p8`.
4. Note the **Key ID** and **Issuer ID** from the same page.
5. Add a `.env` next to `fastlane/`:

   ```bash
   ASC_KEY_ID=ABC123XYZ
   ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
   ASC_KEY_PATH=./fastlane/api_key.p8
   ```

::: warning Don't commit the key
Add `fastlane/api_key.p8` and `.env` to `.gitignore`. The `.p8` is a private key — leaking it lets anyone upload builds as your team.
:::

### 5. Fastfile

Drop this into `fastlane/Fastfile`. It mirrors the lanes used by shipping apps on the template — `beta` for TestFlight, `release` for App Store review, `add_testers` to invite people without clicking through App Store Connect, `bump` for version/build numbers.

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
  desc "Build and upload iOS app to TestFlight"
  lane :beta do
    api_key = load_api_key

    # Optional: read TestFlight "What to Test" notes from fastlane/changelog.txt
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

  desc "Build and submit iOS app to App Store review"
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

Internal testers (added via `add_testers` or in the App Store Connect UI) get builds immediately — no separate review. External testers and groups need a one-time Beta App Review per major version.

### 8. Submit to the App Store

```bash
bundle exec fastlane bump type:minor      # if you want to ship a real new version
bundle exec fastlane ios release
```

`upload_to_app_store` uploads the binary and submits it for review. The lane above sets `skip_metadata: true` and `skip_screenshots: true` — fill those in manually in App Store Connect (description, screenshots, keywords, age rating, privacy answers) before the build can actually be reviewed. Once metadata is complete and the build is processed, the review queue takes 24–72 hours typically.

::: tip CI
Both `./run-ios.sh` and `bundle exec fastlane ios beta` work in GitHub Actions on a macOS runner. Base64-encode `api_key.p8` into a secret and decode it before the lane runs.
:::
