# Defining Your Models

Models are the typed shape of the data your app stores in **documents** (and the same shape used as `modelName` references in **database** operations). The current way to author models is **TOML-first**: declare them in `src/models/models.toml`, run `pnpm codegen`, and import the generated TypeScript classes from `@/models`.

This page is the canonical reference for the model authoring loop. For document-level CRUD and querying, see [Working with Documents](./working-with-documents.md). For database operations and registered queries, see [Working with Databases](./working-with-databases.md).

## Why TOML + Codegen

Defining models in TOML, with codegen producing the TypeScript classes, gives you:

- **Reviewable diffs** — your data model lives in one config file, versioned alongside your code. A schema change is one diff, not many.
- **Strong typing for free** — the generator emits typed `*Attrs` interfaces, model classes, and traversal methods for declared relationships. You can't typo a field name.
- **Auto-registration** — the generated `src/models/index.ts` barrel registers every model with `js-bao` exactly once at app startup. Nothing to remember to wire up.
- **Sync validation at boot** — the barrel checks that `models.toml` and the generated classes match. If they're out of sync, the app throws at startup and tells you to re-run codegen.

## The Authoring Loop

A typical model change is three small steps:

1. **Edit** `src/models/models.toml` — add a model, add a field, declare a relationship.
2. **Run** `pnpm codegen` — regenerates `*.generated.ts` files and the `src/models/index.ts` barrel.
3. **Import** the model from `@/models` and use it like any other class.

```bash
# After editing src/models/models.toml
pnpm codegen
```

The `codegen` script is wired up in the project template — under the hood it runs `npx js-bao-codegen-v2 -i src/models/models.toml -o src/models`.

::: warning Never edit generated files
The codegen output — every `*.generated.ts` file and `src/models/index.ts` — is overwritten on each run. Make all changes in `models.toml`. If you need custom behavior on top of a generated class, define free functions in `src/lib/` rather than subclassing.
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

**Composite (multi-field) uniqueness** — declare a named constraint under `[models.<name>.options]`.

```toml
[[models.categories.options.unique_constraints]]
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
