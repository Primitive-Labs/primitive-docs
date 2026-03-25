# Agent Guide to Primitive Analytics

Guidelines for AI agents implementing analytics tracking in Primitive apps.

## Overview

Primitive provides built-in analytics via `client.analytics`. Events are buffered client-side, batched over WebSocket, and stored server-side for querying. The system handles offline persistence, rate limiting, and automatic lifecycle events out of the box.

**Key constraint:** Every analytics event requires an authenticated user. Events without a `user_ulid` are dropped. Use `ANALYTICS_UNAUTHENTICATED_USER` for pre-auth screens.

---

## What's Tracked Automatically (Zero Developer Work)

A Primitive app that simply initializes `JsBaoClient` with default options gets DAU/WAU/MAU tracking, session analytics, document activity, permission audit trails, and full workflow/prompt/integration observability — all without writing a single `logEvent` call.

### Client-Side Auto Events

All enabled by default. The client automatically emits these lifecycle events:

| Action | Feature | When it fires |
|--------|---------|---------------|
| `user_active_daily` | `session` | First auth on a UTC day |
| `user_returned` | `session` | Tab becomes visible after 5+ minutes hidden |
| `session_end` | `session` | Page unload / client destroy (includes duration) |
| `first_doc_open` | `documents` | First document opened in the session |
| `first_doc_edit` | `documents` | First document edited in the session |
| `offline_recovery` | `network` | Client transitions offline → online |
| `sync_error` | `sync` | Outbound sync fails and is retried |
| `blob_upload_started` | `blobs` | Blob upload begins |
| `blob_upload_succeeded` | `blobs` | Blob upload completes |
| `blob_upload_failed` | `blobs` | Blob upload fails |
| `service_worker_token_update` | `service_worker` | Service worker receives token refresh |
| `llm_request_started` | `llm` | LLM chat request begins |
| `llm_request_succeeded` | `llm` | LLM chat request completes |
| `llm_request_failed` | `llm` | LLM chat request fails |
| `gemini_request_started` | `gemini` | Gemini request begins |
| `gemini_request_succeeded` | `gemini` | Gemini request completes |
| `gemini_request_failed` | `gemini` | Gemini request fails |

### Server-Side Events

The platform automatically emits these server-side analytics. These require no client code at all.

| Action | Feature | When |
|--------|---------|------|
| `session.refreshed` | `auth` | JWT refresh succeeds |
| `document.created` | `documents` | Document created |
| `document.viewed` | `documents` | Document viewed |
| `document.opened` | `documents` | Document opened |
| `document.updated` | `documents` | Document updated |
| `document.deleted` | `documents` | Document deleted |
| `document.tag_added` | `documents` | Tag added to document |
| `document.tag_removed` | `documents` | Tag removed from document |
| `permission.granted` | `permissions` | Permission granted on a document |
| `permission.revoked` | `permissions` | Permission revoked on a document |
| `ownership.transferred` | `ownership` / `permissions` | Document ownership transferred |
| `invitation.sent` | `invitations` | Invitation sent |
| `invitation.cancelled` | `invitations` | Invitation cancelled |
| `invitation.declined` | `invitations` | Invitation declined |
| `user.removed` | `users` | User removed from app |
| `user.role_changed` | `users` | User role changed |
| `prompt.executed` | `prompts` | Prompt execution completes |
| `workflow.started` | `workflows` | Workflow run begins |
| `workflow.completed` | `workflows` | Workflow run succeeds |
| `workflow.failed` | `workflows` | Workflow run fails |
| `integration.invoke` | _(integration key)_ | Integration proxy call |
| `created` | `token` | API token created |
| `revoked` | `token` | API token revoked |

Server events also record `duration_ms` and LLM token counts (`input_tokens`, `output_tokens`, `total_tokens`) for prompt and workflow events.

### Auto-Populated Fields

Every event (auto or custom) gets these fields populated automatically with no developer input:

`tenant_id`, `route`, `device_type`, `os_name`, `os_version`, `browser_name`, `browser_version`, `plan`

### Offline Persistence

