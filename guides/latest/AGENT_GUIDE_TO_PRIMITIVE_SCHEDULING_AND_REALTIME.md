# Agent Guide to Primitive Scheduling and Real-Time

Guidelines for AI agents implementing cron-triggered workflows and real-time database subscriptions.

## Mental Model

Two independent capabilities. They often combine, but they answer different questions.

| Capability | Answers | Runs where | Payload |
|------------|---------|------------|---------|
| **Cron triggers** | "When should work happen?" | Server (workflow run) | Workflow input |
| **Database subscriptions** | "How does the client find out something changed?" | Client (WS handler) | Batched record changes |

**Decision rules:**

1. Trigger is a clock → cron trigger.
2. Trigger is a user action or webhook → regular workflow (`workflows.start`), not cron.
3. UI needs to reflect server-side changes without the user acting → subscription.
4. Polling a database to find changes → replace with a subscription.

---

## Critical Rules

1. **Cron triggers fire workflows, not arbitrary code.** Create the workflow first, then point the trigger at it via `workflowKey`.

2. **Set an IANA `timezone` whenever the schedule has a user-visible hour.** `0 9 * * *` in UTC is 2am in Los Angeles.

3. **`overlapPolicy` is `"skip"` (default) or `"allow"`.** There is no `"queue"`. `"skip"` checks if the previous run is still active and increments `skippedCount`; `"allow"` always fires.

4. **Per-app cap is 50 cron triggers; per-database cap is 20 subscriptions** (and max 5 declared `params` per subscription).

5. **Subscriptions need both `accessRule` and `filter` CEL.** `accessRule` is checked once at subscribe time with full user/membership context. `filter` runs per change and only sees `user.userId`, `record.*`, `params.*` — no memberships, no `database.*`. Don't put membership logic in `filter`.

6. **Writer's *connection* is excluded from subscription fanout, not the writer's user.** Another connection of the same user (e.g. another browser tab) WILL receive the change.

7. **No replay on reconnect.** The client auto re-issues `db.subscribe`, but missed changes during the disconnect are gone. Re-load on reconnect if you need consistency.

8. **`unsub()` leaks if not called.** Each `subscribe()` returns an `unsub` function. Call it on view teardown or you accumulate `ConnectionMapping` rows and dead callbacks.

9. **Subscriptions are per-database, not per-database-type.** They are NOT defined in TOML/sync — create them via the HTTP API or `client` (no `primitive sync` path).

10. **The `filter` field has no `record.*` shorthand for top-level fields.** Use `record.data.fieldName`, not `record.fieldName`. Operation, model, and id are at the top level of `record`.

---

## Cron Triggers

### Creating (TOML / `primitive sync`)

```toml
# config/cron-triggers/nightly-digest.toml
[cronTrigger]
key = "nightly-digest"
displayName = "Nightly digest email"
cron = "0 9 * * *"
timezone = "America/Los_Angeles"
workflowKey = "send-digest"
overlapPolicy = "skip"
state = "active"

# Optional: static input passed to the workflow on every fire
[rootInput]
digestType = "daily"
environment = "production"

# Optional: dynamic input. `{{now}}` is replaced with the fire-time ISO string.
[inputMapping]
firedAt = "{{now}}"
```

```bash
primitive sync push --dir ./config
```

The TOML key `key` maps to the API field `triggerKey`. `cron` (not `schedule`) is the field name.

### Creating (client)

```typescript
const trigger = await client.cronTriggers.create({
  triggerKey: "nightly-digest",
  displayName: "Nightly digest email",
  cron: "0 9 * * *",                       // NOT `schedule`
  timezone: "America/Los_Angeles",
  workflowKey: "send-digest",
  overlapPolicy: "skip",                   // "skip" | "allow"
  rootInput: { digestType: "daily" },      // NOT `input`
  inputMapping: { firedAt: "{{now}}" },    // optional, merged over rootInput
});
// trigger.triggerId is a ULID — use it for subsequent calls.
```

#### Wrong

```typescript
// WRONG — these field names don't exist
await client.cronTriggers.create({
  key: "nightly-digest",         // should be triggerKey
  schedule: "0 9 * * *",          // should be cron
  input: { ... },                 // should be rootInput
  overlapPolicy: "queue",         // not a valid value
  enabled: true,                  // no such field; use `state`
});
```

### Field reference

