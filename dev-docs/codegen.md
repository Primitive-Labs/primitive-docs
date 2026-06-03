# codegen — models from TOML

Both clients generate typed model code from a single TOML schema at build time, so the TOML is the source of truth shared across JavaScript and Swift. The shapes of the generated output differ — and so do a handful of the conventions — but the authoring format is the same file.

This page documents the TOML-schema → model codegen pipeline and the JS↔Swift divergences. It is mostly TOML and prose; the one compile-verified snippet shows *using* a generated model in each language.

## Authoring models

Models are declared in TOML. Each `[models.<key>]` table defines a model; each `[models.<key>.fields.<name>]` sub-table a field with a `type` and optional keys (`indexed`, `unique`, `required`, `auto_assign`, `default`, `max_length`, `max_count`, `enum`, `auto_stamp`). An explicit `class_name` overrides the derived type name.

::: warning Filename divergence
The two clients read the schema from **different filenames**: the JS codegen (`js-bao-codegen-v2`) reads `models.toml`; the Swift codegen (`swift-bao-codegen` / `JsBaoCodegenPlugin`) globs `*schema.toml`. A single shared file can't satisfy both without duplication or a symlink. Tracked in [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) (still open).
:::

The example corpus on this site is written against one shared fixture. Every model sets `class_name` explicitly so both codegens emit identical type names (see [D3](#d3-name-derivation) for why that matters):

<<< ../examples/_harness/schema.toml{toml}

## What gets generated

The same TOML produces structurally different output in each language:

| | JavaScript (`js-bao-codegen-v2`) | Swift (`swift-bao-codegen`) |
|---|---|---|
| Generated type | a `class` extending `BaseModelImpl` (nearly empty body) | a `struct` conforming to `PrimitiveModel` |
| CRUD path | inherited from the base class — `new Task({...})`, `task.save()`, `Task.find(...)` | through a `TypedModel<Task>(doc:)` wrapper that holds the doc handle |
| Generated body | empty (`class Task extends BaseModelImpl {}`) | full struct: stored properties + designated `init`, `init?(record:)`, `init?(row:)`, `primitiveValues()`, and a `primitiveSchema` literal |
| Registration | a self-registering `index.ts` barrel — importing it registers every model | none — a struct is available as soon as it conforms to `PrimitiveModel` |
| How it runs | `npx js-bao-codegen-v2` (CLI) | the `JsBaoCodegenPlugin` SPM build plugin, run automatically during `swift build` |

The struct-vs-class shape is intentional and documented at length (Swift structs can't inherit and protocols can't carry stored state, so each record needs real stored properties plus the four bridge methods). For the full rationale — and why CRUD goes through `TypedModel<T>` rather than statics on the type — see [`swift-client/docs/codegen.md`](https://github.com/Primitive-Labs/js-bao-wss/blob/main/swift-client/docs/codegen.md) in the js-bao-wss repo.

## Using a generated model

This is the one compile-verified snippet on the page. It constructs a `Task` (from the fixture above) in each language. Note how the JS side instantiates the class directly and the Swift side constructs the struct and hands it to a `TypedModel<Task>` wrapper:

::: code-group
<<< ./snippets/codegen/use-generated-model.ts#example{ts} [JavaScript]
<<< ./snippets/codegen/use-generated-model.swift#example{swift} [Swift]
:::

## JS↔Swift codegen divergences

From the [codegen-conventions parity sweep](https://github.com/Primitive-Labs/js-bao-wss/blob/main/swift-client/docs/parity/sweep/codegen-conventions.md). The same TOML does not codegen identically across the two clients; the gaps below are the ones that affect portability or behavior.

| ID | Divergence | Class · severity | Issue |
|---|---|---|---|
| D1 | Swift drops the `enum` field key (see below) | missing-in-swift · P1 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+enum) |
| D2 | Swift ignores `auto_stamp` | missing-in-swift · P2 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+auto_stamp) |
| D3 | Name derivation differs | naming · P1 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+name) |
| D4 | Swift codegen has no `--check` / strict mode | param/options · P2 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+check) |
| D5 | Swift emits no relationship accessor methods | missing-in-swift · P1 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+relationship) |
| D6 | JS has a self-registering barrel; Swift has no registration step | behavioral · P2 | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+registration) |

