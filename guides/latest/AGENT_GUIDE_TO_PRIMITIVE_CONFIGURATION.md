# Agent Guide to Primitive Configuration

Guidelines for AI agents configuring Primitive services. Everything Primitive does for an app — auth settings, workflows, prompts, integrations, database types/operations, webhooks, cron triggers, blob buckets, email templates, rule sets — is server-side configuration with two equivalent interfaces: the web Admin Console (interactive) and **TOML files synced via the CLI** (configuration as code). Agents should use the TOML + CLI path.

## The sync loop

```bash
primitive sync init     # create directory structure
primitive sync pull     # download server config as TOML
primitive sync diff     # preview changes
primitive sync push     # apply local TOML to the server
```

With project-scoped environments (`.primitive/config.json`), the sync directory auto-resolves to `.primitive/sync/<env>/<appId>/` — one isolated slot per environment, so a `pull --env staging` never touches production state. Pass `--dir <path>` only to override that location with a fixed directory shared across environments.

## Pull snapshots and revert

Every `sync pull` snapshots the sync directory before writing anything; if the snapshot can't be written, the pull aborts with no files changed. Snapshots older than 28 days are pruned automatically. Location follows the sync-dir resolution: in project mode `<projectRoot>/.primitive/sync-backups/<env>/<appId>/` (gitignored local state); with an explicit `--dir`, `<dir>/.snapshots/`.

```bash
primitive sync revert --list            # enumerate snapshots, newest first
primitive sync revert                   # restore the most recent
primitive sync revert --snapshot <id>   # timestamp dirname, or a unique >=8-char prefix
primitive sync revert -y                # skip the confirmation prompt
```

`revert` replaces the entire sync directory with the snapshot, including `.primitive-sync.json` (the local sync state). It warns when the config directory has uncommitted git changes (the restore overwrites them), and refuses to restore a partial/corrupted snapshot. After reverting, run `primitive sync diff` to inspect the restored state versus the server.

## Directory map

```
config/
  app.toml                        # App settings
  workflows/*.toml                # Workflow definitions
  workflows/{key}.tests/*.toml    # Workflow test cases
  workflow-fragments/*.toml       # Reusable [[steps]] blocks (include = ["<name>"])
  transforms/*.rhai               # Rhai scripts for workflow script steps
  prompts/*.toml                  # Managed prompts
  prompts/{key}.tests/*.toml      # Prompt test cases
  integrations/*.toml             # External API integrations
  database-types/*.toml           # Database type configs + operations + subscriptions
  webhooks/*.toml                 # Inbound webhook configs
  cron-triggers/*.toml            # Cron trigger configs
  blob-buckets/*.toml             # Blob bucket configs
  email-templates/*.toml          # Email template overrides
  rule-sets/*.toml                # Access rule sets
  group-type-configs/*.toml       # Group type configs
  collection-type-configs/*.toml  # Collection type configs
```

## App settings (`app.toml`)

App-level settings sync from `app.toml`; editing the TOML and `sync push` is the default path. The equivalent `primitive apps update --flag` calls mutate the server imperatively and drift from the checked-in TOML — the next `sync push` reverts them unless mirrored back. TOML-syncable settings:

- `[app]` — `name`, `mode`, `waitlistEnabled`, `baseUrl`
- `[auth]` — `googleOAuthEnabled`, `magicLinkEnabled`, `passkeyEnabled`, `[auth.passkeys]` relying-party config
- `[cors]` (serialized only when `mode = "custom"`) — `allowedOrigins`, `allowCredentials`, `allowedMethods`, `maxAge`

Not in `app.toml` (see [What sync does NOT carry](#what-sync-does-not-carry)): `otp` (set via `--otp <bool>` only) and `redirectUris` (set via `--redirect-uris "<uri1>,<uri2>"` or the Admin Console — no TOML key).

## Environment resolution

Every command resolves its target environment in order: `--env <name>` flag → `PRIMITIVE_ENV` env var → `defaultEnvironment` in `.primitive/config.json` → the only defined environment → error. Manage environments with `primitive env add|list|show|use|remove`. Tokens are stored per-environment in `.primitive/credentials.json` (gitignored); `.primitive/config.json` is committed.

`primitive env add` writes only the environment entry into `.primitive/config.json` — it seeds no credentials, and project mode does **not** fall back to the global `~/.primitive/credentials.json`. A freshly-added environment therefore starts logged-out: project-scoped commands report "not logged in" until you run `primitive login` for that environment, even when a global `primitive whoami` succeeds. Agents and CI can log in without a browser by piping a refresh token — `primitive token --refresh | primitive login -s <url> --token-stdin` (see [Headless auth](#headless-auth-ci)).

## Previewing a push

`primitive sync diff` lists entities that would be created, changed, or removed; `primitive sync push --dry-run` reports the full push without applying it. **`diff` counts entities only** (workflows, prompts, database types, integrations, webhooks, …) — an `app.toml` / app-settings-only edit is invisible to it, reporting `Local only: 0 / Remote only: 0 / Synced: 0`, which reads as "nothing to push" when there is. App-settings changes surface only in `push --dry-run`, which walks the full push. Both run the **same** validate-first gate as a real push — local TOML validation followed by the server-side checks via the validate-first pass — so the preview is faithful: what it reports is what the push applies. Schema-gate rejections surface identically in the preview and in a real push: an operation whose database type has no schema set, an unresolved `$params.X`/reference, or a schema change that would break an existing registered operation. A previewed or blocked entity records no content hash in sync state, so it stays pending on the next `sync diff` rather than reading "in sync" — a server-rejected change cannot silently disappear from the diff. `primitive sync diff --json` emits machine-readable output on stdout.

## Push failures

`sync push` validates every TOML file before applying anything — any validation error aborts the push with no changes applied (`Aborting push: N TOML validation error(s) — no changes were applied.`). For workflows it validates `$params.X` references against declared `[[operations.params]]` entries at push time, naming the file and line of a bad reference. When validation passes but the server rejects an entity, the error names the entity and file. A cron trigger or workflow that already exists on the server but is missing from local sync state is adopted by key and updated in place rather than failing on the 409 — re-running a failed push converges. Diagnostics go to stderr; `--json` data goes to stdout (pipes stay clean).

## What sync does NOT carry

Some settings are set with dedicated update commands rather than TOML (app-level settings that *do* sync are listed under [App settings](#app-settings-app-toml)):

```bash
primitive workflows update <id> --requires-client-apply false
primitive workflows update <id> --sync-callable true
primitive apps update --otp true                                          # no TOML key
primitive apps update --member-invitations-enabled true --member-invitation-limit 5
primitive apps update --test-account-bases alice@example.com
primitive apps update --redirect-uris "https://app.example.com/auth/callback"  # no TOML key
```

## Secrets

App-level secrets are server-side values referenced from workflow/integration TOML as `{{ secrets.KEY }}` — never inline credentials in TOML:

```bash
primitive secrets set OPENAI_API_KEY --value sk-...
primitive secrets list
primitive secrets delete OPENAI_API_KEY
```

## Headless auth (CI)

Browser-based `primitive login` doesn't work in CI. Either log in non-interactively by piping a refresh token — `primitive token --refresh | primitive login -s <url> --token-stdin` — or create a long-lived API token and target an environment explicitly:

```bash
primitive tokens create --name "CI deploys" --ttl 90d    # m/h/d/w/mo/y units; omit for non-expiring
PRIMITIVE_ENV=prod primitive sync push
```

`primitive token` (singular) prints the current access token, auto-refreshing it — usable for `curl -H "Authorization: Bearer $(primitive token)"`.