Events are automatically persisted to IndexedDB while offline (up to 1 MB). When the buffer exceeds 1 MB, the oldest events are trimmed. On reconnect, persisted events are flushed automatically. Rate limiting continues to apply: 300 events/minute with a burst cap of 60. No special code is needed.

---

## Logging Custom Events

If the built-in auto events don't cover your needs, you can log custom events.

### Basic Event

```typescript
client.analytics.logEvent({
  action: "photo_upload",
  feature: "gallery",
  user_ulid: currentUserUlid,
});
```

The `action` and `user_ulid` fields are required in the TypeScript interface. However, `user_ulid` is resolved automatically from the authenticated session at runtime if the queue's context providers can supply it. In practice, you must pass `user_ulid` to satisfy the type checker (or use `ANALYTICS_UNAUTHENTICATED_USER` for pre-auth events).

### Event with Context

```typescript
client.analytics.logEvent({
  action: "search_executed",
  feature: "search",
  route: "/search",
  user_ulid: currentUserUlid,
  context_json: {
    query: "quarterly report",
    resultCount: 42,
  },
});
```

`context_json` accepts a `Record<string, unknown>` or a JSON string. It is truncated to 1 KB before sending.

### AnalyticsEventInput Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | `string` | Yes | Event name (e.g. `"login"`, `"upload"`) |
| `user_ulid` | `string` | Yes | User ULID (resolved from session at runtime, but required in the TS type) |
| `feature` | `string` | No | Feature or module name |
| `route` | `string` | No | Page path (defaults to `window.location.pathname`) |
| `plan` | `string` | No | Plan name (auto-resolved from context, defaults to `"unknown"`) |
| `tenant_id` | `string` | No | App ULID (auto-populated from `client.appId`) |
| `device_type` | `string` | No | `"desktop"`, `"mobile"`, etc. (auto-detected) |
| `os_name` | `string` | No | OS name (auto-detected) |
| `os_version` | `string` | No | OS version (auto-detected) |
| `browser_name` | `string` | No | Browser name (auto-detected) |
| `browser_version` | `string` | No | Browser version (auto-detected) |
| `app_version` | `string` | No | Your app's version |
| `context_json` | `string \| Record<string, unknown> \| null` | No | Debug context (max 1 KB) |
| `user_created_at_epoch_s` | `number` | No | User signup timestamp (epoch seconds) |

---

## Logging Snapshots

Use `logSnapshot()` to record a state snapshot event with optional context:

```typescript
client.analytics.logSnapshot({ screen: "settings", tab: "billing" });
```

This logs an event with action `_snapshot` and feature `_state`.

---

## Pre-Auth Events

Events are normally dropped when no user is authenticated. To log events on pre-auth screens (e.g. a landing page), use the `ANALYTICS_UNAUTHENTICATED_USER` constant:

```typescript
import {
  ANALYTICS_UNAUTHENTICATED_USER,
} from "js-bao-wss-client";

client.analytics.logEvent({
  action: "landing_page_view",
  feature: "onboarding",
  user_ulid: ANALYTICS_UNAUTHENTICATED_USER,
});
```

This bypasses the "missing user" validation guard. Use sparingly — most analytics should be tied to real users.

---

## Manual Flush

Events are buffered and flushed automatically every 100ms or when the buffer reaches 25 KB. To force an immediate flush (e.g. before navigation or logout):

```typescript
client.analytics.flush();
```

A common pattern is flushing on page unload:

```typescript
window.addEventListener("beforeunload", () => {
  client.analytics.flush();
});
```

---

## Querying Analytics (CLI)

The `primitive` CLI provides commands for querying analytics data:

### App Overview

```bash
# DAU, WAU, MAU, and activity series
primitive analytics overview
primitive analytics overview --window-days 7
primitive analytics overview --json
```

### Top Users

```bash
# Most active users by event count
primitive analytics top-users
primitive analytics top-users --window-days 7 --limit 20
```

### User Timeline

```bash
# Activity breakdown and timeline for a specific user
primitive analytics user <user-ulid>
primitive analytics user <user-ulid> --window-days 14
```

### Integration Metrics