### D1 — `enum` field key {#d1-enum}

::: warning D1 · `enum` is JS-only — strict Swift load throws
A `string` field with `enum = ["a","b","c"]` is part of the JS TOML vocabulary: `js-bao-codegen-v2` validates it and emits a TS string-literal union (`status: "Active" | "Archived"`). Swift codegen has no `enum` concept — the key is silently ignored and the property generates as a plain `String?`. Worse, the Swift **runtime** loader does not list `enum` in its known field keys, so the *same* TOML that codegens cleanly in JS **throws `unknownKey`** when loaded in Swift under strict mode (the default). A portability break, not just an ergonomic gap.
:::

### D2 — `auto_stamp` {#d2-auto-stamp}

::: warning D2 · Swift codegen ignores `auto_stamp`
`auto_stamp` (auto-populate a timestamp on create/update/both) is a first-class JS field key — validated and round-tripped by the TOML writer. The Swift build-time codegen has no `autoStamp` in its IR and drops it. The Swift runtime loader *accepts* the key but never reads it into the field descriptor, so the stamp behavior silently no-ops on the Swift side either way. Workaround: stamp manually.
:::

### D3 — name derivation {#d3-name-derivation}

::: warning D3 · The two codegens derive different class names
From the *same* TOML, the codegens derive **different** type names unless every model carries an explicit `class_name`. JS singularizes to PascalCase (`[models.tasks]` → `Task`); Swift PascalCases without singularizing and appends a `Record` suffix (`[models.tasks]` → `TasksRecord`). A non-pluralizable name like `everything` **hard-fails JS codegen** (no plural rule) while Swift happily emits `EverythingRecord`. This is why the fixture above sets `class_name` on every model — it forces cross-client identity.
:::

### D4 — no `--check` / strict mode {#d4-check-strict}

::: tip D4 · Swift codegen has no `--check` and no strict unknown-key mode
`js-bao-codegen-v2` ships two CI-relevant behaviors the Swift tool lacks: a `--check` mode that exits non-zero if generated output is stale (a "did you regenerate?" gate), and strict unknown-key rejection (default-on, with a `--no-strict` escape hatch). Swift codegen has neither — a typo'd field key (`requird = true`) is silently dropped at build time and only surfaces, if at all, when the runtime loader sees it.
:::

### D5 — no relationship accessors {#d5-relationships}

::: warning D5 · Swift codegen emits no relationship accessor methods
The JS codegen bakes typed relationship accessors into the generated model: `author(): Promise<User | null>` for `refersTo`, `posts(options?): Promise<PaginatedResult<Post>>` for `hasMany`, plus `addTag()`/`removeTag()` for `hasManyThrough`. The Swift codegen emits relationships **only** as data inside the `primitiveSchema` literal — zero accessor methods on the struct or its statics facade. So `await post.author()` / `await user.posts()` in JS has no generated equivalent in Swift; the app must drop to the runtime relationship-resolution layer manually.
:::

### D6 — registration model {#d6-registration}

::: tip D6 · JS emits a self-registering barrel; Swift has no registration step
JS emits an `index.ts` barrel whose import has the side effect of registering every model (`attachAndRegisterModel`) and which fail-loud-checks that the TOML model set and the generated class set match. Swift emits independent per-model files and relies on each struct's `PrimitiveModel` conformance at the use site — there's no generated registration entrypoint and no generated TOML-vs-emitted consistency check. The practical difference: importing the JS barrel guarantees registration ran once and that codegen is in sync with the TOML; Swift's "did codegen run / is it in sync?" guarantees are weaker.
:::
