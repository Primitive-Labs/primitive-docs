# Analytics

Primitive includes a built-in analytics pipeline. Events are buffered on the client, batched over WebSocket, persisted server-side, and made available through CLI commands, REST endpoints, the Admin Console, and workflow steps. The platform tracks daily/weekly/monthly active users and the full document, permission, workflow, prompt, and integration lifecycle automatically — your app can ship with analytics on day one and add custom events later.

This page covers what's tracked out of the box, how to emit your own events, and how to read analytics back from the client, the CLI, and from workflows.

## What's Tracked Automatically

You get a working analytics pipeline by initializing `JsBaoClient` with default options. No `logEvent` calls required.

### Client-Side Auto Events

The client emits these lifecycle events automatically. All are enabled by default.

| Action | Feature | When it fires |
|---|---|---|
| `user_active_daily` | `session` | First authenticated activity on a UTC day |
| `user_returned` | `session` | Tab becomes visible after `minResumeMs` (default 5 min) hidden |
| `session_end` | `session` | `beforeunload` or `client.destroy()` (records `duration_ms`) |
| `sync_error` | `sync` | Outbound sync fails (rate-limited, default 30s minimum interval) |
| `blob_upload_started` / `_succeeded` / `_failed` | `blobs` | Blob upload lifecycle |
| `prompt_started` / `_succeeded` / `_failed` | `llm`, `gemini` | LLM call lifecycle |

### Server-Side Events

The platform emits these from the server. No client code required.

| Category | Examples |
|---|---|
| Documents | `document.created`, `document.viewed`, `document.opened`, `document.updated`, `document.deleted`, `document.tag_added`, `document.tag_removed` |
| Permissions | `permission.granted`, `permission.revoked`, `permission.pending.cancelled`, `ownership.transferred` |
| Invitations | `invitation.sent`, `invitation.cancelled`, `invitation.declined` |
| Auth & Users | `session.refreshed`, `user.removed`, `user.role_changed`, and API-token `created` / `revoked` (feature `token`) |
| Workflows / Prompts | `workflow.started`, `workflow.completed`, `workflow.failed`, `prompt.executed` |
| Integrations | `integration.invoke` |

Workflow and prompt events also record `duration_ms` and LLM token counts (`input_tokens`, `output_tokens`, `total_tokens`) when available.

### Auto-Populated Fields

Every event — auto or custom — gets these fields populated automatically: `tenant_id`, `route`, `device_type`, `os_name`, `os_version`, `browser_name`, `browser_version`, `plan`, `connection_id`.

### Offline Persistence

Events are persisted on the device while offline and flushed on reconnect. A rate limiter caps emission at 300 events/minute with a 60-token burst. No code required.

## Emitting Custom Events

Log app-specific events from the client:

::: code-group
<<< ../../examples/analytics/log-event.ts#example{ts} [JavaScript]
<<< ../../examples/analytics/log-event.swift#example{swift} [Swift]
:::

`action` and `user_ulid` are required. Use the verb_noun convention for action names (`photo_uploaded`, `report_generated`, `settings_changed`) and group related events under a `feature` so per-feature dashboards work.

### Adding Context

Pass a `context_json` object for per-event debug data. It's serialized and **truncated to 1 KiB**, so keep it small — don't dump request bodies or full reports.

::: code-group
<<< ../../examples/analytics/log-event-context.ts#example{ts} [JavaScript]
<<< ../../examples/analytics/log-event-context.swift#example{swift} [Swift]
:::

### Pre-Auth Events

Events without an authenticated user are dropped silently. To track activity on landing pages and sign-up flows, pass the unauthenticated-user constant as the `user_ulid`:

::: code-group
<<< ../../examples/analytics/log-event-preauth.ts#example{ts} [JavaScript]
<<< ../../examples/analytics/log-event-preauth.swift#example{swift} [Swift]
:::

Use sparingly — most analytics should be tied to real users.

### Snapshots

`logSnapshot()` records a single state snapshot. The user is auto-resolved; if no user is signed in the call is a no-op (no error).

```typescript
client.analytics.logSnapshot({ screen: "settings", tab: "billing" });
```

This emits an event with `action: "_snapshot"`, `feature: "_state"`, and your payload as `context_json`.

### Plan and App Version Overrides

If your app reports plan/version dynamically (e.g. after an in-app upgrade), set them once on the client and they flow into every subsequent event:

