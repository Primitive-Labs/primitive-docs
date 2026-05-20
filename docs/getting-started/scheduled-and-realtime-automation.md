# Scheduled and Real-Time Automation

Most Primitive features react to requests: a user opens an app, calls an operation, or runs a workflow. This page is about the two ways Primitive reacts to *time* and *server events* instead:

- **Cron triggers** — run a workflow on a schedule (every hour, every Monday at 9am, etc.)
- **Database subscriptions** — push database changes to connected clients in real time

Both are server-side. You configure them once and they keep running.

## Cron Triggers

A cron trigger fires a workflow on a schedule. Use it for nightly reports, scheduled email reminders, data cleanup, cache warming, periodic third-party syncs — anything that should happen on a clock rather than in response to a user action.

### Creating a Cron Trigger

The simplest way is via the CLI:

```bash
primitive cron-triggers create \
  --key nightly-digest \
  --name "Nightly Digest" \
  --workflow-key send-digest \
  --cron "0 9 * * *" \
  --timezone "America/Los_Angeles" \
  --overlap-policy skip
```

Or as a TOML config, checked into your repo and synced with the rest of your configuration:

```toml
# config/cron-triggers/nightly-digest.toml
[cronTrigger]
key = "nightly-digest"
name = "Nightly digest email"
workflowKey = "send-digest"
cron = "0 9 * * *"
timezone = "America/Los_Angeles"
overlapPolicy = "skip"

[cronTrigger.input]
digestType = "daily"
```

Then push with the rest of your config:

```bash
primitive sync push --dir ./config
```

`input` is a literal JSON payload sent to the workflow on every firing. If you'd rather project values from the firing context (e.g. `triggerId`, `firedAt`) into the workflow input, use `inputMapping` instead:

```toml
[cronTrigger.inputMapping]
runId = "$triggerId"
at = "$firedAt"
```

### Schedule Syntax

Standard 5-field cron (minute, hour, day-of-month, month, day-of-week):

| Expression | Fires |
|---|---|
| `0 * * * *` | Every hour at :00 |
| `*/15 * * * *` | Every 15 minutes |
| `0 9 * * *` | Every day at 9:00 |
| `0 9 * * 1` | Every Monday at 9:00 |
| `0 0 1 * *` | First of every month at 00:00 |

### Timezones

