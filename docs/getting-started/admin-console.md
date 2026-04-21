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
- Enable member invitations and set quota limits
- View pending invitations and the email-based document shares or group adds attached to them
- Manage console admins (who can access the admin console) and admin invitations
- Manage waitlist (when in invite-only mode)

### Sharing & Access
- Review and approve/deny pending document access requests
- Browse bookmarks and shared-document state per user
- View audit trail of share, invitation, and access-request activity

### Databases
- Browse databases and their types
- View and test registered operations (including `applyToQuery` and `executeBatch`)
- Inspect operation access control expressions and per-subscription filter rules
- Grant group-based permissions on a database
- Run operations directly to verify behavior

### Workflows
- View workflow definitions and their status (draft, active, archived)
- Manage cron triggers (create, edit, enable/disable, fire manually)
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

### Email Templates
- Manage built-in email templates (magic link, OTP, access-request-created, etc.)
- Register custom email template types with arbitrary kebab-case names
- Preview rendered templates and send test emails

### Blob Buckets
- Create and configure blob buckets (access policy, TTL tier, CEL rules)
- Browse blobs and generate signed URLs for inspection
- Delete buckets and their contents

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
