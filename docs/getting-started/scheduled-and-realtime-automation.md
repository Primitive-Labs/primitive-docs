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
  --key "nightly-digest" \
  --workflow "send-digest" \
  --schedule "0 9 * * *" \
  --timezone "America/Los_Angeles"
```

Or as a TOML config, checked into your repo and synced with the rest of your configuration:

```toml
# config/cron-triggers/nightly-digest.toml
[cronTrigger]
key = "nightly-digest"
displayName = "Nightly digest email"
workflowKey = "send-digest"
schedule = "0 9 * * *"
timezone = "America/Los_Angeles"
overlapPolicy = "skip"

[cronTrigger.input]
digestType = "daily"
```

Then push with the rest of your config:

```bash
primitive sync push --dir ./config
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
| `"queue"` | Start the new run after the current one finishes. |

Use `"skip"` for idempotent jobs (digest emails, cache warming). Use `"queue"` when each firing represents distinct work that mustn't be dropped.

### Managing Cron Triggers

```bash
# List
primitive cron-triggers list

# View a trigger and its recent runs
primitive cron-triggers get nightly-digest

# Pause (prevents future firings without deleting)
primitive cron-triggers disable nightly-digest

# Re-enable
primitive cron-triggers enable nightly-digest

# Fire manually (useful for testing)
primitive cron-triggers run nightly-digest

# Delete
primitive cron-triggers delete nightly-digest
```

From your app:

```typescript
const { triggers } = await client.cronTriggers.list();
const trigger = await client.cronTriggers.get("nightly-digest");
await client.cronTriggers.run("nightly-digest");
```

### Limits

- **Per-app cap of 50 cron triggers.** If you need more, consolidate by having a single trigger fan out to multiple child workflows using `workflow.start`.
- **Minimum granularity is 1 minute.** The scheduler rounds to the minute boundary.

### Monitoring

Cron-triggered runs appear alongside all other workflow runs:

```bash
primitive workflows runs list --workflow send-digest
primitive workflows runs get <runId>
```

The run's metadata includes the trigger that fired it, so you can filter by source.

## Real-Time Database Subscriptions

Databases live on the server. Traditionally your app called `executeOperation` to read them. Subscriptions flip that — the server pushes a `db.change` frame to connected clients whenever matching rows change.

Use subscriptions for:

- **Live dashboards** — revenue, active users, queue depth
- **Collaborative databases** — everyone sees edits as they happen
- **Notification badges** — "3 new messages", "2 pending approvals"
- **Workflow-driven UI** — a workflow writes progress into a database, the UI shows it live

### How Subscriptions Work

Unlike documents (which sync an entire CRDT), database subscriptions push **changes to individual rows**. Each subscription has:

- A **target model** (e.g. `"orders"`)
- An **access rule** — a CEL expression that decides if this user can subscribe at all
- A **filter expression** — a CEL expression evaluated against each change; only matches are delivered

The writer's own connection is excluded from fanout, so clients don't see their own mutations twice.

### Registering a Subscription Type

Subscriptions are registered server-side in your database type config, next to operations and triggers:

```toml
# config/database-types/support-desk.toml
[type]
databaseType = "support-desk"

[[subscriptions]]
name = "my-open-tickets"
modelName = "ticket"
access = "user.userId != ''"
filter = "record.assigneeId == user.userId && record.status == 'open'"
```

Then push as usual:

```bash
primitive sync push --dir ./config
```

### Subscribing from Your App

```typescript
const subscription = await client.databases
  .database(databaseId)
  .subscribe("my-open-tickets");

subscription.on("change", (event) => {
  // event.op is "save" | "patch" | "delete"
  // event.before is the previous record (for patch/delete)
  // event.after is the new record (for save/patch)
  applyTicketChange(event);
});

// Later
subscription.unsubscribe();
```

Parameterized subscriptions take a `params` object at subscribe time — the same substitution syntax as operations:

```toml
[[subscriptions]]
name = "tickets-by-team"
modelName = "ticket"
access = "isMemberOf('team', params.teamId)"
filter = "record.teamId == params.teamId"
params = '{"teamId":{"type":"string","required":true}}'
```

```typescript
const subscription = await client.databases
  .database(databaseId)
  .subscribe("tickets-by-team", { params: { teamId: "eng" } });
```

### Combined Pattern: Load + Subscribe

The usual pattern is to load the current state once, then subscribe for updates:

```typescript
async function setupLiveView(databaseId: string) {
  // 1. Initial load
  const { data: tickets } = await client.databases.executeOperation(
    databaseId, "list-my-tickets"
  );
  renderTickets(tickets);

  // 2. Subscribe for future changes
  const sub = await client.databases.database(databaseId)
    .subscribe("my-open-tickets");

  sub.on("change", (event) => {
    if (event.op === "save") upsertTicket(event.after);
    else if (event.op === "patch") upsertTicket(event.after);
    else if (event.op === "delete") removeTicket(event.before.id);
  });

  return sub;
}
```

### Subscriptions and Workflows

When a workflow calls `database.mutate` (or any write operation), the same subscription fanout applies. A workflow writing `{ status: "complete" }` to a job record will wake up every connected client whose filter matches.

This is the primary way to build "workflow progress" UIs:

```toml
# workflow writes status updates
[[steps]]
name = "mark-processing"
type = "database.mutate"
databaseId = "{{ input.jobsDbId }}"
operation = "update-job-status"
params = { jobId = "{{ input.jobId }}", status = "processing" }
```

```typescript
// client subscribes and updates the UI
const sub = await client.databases.database(jobsDbId)
  .subscribe("my-jobs");

sub.on("change", (event) => {
  updateJobRow(event.after);
});
```

### Access Control Enforcement

Two things are checked:

1. **`access` at subscribe time** — if this CEL expression returns `false`, the subscribe call fails immediately. The connection cannot subscribe.
2. **`filter` on each change** — evaluated once per change, per subscribed connection. Only matches are delivered. The filter cannot grant access the `access` rule denies — it can only narrow.

Both run in the same CEL environment as operation access rules, so `user.*`, `isMemberOf`, `hasRole`, etc. are all available.

### Limits and Behavior

- **Bounded fanout** — the server fans out changes with a concurrency of 20, paginated over all matching subscribers. There is no hard cap on subscriber count.
- **No guaranteed replay** — if a client disconnects, changes during the gap are not re-delivered. Re-load on reconnect via your usual `executeOperation` query.
- **Writer exclusion** — the connection that triggered the mutation does not receive the change event (it already has the result).

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
