# Defining Your Models

Models are the typed shape of the data your app stores in **documents** (and the same shape used as `modelName` references in **database** operations). The current way to author models is **TOML-first** on every platform: declare them in one TOML file, run codegen, and consume the generated types.

| | Web (Vue) | iOS (SwiftUI) |
|---|---|---|
| Schema file | `src/models/models.toml` | `Sources/<App>/Models/schema.toml` |
| Codegen | `pnpm codegen` (run after editing) | Automatic on build (`./run-ios.sh` regenerates first; `swift build` runs the SPM plugin) |
| Output | `*.generated.ts` classes + `@/models` barrel | `PrimitiveModel` structs in `Models/Generated/` |

The TOML dialect is identical on both platforms — the same schema file works for web and iOS clients sharing an app.

This page is the canonical reference for the model authoring loop. For document-level CRUD and querying, see [Working with Documents](./working-with-documents.md). For database operations and registered queries, see [Working with Databases](./working-with-databases.md).

## Why TOML + Codegen

Defining models in TOML, with codegen producing the TypeScript classes, gives you:

- **Reviewable diffs** — your data model lives in one config file, versioned alongside your code. A schema change is one diff, not many.
- **Strong typing for free** — the generator emits typed `*Attrs` interfaces, model classes, and traversal methods for declared relationships. You can't typo a field name.
- **Auto-registration** — the generated `src/models/index.ts` barrel registers every model with `js-bao` exactly once at app startup. Nothing to remember to wire up.
- **Sync validation at boot** — the barrel checks that `models.toml` and the generated classes match. If they're out of sync, the app throws at startup and tells you to re-run codegen.

## The Authoring Loop

A typical model change is three small steps: edit the TOML, regenerate, use the types.

::: code-group

```bash [Web (Vue)]
# 1. Edit src/models/models.toml
# 2. Regenerate:
pnpm codegen
# 3. Import from @/models and use like any other class
```

```bash [iOS (SwiftUI)]
# 1. Edit Sources/<App>/Models/schema.toml
# 2. Regenerate — codegen is wired into both build paths:
./run-ios.sh        # regenerates, then builds + launches (Xcode path)
swift build         # the SPM plugin regenerates automatically
# 3. Consume the generated structs through TypedModel<T>
```

:::

On web, the `codegen` script runs `npx js-bao-codegen-v2 -i src/models/models.toml -o src/models` under the hood. On iOS, `swift-bao-codegen` writes into `Models/Generated/` (gitignored, regenerated every build).

::: warning Never edit generated files
The codegen output — `*.generated.ts` + the `src/models/index.ts` barrel on web, `Models/Generated/*.swift` on iOS — is overwritten on each run. Make all changes in the TOML. For custom behavior on top of a generated type: on web, define free functions in `src/lib/`; on iOS, add a companion extension file *alongside* (not inside) `Models/Generated/`, e.g. `Models/TaskRecord+Extensions.swift` — the codegen sweep only touches files carrying its generated banner, so extensions survive each regen.
:::

::: warning iOS: build through run-ios.sh after schema changes
If you edit `schema.toml` and then hit **Run in Xcode directly**, Xcode compiles whatever stale files are already in `Models/Generated/` with no error pointing at the cause. Build through `./run-ios.sh` (it regenerates first), or run `swift build` once before the Xcode build.
:::

## Authoring `models.toml`

Each model is a top-level `[models.<name>]` block. Fields go under `[models.<name>.fields.<fieldName>]`. Relationships go under `[models.<name>.relationships.<relName>]`.

Field option names use `snake_case` in TOML (the loader maps them to camelCase at runtime).

```toml
[models.todos.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.todos.fields.title]
type = "string"
indexed = true

[models.todos.fields.completed]
type = "boolean"
default = false

[models.todos.fields.priority]
type = "number"
default = 0

[models.todos.fields.due_date]
type = "date"

[models.todos.fields.tags]
type = "stringset"
max_count = 10
```

### Field Types

