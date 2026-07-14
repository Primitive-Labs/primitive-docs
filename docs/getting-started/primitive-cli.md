# Primitive CLI

The Primitive CLI (`primitive`) is a command-line tool for managing your Primitive applications. It handles authentication, app configuration, user management, and provides access to guides and documentation.

## Why Use the CLI?

While most day-to-day development happens in your code editor, the CLI is essential for:

- **AI Agent Integration** — The CLI is designed to be used by AI coding assistants (like Claude). When you ask an agent to create a workflow, configure an integration, or deploy a prompt, it uses `primitive` commands to interact with the Primitive server. This enables agents to fully manage your app's backend configuration without you needing to use the admin console.

- **Version-Controlled Configuration** — Use `primitive sync` to export your app's configuration (prompts, workflows, integrations) as TOML files that live in your repo alongside your code.

- **Automation & CI/CD** — Script deployments and configuration changes in your build pipelines.

- **Quick Admin Tasks** — Invite users, check analytics, or test prompts without leaving your terminal.

:::tip Agent Usage
If you're working with an AI coding assistant, it can run `primitive guides list` to see available documentation and `primitive guides get <topic>` to learn how to use specific features. The agent can then use CLI commands to implement what you've asked for.
:::

## Installation

Install the CLI globally:

```bash
pnpm add -g primitive-admin
```

This installs the `primitive` command globally on your system.

## Authentication

Before using most commands, you need to authenticate:

```bash
primitive login
```

