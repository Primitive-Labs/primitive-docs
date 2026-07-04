# Configuring Primitive Services

Everything Primitive does for your app — which sign-in methods are enabled, what workflows exist, which external APIs can be called, what database operations clients may run — is **configuration of Primitive's services, stored on the Primitive servers**. Your client code doesn't define that behavior; it invokes what configuration declares.

There are two equivalent ways to manage that configuration:

1. **The [Admin Console](https://admin.primitiveapi.com)** — interactive and visual. Best for exploring, testing, and one-off changes.
2. **TOML files in your repo, synced via the CLI** — configuration as code. Best for anything you want versioned, reviewed, reproduced across environments, or managed by an AI coding agent.

Both edit the same underlying configuration. Most teams explore in the console and commit the result as TOML.

## The Sync Loop

`primitive sync` round-trips your app's configuration between the server and a directory of TOML files:

```bash
primitive sync init     # create the directory structure
primitive sync pull     # download current server config as TOML
# ... edit files locally ...
primitive sync diff     # see what would change
primitive sync push     # apply your changes to the server
```

The sync directory auto-resolves to `.primitive/sync/<env>/<appId>/` — one isolated slot per environment. Pass `--dir <path>` to override it with a fixed directory.

The files live in your repo, so configuration changes ride the same workflow as code: branches, diffs, reviews, rollbacks. `sync push` validates every file before applying anything — a validation error aborts the push with no changes applied — and reports the file and entity behind any failure.

**Preview before you push.** `primitive sync diff` shows which entities would be created, changed, or removed; `primitive sync push --dry-run` walks the full push and reports the same outcome without writing anything. One caveat: `diff` counts entities only, so a change confined to `app.toml` (app settings) shows up as `Local only: 0 / Remote only: 0 / Synced: 0` there — preview app-settings changes with `push --dry-run`, which includes them. Both run the identical validation a real push runs, so a rejection — an operation whose database type has no schema, an unresolved reference, a schema change that would break an existing operation — surfaces in the preview exactly as it would on push. The preview is faithful: what it reports is what `sync push` will do. And a blocked entity records no sync state, so it stays visible as pending on the next `diff` instead of quietly reading as "in sync."

Every `sync pull` snapshots the sync directory before writing, so a pull that overwrites local edits is recoverable:

```bash
primitive sync revert --list            # list available snapshots
primitive sync revert                   # restore the most recent
primitive sync revert --snapshot <id>   # restore a specific one
```

Snapshots are local CLI state, kept out of version control and pruned after 28 days. `revert` replaces the sync directory with the snapshot — run `primitive sync diff` afterwards to see where the restored files stand relative to the server.

## What Lives in the Config Directory

One subdirectory per kind of configuration:

```
config/
  app.toml                        # App settings
  workflows/*.toml                # Workflow definitions
  workflow-fragments/*.toml       # Reusable step blocks
  transforms/*.rhai               # Rhai scripts for workflow script steps
  prompts/*.toml                  # Managed prompts
  integrations/*.toml             # External API integrations
  database-types/*.toml           # Database operations, triggers, subscriptions
  webhooks/*.toml                 # Inbound webhooks
  cron-triggers/*.toml            # Scheduled workflow triggers
  blob-buckets/*.toml             # Blob bucket definitions
  email-templates/*.toml          # Email template overrides
  rule-sets/*.toml                # Access rule sets
  group-type-configs/*.toml       # Group type configuration
  collection-type-configs/*.toml  # Collection type configuration
  metadata-category-configs/*.toml # Resource metadata category configs
```

Every feature page in these docs that shows a TOML block — [Workflows](./workflows.md), [Prompts](./prompts.md), [API Integrations](./api-integrations.md), [Working with Databases](./working-with-databases.md), [Blobs and Files](./blobs-and-files.md), [Resource Metadata](./resource-metadata.md) — is describing one of these files. Define the entity in TOML, `primitive sync push`, and it's live.

`app.toml` holds the app-level settings, and pushing it is the preferred way to change them — the imperative `primitive apps update --flag` calls mutate the server directly and drift from the checked-in TOML, so a later `sync push` reverts them. The TOML-syncable settings are:

- `[app]` — `name`, `mode`, `waitlistEnabled`, `baseUrl`
- `[auth]` — `googleOAuthEnabled`, `magicLinkEnabled`, `passkeyEnabled`, `appleSignInEnabled`, `appleAudiences`, `otpEnabled`, and `[auth.passkeys]` relying-party config
- `[cors]` (when `mode = "custom"`) — `allowedOrigins`, `allowCredentials`, `allowedMethods`, `maxAge`

Only the keys listed above are pushed — an omitted `[auth]` key leaves the server value untouched (it isn't cleared), and an unrecognized `[auth]` key is ignored with a warning on push. **Redirect URIs** are the one app setting not part of `app.toml`: set them with `primitive apps update --redirect-uris "<uri1>,<uri2>"` or in the [Admin Console](https://admin.primitiveapi.com).

Credentials never go in these files: config that needs an API key references it as <span v-pre>`{{ secrets.KEY }}`</span>, with the value stored server-side. See [App Secrets](./app-secrets.md).

## Environments

A project usually targets more than one app — a development app for day-to-day coding, a production app for your customers. The CLI's named environments bind a server and app together so every command (including `sync`) knows which app it's talking to, and each environment gets its own isolated sync directory. See [Project Configuration and Environments](./primitive-cli.md#project-configuration-and-environments).

## Console or Code?

| Task | Console | TOML + CLI |
|---|---|---|
| Exploring and testing | Preferred — visual, interactive | Works but less convenient |
| Version-controlled config | — | Preferred |
| Quick one-off changes | Convenient | Convenient |
| AI agent automation | — | Preferred — agents speak CLI |
| CI/CD pipelines | — | Preferred — scriptable |

## Next Steps

- **[Primitive CLI](./primitive-cli.md)** — Full CLI reference, environments, and sync details
- **[Admin Console](./admin-console.md)** — The interactive view of the same configuration
- **[Workflows](./workflows.md)** — The most config-driven feature on the platform