| Field | Required | Notes |
|-------|----------|-------|
| `triggerKey` | Yes | Per-app unique. Alphanumerics, `-`, `_`. Must start alphanumeric. |
| `displayName` | Yes | Human label. |
| `cron` | Yes | 5-field cron (see Syntax below). |
| `workflowKey` | Yes | Must refer to an existing workflow definition. |
| `timezone` | No | IANA name (validated via `Intl.DateTimeFormat`). Default `"UTC"`. |
| `overlapPolicy` | No | `"skip"` (default) or `"allow"`. |
| `rootInput` | No | JSON object, merged into workflow input. |
| `inputMapping` | No | JSON object, merged AFTER `rootInput`. Supports `{{now}}` substitution. |
| `description` | No | Free text. |
| `state` | Update only | `"active"` / `"paused"` / `"archived"`. Set on update; create always starts `"active"`. |

### Cron expression syntax

Standard 5-field POSIX: `minute hour day-of-month month day-of-week`.

Supported per field: `*`, exact (`5`), range (`5-10`), step on wildcard (`*/5`), step on range (`9-17/2`), comma list (`1,2,3`).

**Not supported:** month/day names, `?`, `L`, `W`, `#`, last-day modifiers, 6/7-field crons.

**Day-of-week:** `0` and `7` both mean Sunday, but `7` is only allowed as a bare value (NOT in ranges). Use `0` in ranges.

**Vixie semantics:** when both day-of-month and day-of-week are restricted, fires when EITHER matches.

| Need | Schedule |
|------|----------|
| Every 5 minutes | `*/5 * * * *` |
| Every hour on the hour | `0 * * * *` |
| Every day at 9am (local) | `0 9 * * *` + `timezone` |
| Every Monday at 9am | `0 9 * * 1` |
| First of every month | `0 0 1 * *` |
| Every 15 min, business hours, Mon–Fri | `*/15 9-17 * * 1-5` |

Invalid expressions are rejected at create time. If the cron later becomes unparseable (rare), the trigger transitions to `state: "error_paused"` with `lastError` set; alarms stop until you call `resume`.

### Workflow input shape

The workflow receives `rootInput` merged with `inputMapping` (latter wins on key collision), plus the `meta` object on the run record:

```typescript
// Inside the workflow:
input.digestType    // "daily"          (from rootInput)
input.firedAt       // "2026-04-27T..." (from inputMapping with {{now}})

// And on the run record:
run.contextDocId    // "cron:<triggerId>"
run.meta.source     // "cron"
run.meta.triggerId  // <triggerId>
run.meta.triggerKey // "nightly-digest"
run.meta.manual     // true if started via cronTriggers.test()
```

### Lifecycle methods

```typescript
await client.cronTriggers.list();                       // exclude archived
await client.cronTriggers.get(triggerId);               // includes runtime.scheduledAlarmAt
await client.cronTriggers.update(triggerId, { ... });   // change cron/timezone/state etc.
await client.cronTriggers.pause(triggerId);             // cancels pending alarm
await client.cronTriggers.resume(triggerId);            // clears lastError, reschedules
await client.cronTriggers.delete(triggerId);            // soft delete (archive)
await client.cronTriggers.test(triggerId);              // fire NOW; does not affect schedule
```

Note: `.test()`, `.pause()`, `.resume()`, `.delete()`, `.update()`, `.get()` all take the `triggerId` (ULID returned from `.create()`), NOT the `triggerKey`. Use `.list()` to look up `triggerId` by key.

### Querying cron-triggered runs

There is no `triggerSource` filter on `workflows.listRuns()`. Cron runs are identifiable by their `contextDocId` starting with `cron:` and `meta.source === "cron"`:

```typescript
const { items } = await client.workflows.listRuns({ workflowKey: "send-digest" });
const cronRuns = items.filter(r => r.contextDocId?.startsWith("cron:"));
```

---

## Database Subscriptions

### Registering (server-side)

Subscriptions are created via the HTTP API or client — they are **not** part of `primitive sync` TOML config. One subscription is scoped to one database (not to a database type).

```typescript
await client.makeRequest(
  "POST",
  `/databases/${databaseId}/subscriptions`,
  {
    subscriptionKey: "my-open-tickets",
    displayName: "My open tickets",
    accessRule: "user.userId != ''",                                  // CEL, evaluated at subscribe time
    filter: "record.modelName == 'ticket' && record.data.assigneeId == user.userId && record.data.status == 'open'",
  }
);
```

Parameterized:

```typescript
await client.makeRequest(
  "POST",
  `/databases/${databaseId}/subscriptions`,
  {
    subscriptionKey: "tickets-by-team",
    displayName: "Tickets by team",
    accessRule: "isMemberOf('team', params.teamId)",
    filter: "record.modelName == 'ticket' && record.data.teamId == params.teamId",
    params: {
      teamId: { type: "string", required: true },
    },
  }
);
```

