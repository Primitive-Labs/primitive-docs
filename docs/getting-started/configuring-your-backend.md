# Configuring Your Backend

Everything your app's backend *does* — which sign-in methods are enabled, what workflows exist, which external APIs can be called, what database operations clients may run — is **configuration that lives on the Primitive servers**. Your client code doesn't define backend behavior; it invokes behavior that configuration declares.

There are two equivalent ways to manage that configuration:

1. **The [Admin Console](https://admin.primitiveapi.com/login)** — interactive and visual. Best for exploring, testing, and one-off changes.
2. **TOML files in your repo, synced via the CLI** — configuration as code. Best for anything you want versioned, reviewed, reproduced across environments, or managed by an AI coding agent.

Both edit the same underlying configuration. Most teams explore in the console and commit the result as TOML.

## The Sync Loop

`primitive sync` round-trips your app's configuration between the server and a directory of TOML files:

```bash
primitive sync init --dir ./config     # create the directory structure
primitive sync pull --dir ./config    # download current server config as TOML
# ... edit files locally ...
primitive sync diff --dir ./config    # see what would change
primitive sync push --dir ./config    # apply your changes to the server
```

The files live in your repo, so configuration changes ride the same workflow as code: branches, diffs, reviews, rollbacks. `sync push` validates every file before applying anything — a validation error aborts the push with no changes applied — and reports the file and entity behind any failure.

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
```

Every feature page in these docs that shows a TOML block — [Workflows](./workflows.md), [Prompts](./prompts.md), [API Integrations](./api-integrations.md), [Working with Databases](./working-with-databases.md), [Blobs and Files](./blobs-and-files.md) — is describing one of these files. Define the entity in TOML, `primitive sync push`, and it's live.

Credentials never go in these files: config that needs an API key references it as <span v-pre>`{{ secrets.KEY }}`</span>, with the value stored server-side. See [App Secrets](./app-secrets.md).

## Environments

A project usually targets more than one backend — a development app for day-to-day coding, a production app for your customers. The CLI's named environments bind a server and app together so every command (including `sync`) knows which backend it's talking to, and each environment gets its own isolated sync directory. See [Project Configuration and Environments](./primitive-cli.md#project-configuration-and-environments).

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