```bash
# Invocation counts, error rates, and latency per integration
primitive analytics integrations
primitive analytics integrations --window-days 7 --json
```

All commands accept `--json` for machine-readable output and default to a 30-day window.

---

## Querying Analytics (API)

The REST API exposes analytics endpoints (all require admin permission):

```typescript
// Overview: DAU, WAU, MAU, daily series
GET /app/{appId}/api/analytics/overview?windowDays=28

// Granular active-user endpoints
GET /app/{appId}/api/analytics/overview/dau?windowDays=28
GET /app/{appId}/api/analytics/overview/wau?windowDays=28
GET /app/{appId}/api/analytics/overview/mau?windowDays=28
GET /app/{appId}/api/analytics/overview/growth?windowDays=28

// Daily/rolling active users and cohort retention
GET /app/{appId}/api/analytics/daily-active?windowDays=28
GET /app/{appId}/api/analytics/rolling-active?windowDays=28
GET /app/{appId}/api/analytics/cohort-retention?windowDays=28

// Top users by activity
GET /app/{appId}/api/analytics/users/top?windowDays=7&limit=10

// Search users
GET /app/{appId}/api/analytics/users/search?q=...&limit=25

// User timeline and action breakdown
GET /app/{appId}/api/analytics/users/{userUlid}/timeline?windowDays=14
GET /app/{appId}/api/analytics/users/{userUlid}/events?windowDays=14&limit=50
GET /app/{appId}/api/analytics/users/{userUlid}/detail?windowDays=7
GET /app/{appId}/api/analytics/users/{userUlid}/snapshot?windowDays=7

// Integration invocation metrics
GET /app/{appId}/api/analytics/integrations?windowDays=30

// Workflow analytics
GET /app/{appId}/api/analytics/workflows/overview?windowDays=30
GET /app/{appId}/api/analytics/workflows/top?windowDays=30&limit=10

// Prompt analytics
GET /app/{appId}/api/analytics/prompts/overview?windowDays=30
GET /app/{appId}/api/analytics/prompts/top?windowDays=30&limit=10

// Raw event browsing and grouping
GET /app/{appId}/api/analytics/events?windowDays=7&page=0
GET /app/{appId}/api/analytics/events/grouped?windowDays=7&groupBy=action
```

---

## Best Practices

1. **Use meaningful `action` names** — use verb_noun format: `"photo_uploaded"`, `"report_generated"`, `"settings_changed"`
2. **Group with `feature`** — set `feature` consistently to enable per-feature dashboards: `"gallery"`, `"settings"`, `"billing"`
3. **Keep `context_json` small** — it's truncated to 1 KB; include only what's useful for debugging
4. **Don't log high-frequency events** — the rate limiter caps at 300 events/minute; design around meaningful actions, not continuous telemetry
5. **Flush before navigation** — call `client.analytics.flush()` in `beforeunload` to avoid losing the last batch
6. **Disable noisy auto events** — turn off `firstDocOpen`/`firstDocEdit` if they're not useful for your app

---

## Complete Example: Feature Usage Tracking

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const client = new JsBaoClient({
  appId: "app-123",
  apiUrl: "https://api.example.com",
  wsUrl: "wss://ws.example.com",
  analyticsAutoEvents: {
    dailyAuth: true,
    returnActive: true,
    sessionEnd: true,
    firstDocOpen: false,
    firstDocEdit: false,
    blobUploads: { start: false, success: true, failure: true },
    llm: { start: false, success: true, failure: true },
  },
});

// Track a custom action (assumes you have the user ULID from auth)
function trackFeatureUsed(userUlid: string, feature: string, action: string, context?: Record<string, unknown>) {
  client.analytics.logEvent({
    action,
    feature,
    user_ulid: userUlid,
    context_json: context,
  });
}

// Usage
trackFeatureUsed(userUlid, "reports", "report_generated", {
  reportType: "quarterly",
  format: "pdf",
});

trackFeatureUsed(userUlid, "search", "search_executed", {
  resultCount: 15,
});

// Flush on exit
window.addEventListener("beforeunload", () => {
  client.analytics.flush();
});
```
