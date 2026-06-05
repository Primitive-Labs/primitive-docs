# model-surface — typed model API

The typed model surface (`Task.save()`, `Task.query()`, …) — record CRUD, queries, aggregation, and change subscriptions on a generated model class. Records are imported from your generated models, not reached through `client.<x>`.

::: tip Why the JS and Swift model APIs look a little different
Both clients give you **one model per type** with the same verbs — `save`, `find`,
`findAll`, `query`, `count`, `aggregate`, `subscribe`, `delete` — and **both run
those queries through an embedded SQLite engine** under the hood. They differ in
two small ways, neither of which is a capability gap:

- **Async vs synchronous reads.** JavaScript's SQLite runs as WebAssembly (sql.js,
  persisted via IndexedDB) and is reached through an async interface, so every read
  is `await`ed and returns a `Promise`. Swift mirrors the same records into a
  *native, in-memory* SQLite database (kept in sync with the document) and reads it
  **synchronously** — no `await`. Same SQL underneath; one platform's binding is
  async, the other's is instant. Making Swift `async` would just add ceremony for
  no benefit, so it stays synchronous.
- **Where the document target lives.** JS keeps a hidden "active document" that
  writes default to; Swift makes you name the document explicitly with `save(in:)`.

That's it for style. There is **one** spot where Swift is genuinely *behind* on
capability — `aggregate` returns untyped rows and can't group by string-set
membership ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)) — and
it's flagged in red below. Cursor pagination, despite older notes, **is** supported
in Swift (via `queryPaged`).

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
Same lookup on both clients. JS `Task.find` is `async` — you `await` it — because its
SQLite store (WebAssembly, IndexedDB-backed) is reached asynchronously. Swift
`Task.find(_:)` reads its native in-memory SQLite mirror synchronously, so there's
nothing to wait for (no `await`/`throws`). One Swift caveat: if a stored row no longer
matches your model's shape, Swift returns `nil`, so a decode miss looks the same as
"not found" (sweep model D-find).
:::

::: code-group
<<< ./snippets/model-surface/find.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/find.swift#example{swift} [Swift]
:::

## findAll()

Load every record of this model (no filter, no pagination).

::: tip JS awaits, Swift doesn't
Same reason as `find`: JS `Task.findAll()` is `async` (its SQLite store is reached
asynchronously); Swift `Task.findAll()` reads its in-memory SQLite mirror
synchronously. Swift silently drops rows that have drifted from the typed shape, so
the returned count can be smaller than what's actually stored (sweep model D-findAll).
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

::: tip Two methods vs one
JS folds pagination into a single `query` that **always** returns a
`PaginatedResult<Task>` — rows on `.data`, plus `.nextCursor` / `.hasMore`. Swift
splits that into two methods: `Task.query(...)` returns the rows as a plain `[Task]`
(no wrapper) when you just want results, and `Task.queryPaged(...)` returns the
cursor page (`.data` / `.nextCursor` / `.hasMore`) when you want to page — see
[paginate](#query-paginate) below. Same capability, just two entry points.
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

::: tip Same cursor paging, different method name
Both clients page with an opaque cursor. JS reuses `query` and carries
`PaginatedResult.nextCursor` forward via `uniqueStartKey` on the next call. Swift
uses the dedicated `Task.queryPaged(...)`, which returns `.nextCursor` /
`.prevCursor` / `.hasMore`; you carry `nextCursor` forward via `options.cursor`. Full
parity — the only difference is which method you call.
:::

::: code-group
<<< ./snippets/model-surface/paginate.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/paginate.swift#example{swift} [Swift]
:::

## count(filter?)

Count records matching a filter (or all of them when omitted).

::: tip JS awaits, Swift doesn't
Same reason as `find`: JS `Task.count` is `async` (its SQLite store is reached
asynchronously); Swift `Task.count` is a synchronous static returning an `Int`,
counting across every open document.
:::

::: code-group
<<< ./snippets/model-surface/count.ts#example{ts} [JavaScript]
<<< ./snippets/model-surface/count.swift#example{swift} [Swift]
:::

## aggregate(options)

Group-by aggregation with count/avg/sum, an optional filter, sort, and limit.

::: danger Swift's group-by is more limited
This is the **one real capability gap** on the model surface. Both clients run the
aggregation as SQL `GROUP BY`, but the JS model facade returns a fully-typed result
and lets you group by string-set *membership*; Swift's model facade returns untyped
`[[String: Any]]` rows and its `groupBy` is plain field names only (`[String]`). So
two JS grouping shapes have no Swift form on the facade yet — membership-in-a-string-set
(`{ field, contains }`) and the single-facet map (sweep D2, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). (The lower-level `client.db` aggregate path does
expose string-set grouping via `DoDbGroupBy`; it's only the typed model facade that's
behind.)
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
