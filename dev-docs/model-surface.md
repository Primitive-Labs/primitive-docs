# model-surface — typed model API

The typed model surface (`Task.save()`, `Task.query()`, …) — record CRUD, queries, aggregation, and change subscriptions on a generated model class. Records are imported from your generated models, not reached through `client.<x>`.

::: tip Divergent shape
Both clients now expose the surface as one model per type. JavaScript uses **static/instance methods on the generated `BaseModel` class** (`Task.query`, `task.save`); Swift (post-[#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918)) uses a matching **static `Model.*` facade** on the generated struct — reads are statics that span every open document by default (`Task.query`, `Task.count`, `Task.findAll`, `Task.find`, `Task.aggregate`, `Task.subscribe`), and writes are the instance `save(in:)` / `delete(in:)` that target one document and throw if it isn't open. The old per-document `TypedModel<Task>` wrapper and its `.dynamic` escape hatch are gone — app code only ever touches the facade. Two surface gaps remain vs JS: the model facade has no `findByUnique` / `upsert` / `queryOne` / cursor-paged `query` (filter and take `.first` / re-save by natural key instead), and Swift `query()` returns the hydrated `[Task]` directly rather than a `PaginatedResult` ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) / [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955)). Per-method divergences are noted inline.
:::

## save(options?)

Construct a record and persist it. JS `save` accepts `SaveOptions` (`targetDocument`, `forceWrite`, `upsertOn`); Swift's instance `save(in:)` (the unified create/update from [#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918)) takes an explicit `documentId` and throws if that document isn't open.

::: tip Divergent shape
JS targets the active document by default (or `{ targetDocument }`); Swift's `save(in:)` always names the document explicitly — there's no active-document defaulting. The other `SaveOptions` aren't on the Swift facade: `forceWrite` has no equivalent, and `upsertOn` has no facade form — upsert by re-saving a record you looked up by its natural key (see [upsert](#upsert-save-with-upserton)) (sweep D3/D4, [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947)).
:::

::: code-group
<<< ./snippets/model-surface/save.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/save.swift#example{swift} [Swift]
:::

## find(id)

Look up a single record by its id. Resolves to null/nil when nothing matches.

::: tip Divergent shape
JS `Task.find` is `async` (returns a `Promise`); Swift `Task.find(_:)` is synchronous
(reads from the local cross-document store, no `await`/`throws`). Swift also returns `nil`
when the stored row has drifted from the typed shape — a decode miss is silently
indistinguishable from "not found" (sweep model D-find).
:::

::: code-group
<<< ./snippets/model-surface/find.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find.swift#example{swift} [Swift]
:::

## findAll()

Load every record of this model (no filter, no pagination).

::: tip Divergent shape
JS `Task.findAll()` is `async`; Swift `Task.findAll()` is synchronous (local cross-document
read). Swift silently drops rows that have drifted from the typed shape, so the
returned count can be smaller than what's actually stored (sweep model D-findAll).
:::

::: code-group
<<< ./snippets/model-surface/find-all.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find-all.swift#example{swift} [Swift]
:::

## findByUnique(constraintName, value)

Look up a record by a registered unique constraint without knowing its id. Pass an array for a compound constraint.

::: tip Divergent shape
JS has a dedicated `async` `findByUnique` (bare value, or an array for a compound constraint). The Swift model facade has **no** `findByUnique` — filter on the unique field and take `.first` (`Task.query(["email": "alice@example.com"]).first`); for a compound constraint, filter on every field of it ([#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947)).
:::

::: code-group
<<< ./snippets/model-surface/find-by-unique.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find-by-unique.swift#example{swift} [Swift]
:::

## query(filter?, options?)

Mongo-style filtered query.

::: tip Divergent shape
JS returns a `PaginatedResult<Task>` — rows on `.data`, plus `.nextCursor` / `.hasMore`. Swift `Task.query()` returns the hydrated `[Task]` directly (no wrapper). It accepts a `limit` and an ordered `sortOrder` on `QueryOptions`, but returns no cursor, so cursor pagination isn't expressible on the facade today ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
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

Fetch just the first match (with an optional sort). Resolves to null/nil when nothing matches.

::: tip Divergent shape
JS has a dedicated `queryOne`; the Swift model facade has none — take `.first` of a sorted `Task.query(...)` ([#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955)).
:::

::: code-group
<<< ./snippets/model-surface/query-one.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/query-one.swift#example{swift} [Swift]
:::

## query — paginate

Sort and paginate with a cursor.

::: danger Swift parity gap
JS carries `PaginatedResult.nextCursor` forward via `uniqueStartKey` on the same `query()`. The Swift model facade has **no** cursor pagination: `Task.query` accepts `limit` and an ordered `sortOrder` but returns a plain `[Task]` with no `nextCursor` to advance, so only a single bounded, ordered page is expressible today ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

::: code-group
<<< ./snippets/model-surface/paginate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/paginate.swift#example{swift} [Swift]
:::

## count(filter?)

Count records matching a filter (or all of them when omitted).

::: tip Divergent shape
JS `Task.count` is `async`; Swift `Task.count` is a synchronous static returning an `Int`, counting across every open document.
:::

::: code-group
<<< ./snippets/model-surface/count.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/count.swift#example{swift} [Swift]
:::

## aggregate(options)

Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.

::: danger Swift parity gap
Swift `Task.aggregate` is a static returning untyped `[[String: Any]]` rows (vs JS's typed result). Its `groupBy` is `[String]` only, so two JS grouping shapes have no Swift form: StringSet-membership grouping (`{ field, contains }`) and the single-facet map (sweep D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
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

Insert-or-merge by a natural unique key, without knowing the existing record's id. The field must have a single-field unique constraint.

::: tip Divergent shape
JS expresses this as `save({ upsertOn: "email" })` on the typed instance. The Swift model facade has no `upsertOn` — look the record up by its unique field (`AppUser.query(["email": ...]).first`), mutate it in place if it exists or build a new one if it doesn't, then `save(in:)` (the unified create/update) ([#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947)).
:::

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
