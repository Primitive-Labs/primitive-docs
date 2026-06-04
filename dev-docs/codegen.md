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
| CRUD path | inherited from the base class — `new Task({...})`, `task.save()`, `Task.find(...)` | a static `Task.*` facade for reads (`Task.query` / `Task.find` / …) plus instance `save(in:)` / `delete(in:)` for writes |
| Generated body | empty (`class Task extends BaseModelImpl {}`) | full struct: stored properties + designated `init`, `init?(record:)`, `init?(row:)`, `primitiveValues()`, and a `primitiveSchema` literal |
| Registration | a self-registering `index.ts` barrel — importing it registers every model | a `GeneratedModels.swift` barrel exposing `GeneratedModels.all` + `register(on:)` (Swift has no import-time side effects, so registration is one explicit call) |
| How it runs | `npx js-bao-codegen-v2` (CLI) | the `JsBaoCodegenPlugin` SPM build plugin, run automatically during `swift build` |

The struct-vs-class shape is intentional and documented at length (Swift structs can't inherit and protocols can't carry stored state, so each record needs real stored properties plus the four bridge methods). The CRUD surface is the static `Model.*` facade the codegen bakes onto each struct ([#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918)) — reads span every open document, writes target one via `save(in:)` / `delete(in:)` — so app code mirrors the JS client's one-model design without a per-document wrapper. For the full rationale see [`swift-client/docs/codegen.md`](https://github.com/Primitive-Labs/js-bao-wss/blob/main/swift-client/docs/codegen.md) in the js-bao-wss repo.

## Using a generated model

This is the one compile-verified snippet on the page. It constructs a `Task` (from the fixture above) and persists it in each language. Note how the JS side instantiates the class and calls `task.save()`, while the Swift side constructs the struct and calls the instance `save(in:)` against a named document:

::: code-group
<<< ./snippets/codegen/use-generated-model.ts#example{ts} [JavaScript]
<<< ./snippets/codegen/use-generated-model.swift#example{swift} [Swift]
:::

## JS↔Swift codegen divergences

From the [codegen-conventions parity sweep](https://github.com/Primitive-Labs/js-bao-wss/blob/main/swift-client/docs/parity/sweep/codegen-conventions.md). The same TOML does not codegen identically across the two clients; the gaps below are the ones that affect portability or behavior.

| ID | Divergence | Class · severity | Issue |
|---|---|---|---|
| D1 | ~~Swift drops the `enum` field key~~ — now parsed + emitted (see below) | resolved | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+enum) |
| D2 | ~~Swift ignores `auto_stamp`~~ — now parsed + round-tripped (see below) | resolved | [filed](https://github.com/Primitive-Labs/js-bao-wss/issues?q=codegen+auto_stamp) |
| D3 | Default name derivation differs (JS singularizes; Swift suffixes). `class_name` override now works on both | naming · P2 | [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) |
| D4 | ~~Swift codegen has no `--check`~~ — `--check` now shipped (see below); strict unknown-key mode still JS-only | partly resolved | [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) |
| D5 | ~~Swift emits no relationship accessors~~ — now emitted as typed static accessors (see below) | resolved | [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) |
| D6 | ~~Swift has no registration step~~ — now emits a `GeneratedModels` barrel (see below) | resolved | [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) |

### D1 — `enum` field key {#d1-enum}

### D2 — `auto_stamp` {#d2-auto-stamp}

### D3 — name derivation {#d3-name-derivation}

::: warning D3 · Default name derivation differs (but `class_name` reconciles it)
With **no** `class_name`, the codegens derive **different** default type names: JS singularizes to PascalCase (`[models.tasks]` → `Task`); Swift PascalCases without singularizing and appends a `--name-suffix` (default `Record`), so `[models.tasks]` → `TasksRecord`. A non-pluralizable name like `everything` **hard-fails JS codegen** (no plural rule) while Swift happily emits `EverythingRecord`.

The language-agnostic `[models.<name>] class_name = "..."` override is parsed by **both** codegens (same TOML key js-bao reads via `tomlLoader.ts`), so setting it forces a single cross-client type name — which is why the fixture above sets `class_name` on every model. Swift validates the value up front: it must be a legal Swift identifier and not a reserved keyword, and the error names the offending TOML model rather than the generated file. The Swift output filename is derived from the resolved class name (`TaskRecord` → `TaskRecord.swift`); the driver fail-loud-rejects two models that would resolve to the same filename (or to the reserved `GeneratedModels.swift` barrel name).
:::

### D4 — `--check` strict mode {#d4-check-strict}

Swift codegen now ships `--check` (#995), mirroring `js-bao-codegen-v2 --check`. It regenerates every file in memory and compares against what's on disk — without writing — then exits non-zero listing any file that is **missing, changed, or a stale leftover**. Drop it into CI as a "did you regenerate?" gate:

```sh
swift-bao-codegen --input schema.toml --output Sources/Generated --check
```

::: tip D4 · Strict unknown-key rejection is still JS-only
`--check` reaches parity, but the other CI behavior — strict unknown-key rejection (`js-bao-codegen-v2` default-on, with a `--no-strict` escape hatch) — has no Swift equivalent yet. A typo'd field key (`requird = true`) is silently dropped at build time rather than failing the codegen.
:::

### D5 — relationship accessors {#d5-relationships}

The Swift codegen now bakes typed relationship accessors into the generated struct (#995), mirroring the JS codegen's `author()` / `posts(...)` methods. Because a Swift struct is a doc-decoupled value type (it can't carry the doc binding the way the JS instance does), the accessors are emitted as **static** methods that take the source `PrimitiveRecord` plus the target `DynamicModel`(s) explicitly:

- `refersTo` → `static func author(of: PrimitiveRecord, in: DynamicModel) throws -> UserRecord?`
- `hasMany` → `static func posts(of: PrimitiveRecord, in: DynamicModel) throws -> [PostRecord]`
- `hasManyThrough` → `static func tags(of: PrimitiveRecord, through: DynamicModel, in: DynamicModel) throws -> [TagRecord]`

Each accessor delegates to the runtime resolvers (`record.refersTo` / `hasMany` / `hasManyThrough`) and maps the result back through the generated `init?(record:)`, so callers get typed records instead of raw `PrimitiveRecord`s. The return type names the target's resolved Swift type via the cross-model name map.

### D6 — registration barrel {#d6-registration}

The Swift codegen now emits a `GeneratedModels.swift` registration barrel (#995) alongside the per-model files, mirroring the JS codegen's `index.ts`. JS has import-time side effects, so its barrel self-registers on import; Swift has none, so the barrel instead exposes an aggregate plus a one-call register:

```swift
// Generated GeneratedModels.swift
enum GeneratedModels {
    static let all: [any PrimitiveModel.Type] = [TaskRecord.self, /* … */]
    static func register(on client: JsBaoClient) {
        client.registerModels(all)
    }
}

// App side — register every generated model in one call:
GeneratedModels.register(on: client)
```

The `all` array preserves TOML declaration order, so the file is byte-stable across runs (and clean under `--check`). The barrel filename `GeneratedModels.swift` is reserved — a model that would resolve to it is rejected with a "disambiguate with `class_name`" error.

::: tip D6 · One residual difference
JS's barrel also fail-loud-checks that the TOML model set and the generated class set match on import. Swift's `--check` covers the "is generated code in sync with the TOML?" guarantee at build/CI time instead, but there's no equivalent *runtime* import-time consistency assertion.
:::
