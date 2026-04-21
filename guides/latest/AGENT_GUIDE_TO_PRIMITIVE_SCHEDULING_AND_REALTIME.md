# Agent Guide to Primitive Scheduling and Real-Time

Guidelines for AI agents implementing cron-triggered workflows and real-time database subscriptions.

## Mental Model

Two independent capabilities live here. They often combine, but they answer different questions.

| Capability | Answers | Runs where | Payload |
|------------|---------|------------|---------|
| **Cron triggers** | "When should work happen?" | Server (workflow run) | Workflow input |
| **Database subscriptions** | "How does the client find out something changed?" | Client (WS handler) | The changed record |

**Decision rules:**

1. If the trigger is a clock → cron trigger.
2. If the trigger is a user action or webhook → regular workflow, not cron.
3. If the UI needs to reflect server-side changes without the user acting → subscription.
4. If you're polling a database to find changes → replace with a subscription.

---

## Critical Rules

1. **Cron triggers fire workflows, not arbitrary code.** Always create the workflow first, then point the trigger at it.

2. **Set an IANA `timezone` whenever the schedule has a user-visible hour.** `0 9 * * *` in UTC is 2am in Los Angeles — usually wrong.

3. **Default `overlapPolicy` is `"skip"`.** Only use `"queue"` when each firing represents distinct work that must not be dropped. Idempotent jobs should stay on `"skip"`.

4. **Per-app cap is 50 cron triggers.** If you need more, consolidate by fanning out with `workflow.start`.

5. **Subscriptions must have both `access` and `filter` CEL.** `access` is checked at subscribe time; `filter` is evaluated per change. Don't put per-record logic in `access` or per-user logic in `filter` — they serve different purposes.

6. **Writer's connection is excluded from subscription fanout.** Never rely on your own mutation coming back through the subscription channel.

7. **No replay on reconnect.** If a client disconnects, changes during the gap are not re-delivered. Re-query on reconnect.

8. **`filter` can only narrow what `access` allows.** It cannot grant access the access rule denies.

---

## Cron Triggers

### Creating (via TOML sync)

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
environment = "production"
```

```bash
primitive sync push --dir ./config
```

### Creating (via client)

```typescript
await client.cronTriggers.create({
  key: "nightly-digest",
  workflowKey: "send-digest",
  schedule: "0 9 * * *",
  timezone: "America/Los_Angeles",
  overlapPolicy: "skip",
  input: { digestType: "daily" },
});
```

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| `key` | Yes | Unique per app. Kebab-case. |
| `workflowKey` | Yes | Must refer to a published workflow. |
| `schedule` | Yes | Standard 5-field cron. |
| `timezone` | No | IANA name. Defaults to UTC. |
| `overlapPolicy` | No | `"skip"` (default) or `"queue"`. |
| `input` | No | JSON object passed as workflow input. |
| `enabled` | No | Default `true`. |

### Common Schedule Patterns

| Need | Schedule |
|------|----------|
| Every 5 minutes | `*/5 * * * *` |
| Every hour on the hour | `0 * * * *` |
| Every day at 9am (local) | `0 9 * * *` + timezone |
| Every Monday at 9am | `0 9 * * 1` |
| First of every month | `0 0 1 * *` |
| Every 15 minutes during business hours | `*/15 9-17 * * 1-5` |

### Testing a Trigger

```typescript
await client.cronTriggers.run("nightly-digest");
```

This fires the workflow immediately with the configured input, bypassing the schedule. Use this in integration tests.

### Monitoring

Cron runs appear in the normal workflow run list with a `triggerSource: "cron"` field on the run record.

```typescript
const { runs } = await client.workflows.listRuns("send-digest", {
  triggerSource: "cron",
});
```

---

## Database Subscriptions

### Registering (server-side)

Subscriptions live in the database type config alongside operations and triggers:

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

Parameterized:

```toml
[[subscriptions]]
name = "tickets-by-team"
modelName = "ticket"
access = "isMemberOf('team', params.teamId)"
filter = "record.teamId == params.teamId"
params = '{"teamId":{"type":"string","required":true}}'
```

### Subscribing (client)

```typescript
const sub = await client.databases
  .database(databaseId)
  .subscribe("my-open-tickets");

sub.on("change", (event) => {
  // event.op: "save" | "patch" | "delete"
  // event.before: previous record (patch/delete only)
  // event.after:  new record (save/patch only)
  // event.recordId
  applyChange(event);
});