Set `timezone` to any [IANA name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (e.g. `"America/New_York"`, `"Europe/London"`, `"Asia/Tokyo"`). The scheduler handles DST transitions correctly — a `0 9 * * *` trigger in `America/Los_Angeles` fires at 9:00 local time year-round, not at a fixed UTC offset.

If omitted, the schedule is interpreted in UTC.

### Overlap Policy

What happens if a trigger fires while the previous run is still executing?

| Value | Behavior |
|---|---|
| `"skip"` (default) | Skip the new firing. Logged as a skipped run. |
| `"allow"` | Start the new run anyway, in parallel with the existing one. |

Use `"skip"` for idempotent jobs (digest emails, cache warming). Use `"allow"` only when each firing is independent and can safely run alongside another.

### Server-only workflows

Cron-triggered workflows almost always want `requiresClientApply = false` — no client is listening to apply the result. Otherwise the run will sit in `apply_pending` until a connected client claims it. Set the flag with:

```bash
primitive workflows update <workflow-id> --requires-client-apply false
```

### Managing Cron Triggers

```bash
# List
primitive cron-triggers list

# View a trigger and its recent runs
primitive cron-triggers get <trigger-id>

# Pause (prevents future firings without deleting)
primitive cron-triggers pause <trigger-id>

# Resume
primitive cron-triggers resume <trigger-id>

# Fire manually (useful for testing)
primitive cron-triggers test <trigger-id>

# Delete
primitive cron-triggers delete <trigger-id>
```

From your app:

```typescript
const { items } = await client.cronTriggers.list();
const trigger = await client.cronTriggers.get(triggerId);
await client.cronTriggers.test(triggerId);
```

### Limits

- **Per-app cap of 50 cron triggers.** If you need more, consolidate by having a single trigger fan out to multiple child workflows using `workflow.start`.
- **Minimum granularity is 1 minute.** The scheduler rounds to the minute boundary.

### Monitoring

Every firing creates a persistent `WorkflowRun` record, so cron-driven runs appear alongside user-triggered ones with the same status, step output, and error surface:

```bash
primitive workflows runs list <workflow-id>
primitive workflows runs status <workflow-id> <run-id>
```

The run's `meta.triggerId` identifies the cron trigger that fired it, so you can filter by source.

## Real-Time Database Subscriptions

Databases live on the server. Traditionally your app called `executeOperation` to read them. Subscriptions flip that — the server pushes a `db.change` frame to connected clients whenever matching rows change.

Use subscriptions for:

- **Live dashboards** — revenue, active users, queue depth
- **Collaborative databases** — everyone sees edits as they happen
- **Notification badges** — "3 new messages", "2 pending approvals"
- **Workflow-driven UI** — a workflow writes progress into a database, the UI shows it live

### How Subscriptions Work

Unlike documents (which sync an entire CRDT), database subscriptions push **changes to individual rows**. Each subscription is defined on a *database type* (so one definition serves every database of that type) and has:

- A **target model** (e.g. `"ticket"`)
- An **access rule** — a CEL expression that decides if this user can subscribe at all
- A **filter expression** — a CEL expression evaluated against each change; only matches are delivered
- An optional **`select`** projection — a list of field names to include in each change frame
- An optional **`emit`** filter — restricts which change types are delivered (`"enter"`, `"update"`, `"leave"`)

### Registering a Subscription

Subscriptions live in your database type config, next to operations and triggers:

```toml
# config/database-types/support-desk.toml
[databaseType]
databaseType = "support-desk"

[[subscriptions]]
subscriptionKey = "my-open-tickets"
displayName = "My open tickets"
modelName = "ticket"
access = "user.userId != ''"
filter = "record.assigneeId == user.userId && record.status == 'open'"
# Optional: only send these fields in each change frame
select = ["id", "title", "priority", "updatedAt"]
# Optional: only fire when a row enters or leaves the filter set
emit = ["enter", "leave"]
```

Then push as usual:

```bash
primitive sync push --dir ./config
```

Subscriptions are keyed by `(databaseType, subscriptionKey)` and apply across every database of that type.

### Subscribing from Your App

The client calls `databases.subscribe(databaseId, subscriptionKey, { onChange })`, which returns an `unsub()` function:

```typescript
const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
  onChange: (event) => {
    if (event.isOrigin) {
      // This same tab wrote it — we already updated the UI optimistically.
      return;
    }
    for (const change of event.changes) {
      // change.op:        "save" | "patch" | "delete" | "increment" | "addToSet" | "removeFromSet"
      // change.changeType: "enter" | "update" | "leave"
      // change.id, change.modelName
      // change.data: the new record (subject to `select` projection)
      // change.previousData: the prior record (for patch/delete)
      applyTicketChange(change);
    }
  },
});

// Later
unsub();
```

Each `db.change` frame carries origin attribution so consumers can tell who wrote it:

| Field | Meaning |
|---|---|
| `originConnectionId` | The writer's WebSocket connection id (or `null` for server-side writes like cron and workflow steps) |
| `originUserId` | The writer's user id (or `null` for server-side writes) |
| `isOrigin` | `true` when this specific tab/process produced the write |
| `isOriginUser` | `true` when any session signed in as the current user produced the write (use for cross-tab cache invalidation) |

The writer's own connection receives the `db.change` frame just like every other matching subscriber — server-side fanout doesn't filter out the writer. Use `isOrigin` to suppress the echo on the tab that produced the write (it already updated optimistically), and `isOriginUser` to coordinate the cross-tab/reconnect cases for other sessions of the same user.

Parameterized subscriptions take a `params` object at subscribe time — the same substitution syntax as operations:

```toml
[[subscriptions]]
subscriptionKey = "tickets-by-team"
modelName = "ticket"
access = "isMemberOf('team', params.teamId)"
filter = "record.teamId == params.teamId"
params = '{"teamId":{"type":"string","required":true}}'
```

```typescript
const unsub = client.databases.subscribe(databaseId, "tickets-by-team", {
  params: { teamId: "eng" },
  onChange: (event) => { /* ... */ },
});
```

### Combined Pattern: Load + Subscribe

The usual pattern is to load the current state once, then subscribe for updates:

```typescript
async function setupLiveView(databaseId: string) {
  // 1. Initial load
  const { data: tickets } = await client.databases.executeOperation(
    databaseId,
    "list-my-tickets"
  );
  renderTickets(tickets);

  // 2. Subscribe for future changes
  const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
    onChange: (event) => {
      if (event.isOrigin) return;
      for (const change of event.changes) {
        if (change.op === "delete") removeTicket(change.id);
        else upsertTicket(change.data);
      }
    },
  });

  return unsub;
}
```

### Subscriptions and Workflows

When a workflow calls `database.mutate` (or any write operation), the same subscription fanout applies. A workflow writing `{ status: "complete" }` to a job record will wake up every connected client whose filter matches. Because workflow writes are server-side, their frames arrive with `originConnectionId: null` / `originUserId: null` and `isOrigin: false` / `isOriginUser: false`.

This is the primary way to build "workflow progress" UIs:

```toml
# workflow writes status updates
[[steps]]
id = "mark-processing"
kind = "database.mutate"
databaseId = "{{ input.jobsDbId }}"
operationName = "update-job-status"

[steps.params]
jobId = "{{ input.jobId }}"
status = "processing"
```

```typescript
// client subscribes and updates the UI
const unsub = client.databases.subscribe(jobsDbId, "my-jobs", {
  onChange: (event) => {
    for (const change of event.changes) {
      updateJobRow(change.data);
    }
  },
});
```

### Access Control Enforcement

Two things are checked:

1. **`access` at subscribe time** — if this CEL expression returns `false`, the subscribe call fails immediately. The connection cannot subscribe.
2. **`filter` on each change** — evaluated once per change, per subscribed connection. Only matches are delivered. The filter cannot grant access the `access` rule denies — it can only narrow.

Both run in the same CEL environment as operation access rules, so `user.*`, `isMemberOf`, `hasRole`, etc. are all available.

### Limits and Behavior

- **Bounded fanout** — the server fans out changes with a concurrency of 20, paginated over all matching subscribers.
- **No guaranteed replay** — if a client disconnects, changes during the gap are not re-delivered. Re-load on reconnect via your usual `executeOperation` query.
- **`select` projection is server-side** — fields you exclude never reach the wire, so this is the way to keep sensitive columns off subscribers' machines.

## Choosing Between Cron and Subscriptions

They solve different problems, but it helps to contrast them:

| | Cron | Subscriptions |
|---|---|---|
| Trigger | A clock | A database write |
| Runs where | Server (as a workflow) | Client (a WebSocket handler) |
| Payload | Workflow input | The changed record |
| Typical use | Scheduled side effects | Live UI state |

Many apps use both. A cron trigger writes the nightly rollup into a database; clients subscribed to that database see the new row appear live.

## Next Steps

- **[Workflows and Prompts](./workflows-and-prompts.md)** — The workflows your cron triggers fire
- **[Working with Databases](./working-with-databases.md)** — Operations, access control, and the database fundamentals subscriptions are built on
