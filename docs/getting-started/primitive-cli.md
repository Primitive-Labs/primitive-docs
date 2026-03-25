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

This opens your browser for OAuth authentication. Once complete, your credentials are stored locally at `~/.primitive/credentials.json`.

To check your current authentication status:

```bash
primitive whoami
```

To log out:

```bash
primitive logout
```

## Setting Your App Context

Most commands operate on a specific app. Instead of passing `--app` to every command, set a default context:

```bash
primitive use "My App"
```

This stores your current app context so subsequent commands know which app to target. You can also run this without arguments to interactively select from your apps:

```bash
primitive use
```

To see your current context:

```bash
primitive context
```

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

Configure OAuth providers for your app:

```bash
# Set up Google OAuth
primitive apps oauth set-google --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET

# Add allowed origins (for CORS)
primitive apps origins add http://localhost:5173
primitive apps origins add https://myapp.com
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

The CLI supports exporting and importing app configuration as TOML files, enabling version control for your app settings:

```bash
# Initialize a config directory
primitive sync init --dir ./config

# Pull current configuration from server
primitive sync pull --dir ./config

# See what's changed
primitive sync diff --dir ./config

# Push local changes to server
primitive sync push --dir ./config
```

This creates a directory structure like:

```
config/
  app.toml                    # App settings
  integrations/*.toml         # Integration configs
  prompts/*.toml              # Prompt configs
  workflows/*.toml            # Workflow definitions
  email-templates/*.toml      # Email template overrides
```

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
primitive prompts test my-prompt
```

### Workflows

Build and manage multi-step workflows:

```bash
primitive workflows list
primitive workflows publish my-workflow
primitive workflows runs list
```

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

Email template types include `magic-link` and `otp`. Each type exposes template variables (e.g. `{{magicLinkUrl}}`, `{{otpCode}}`) that Primitive substitutes at send time. Use `primitive email-templates variables <type>` to see the full list.

### Analytics

View usage metrics:

```bash
primitive analytics overview
primitive analytics top-users
primitive analytics user <user-ulid>
primitive analytics integrations
```

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