// Later
sub.unsubscribe();
```

Parameterized subscribe:

```typescript
const sub = await client.databases
  .database(databaseId)
  .subscribe("tickets-by-team", { params: { teamId: "eng" } });
```

### CEL Variables

For `access`:
- `user.userId`, `user.role`
- `isMemberOf(type, id)`, `hasRole(role)`
- `params.*`
- `database.id`, `database.metadata.*`

For `filter`:
- `record.*` — the new record (on save/patch) or the record being deleted
- `user.*` — the subscribed connection's user
- `params.*`
- `database.*`

### Change Event Shape

```typescript
type SubscriptionEvent =
  | { op: "save";   recordId: string; after: Record; before?: Record }
  | { op: "patch";  recordId: string; after: Record; before: Record }
  | { op: "delete"; recordId: string; before: Record };
```

---

## Canonical Pattern: Load + Subscribe

The right way to render a live view.

```typescript
async function liveTickets(databaseId: string) {
  // 1. Initial load — full current state
  const { data: tickets } = await client.databases.executeOperation(
    databaseId,
    "list-my-open-tickets",
  );
  const byId = new Map(tickets.map(t => [t.id, t]));

  // 2. Subscribe for delta updates
  const sub = await client.databases.database(databaseId)
    .subscribe("my-open-tickets");

  sub.on("change", (event) => {
    if (event.op === "delete") byId.delete(event.recordId);
    else byId.set(event.recordId, event.after);
    render(Array.from(byId.values()));
  });

  // 3. Re-load on reconnect (there's no replay)
  sub.on("reconnected", async () => {
    const { data: fresh } = await client.databases.executeOperation(
      databaseId,
      "list-my-open-tickets",
    );
    byId.clear();
    fresh.forEach(t => byId.set(t.id, t));
    render(Array.from(byId.values()));
  });

  return () => sub.unsubscribe();
}
```

Note: initial load query and subscription filter should be semantically equivalent. If the filter is `record.assigneeId == user.userId`, the initial query should filter the same way. Divergence causes UI flicker.

---

## Combining: Cron + Subscriptions for Live Reports

Cron writes → subscription broadcasts → UI renders.

```toml
# cron-triggers/hourly-rollup.toml
[cronTrigger]
key = "hourly-metrics-rollup"
schedule = "0 * * * *"
workflowKey = "compute-metrics-rollup"
timezone = "UTC"
```

```toml
# workflows/compute-metrics-rollup.toml
[[steps]]
name = "write-rollup"
type = "database.mutate"
databaseId = "{{ input.metricsDbId }}"
operation = "upsert-hourly-rollup"
params = { timestamp = "{{ meta.triggeredAt }}" }
```

```typescript
// Client subscribes, no cron-awareness needed
const sub = await client.databases
  .database(metricsDbId)
  .subscribe("hourly-rollups");

sub.on("change", (event) => {
  if (event.op === "save") renderNewRow(event.after);
});
```

---

## Anti-Patterns

- ❌ Polling a database on an interval to find changes. Use a subscription.
- ❌ Using cron for user-triggered work. Use a regular workflow started via `workflows.start` or a webhook.
- ❌ Setting `overlapPolicy: "queue"` on idempotent jobs. Use `"skip"`.
- ❌ Cron schedule without timezone for user-visible times.
- ❌ Putting per-user logic in `filter`. That belongs in `access` (which runs once at subscribe time).
- ❌ Assuming the writer's own mutation comes back through their subscription — it doesn't.
- ❌ Relying on replay after disconnect. Always re-query on reconnect.
- ❌ Creating >50 cron triggers. Consolidate with fan-out workflows.
- ❌ Subscribing on every render. Subscribe once per view, unsubscribe on unmount.

---

## Debugging

### Cron Triggers

```bash
primitive cron-triggers get nightly-digest   # includes recent firings
primitive cron-triggers run nightly-digest   # fire manually for testing
primitive workflows runs list --workflow send-digest --trigger-source cron
```

### Subscriptions

- Subscribe call fails → check `access` CEL with a known `user` context.
- Changes aren't arriving → verify your mutation is executing, check `filter` CEL against the actual record, confirm the client's connection hasn't dropped.
- "Seeing my own writes" bug → you're not, unless the connection differs. Likely a client-side optimistic update duplicating.

---

## Related Guides

- [Workflows](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) — What cron triggers fire
- [Databases](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) — Operations, access rules, triggers
- [Users and Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) — CEL membership checks used in access rules
