# model-surface — typed model API

The typed model surface (`Task.save()`, `Task.query()`, …) — record CRUD, queries, aggregation, and change subscriptions on a generated model class. Records are imported from your generated models, not reached through `client.<x>`.

::: tip Why the JS and Swift model APIs look a little different
Both clients give you **one model per type** with the same verbs — `save`, `find`,
`findAll`, `query`, `count`, `subscribe`, `delete`. Almost every difference below
comes from **one root cause: the two clients store your records differently.**

- **JavaScript** loads your records into a tiny SQL database that runs *inside* the
  app (SQLite compiled to WebAssembly in the browser). Talking to that database is
  asynchronous, so every read is `await`ed and hands back a `Promise`. Because it's
  real SQL, you also get conveniences for free: a `PaginatedResult` with a
  `nextCursor`, and a fully-typed `aggregate` result.
- **Swift** keeps the same records as plain in-memory data and reads them directly.
  That makes reads **instant and synchronous** — no `await`, no `Promise` — but it
  also means a couple of SQL-only conveniences (cursor pagination, fully-typed
  group-by) aren't built yet.

So when a method below says *"JS is async, Swift is synchronous,"* that's not a
missing feature — it's the **same data read two different ways**, and matching JS
would mean shipping a whole SQL engine inside the Swift client for no real gain.
The two spots where Swift is genuinely *behind* (cursor pagination, typed
aggregate) are flagged in red and tracked in [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946).

(Mechanically: JS uses static/instance methods on the generated `BaseModel` class;
Swift uses a matching static `Model.*` facade on the generated struct — reads are
statics that span every open document, writes are the instance `save(in:)` /
`save(in:upsertOn:)` / `delete(in:)` that name one document and throw if it isn't
open. Per-method notes follow.)
:::

## save(options?)

