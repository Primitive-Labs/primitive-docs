# Agent Guide to Primitive Analytics

Guidelines for AI agents implementing analytics tracking in Primitive apps.

## Overview

Primitive provides built-in analytics. The platform tracks user activity and resource lifecycle automatically and stores events server-side for querying. The system handles offline persistence, rate limiting, and automatic lifecycle events out of the box.

Read aggregated analytics (DAU/WAU/MAU, retention, top users, event feeds) through the `primitive` CLI, the REST API, or workflow steps — covered below.

---

## What's Tracked Automatically (Zero Developer Work)

Standing up an app gets you DAU/WAU/MAU tracking, session analytics, document/permission audit trails, and full workflow/prompt/integration observability with no instrumentation.


### Server-Side Events

The platform emits these from the server. No client code at all.

| Action | Feature | When |
|--------|---------|------|
| `session.refreshed` | `auth` | JWT refresh succeeds |
| `document.created` | `documents` | Document created |
| `document.viewed` | `documents` | Document viewed |
| `document.opened` | `documents` | Document opened |
| `document.updated` | `documents` | Document updated |
| `document.deleted` | `documents` | Document deleted |
| `document.tag_added` | `documents` | Tag added |
| `document.tag_removed` | `documents` | Tag removed |
| `access_request.created` | `documents` | User requested access to a document |
| `access_request.approved` | `documents` | Access request approved |
| `access_request.denied` | `documents` | Access request denied |
| `permission.granted` | `permissions` | Permission granted |
| `permission.revoked` | `permissions` | Permission revoked |
| `permission.pending.cancelled` | `permissions` | Pending invite-permission cancelled |
| `ownership.transferred` | `permissions` / `ownership` | Document ownership transferred (emitted from both controllers) |
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

Workflow and prompt events also record `duration_ms` and LLM token counts (`input_tokens`, `output_tokens`, `total_tokens`) when available.


---

## Querying Analytics (CLI)

The `primitive` CLI provides commands for querying analytics. All accept `--json` for machine-readable output.

```bash
# DAU / WAU / MAU + growth (default --window-days 28)
primitive analytics overview
primitive analytics overview --window-days 28 --json

# Active users time series
primitive analytics daily-active --window-days 28
primitive analytics rolling-active --window-days 7   # default 7

# Cohort retention (no window flag — returns full matrix)
primitive analytics cohort-retention

# Top users (default --window-days 30, --limit 10)
primitive analytics top-users --window-days 7 --limit 20

# Search users (--query is required)
primitive analytics user-search --query user@example.com

# Per-user breakdown
primitive analytics user-detail <user-ulid>
primitive analytics user-snapshot <user-ulid>

# Raw event feed (default --window-days 7, --page 0)
primitive analytics events --window-days 7 --page 0

# Group by: action | feature | route | country | deviceType | plan | day
primitive analytics events-grouped --group-by feature --window-days 14

# Integration / workflow / prompt analytics (default --window-days 30)
primitive analytics integrations
primitive analytics workflows --limit 5
primitive analytics prompts --limit 5
```

---

## Querying Analytics (REST API)

All endpoints require `admin` permission on the app.

```text
# DAU / WAU / MAU / growth — separate endpoints (no combined `/overview`)
GET /app/{appId}/api/analytics/overview/dau?windowDays=28
GET /app/{appId}/api/analytics/overview/wau?windowDays=28
GET /app/{appId}/api/analytics/overview/mau?windowDays=28
GET /app/{appId}/api/analytics/overview/growth?windowDays=28

# Active-user series
GET /app/{appId}/api/analytics/daily-active?windowDays=28
GET /app/{appId}/api/analytics/rolling-active?windowDays=7
GET /app/{appId}/api/analytics/cohort-retention

# Users
GET /app/{appId}/api/analytics/users/top?windowDays=30&limit=10
GET /app/{appId}/api/analytics/users/search?q=...&limit=25
GET /app/{appId}/api/analytics/users/{userUlid}/detail
GET /app/{appId}/api/analytics/users/{userUlid}/snapshot

# Events
GET /app/{appId}/api/analytics/events?windowDays=7&page=0
GET /app/{appId}/api/analytics/events/grouped?windowDays=7&groupBy=action

# Integrations / workflows / prompts (admin-only top lists)
GET /app/{appId}/api/analytics/integrations?windowDays=30
GET /app/{appId}/api/analytics/workflows/top?windowDays=30&limit=10
GET /app/{appId}/api/analytics/prompts/top?windowDays=30&limit=10
```

> The REST API does **not** expose `users/{userUlid}/timeline`, `users/{userUlid}/events`, `workflows/overview`, `prompts/overview`, or a combined `overview` endpoint. Use the granular endpoints above.

### Filtering events / events-grouped

Both `/analytics/events` and `/analytics/events/grouped` accept up to 10 filter clauses via repeated query parameters of the form `filter[FIELD][OPERATOR]=value`. Values are capped at 200 chars and rejected if they contain control or binary characters (printable Unicode only).

Supported `FIELD`s and the `OPERATOR`s each accepts:

| Field | Operators |
| --- | --- |
| `user` | `is`, `contains`, `starts with` |
| `action` | `is`, `is not`, `contains` |
| `feature` | `is`, `is not`, `contains` |
| `route` | `is`, `contains`, `starts with` |
| `country` | `is`, `is not` |
| `region` | `is`, `contains` |
| `city` | `is`, `contains` |
| `plan` | `is`, `is not` |
| `deviceType` | `is`, `is not` |
| `os` | `is`, `is not`, `contains` |
| `browser` | `is`, `is not`, `contains` |
| `appVersion` | `is`, `is not`, `contains` |

Example: `?windowDays=7&filter[feature][is]=billing&filter[action][contains]=upgrade`. Unknown fields, unsupported operators, or rejected values are silently dropped.

### Event row shape

Each row from `/analytics/events` includes geographic and per-event metric fields beyond the basic `timestamp` / `user` / `action` / `feature`:

- `region_code`, `region`, `city`, `colo` — derived from the request edge
- `entity_key` — caller-provided correlation handle (e.g. workflow run id, prompt id)
- `duration_ms` — for `*_succeeded` / `*_failed` events that record latency
- `input_tokens`, `output_tokens`, `total_tokens` — populated for `prompt_succeeded` events

These fields are absent (or zero) when the event type doesn't produce them.

---