This opens your browser for OAuth authentication. Tokens are stored per-environment so dev and prod can stay signed in independently — see [Project Configuration and Environments](#project-configuration-and-environments) below for where they land.

`login` authenticates against the active environment's server. Inside a project it uses the selected environment's `apiUrl` — pick the environment with `-e <env>`. Outside a project it uses the default server, which you can point at a local or custom server with the `PRIMITIVE_SERVER_URL` environment variable:

```bash
primitive -e prod login                                       # a named environment's server
PRIMITIVE_SERVER_URL=http://localhost:8787 primitive login    # a custom server, no project config
```

To check your current authentication status:

```bash
primitive whoami
```

To log out:

```bash
primitive logout
```

## Project Configuration and Environments

Primitive CLI config is **project-scoped**. When you run `primitive init` or any CLI command inside a directory containing `.primitive/config.json` (the CLI walks up from the current working directory looking for it), the CLI operates against the named environments declared in that file.

```
my-app/
├── .primitive/
│   ├── config.json         # committed — environment definitions
│   └── credentials.json    # gitignored — per-environment tokens
├── src/
└── package.json
```

Two files, two purposes:

- **`.primitive/config.json`** is committable. It defines named environments and an optional default. Your whole team targets the same apps because the file is checked in.
- **`.primitive/credentials.json`** is gitignored. It holds the per-environment access/refresh tokens written by `primitive login`. Never check it in.

Outside a project directory (no `.primitive/config.json` found by walking up from cwd), the CLI falls back to a user-scope config at `~/.primitive/credentials.json` driven by `primitive use <app>`. Most teams never need this — see [User-Scope Fallback](#user-scope-fallback) below.

### Named Environments

A single project usually targets multiple backends — a development app for day-to-day coding, a staging app for QA, a production app for your customers. Each environment in `.primitive/config.json` binds an `apiUrl` and an `appId` together so "which server" and "which app" always travel as one unit:

```json
{
  "version": 1,
  "defaultEnvironment": "dev",
  "environments": {
    "dev":  { "apiUrl": "http://localhost:8787",       "appId": "app_..." },
    "prod": { "apiUrl": "https://api.primitive.com",   "appId": "app_..." }
  }
}
```

Manage environments with the `env` subcommands:

```bash
# Create an environment (auto-creates .primitive/config.json if missing)
primitive env add dev  --api-url http://localhost:8787      --app-id app_dev123
primitive env add prod --api-url https://api.primitive.com  --app-id app_prod456

# List all environments and inspect one
primitive env list
primitive env show prod

# Set the default environment for this project
primitive env use dev

# Delete an environment (also clears its credential slot, so re-adding the
# same name later cannot reuse stale tokens)
primitive env remove staging
```

`--app-id` is optional. If you omit it, the environment pins only an `apiUrl` and the app is chosen per-session via `primitive use <appId>`.

A freshly-added environment starts **logged-out**. `primitive env add` writes only the config entry — it seeds no credentials, and project mode does not borrow the global `~/.primitive/credentials.json`. So right after `env add`, project-scoped commands report "not logged in" even if `primitive whoami` works globally; run `primitive login` with that environment active to sign it in. For agents and CI, sign in without a browser by piping a refresh token — see [API Tokens for CI and Servers](#api-tokens-for-ci-and-servers).

### How the Active Environment Is Resolved

Every command resolves an active environment in this order — the first match wins:

1. **`--env <name>` flag** on the command itself
2. **`PRIMITIVE_ENV` environment variable** (handy for CI)
3. **`defaultEnvironment`** in `.primitive/config.json` (set by `primitive env use`)
4. **The only environment defined** — if there is exactly one, it's used automatically
5. Otherwise the CLI errors and asks you to choose

So in CI you can do:

```bash
PRIMITIVE_ENV=prod primitive sync push
```

…or override per-command without changing the default:

```bash
primitive workflows runs list --env staging
primitive sync push --env prod
```

### Switching Apps Inside a Project

There is no global "currently active app" in project mode. The active app is whatever the resolved environment's `appId` says it is. To point an environment at a different app, edit `.primitive/config.json` (or run `primitive env add` again to overwrite). `primitive use <appId>` is a no-op when the resolved environment already pins an `appId` — for environments that omit `appId`, `use` still sets a per-session override.

### User-Scope Fallback

For one-off shells with no `.primitive/config.json` anywhere up the directory tree, the CLI uses a global config at `~/.primitive/credentials.json` and an active app set by `primitive use`:

```bash
primitive use "My App"
primitive context     # show current context
```

Inside a project directory, prefer `primitive env` — it's checked in, scoped to the project, and makes it trivial to switch between dev/staging/prod.

## Common Commands

### Managing Apps

```bash
# List all your apps
primitive apps list

# Create a new app
primitive apps create "My New App"

# View app details
primitive apps get

# Update app settings
primitive apps update --mode invite-only

# Let members send invitations, capped at 5 active each (0 = unlimited)
primitive apps update --member-invitations-enabled true --member-invitation-limit 5
```

### Managing Users

```bash
# List users in your app
primitive users list

# Invite a user
primitive users invite user@example.com

# Remove a user
primitive users remove <user-id>

# List pending invitations
primitive users invitations

# Change a user's role
primitive users set-role <user-id> admin
```

### Managing Console Admins

Console admins have access to the admin console for your app. Manage them separately from regular app users:

```bash
# List console admins
primitive users admins list

# Add a console admin (sends invitation if they don't have an account)
primitive users admins add admin@example.com

# Remove a console admin
primitive users admins remove <admin-id>

# List pending console admin invitations
primitive users admin-invitations list

# Delete a pending admin invitation
primitive users admin-invitations delete <invitation-id>
```

### OAuth Configuration

Configure OAuth providers for your app (client credentials are entered in the [Admin Console](https://admin.primitiveapi.com) under the app's Google OAuth settings). The provider toggle and CORS origins are app settings synced from `app.toml`, so the drift-free path is to edit the TOML and push:

```toml
# config/app.toml
[auth]
googleOAuthEnabled = true

[cors]
mode = "custom"
allowedOrigins = ["http://localhost:5173", "https://myapp.com"]
```

```bash
primitive sync push
```

The equivalent `primitive apps update --google-oauth true` / `--cors-origins "…"` flags set the same values imperatively for a quick one-off — but they mutate the server without touching `app.toml`, so the next `sync push` reverts them unless you mirror the change back. See [Configuration Sync](#configuration-sync) for which app settings are TOML-syncable.

OAuth **redirect URIs** are not TOML-syncable — set the callback whitelist with the flag (non-localhost entries must be https; pass `''` to clear) or in the Admin Console:

```bash
primitive apps update --redirect-uris "https://myapp.com/auth/callback,http://localhost:5173/auth/callback"
```

### Accessing Guides

The CLI includes built-in guides for various Primitive features:

```bash
# List available guides
primitive guides list

# Read a specific guide
primitive guides get documents
primitive guides get workflows
primitive guides get authentication
```

Guides come in TypeScript and Swift variants. By default you get the TypeScript guide; pass `--language swift` to fetch the Swift variant, or `--platform ios` (or `--platform macos`) to select the language that platform targets:

```bash
# Fetch the Swift variant of a guide
primitive guides get documents --language swift

# ...or let the platform choose the language (iOS and macOS target Swift)
primitive guides get documents --platform ios
```

`primitive guides list` takes the same flags. An unknown `--language` or `--platform` value is rejected rather than silently served as TypeScript, so a typo surfaces immediately.

Guides are cached locally at `~/.primitive/guides/`.

:::tip For AI Agents
When working with an AI coding assistant, point it to these guides before asking it to implement features. For example: "Read `primitive guides get workflows` and then create a workflow that sends a welcome email when a user signs up." The agent will fetch the guide, learn the patterns, and implement your request correctly. Building for iOS or macOS? Tell the agent to pass `--platform ios` so it fetches the Swift guides instead of the TypeScript default.
:::

## Configuration Sync

`primitive sync` round-trips your app's configuration between the server and a directory of TOML files. [Configuring Primitive Services](./configuring-primitive-services.md#the-sync-loop) covers the loop, the directory layout, and the `app.toml` settings in full — this is the command reference.

```bash
primitive sync init            # create the directory (auto-resolves .primitive/sync/<env>/<appId>/)
primitive sync pull            # download current server config as TOML
primitive sync diff            # preview entities that would be created, changed, or removed
primitive sync push            # apply local changes
primitive sync push --dry-run  # walk the full push, reported but not applied
primitive sync revert          # restore the sync directory from a pre-pull snapshot
```

Pass `--dir <path>` to any of these to override the auto-resolved directory with a fixed path. `sync revert --list` enumerates snapshots and `--snapshot <id>` restores a specific one.

Validation, preview fidelity, and push convergence (re-running a failed push adopts entities missing from sync state by key) are covered in [The Sync Loop](./configuring-primitive-services.md#the-sync-loop). `primitive workflows expand <workflow.toml>` prints a workflow with its [fragments](./workflows.md#syncing-workflow-config) expanded — the same flattening `sync push` performs before upload.

CLI diagnostics (success/warning/info messages) are written to stderr; only structured data (`--json` output) goes to stdout, so `primitive sync diff --json | jq` works without any extra redirects.

## Claude Code Skill

The CLI includes a built-in skill for Claude Code that gives it expert knowledge of the Primitive platform. When installed, Claude Code automatically follows Primitive patterns and best practices as you build.

```bash
# Install or update the skill
primitive skill install

# Check installation status
primitive skill status

# Remove the skill
primitive skill uninstall
```

The skill is installed to `~/.claude/skills/primitive-platform/SKILL.md`. If the skill is already installed, the CLI will automatically update it to the latest bundled version after each command run.

:::tip During Init
When you run `primitive init`, you'll be prompted to install the skill as part of project setup. If you skip it, you can always install it later with `primitive skill install`.
:::

## Advanced Features

### App Secrets

Store app-level secrets server-side and reference them from workflows and integrations as <span v-pre>`{{secrets.KEY_NAME}}`</span> — your client code and repo never see the values:

```bash
primitive secrets set OPENAI_API_KEY --value sk-...
primitive secrets list
primitive secrets delete OPENAI_API_KEY
```

### Resource Metadata

Read and write [resource metadata](./resource-metadata.md) category values — category definitions (schema, `readRule`, `writeRule`) are managed through `primitive sync`, not this command:

```bash
primitive metadata set user 01HXY... profile --data '{"tier":"pro"}'
primitive metadata get user 01HXY... profile --json
primitive metadata get-batch --resource user:01HXY...:profile,billing
primitive metadata list user 01HXY...                # every stored category on a resource
primitive metadata delete user 01HXY... profile      # idempotent
primitive metadata categories list                   # inspect category definitions
primitive metadata categories get user profile
```

### Integrations

Configure external API connections:

```bash
primitive integrations list
primitive integrations create my-api
primitive integrations test my-api
```

### Prompts

Manage LLM prompts:

```bash
primitive prompts list
primitive prompts create my-prompt
primitive prompts execute my-prompt
```

### Scripts

Inspect Rhai [scripts](./workflows.md#script) (transforms) and manage their test cases. Script bodies are authored through `primitive sync` (`transforms/<name>.rhai`); this command reads them and drives their tests:

```bash
primitive scripts list
primitive scripts get normalize-order
primitive scripts tests run-all normalize-order
```

### Workflows

Build and manage multi-step workflows:

```bash
primitive workflows list
primitive workflows publish my-workflow
primitive workflows runs list
```

The management and runs commands identify a workflow by its id **or** its key — `publish my-workflow` above resolves the key `my-workflow` (app-scoped, case-insensitive; when a value matches both, the id wins).

Inspect and clear the restartable iterations of an [`iterate-users`](./workflows.md#iterate-users) workflow:

```bash
primitive workflows iterations list             # status + progress of each iteration
primitive workflows iterations get <name>       # one iteration in detail
primitive workflows iterations reset <name>     # clear a finished iteration so its next trigger runs fresh
```

### Webhooks

Manage inbound webhooks that trigger workflows when external services (Stripe, GitHub, Slack, …) send events. Define them as `webhooks/*.toml` in your sync directory, then inspect from the terminal:

```bash
primitive webhooks list                    # shows each webhook's ID
primitive webhooks get <webhook-id>
primitive webhooks events <webhook-id>      # recent deliveries (accepted/rejected/duplicate)
primitive webhooks rotate-secret <webhook-id>
primitive webhooks test <webhook-id>
```

See [Inbound Webhooks](./workflows.md#via-inbound-webhooks).

### Cron Triggers

Schedule workflows to run on a cron expression:

```bash
primitive cron-triggers list
primitive cron-triggers create \
  --key nightly-digest \
  --workflow-key send-digest \
  --cron "0 9 * * *" \
  --timezone "America/Los_Angeles"
primitive cron-triggers test <trigger-id>        # fire manually (ID from cron-triggers list)
primitive cron-triggers pause <trigger-id>
primitive cron-triggers resume <trigger-id>
primitive cron-triggers delete <trigger-id>
```

See [Invoking Workflows: On a Schedule](./workflows.md#on-a-schedule-cron-triggers).

### Database Codegen

Generate TypeScript types from your database-type TOML schemas:

```bash
primitive databases codegen -o ./src/generated/db
```

Reads from the database-type TOML in the auto-resolved sync directory; pass `--sync-dir <path>` to override it. Reads `[models.*]` schema blocks and `[[operations]]` from your database-type TOML and emits typed record interfaces, operation param and result types, and a typed `<type>Ops(client, databaseId)` call factory per database type (see [Typed operation calls](./working-with-databases.md#typed-operation-calls)). Keeps client-side types aligned with the server-authoritative schema.

### Workflow Codegen

Generate typed workflow-invocation wrappers from the `inputSchema`/`outputSchema` in your workflow TOML:

```bash
primitive workflows codegen
```

Emits one `<key>.generated.ts` per workflow with input/output types and a factory that pins the workflow key, with typed `start`/`getStatus` (and `runSync` when the workflow is `syncCallable`); `--check` fails in CI when the output is out of date (see [Typed Invocations](./workflows.md#typed-invocations-typescript-codegen)).

### Blob Buckets

Manage general-purpose blob storage:

```bash
primitive blob-buckets list
primitive blob-buckets create --key avatars --preset authenticated --ttl permanent
```

See [Blobs and Files](./blobs-and-files.md#cli-reference) for the full command set — uploading, signed URLs, and blob/bucket deletion.

### Email Templates

Customize the emails Primitive sends for authentication (magic links, OTP codes, etc.):

```bash
# List all email types and their override status
primitive email-templates list

# View the current template for an email type
primitive email-templates get magic-link

# Set a custom template (provide subject and/or body files)
primitive email-templates set magic-link --subject "Sign in to MyApp" --html-file ./magic-link.html --text-file ./magic-link.txt

# See available template variables for an email type
primitive email-templates variables magic-link

# Send a test email using the current template
primitive email-templates test magic-link

# Remove a custom override (revert to default)
primitive email-templates delete magic-link
```

Email template types are the built-ins — `magic-link`, `otp`, `document-share`, `document-share-deferred`, `collection-share`, `collection-share-deferred`, `waitlist-invite`, `waitlist-signup-notification`, `admin-invite`, `app-invite`, `access-request-created`, and `access-request-resolved` — plus any custom kebab-case type names you register. Each type exposes template variables (e.g. <span v-pre>`{{magicLinkUrl}}`</span>, <span v-pre>`{{otpCode}}`</span>) that Primitive substitutes at send time. Use `primitive email-templates variables <type>` to see the full list.

### Analytics

View usage metrics:

```bash
primitive analytics overview
primitive analytics top-users
primitive analytics user-detail <user-ulid>
primitive analytics user-search --query user@example.com
primitive analytics events --window-days 7
primitive analytics events-grouped --group-by feature
primitive analytics cohort-retention
primitive analytics workflows
primitive analytics prompts
primitive analytics integrations
```

## Test Users for Automated Testing

For integration tests and local dev, Primitive supports a `+primitivetest` OTP bypass gated by a per-app whitelist. Configure the whitelist with `primitive apps update`:

```bash
# Authorize one or more base emails to derive +primitivetest test accounts
primitive apps update --test-account-bases alice@example.com,bob@example.com

# Inspect the current whitelist (along with other app settings)
primitive apps get

# Clear the whitelist — pass an empty string
primitive apps update --test-account-bases ''
```

The list is capped at 50 base emails per app, and a base cannot itself be a `+primitivetest` derivative.

Each whitelisted base authorizes unlimited derived addresses of the form `<base-local>+primitivetest<suffix>@<base-domain>`. From the test side, sign in via the normal OTP flow using the magic code `000000`:

::: code-group

<<< ../../examples/auth/test-user-otp.ts#example{ts} [JavaScript]

<<< ../../examples/auth/test-user-otp.swift#example{swift} [Swift]

:::

A first sign-in provisions the derived account through the same signup path as a real user, and the response's `isNewUser` reflects whether the account was just created — so first-run and new-user flows can be exercised through the bypass. The app's signup-mode gates apply exactly as for a normal signup: an invite-only app still requires an invitation or invite token (or adds the address to the waitlist when that's enabled), and domain mode still rejects disallowed domains. The whitelist is what keeps provisioning safe — only the app owner's own `+primitivetest` derivatives are eligible.

Guardrails:

- **Per-app whitelist.** Apps without a whitelist have no bypass at all.
- **30-minute tokens** with a `primitiveBypass: true` claim, re-checked per request against the whitelist — removing a base immediately revokes its derived sessions.
- **Member scope only.** `+primitivetest*` cannot hold admin/owner privileges or receive invitations to those roles — boundary calls return `RESERVED_EMAIL_FOR_ADMIN`.
- **Suffix shape.** Derived addresses match `<base-local>+primitivetest<suffix>@<base-domain>` where the suffix is `[A-Za-z0-9._-]*`; only single-`+` shapes are accepted.

Use this for automated tests and local development — not for staging or production flows.

### CI Recipe for Invite-Only Apps

Because the signup gates apply, a fresh derived address on an invite-only app is stopped at the email step — waitlisted or rejected before any code is accepted. Rather than routing invitation emails through CI, add the member directly:

```bash
# 1. One-time app setup: whitelist the base
primitive apps update --test-account-bases ci@example.com

# 2. Per test user: add the derived address as a member — no invitation email.
#    --json returns the new member's userId for scripting.
primitive users create ci+primitivetest-checkout@example.com --json

# 3. The test session signs in through the normal OTP flow with code 000000
```

`users create` adds the membership directly, so the invite gate never fires and the OTP sign-in proceeds as an existing member. For features gated on [resource metadata](./resource-metadata.md) — a subscription entitlement, a feature flag — an app owner or admin can set the test user's state directly, since app-level owners and admins bypass category write rules:

```bash
primitive metadata set user <userId> entitlements --data '{"tier":"pro"}'
```

With those steps a headless or browser-automation session can sign in as a fresh, entitled member with no human interaction.

## Scripting

For automation and scripting, most commands support `--json` output:

```bash
primitive apps list --json
primitive users list --json
```

To get the current access token for use with other tools:

```bash
primitive token
```

`primitive token` automatically refreshes the active access token if it's expired or about to expire, so scripts that pipe it into another tool ( `curl -H "Authorization: Bearer $(primitive token)" ...`) keep working past the access-token lifetime without a manual `primitive login`.

### API Tokens for CI and Servers

For headless environments where a browser-based `primitive login` isn't possible — CI pipelines, deploy scripts, server-side jobs — you have two non-interactive paths.

To sign in as yourself, pipe a refresh token into `login --token-stdin`. Select the environment with `-e <env>` so login targets the right server (or, without a project config, point it at one with `PRIMITIVE_SERVER_URL`):

```bash
primitive token --refresh | primitive -e <env> login --token-stdin
```

Or create a long-lived API token, which isn't tied to a user session:

```bash
primitive tokens create --name "CI deploys" --ttl 90d
primitive tokens list
primitive tokens revoke <token-id>
```

TTL accepts `m`/`h`/`d`/`w`/`mo`/`y` units; omit `--ttl` for a non-expiring token. Treat these like passwords — store them in your CI's secret store and revoke any token you no longer need.

### Non-Interactive `primitive init`

`primitive init` (the command behind `npx create-primitive-app`) prompts for anything it needs — app name, target platform, access mode. For scripted setups, put the answers in a `.primitive-init.toml` file in the directory where you run it (or point at one elsewhere with `--config <path>`), and init skips every prompt:

```toml
action = "create"            # or "use-existing" (then set app_id instead of app_name)
app_name = "My App"
platform = "web"             # "web" or "ios" (defaults to web)
dir = "my-app"
access_mode = "invite-only"  # "public", "domain", or "invite-only"
skip_install = false
```

Run `primitive init --help` for the full key list (dev port, invite emails, allowed domains, overwrite behavior).

## Getting Help

Every command has built-in help:

```bash
primitive --help
primitive apps --help
primitive users invite --help
```

## Next Steps

- **[Quick Start](./template-app.md)** — Create your first app
- **[Working with Databases](./working-with-databases.md)** — Server-side storage managed via CLI
- **[Workflows](./workflows.md)** — Automation configured via CLI
- **[Deploying to Production](./deploying-to-production.md)** — Deploy your app