::: code-group
<<< ../../examples/analytics/analytics-overrides.ts#example{ts} [JavaScript]
<<< ../../examples/analytics/analytics-overrides.swift#example{swift} [Swift]
:::

### What to Avoid

- **Don't log without `user_ulid`** — the runtime drops the event silently.
- **Don't log high-frequency telemetry** (mouse moves, scroll, keystrokes) — the rate limiter caps at 300 events/min and will drop the rest.
- **Don't add your own teardown flush** — the client flushes pending events and emits `session_end` for you.

## Configuring Auto Events

Pass an `analyticsAutoEvents` option to the client constructor to fine-tune the lifecycle events. Sub-options accept either a boolean or a granular `{ start, success, failure }` shape for the upload/LLM events.

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const client = new JsBaoClient({
  appId: "app-123",
  apiUrl: "https://api.example.com",
  wsUrl: "wss://ws.example.com",
  analyticsAutoEvents: {
    dailyAuth: true,
    returnActive: true,
    minResumeMs: 5 * 60 * 1000,
    sessionEnd: true,
    syncErrors: { enabled: true, minIntervalMs: 30_000 },
    blobUploads: { start: false, success: true, failure: true },
    llm: { start: false, success: true, failure: true },
    gemini: false,
  },
});
```

## Querying Analytics

There are four ways to read analytics back: the CLI (terminal-friendly, scriptable), the REST API (admin-only), workflows (server-side, scheduled), and the Admin Console (visual).

### From the CLI

All commands support `--json` for machine-readable output. Most accept a `--window-days` flag.

```bash
# DAU / WAU / MAU + growth (default 28-day window)
primitive analytics overview
primitive analytics overview --window-days 28 --json

# Active-user series
primitive analytics daily-active --window-days 28
primitive analytics rolling-active --window-days 7

# Cohort retention (no window flag — full matrix)
primitive analytics cohort-retention

# Top users
primitive analytics top-users --window-days 7 --limit 20

# Search and per-user
primitive analytics user-search --query user@example.com
primitive analytics user-detail <user-ulid>
primitive analytics user-snapshot <user-ulid>

# Raw event feed
primitive analytics events --window-days 7 --page 0

# Group by: action | feature | route | country | deviceType | plan | day
primitive analytics events-grouped --group-by feature --window-days 14

# Workflow / prompt / integration analytics
primitive analytics workflows --limit 5
primitive analytics prompts --limit 5
primitive analytics integrations
```

### From the REST API

Every CLI query above is backed by an admin-only REST endpoint under `/app/{appId}/api/analytics/...` — use the CLI's `--json` output to discover the shapes, or call the endpoints directly from your own tooling.

### From a Workflow

Workflows can run analytics queries as a step. This is the simplest way to ship a recurring digest, an admin email, or a Slack post that summarizes activity. See [Workflows](./workflows.md#analytics-query-step) for the full step reference.

```toml
[[steps]]
id = "top-users-weekly"
kind = "analytics.query"
queryType = "users.top"
windowDays = 7
limit = 25
```

The runner is **default-deny** — non-admin callers are rejected before the upstream call. Lock down workflows that contain `analytics.query` steps with `accessRule = "hasRole('admin')"` (or fire them via cron). Each run is capped at 50 analytics queries.

### From the Admin Console

The **Analytics** section of the [Admin Console](./admin-console.md) shows usage metrics, daily/weekly/monthly active users, and per-user breakdowns visually. Use it for ad-hoc exploration; use the CLI or a workflow when you need scripted or recurring queries.

## Best Practices

1. **Use verb_noun action names** — `photo_uploaded`, `report_generated`, `settings_changed`.
2. **Group events with `feature`** — set consistently to enable per-feature dashboards (`gallery`, `settings`, `billing`).
3. **Keep `context_json` small** — truncated to 1 KiB. Don't include full payloads.
4. **Don't log per-frame telemetry** — design around meaningful actions, not continuous telemetry.
5. **Use `setPlanOverride` / `setAppVersionOverride`** instead of passing `plan` / `app_version` on every call.
6. **Lock down analytics workflows** — they read aggregate data; keep `accessRule = "hasRole('admin')"` on anything that surfaces analytics.

## Next Steps

- **[Workflows](./workflows.md#analytics-query-step)** — Wire analytics into recurring workflows
- **[Admin Console](./admin-console.md)** — Visual analytics dashboards
- **[Primitive CLI](./primitive-cli.md)** — Full `primitive analytics` reference