Notes on the schema:
- There is **no `modelName` field** on the subscription itself. Filter on `record.modelName` inside the CEL expression if you only want one model.
- `params` schema declares names with `type` (`string` | `number` | `boolean`) and optional `required: true`. Max 5 entries.
- Per-database limit: 20 active subscriptions.
- Field is `accessRule` (not `access`).

### Subscribing (client)

`subscribe()` returns an `unsub()` function. There is no event-emitter API.

```typescript
const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
  onChange: (event) => {
    // event.type === "db.change"
    // event.databaseId, event.subscriptionKey, event.timestamp
    for (const change of event.changes) {
      // change.op:           "save" | "patch" | "delete" | "increment" | "addToSet" | "removeFromSet"
      // change.modelName:    e.g. "ticket"
      // change.id:           record id
      // change.data:         new record data (save/patch/increment/addToSet/removeFromSet)
      // change.previousData: prior data (patch/delete)
      applyChange(change);
    }
  },
});

// Later — REQUIRED for cleanup
unsub();
```

Parameterized:

```typescript
const unsub = client.databases.subscribe(databaseId, "tickets-by-team", {
  params: { teamId: "eng" },
  onChange: (event) => { ... },
});
```

#### Wrong

```typescript
// WRONG — there is no .on() / .unsubscribe() / "reconnected" event.
const sub = await client.databases.database(databaseId).subscribe("my-open-tickets");
sub.on("change", handler);
sub.on("reconnected", refetch);
sub.unsubscribe();

// WRONG — onChange receives an envelope with `changes[]`, not a single record.
onChange: (record) => render(record);

// WRONG — record fields are nested under .data
filter: "record.assigneeId == user.userId"
// CORRECT:
filter: "record.data.assigneeId == user.userId"
```

### CEL variables

`accessRule` (full context, evaluated once at subscribe time):

| Variable | Notes |
|----------|-------|
| `user.userId`, `user.role` | `role` is the caller's app role. |
| `isMemberOf(type, id)`, `hasRole(role)` | Standard membership helpers. |
| `params.*` | Subscriber-supplied params. |

`filter` (per-change, narrow context — NO memberships, NO `database.*`):

| Variable | Notes |
|----------|-------|
| `user.userId` | The subscriber's user id. |
| `user.role` | **Always `""` empty string in filter context.** Don't rely on it. |
| `record.modelName` | Which model the row belongs to. |
| `record.op` | One of `save`/`patch`/`delete`/`increment`/`addToSet`/`removeFromSet`. |
| `record.id` | Record id. |
| `record.data` | New data (null on delete). |
| `record.previousData` | Prior data (null on create). |
| `params.*` | Bound params from `subscribe()`. |

`filter` cannot grant access that `accessRule` denies — they're ANDed (subscribe is rejected if `accessRule` fails; otherwise only filter-matching changes are sent).

### Change envelope shape

```typescript
interface DatabaseChangePayload {
  type: "db.change";
  databaseId: string;
  subscriptionKey: string;
  timestamp: string;             // ISO
  changes: DatabaseChangeEvent[]; // 1+ changes; batched per write op
}

interface DatabaseChangeEvent {
  op: "save" | "patch" | "delete" | "increment" | "addToSet" | "removeFromSet";
  modelName: string;
  id: string;
  data?: any;          // present on save/patch/increment/addToSet/removeFromSet
  previousData?: any;  // present on patch/delete
}
```

### Reconnect & cleanup behavior

- The WS client persists the registry of `(databaseId, subscriptionKey, params, onChange)` tuples and re-issues `db.subscribe` automatically when the socket reopens. No app code needed.
- **No replay** of changes that occurred while disconnected. If you need consistency on reconnect, re-run your initial-load query.
- The writer's connection is excluded from broadcast via `excludeConnectionId`. The writer's user is NOT excluded — other tabs/devices of the same user receive the change.
- Auth refresh that does NOT require a hard reconnect leaves subscriptions intact. A hard reconnect re-runs the registry pass (so `accessRule` is re-evaluated against the current user/memberships).

---

## Canonical Pattern: Load + Subscribe

```typescript
async function liveTickets(databaseId: string) {
  // 1. Initial load — full current state.
  const { records: tickets } = await client.databases.executeOperation(
    databaseId,
    "list-my-open-tickets",
  );
  const byId = new Map(tickets.map(t => [t.id, t]));
  render(Array.from(byId.values()));

  // 2. Subscribe for delta updates.
  const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
    onChange: (event) => {
      for (const change of event.changes) {
        if (change.op === "delete") {
          byId.delete(change.id);
        } else {
          // save / patch / increment / addToSet / removeFromSet
          byId.set(change.id, change.data);
        }
      }
      render(Array.from(byId.values()));
    },
  });

  // 3. Return teardown — call this on unmount.
  return unsub;
}
```

