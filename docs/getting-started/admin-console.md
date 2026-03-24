# Admin Console

The Primitive Admin Console is a web-based dashboard for managing your apps, users, and backend configuration. It's available at [admin.primitiveapi.com](https://admin.primitiveapi.com).

## What You Can Do

### App Configuration
- View and update app settings (name, mode, allowed origins)
- Configure authentication providers (Google OAuth credentials, Magic Link, OTP, Passkeys)
- Manage email templates for authentication flows
- Set invite-only mode for controlled access

### Users & Groups
- View all users in your app
- Invite new users and manage pending invitations
- Manage console admins (who can access the admin console) and admin invitations
- Manage waitlist (when in invite-only mode)

### Databases
- Browse databases and their types
- View and test registered operations
- Inspect operation access control expressions
- Run operations directly to verify behavior

### Workflows
- View workflow definitions and their status (draft, active, archived)
- Start workflow runs with test inputs
- Monitor run progress and inspect step-by-step output
- View run history and debug failures

### Prompts
- View managed prompts and their configurations
- Preview rendered prompts with test inputs
- Run prompt test cases
- Manage prompt status (draft, active, archived)

### Integrations
- Configure external API connections (base URL, allowed paths, headers)
- Manage integration secrets
- Test integrations with sample requests
- View recent call logs

### Analytics
- View usage metrics and event counts
- Monitor daily active users
- Track custom events

## When to Use the Console vs. the CLI

Both tools manage the same configuration — use whichever fits your workflow:

| Task | Console | CLI |
|---|---|---|
| Exploring and testing | Preferred — visual feedback, interactive | Works but less convenient |
| Version-controlled config | Not applicable | Preferred — TOML files in your repo |
| Quick one-off changes | Convenient | Convenient |
| AI agent automation | Not applicable | Preferred — agents use CLI commands |
| CI/CD pipelines | Not applicable | Preferred — scriptable |

In practice, many developers use the console for exploring and testing, and the CLI (with `primitive sync`) for managing configuration as code.

## Next Steps

- **[Primitive CLI](./primitive-cli.md)** — Command-line alternative for all admin tasks
- **[Workflows and Prompts](./workflows-and-prompts.md)** — Define the workflows you'll test in the console
- **[API Integrations](./api-integrations.md)** — Configure the integrations you'll manage in the console
