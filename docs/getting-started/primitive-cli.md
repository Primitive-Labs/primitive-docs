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

Install the CLI globally via npm:

```bash
npm install -g primitive-admin
```

This installs the `primitive` command globally on your system.

## Authentication

Before using most commands, you need to authenticate:

```bash
primitive login
```

This opens your browser for OAuth authentication. Tokens are stored per-environment so dev and prod can stay signed in independently — see [Project Configuration and Environments](#project-configuration-and-environments) below for where they land.

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
```

### Managing Users

```bash
# List users in your app
primitive users list

# Invite a user
primitive users invite user@example.com

# Remove a user
primitive users remove user@example.com

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

Configure OAuth providers for your app (client credentials are entered in the [Admin Console](https://admin.primitiveapi.com/login) under the app's Google OAuth settings):

```bash
# Enable Google OAuth as a sign-in method
primitive apps update --google-oauth true

# Set allowed origins (for CORS; comma-separated list)
primitive apps update --cors-origins "http://localhost:5173,https://myapp.com"
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

Guides are cached locally at `~/.primitive/guides/` for offline access.

:::tip For AI Agents
When working with an AI coding assistant, point it to these guides before asking it to implement features. For example: "Read `primitive guides get workflows` and then create a workflow that sends a welcome email when a user signs up." The agent will fetch the guide, learn the patterns, and implement your request correctly.
:::

## Configuration Sync

The CLI supports exporting and importing app configuration as TOML files, enabling version control for your app settings.

When using **project-scoped environments** (set up via `primitive env create`), the sync directory is resolved automatically as `.primitive/sync/<env>/<appId>/` — each environment gets its own isolated slot so a `pull --env staging` never touches production state:

```bash
# Initialize (auto-resolves .primitive/sync/<env>/<appId>/)
primitive sync init

# Pull current configuration from server
primitive sync pull

# See what's changed
primitive sync diff

# Push local changes to server
primitive sync push
```

Pass `--dir <path>` to override and use a fixed directory:

```bash
primitive sync init --dir ./config
primitive sync pull --dir ./config
primitive sync push --dir ./config
```

This creates a directory structure like:

```
.primitive/sync/<env>/<appId>/
  app.toml                    # App settings
  integrations/*.toml         # Integration configs
  prompts/*.toml              # Prompt configs
  workflows/*.toml            # Workflow definitions
  workflow-fragments/*.toml   # Reusable [[steps]] blocks for workflows
  database-types/*.toml       # Database type configs + operations
  email-templates/*.toml      # Email template overrides
```

`workflow-fragments/<name>.toml` lets several workflows share a common run of `[[steps]]`. Reference them from a workflow file with `include = ["<name>"]`; the CLI expands fragments client-side before push (the server only stores the canonical flattened step list). Use `primitive workflows expand <workflow.toml>` to inspect the expanded result.

### When `sync push` fails

`sync push` reports the server's error message along with the entity it was applying when the failure happened, so you can jump straight to the offending file:

```
Failed to update workflow "send-digest": Workflow contains sync-incompatible steps
```

For workflows in particular, the CLI validates referenced operation params at push time: every `$params.X` substitution inside a workflow's database operations must match a declared `[[operations.params]]` entry, and the error names the file and line of the operation block where the bad reference appears. This catches typos like `$params.proectId` that would otherwise silently no-op at runtime.

CLI diagnostics (success/warning/info messages) are written to stderr; only structured data (e.g. `--json` output) goes to stdout, so piping `primitive sync diff --json | jq` works without any extra redirects.

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

### Workflows

Build and manage multi-step workflows:

```bash
primitive workflows list
primitive workflows publish my-workflow
primitive workflows runs list
```

### Cron Triggers

Schedule workflows to run on a cron expression:

```bash
primitive cron-triggers list
primitive cron-triggers create \
  --key nightly-digest \
  --workflow-key send-digest \
  --cron "0 9 * * *" \
  --timezone "America/Los_Angeles"
primitive cron-triggers test nightly-digest      # fire manually
primitive cron-triggers pause nightly-digest
primitive cron-triggers resume nightly-digest
primitive cron-triggers delete nightly-digest
```

See [Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md).

### Database Codegen

Generate TypeScript types from your database-type TOML schemas:

```bash
primitive databases codegen --sync-dir ./config --output ./src/generated/db
```

Reads `[models.*]` schema blocks and `[[operations]]` from your database-type TOML and emits typed record interfaces, operation param types, and result types. Keeps client-side types aligned with the server-authoritative schema.

### Blob Buckets

Manage general-purpose blob storage:

```bash
primitive blob-buckets list
primitive blob-buckets create --key avatars --access authenticated --ttl permanent
primitive blob-buckets list-blobs avatars
primitive blob-buckets upload avatars ./file.png --content-type image/png
primitive blob-buckets signed-url avatars <blobId> --expires 3600
primitive blob-buckets delete avatars -y
```

See [Blob Buckets](./blob-buckets.md).

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

Email template types include built-in types (`magic-link`, `otp`, `access-request-created`, `access-request-resolved`, and others) plus any custom kebab-case type names you register. Each type exposes template variables (e.g. <span v-pre>`{{magicLinkUrl}}`</span>, <span v-pre>`{{otpCode}}`</span>) that Primitive substitutes at send time. Use `primitive email-templates variables <type>` to see the full list.

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

The list is capped at 50 base emails per app, and a base cannot itself be a `+primitivetest` derivative. The whitelist is re-checked on every request, so removing a base immediately revokes its derived sessions.

Each whitelisted base authorizes unlimited derived addresses of the form `<base-local>+primitivetest<suffix>@<base-domain>`. From the test side, sign in via the normal OTP flow using the magic code `000000`:

```typescript
// In an integration test
await client.otpRequest("alice+primitivetest-teacher@example.com");
await client.otpVerify("alice+primitivetest-teacher@example.com", "000000");
// client is now authenticated; the access token expires in 30 minutes
```

The derived account must already exist as an `AppUser` in this app — invite it ahead of time or seed it as part of test setup. The bypass never auto-provisions.

Guardrails:

- **Per-app whitelist.** Apps without a whitelist have no bypass at all.
- **30-minute tokens** with a `primitiveBypass: true` claim, re-checked per request against the whitelist.
- **Member scope only.** `+primitivetest*` cannot hold admin/owner privileges or receive invitations to those roles — boundary calls return `RESERVED_EMAIL_FOR_ADMIN`.
- **AppUser must exist.** The derived account has to be an existing member of the app.

Use this for automated tests and local development. See [Authentication](./authentication.md#test-user-sign-in-for-automated-testing) for the security model in detail.

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

## Getting Help

Every command has built-in help:

```bash
primitive --help
primitive apps --help
primitive users invite --help
```

## Next Steps

- **[Template App Setup](./template-app.md)** — Create your first app
- **[Working with Databases](./working-with-databases.md)** — Server-side storage managed via CLI
- **[Workflows and Prompts](./workflows-and-prompts.md)** — Automation configured via CLI
- **[Deploying to Production](./deploying-to-production.md)** — Deploy your app