Make the initial-load operation's filter and the subscription's `filter` semantically equivalent. If they diverge, the UI will flicker (records the operation returned but the subscription never updates, or vice versa).

There is no built-in "reconnected" callback. If you need to re-run the initial load after a disconnect, hook the WS reconnect via `client.events` (or whatever your client exposes) and call your loader again.

---

## Combining: Cron + Subscriptions for Live Reports

Cron writes → subscription broadcasts → UI renders. The cron-spawned workflow's database mutation is just a normal write; the subscription doesn't know cron exists.

```toml
# config/cron-triggers/hourly-rollup.toml
[cronTrigger]
key = "hourly-metrics-rollup"
displayName = "Hourly metrics rollup"
cron = "0 * * * *"
timezone = "UTC"
workflowKey = "compute-metrics-rollup"
overlapPolicy = "skip"
state = "active"

[inputMapping]
firedAt = "{{now}}"
```

```typescript
// On the client — no cron-awareness needed.
const unsub = client.databases.subscribe(metricsDbId, "hourly-rollups", {
  onChange: (event) => {
    for (const change of event.changes) {
      if (change.op === "save") renderNewRow(change.data);
    }
  },
});
```

---

## Anti-Patterns

- Polling a database on an interval to find changes. Use a subscription.
- Using cron for user-triggered work. Use `workflows.start` or a webhook.
- Setting `overlapPolicy: "queue"`. Not a valid value. Use `"skip"` (default) or `"allow"`.
- Cron schedule with a user-visible hour but no `timezone` — fires at the wrong wall-clock time.
- Using `key`, `schedule`, or `input` in the client API — fields are `triggerKey`, `cron`, `rootInput`.
- Calling `.test()` / `.update()` / `.pause()` with the trigger's *key* — they take the *id*.
- Putting `isMemberOf()` or per-user logic in subscription `filter` — `filter` has no membership data. Put it in `accessRule`.
- Writing `record.fieldName` in `filter` — record fields live under `record.data.fieldName`.
- Defining subscriptions in TOML / `primitive sync` — they are HTTP-API only.
- Adding a `modelName` field to the subscription — there isn't one. Filter on `record.modelName` in CEL.
- Assuming the writer's own mutation comes back through THEIR subscription on the SAME connection — it doesn't. (Other connections of the same user DO receive it.)
- Relying on replay after disconnect. There is none. Re-load if you need consistency.
- Forgetting to call the returned `unsub()`. Leaks `ConnectionMapping` rows and registry entries.
- Subscribing on every render. Subscribe once per view, unsub on unmount.
- Creating >50 cron triggers per app or >20 subscriptions per database. Consolidate.

---

## Debugging

### Cron Triggers

```bash
primitive cron-triggers list
primitive cron-triggers get <triggerId>          # includes runtime.scheduledAlarmAt
primitive cron-triggers test <triggerId>         # fire now; does NOT affect schedule
```

Common states:
- `active` — scheduled, alarm armed.
- `paused` — manual pause; alarm cancelled until `resume`.
- `error_paused` — set automatically when the workflow start fails or the cron expression becomes unparseable. `lastError` is populated. Call `resume` to clear and reschedule.
- `archived` — soft-deleted; never returns from list.

`skippedCount` increments when `overlapPolicy: "skip"` blocks a fire because the prior run is still active.

### Subscriptions

- Subscribe call returns an error message (sent over WS as `type: "error"`, `context: "db.subscribe"`):
  - `"Database not found"` / `"Subscription not found"` — wrong id/key or archived.
  - `"Access denied to subscription"` — `accessRule` returned false. Test the rule against the caller's user/memberships.
  - `"Missing required parameter: ..."` / `"Undeclared parameter: ..."` / `"Parameter ... must be of type ..."` — params don't match schema.
- Changes aren't arriving — verify (a) the write completed, (b) the subscription's `filter` matches the actual record (remember `record.data.field` not `record.field`), (c) the subscriber's connection is still open.
- "Seeing my own writes" — only happens if a different connection performed the write (e.g. another tab) or you have a client-side optimistic update on the same path.

---

## Related Guides

- [Workflows](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) — what cron triggers fire
- [Databases](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) — operations, access rules, triggers
- [Users and Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) — CEL membership checks for `accessRule`
