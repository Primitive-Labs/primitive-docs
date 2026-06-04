# Agent Guide to Primitive Configuration

Guidelines for AI agents managing Primitive backend configuration. All backend behavior — auth settings, workflows, prompts, integrations, database types/operations, webhooks, cron triggers, blob buckets, email templates, rule sets — is server-side configuration with two equivalent interfaces: the web Admin Console (interactive) and **TOML files synced via the CLI** (configuration as code). Agents should use the TOML + CLI path.

## The sync loop

```bash
primitive sync init --dir ./config     # create directory structure
primitive sync pull --dir ./config    # download server config as TOML
primitive sync diff --dir ./config    # preview changes
primitive sync push --dir ./config    # apply local TOML to the server
```

With project-scoped environments (`.primitive/config.json`), omit `--dir` and the sync directory auto-resolves to `.primitive/sync/<env>/<appId>/` — one isolated slot per environment, so a `pull --env staging` never touches production state.

## Directory map

```
config/
  app.toml                        # App settings
  workflows/*.toml                # Workflow definitions
  workflows/{key}.tests/*.toml    # Workflow test cases
  workflow-fragments/*.toml       # Reusable [[steps]] blocks (include = ["<name>"])
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

## Environment resolution

Every command resolves its target environment in order: `--env <name>` flag → `PRIMITIVE_ENV` env var → `defaultEnvironment` in `.primitive/config.json` → the only defined environment → error. Manage environments with `primitive env add|list|show|use|remove`. Tokens are stored per-environment in `.primitive/credentials.json` (gitignored); `.primitive/config.json` is committed.

## Push failures

`sync push` validates as it applies and reports the failing entity and file. For workflows it validates `$params.X` references against declared `[[operations.params]]` entries at push time, naming the file and line of a bad reference. Diagnostics go to stderr; `--json` data goes to stdout (pipes stay clean).

## What sync does NOT carry

Some flags are set with dedicated update commands rather than TOML:

```bash
primitive workflows update <id> --requires-client-apply false
primitive workflows update <id> --sync-callable true
primitive apps update --cors-origins "..." --base-url "..." --google-oauth true
primitive apps update --test-account-bases alice@example.com
```

## Secrets

App-level secrets are server-side values referenced from workflow/integration TOML as `{{ secrets.KEY }}` — never inline credentials in TOML:

```bash
primitive secrets set OPENAI_API_KEY --value sk-...
primitive secrets list
primitive secrets delete OPENAI_API_KEY
```

## Headless auth (CI)

Interactive `primitive login` doesn't work in CI. Create a long-lived API token and target an environment explicitly:

```bash
primitive tokens create --name "CI deploys" --ttl 90d    # m/h/d/w/mo/y units; omit for non-expiring
PRIMITIVE_ENV=prod primitive sync push
```

`primitive token` (singular) prints the current access token, auto-refreshing it — usable for `curl -H "Authorization: Bearer $(primitive token)"`.