Construct a record and persist it. JS `save` accepts `SaveOptions` (`targetDocument`, `forceWrite`, `upsertOn`); Swift's instance `save(in:)` (the unified create/update from [#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918)) takes an explicit `documentId` and throws if that document isn't open. The `upsertOn` form is `save(in:upsertOn:)` (see [upsert](#upsert-save-with-upserton)).

::: tip Swift makes you name the document
JS keeps a hidden pointer to one "active" document and `save()` quietly writes to
it (or you pass `{ targetDocument }`). Swift has **no hidden active document**, so
you always say which one with `save(in:)`. It's the same write — Swift just makes
the target explicit instead of guessing. (JS's `forceWrite` escape hatch has no
Swift equivalent.)
:::

::: code-group
<<< ./snippets/model-surface/save.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/save.swift#example{swift} [Swift]
:::

## find(id)

Look up a single record by its id. Resolves to null/nil when nothing matches.

::: tip JS awaits, Swift doesn't
Same lookup on both clients. JS `Task.find` is `async` — you `await` it — because it
reads from the in-app SQL database. Swift `Task.find(_:)` is a plain synchronous call:
the record is already in memory, so there's nothing to wait for (no `await`/`throws`).
One Swift caveat: if a stored row no longer matches your model's shape, Swift returns
`nil`, so a decode miss looks the same as "not found" (sweep model D-find).
:::

::: code-group
<<< ./snippets/model-surface/find.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find.swift#example{swift} [Swift]
:::

## findAll()

Load every record of this model (no filter, no pagination).

::: tip JS awaits, Swift doesn't
Same reason as `find`: JS `Task.findAll()` is `async` (it queries the in-app SQL
database); Swift `Task.findAll()` is synchronous (it reads in-memory data directly).
Swift silently drops rows that have drifted from the typed shape, so the returned
count can be smaller than what's actually stored (sweep model D-findAll).
:::

::: code-group
<<< ./snippets/model-surface/find-all.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find-all.swift#example{swift} [Swift]
:::

## findByUnique(constraintName, value)

Look up a record by a registered unique constraint without knowing its id. Both clients expose `findByUnique(constraintName, value)`; pass an array for a compound constraint. JS is `async`; Swift's static `throws` if the constraint isn't registered.

::: code-group
<<< ./snippets/model-surface/find-by-unique.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find-by-unique.swift#example{swift} [Swift]
:::

## query(filter?, options?)

Mongo-style filtered query.

::: tip Different return shape
Because JS queries an in-app SQL database, it returns a `PaginatedResult<Task>` — rows
on `.data`, plus `.nextCursor` / `.hasMore` for paging. Swift reads in-memory data and
returns the records as a plain `[Task]` array. It accepts a `limit` and an ordered
`sortOrder`, but returns no cursor — so you can get one bounded, sorted page, but can't
yet page through a large set (see [paginate](#query-paginate) below, [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

::: code-group
<<< ./snippets/model-surface/query.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/query.swift#example{swift} [Swift]
:::

## query — logical operators

Combine conditions with `$or` / `$and`.

::: code-group
<<< ./snippets/model-surface/query-logical.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/query-logical.swift#example{swift} [Swift]
:::

## queryOne(filter?, options?)

Fetch just the first match (with an optional sort). Resolves to null/nil when nothing matches. Both clients expose `queryOne`; JS is `async`, Swift's static is synchronous.

::: code-group
<<< ./snippets/model-surface/query-one.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/query-one.swift#example{swift} [Swift]
:::

## query — paginate

Sort and paginate with a cursor.

::: danger Swift can't page through results yet
This one is a **real gap, not a style difference.** In JS, a `query` hands back a
`nextCursor` that you feed into the next call (`uniqueStartKey`) to walk through a
large result set page by page. Swift's `query` returns a plain `[Task]` — you can cap
it with `limit` and sort it, but there's no cursor to continue from, so you only ever
get one page today. Tracked in [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946).
:::

::: code-group
<<< ./snippets/model-surface/paginate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/paginate.swift#example{swift} [Swift]
:::

## count(filter?)

Count records matching a filter (or all of them when omitted).

::: tip JS awaits, Swift doesn't
Same reason as `find`: JS `Task.count` is `async` (it asks the in-app SQL database);
Swift `Task.count` is a synchronous static returning an `Int`, counting across every
open document in memory.
:::

::: code-group
<<< ./snippets/model-surface/count.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/count.swift#example{swift} [Swift]
:::

## aggregate(options)

Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.

::: danger Swift's group-by is more limited
Another **real gap.** Both clients can group-and-count, but JS — backed by SQL —
returns a fully-typed result and supports richer grouping. Swift returns untyped
`[[String: Any]]` rows and only groups by plain field names, so two JS grouping shapes
have no Swift form yet: grouping by membership in a string-set (`{ field, contains }`)
and the single-facet map (sweep D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

::: code-group
<<< ./snippets/model-surface/aggregate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/aggregate.swift#example{swift} [Swift]
:::

## subscribe(callback)

Subscribe to model changes (local edits and synced remote edits). Returns an unsubscribe function — always call it.

::: tip Divergent shape
Both clients expose `Task.subscribe`. The Swift static fires the callback after any add/update/delete in any open document's copy of the model and returns an unsubscribe closure.
:::

::: code-group
<<< ./snippets/model-surface/subscribe.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/subscribe.swift#example{swift} [Swift]
:::

## upsert (save with upsertOn)

Insert-or-merge by a natural unique key, without knowing the existing record's id. The field must have a single-field unique constraint. JS expresses this as `save({ upsertOn: "email" })`; Swift uses the instance `save(in:upsertOn:)` overload.

::: code-group
<<< ./snippets/model-surface/upsert.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/upsert.swift#example{swift} [Swift]
:::

## update

Update a record: load it, change fields, persist.

::: tip Divergent shape
Both clients now update the same way: load the record, mutate fields on the value, then persist. JS calls `save()`; Swift calls the instance `save(in:)` (the unified create/update — it writes in place when the record already exists), which throws if the named document isn't open.
:::

::: code-group
<<< ./snippets/model-surface/update.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/update.swift#example{swift} [Swift]
:::

## delete()

Delete a record by id.

::: tip Divergent shape
Both clients load the record and call `delete` on the instance. Swift's `delete(in:)` names the document to delete from and throws if it isn't open.
:::

::: code-group
<<< ./snippets/model-surface/delete.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/delete.swift#example{swift} [Swift]
:::