| Type        | TypeScript    | Description                          | Common Options                  |
| ----------- | ------------- | ------------------------------------ | ------------------------------- |
| `id`        | `string`      | Unique identifier                    | `auto_assign = true`, `indexed` |
| `string`    | `string`      | Text value                           | `indexed`, `default`, `unique`  |
| `number`    | `number`      | Numeric value                        | `indexed`, `default`            |
| `boolean`   | `boolean`     | True/false                           | `default`                       |
| `date`      | `string`      | ISO-8601 timestamp string            | `indexed`                       |
| `stringset` | `StringSet`   | Set-of-strings (tags, categories)    | `max_count`                     |

### Field Options

```toml
[models.tasks.fields.id]
type = "id"
auto_assign = true     # server-assigns a ULID on save
indexed = true         # required for fast lookup by id

[models.tasks.fields.email]
type = "string"
unique = true          # single-field uniqueness — enables upsertOn
indexed = true

[models.tasks.fields.priority]
type = "number"
default = 0

[models.tasks.fields.tags]
type = "stringset"
max_count = 10
```

### Unique Constraints

Two ways to enforce uniqueness:

**Single-field uniqueness** — set `unique = true` on the field. This also enables `upsertOn` for that field on save.

```toml
[models.users.fields.email]
type = "string"
unique = true
indexed = true
```

**Composite (multi-field) uniqueness** — declare a named constraint with `[[models.<name>.unique_constraints]]`.

```toml
[[models.categories.unique_constraints]]
name = "name_parent_unique"
fields = ["name", "parentId"]
```

The constraint `name` is what you pass to `upsertByUnique` / `findByUnique` at runtime.

## Relationships

Declare relationships in TOML and codegen emits typed traversal methods on the generated interfaces.

```toml
# Author hasMany Posts
[models.authors.relationships.posts]
type = "hasMany"
model = "posts"
related_id_field = "authorId"
order_by_field = "createdAt"
order_direction = "DESC"

# Post refersTo Author
[models.posts.relationships.author]
type = "refersTo"
model = "authors"
related_id_field = "authorId"
```

After `pnpm codegen`, the generated interfaces include typed traversal methods:

```typescript
import { Author, Post } from "@/models";

const author = await Author.queryOne({ id: authorId });
const posts = await author.posts();        // PaginatedResult<Post>
const firstPost = posts.data[0];
const backRef = await firstPost.author();  // Author | null
```

| Relationship type | Returns                            | Required options                            |
| ----------------- | ---------------------------------- | ------------------------------------------- |
| `hasMany`         | `Promise<PaginatedResult<T>>`      | `model`, `related_id_field`                 |
| `refersTo`        | `Promise<T \| null>`               | `model`, `related_id_field`                 |
| `refersToMany`    | `Promise<T[]>`                     | `model`, `source_field` (an array of IDs)   |

Optional ordering: `order_by_field` and `order_direction = "ASC" | "DESC"` apply to `hasMany` and `refersToMany`.

## Using Generated Models

Always import from the barrel, never directly from a `*.generated.ts` file:

```typescript
import { Todo, Author, Post } from "@/models";

// Create
const todo = new Todo({ title: "Review PR", priority: 2 });
await todo.save();

// Query
const open = await Todo.query({ completed: false });
```

The barrel runs `attachAndRegisterModel` for every model exactly once — that's why importing from `@/models` is essential. Importing directly from `Todo.generated.ts` skips registration, which fails at runtime with "Model not properly initialized" on the first save or query.

