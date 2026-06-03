# model-surface — typed model API

The typed model surface (`Task.save()`, `Task.query()`, …) — record CRUD, queries, aggregation, and change subscriptions on a generated model class. Records are imported from your generated models, not reached through `client.<x>`.

::: tip Divergent shape
JavaScript exposes the whole surface as **static/instance methods on the generated `BaseModel` class** (`Task.query`, `task.save`). Swift exposes a `TypedModel<Task>` bound to one document: the typed reads/writes (`create`, `find`, `findAll`, `query`, `update`, `delete`, `findByUnique`) live on `TypedModel`, while `count` / `queryPaged` / `aggregate` / `upsert` / `subscribe` live on its `.dynamic` escape hatch. The biggest return-shape gap: JS `query()` returns a `PaginatedResult` (rows on `.data`, plus `.nextCursor` / `.hasMore`) whereas Swift `query()` returns the hydrated `[Task]` directly — cursor pagination moves to `.dynamic.queryPaged`. Tracked under [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) / [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) / [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947). Per-method divergences are noted inline.
:::

## save(options?)

Construct a record and persist it. JS `save` accepts `SaveOptions` (`targetDocument`, `forceWrite`, `upsertOn`); in Swift a `TypedModel` is bound to one document, so the write targets that document.

::: warning Swift parity gap
JS targets the active document by default (or `{ targetDocument }`); Swift's `TypedModel.create(_:)` writes to the document the model was constructed against, with no active-document defaulting. None of JS's `SaveOptions` are exposed on the Swift facade — `targetDocument` and `forceWrite` have no equivalent at all, and `upsertOn` is reachable only via the internal `.dynamic.upsert` (see below) (sweep D3/D4, [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947)).
:::

::: code-group
<<< ./snippets/model-surface/save.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/save.swift#example{swift} [Swift]
:::

## find(id)

Look up a single record by its id. Resolves to null/nil when nothing matches.

::: tip Divergent shape
JS `Task.find` is `async` (returns a `Promise`); Swift `tasks.find(_:)` is synchronous
(reads from the local store, no `await`/`throws`). Swift also returns `nil` when the
stored row has drifted from the typed shape — a decode miss is silently indistinguishable
from "not found" (sweep model D-find).
:::

::: code-group
<<< ./snippets/model-surface/find.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find.swift#example{swift} [Swift]
:::

## findAll()

Load every record of this model (no filter, no pagination).

::: tip Divergent shape
JS `Task.findAll()` is `async`; Swift `tasks.findAll()` is synchronous (local-store
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
JS takes a bare value (`"alice@example.com"`) and an array for a compound constraint, all on one `async` `findByUnique`; Swift takes a typed `PrimitiveValue` (`.string(...)`) via `findByUnique(constraint:value:)` and a separate `values:` overload for compound constraints (synchronous, `throws`).
:::

::: code-group
<<< ./snippets/model-surface/find-by-unique.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find-by-unique.swift#example{swift} [Swift]
:::

## query(filter?, options?)

Mongo-style filtered query.

::: tip Divergent shape
JS returns a `PaginatedResult<Task>` — rows on `.data`, plus `.nextCursor` / `.hasMore`. Swift `query()` returns the hydrated `[Task]` directly (no wrapper); reach for `.dynamic.queryPaged` when you need a cursor ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
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
JS has a dedicated `queryOne`; Swift has no `queryOne` on the typed facade — take `.first` of a sorted `query(...)` ([#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955)).
:::

::: code-group
<<< ./snippets/model-surface/query-one.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/query-one.swift#example{swift} [Swift]
:::

## query — paginate

Sort and paginate with a cursor.

::: tip Divergent shape
JS carries `PaginatedResult.nextCursor` forward via `uniqueStartKey` on the same `query()`. Swift pagination lives on `.dynamic.queryPaged` (the typed `query()` has no cursor); pass the ordered `sortOrder` and feed `nextCursor` back as `cursor:` ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

::: code-group
<<< ./snippets/model-surface/paginate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/paginate.swift#example{swift} [Swift]
:::

## count(filter?)

Count records matching a filter (or all of them when omitted).

::: tip Divergent shape
Swift `count` lives on `.dynamic`.
:::

::: code-group
<<< ./snippets/model-surface/count.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/count.swift#example{swift} [Swift]
:::

## aggregate(options)

Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.

::: warning Swift parity gap
Swift `aggregate` lives on `.dynamic` and returns untyped `[[String: Any]]` rows (vs JS's typed result). Its `groupBy` is `[String]` only, so two JS grouping shapes have no Swift form: StringSet-membership grouping (`{ field, contains }`) and the single-facet map (sweep D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

::: code-group
<<< ./snippets/model-surface/aggregate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/aggregate.swift#example{swift} [Swift]
:::

## subscribe(callback)

Subscribe to model changes (local edits and synced remote edits). Returns an unsubscribe function — always call it.

::: tip Divergent shape
JS exposes `Task.subscribe`; in Swift it lives on `.dynamic.subscribe`.
:::

::: code-group
<<< ./snippets/model-surface/subscribe.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/subscribe.swift#example{swift} [Swift]
:::

## upsert (save with upsertOn)

Insert-or-merge by a natural unique key, without knowing the existing record's id. The field must have a single-field unique constraint.

::: tip Divergent shape
JS expresses this as `save({ upsertOn: "email" })` on the typed instance. Swift has no `save`-with-`upsertOn` on the facade — call `.dynamic.upsert(_:on:)`, which takes a `[String: PrimitiveValue]` dict ([#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947)).
:::

::: code-group
<<< ./snippets/model-surface/upsert.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/upsert.swift#example{swift} [Swift]
:::

## update

Update a record: load it, change fields, persist.

::: tip Divergent shape
JS mutates the loaded instance and calls `save()`. Swift applies a partial `[String: Any]` dict via `TypedModel.update(_:_:)` — unknown keys are dropped, and write failures are logged rather than thrown.
:::

::: code-group
<<< ./snippets/model-surface/update.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/update.swift#example{swift} [Swift]
:::

## delete()

Delete a record by id.

::: tip Divergent shape
JS loads the record and calls `delete()` on the instance; Swift deletes by id directly via `TypedModel.delete(_:)`.
:::

::: code-group
<<< ./snippets/model-surface/delete.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/delete.swift#example{swift} [Swift]
:::