On iOS, codegen emits value-type `PrimitiveModel` structs (`Codable`, `Equatable`, `Hashable`) — set `class_name = "TaskRecord"` on the model block to control the Swift type name. You consume them through a `TypedModel<T>` bound to an open document (see [Working with Documents](./working-with-documents.md#creating-and-opening-documents)). A few Swift conventions worth knowing:

- **IDs are `String`** — generate with `UUID().uuidString` when the caller doesn't supply one.
- **`type = "number"` codegens a `Double`** — cast to `Int` on read if you need to.
- **No nulls** — the CRDT layer doesn't model `nil`. Use `""` / `0` for absent values and check them explicitly.
- **Dates round-trip as ISO-8601 `String`s** — there's no native date type on the wire.
- **Wire keys are forever** — renaming a TOML key orphans existing records on every platform. Keep wire keys snake_case so they round-trip cleanly between web and iOS, and add camelCase aliases in a `+Extensions.swift` companion if the Swift call sites read awkwardly.

## Working with Model Instances

CRUD on model instances (create / read / update / delete, queries, aggregation) is shown side-by-side in JavaScript and Swift in [Working with Documents](./working-with-documents.md#crud-operations).

::: tip JavaScript-specific
The value-handling caveats in this section apply to the **JavaScript** client only. In Swift, generated models are value-type `struct`s (Codable), so spreading/copying works normally and the gotchas below don't arise.
:::

A JavaScript model instance behaves like a normal object when you read and write individual fields:

```typescript
const todo = await Todo.find(id);
console.log(todo.title);   // read
todo.completed = true;     // write
await todo.save();
```

But a JavaScript model instance is **not** a plain object, and this trips people up: you cannot spread or clone it. Under the hood, each field is a getter/setter on the model's prototype rather than a value sitting directly on the instance, so the spread (`...`) and rest operators — which only copy a value's own properties — skip every field and quietly give you back an empty object.

```typescript
const copy = { ...todo };            // ❌ has none of todo's fields
const { id, ...rest } = todo;        // ❌ `rest` is empty
const next = { ...todo, done: true } // ❌ todo's other fields are lost
```

None of these throw — they just hand back partial data, which usually surfaces later as a confusing "missing field" bug. When you genuinely need a plain object — to serialize a record, send it to an integration, or copy it into a new record — read the fields you want explicitly:

```typescript
// Snapshot a record as a plain object
const snapshot = { id: todo.id, title: todo.title, completed: todo.completed };

// Duplicate into a new record — list the fields you want to carry over
const dup = new Todo({ title: todo.title, priority: todo.priority });
await dup.save({ targetDocument: documentId });
```

The reverse direction is fine: constructors, `save()`, and `query()` filters all take plain objects, so spreading a plain object *into* them works as expected. The pitfall is only when the model instance is the thing being spread.

## Iterating on the Schema

You're free to evolve the schema as the app grows. A few rules of thumb:

- **Add new fields freely** — js-bao stores documents as Yjs CRDTs, so adding an optional field is a no-op for existing records.
- **Adding `default` doesn't backfill** — existing records keep their absent values; `default` only applies to records created after the change. Read sites should treat the field as optional.
- **Don't remove fields** — the underlying Yjs data is still there. Mark unused fields with a TOML comment instead, and stop reading them.
- **Renaming a field is a breaking change** — pick a new field with a new name, write to both during a migration window, then stop writing the old one. Add `default` only for the new field.
- **Adding a `unique = true` constraint to an existing field** can fail at save time if existing records collide. Inspect the data before tightening uniqueness.

The `index.ts` barrel will throw at startup if `models.toml` and the generated classes drift apart. If you see that error, run `pnpm codegen` and commit the regenerated files.

## Migrating an Existing Project

If you have an older project that defines models with `defineModelSchema()` directly in TypeScript, the codegen CLI ships with a migration tool:

```bash
npx js-bao-codegen-v2 migrate
```

This scans your existing model files, generates `src/models/models.toml`, and produces a migration report classifying each model as `safe-to-delete` (fully captured in TOML) or `needs-manual-migration` (custom methods, function-valued defaults, etc. — these need manual review). After running migrate, run `pnpm codegen` and delete the original hand-authored files marked safe.

## Models in Database Operations

Database operations reference models by name in their `modelName` field. The same model names you declare in `models.toml` for documents are the canonical names used in database TOML configs:

```toml
# In src/models/models.toml — declared once
[models.todos.fields.id]
type = "id"
auto_assign = true

# In .primitive/sync/<env>/<appId>/database-types/personal.toml
[[operations]]
name = "list-todos"
type = "query"
modelName = "todos"        # references the same model
access = "params.userId == user.userId"
definition = '{"filter":{"userId":"$params.userId"}}'
params = '{"userId":{"type":"string","required":true}}'
```

Databases themselves are still schemaless on the server — they accept any JSON for a given `modelName`. Sharing the same TOML-defined types means the client gets typed reads/writes for both storage systems without two sources of truth.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — CRUD, query, sharing, and sync for the data shapes defined here
- **[Working with Databases](./working-with-databases.md)** — server-side operations that reference these models
- **[Choosing Your Data Model](./choosing-your-data-model.md)** — when to put data in documents vs. databases
