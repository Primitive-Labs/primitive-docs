# Building Primitive apps in Swift (iOS / macOS)

This guide is for agents writing Swift code against the Primitive platform. The Swift stack is `PrimitiveApp` (the high-level SwiftUI integration) sitting on top of `JsBaoClient` (the Swift port of `js-bao-wss-client`). The conceptual model is identical to the JS path — documents, databases, blobs, workflows, events, auth — so this guide focuses on **Swift-specific deltas** and cross-references the conceptual JS guides for everything else.

## Companion guides

When writing Swift code, fetch the conceptual JS guide for the feature you're working with *and* this one — the Swift API names and lifecycles differ, but the platform behavior (sync semantics, permission resolution, workflow apply lifecycle, blob caching, etc.) is the same.

- [Documents](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — conceptual model, sharing, sync semantics
- [Data Modeling](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md) — documents vs. databases decision framework
- [Workflows](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) — apply lifecycle, runKeys, leases
- [Blobs](AGENT_GUIDE_TO_PRIMITIVE_BLOBS.md) — document-scoped vs. bucket-scoped storage
- [Authentication](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md) — OAuth, Magic Link, OTP, Passkeys
- [Databases](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md), [Prompts](AGENT_GUIDE_TO_PRIMITIVE_PROMPTS.md), [Integrations](AGENT_GUIDE_TO_PRIMITIVE_INTEGRATIONS.md), [Analytics](AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.md), [Sharing](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md), [Users & Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md)

## Critical Rules

1. **Define models in `schema.toml` and use codegen. NEVER hand-roll `BaoModelRecord` structs.** The legacy `BaoModel<T>` / `BaoModelRecord` path still compiles but is deprecated. New code uses `swift-bao-codegen` to emit `PrimitiveModel` structs from a TOML schema, then consumes them through `TypedModel<T>`. Drift between schema and Swift is impossible when codegen is the source of truth.

2. **Wire codegen on both build paths.** `swift build` runs `JsBaoCodegenPlugin` automatically; the Xcode/iOS path does NOT. Invoke `swift run swift-bao-codegen` inline in `run-ios.sh` before `xcodegen generate`, write to a gitignored `Models/Generated/` (regenerated on every build, never committed), and add `exclude: ["Models/Generated"]` to the SPM target so the two producers don't collide. See [§4](#data-modeling-schematoml--codegen--typedmodelt).

3. **Wire `TypedModel<T>` instances through `appState.makeTypedModel(doc:documentId:)`.** Constructing `TypedModel<T>(doc:)` directly works but skips registration with the in-app debug inspector. Use `makeTypedModel` so the model shows up in the Debug Inspector tab.

4. **Wire field names are forever.** TOML keys are wire field names. Once data is on disk, renaming a key orphans every existing record (both Swift and JS clients reading the same doc). Style is your call: **snake_case is the cross-client convention** (web/Node + Swift speaking the same Primitive doc); **camelCase is fine for Swift-only docs**. The codegen tool preserves whatever you write — `text` stays `text`, `created_at` stays `created_at`, `createdAt` stays `createdAt`. If you went snake_case for cross-client reasons and the call sites read awkwardly, add camelCase aliases in a hand-written `+Extensions.swift` companion — but the underlying stored property keeps the wire key.

5. **No nulls in CRDT-backed fields.** The CRDT layer does not model `nil`. Use `""` for absent strings, `0` for absent numbers, sentinel timestamps for "never". Check those values explicitly.

6. **Numbers round-trip as `Double`.** Codegen emits `type = "number"` fields as `Double`. Cast to `Int` when reading, wrap in `Double(...)` when writing.

7. **IDs are `String`.** Use `UUID().uuidString` (or a ULID helper) when not supplied. The codegen-emitted `init?(record:)` reads `id` straight off the record.

8. **Store `EventSubscription` on a property; always `[weak self]` the closure.** `client.events.on(...)` returns a subscription that's dropped (and the handler unregistered) if the return value isn't retained. Holding the subscription strongly on `self` while the closure also captures `self` strongly creates a retain cycle. Call `.cancel()` on teardown.

9. **Register workflow `define(...)` handlers BEFORE calling `workflows.start(...)`.** If the server completes before the handler is registered, the apply event delivers to another connected client (or queues). Always define first, then start.

10. **Use `[weak self]` + a `runKey`-match guard inside workflow handlers.** Stale completions from a prior app session can otherwise resolve a fresh continuation.

11. **Bind `TypedModel<T>` inside `onDocumentOpened(doc:documentId:)` — don't re-open the doc just to get a YDocument.** The base class's `selectDocumentAwaiting(_:)` opens the doc, sets up sync routing, and hands you the live `YDocument` through the `onDocumentOpened(doc:documentId:)` override. Calling `client.openDocument(...)` a second time to fetch a YDocument is wasteful and races with the base class's bookkeeping.

12. **Set `DEVELOPMENT_TEAM` in `project.yml` (NOT in Xcode UI) and regenerate the xcodeproj.** The xcodeproj is xcodegen output — any UI edits are wiped on the next `xcodegen generate`. The team ID is the only setting that has to exist for device, TestFlight, and App Store builds; simulator builds run unsigned.

13. **Use the `JsBaoClient` and `PrimitiveAppState` instances from `appState` — do NOT construct them yourself.** `PrimitiveAppState.initialize()` owns the client lifecycle, reads `primitive.json`, attaches the auth manager, and (in dev) auto-signs in via the CLI token. Manual instantiation breaks the dev-mode auth bypass and the inspector registration.

14. **Treat `[String: Any]` API responses as untyped at the boundary.** `documents.create`, `documents.aliases.resolve`, `blobs.upload`, etc. return `[String: Any]`. Cast at the call site (`result["documentId"] as? String`) and validate immediately — there's no compile-time response shape.

15. **Prefer the high-level helper over the low-level dance.** Every section below has a *"Pick the right helper"* card listing the in-tree idiomatic choice for each shape. Reach for those first; only fall through to lower-level APIs when the high-level one doesn't fit. The lower-level APIs exist for completeness and edge cases — they're not the default path.

## Helper Preference Order

The single most common way to write wrong-but-compiling Swift against Primitive is to reach for a JS-flavored REST + state-class pattern when there's a higher-level Swift helper that's right there. The table below is the cheat sheet — read each row as *"If you're about to do X, do Y instead."*

| Don't do this | Do this instead | Why |
|---|---|---|
| `aliases.resolve` + `createWithAlias` two-step | `documents.getOrCreateWithAlias(alias:title:)` | Single atomic upsert. The two-step has a TOCTOU window where two clients onboarding simultaneously both fall into the `createWithAlias` branch and lose one of the docs. |
| `client.openDocument(...)` in a subclass to get a YDocument for a `TypedModel` | Override `onDocumentOpened(doc:documentId:)` and bind there | The base class already opens the doc once via `selectDocumentAwaiting` and hands you the `YDocument`. Re-opening duplicates the work and races with `selectedDocId` routing. |
| `@Published var items: [T]` + manual `refresh()` after every mutation | `BaoDataLoader<[T]>` bound with `.onModelChange(typedModel)` | The loader owns the subscription lifecycle, debounces reloads, and re-fetches on local **and** remote writes via one trigger. The `@Published` + refresh pattern silently drifts whenever you add a mutation site and forget to call `refresh()`. |
| Combine sink on `appState.$isConnected` to run post-connect setup | `override func connectClient() async { await super.connectClient(); … }` | `connectClient()` is `open` — override it and call super. The Combine sink is the workaround you reach for when you forget that. |
| `createDocument` then `openDocument` then start writing | `createDocument(options:)` returns `(documentId, doc: YDocument?)` — start writing on the returned doc | Local-first: the returned YDocument is writable immediately, the server commit happens in the background. Re-opening with `.network` blocks ~15s on a freshly-created empty doc waiting for a sync event that never has anything to deliver. |
| `documents.list()` + filter by tag for a per-user singleton | `documents.getOrCreateWithAlias(...)` keyed by `scope: "user"` | Aliases were built for singletons; tag-filtering is fragile (the doc may not have the tag you assume, or may be filtered out for permission reasons). |
| `me.ownedDocuments(tag:)` + `me.sharedDocuments(tag:)` + manual merge for "every doc I can read" | `me.accessibleDocuments(tag:)` | One call, dedupes by `documentId`, attaches an `_origin: "owned"|"shared"` key so reconcile passes can keep the distinction. |
| `selectDocumentAwaiting(_:)` for a per-item detail view in a multi-doc app | `appState.openAuxiliaryDoc(_:modelType:)` from `.task`, `appState.closeAuxiliaryDoc(_:)` from `.onDisappear` | `selectDocumentAwaiting` closes the previously-selected doc, so using it for a per-item detail view closes your library/index doc. Use the auxiliary helpers when there's an ambient doc + N transient docs. |
| Subscribe to `.documentMetadataChanged` and filter on `action == "deleted"` in detail views | Subscribe to `.documentDeleted` directly | Derived event with the same trigger but no payload-filter boilerplate. |
| Raw `documents.updatePermissions(documentId:params:[String: Any])` for the common email-share | `documents.invite(documentId:email:permission:)` | Typed shape, doesn't require knowing the key vocabulary. Returns the same dict so the response shape stays uniform. |
| Raw `collections.addMember(collectionId:params:)` for the common email-invite | `collections.invite(collectionId:email:permission:)` | Same reason. |
| Hand-rolled "list pending → find by email → revoke" for cancelling a collection invite | `collections.cancelPendingInvitation(collectionId:email:)` | One call, returns `Bool` (`false` = no pending invite matched, e.g. already accepted). |
| `List(loader.data ?? []) { … }` for view-data binding | `switch loader.phase { case .loading: …; .empty: …; .loaded(let d): … }` | `?? []` collapses "not yet loaded" with "loaded, no items" — empty-state placeholders flash for ~50ms on every appearance. `LoaderPhase` makes the bug unreachable. |

When in doubt: `primitive guides get swift-client` (or read this guide) and search for the shape you want. Every section has a *"Pick the right helper"* card at the top.

## Core Concepts: PrimitiveApp + JsBaoClient

The Swift stack has two layers:

| Layer | Purpose | Where it lives |
|---|---|---|
| `PrimitiveApp` | SwiftUI integration — owns the client lifecycle, ships built-in views (`AuthGateView`, `PrimitiveProfileView`, `ConnectionStatusView`), provides `PrimitiveAppState` as the `@StateObject` your app holds | `swift-primitive-app` package |
| `JsBaoClient` | The low-level SDK — sub-APIs (`.documents`, `.blobs`, `.workflows`, `.collections`, `.events`, `.me`, `.groups`), event emitter, auth primitives. Direct port of `js-bao-wss-client` | `swift-client` package (re-exported by `PrimitiveApp`) |

You almost never construct `JsBaoClient` directly. `PrimitiveAppState` owns it as `public private(set) var client: JsBaoClient?` and exposes the lifecycle through `appState.client`.

```swift
import SwiftUI
import PrimitiveApp

@main
struct MyAppApp: App {
    @StateObject private var appState = PrimitiveAppState()

    var body: some Scene {
        WindowGroup("My App") {
            ContentView()
                .environmentObject(appState)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var appState: PrimitiveAppState

    var body: some View {
        AuthGateView(appName: "My App", authManager: appState.authManager) {
            // Signed-in UI
            MainTabView()
        }
        .task { await appState.initialize() }
    }
}
```

`appState.initialize()` reads `primitive.json` (bundled as a resource — contains `appId` and `serverUrl`), creates the `JsBaoClient`, attaches the auth manager. In dev mode it auto-signs in using the CLI token from `~/.primitive/credentials.json` so the login UI never appears on rebuilds.

## Scaffolding a New App

```bash
primitive init my-app --platform apple
```

This:

1. Downloads the Apple SwiftUI template.
2. Prompts for an app name and creates it on the Primitive server (or `--use-existing-app-id 01HX...`).
3. Writes `primitive.json` (`appId` + `serverUrl`) at the project root.
4. Resolves SPM packages.

Template layout:

```
my-app/
├── Package.swift                 # SwiftPM manifest, pulls in PrimitiveApp
├── project.yml                   # xcodegen source of truth — edit this, regenerate the xcodeproj
├── primitive.json                # appId + server URL — read at runtime
├── MyApp.xcodeproj/              # Generated by xcodegen
├── MyApp.entitlements
├── Info-Partial.plist            # Merged into auto-generated Info.plist (Bonjour, etc.)
├── Assets.xcassets
├── Sources/
│   └── MyApp/
│       ├── MyAppApp.swift        # @main entry, owns PrimitiveAppState
│       └── Views/
│           └── ContentView.swift # AuthGate → TabView
├── run.sh                        # Build + launch macOS app bundle
├── run-ios.sh                    # Build + launch on iOS simulator or device
├── build.sh                      # Generic xcodebuild wrapper
└── archive.sh                    # Archive + export for TestFlight / App Store
```

**The fresh scaffold does NOT include codegen wiring or a `schema.toml` — you add those in [§4](#data-modeling-schematoml--codegen--typedmodelt) before defining models.**

### Required tools

- Xcode 15+ (iOS 17 / macOS 14 minimum deployment).
- `brew install xcodegen` — `run-ios.sh` calls `xcodegen generate` on every run so new source files get picked up.
- Apple Developer account ($99/year) for physical devices, TestFlight, App Store. Simulator + macOS dev builds work unsigned.

### Run paths

| Target | Command | Notes |
|---|---|---|
| iOS Simulator | `./run-ios.sh` | Auto-boots latest iPhone simulator if none running. Logs stream filtered to app + PrimitiveApp library. Pass `--verbose` for raw stream. |
| Physical iPhone/iPad | `./run-ios.sh --device` | Requires paired device (`xcrun devicectl list devices`) + `DEVELOPMENT_TEAM` set in `project.yml`. Uses `-allowProvisioningUpdates`. |
| macOS | `./run.sh` | Builds a real `.app` bundle and `open`s it. Logs go to Console.app, not the terminal. |

### Signing setup (device / TestFlight / App Store)

1. Get Team ID from [developer.apple.com/account](https://developer.apple.com/account) → Membership Details.
2. Edit `project.yml`:
   ```yaml
   settings:
     base:
       DEVELOPMENT_TEAM: "2J4V27W63D"
       CODE_SIGN_STYLE: Automatic
   ```
3. `xcodegen generate`.

DO NOT edit the xcodeproj's signing settings in the Xcode UI — they're overwritten on the next `xcodegen generate`.

## App Lifecycle: PrimitiveAppState + AuthGateView

`PrimitiveAppState` is the `@StateObject` your app holds. Subclass it when you need app-specific state (document caches, `TypedModel` registry, etc.). The canonical shape:

```swift
@MainActor
final class MyAppState: PrimitiveAppState {
    @Published private(set) var todos: TypedModel<TodoItem>?

    // 1. Extend the connect flow. Call super first so the base class
    //    connects and fetches /me + document list; then run your
    //    app-specific setup. `connectClient` is `open` for this.
    override func connectClient() async {
        await super.connectClient()
        await openLibraryDoc()
    }

    // 2. Resolve-or-create the user's singleton doc with the
    //    race-free atomic alias upsert. Don't split this into
    //    `aliases.resolve` + `createWithAlias` — see the Helper
    //    Preference Order table above.
    private func openLibraryDoc() async {
        guard let client else { return }
        do {
            let result = try await client.documents.getOrCreateWithAlias(
                alias: ["scope": "user", "aliasKey": "library"],
                title: "Library"
            )
            guard let id = result["documentId"] as? String else { return }

            // 3. selectDocumentAwaiting opens the doc, routes the
            //    base class's sync/remoteUpdate hooks at it, and
            //    fires onDocumentOpened(doc:documentId:) below.
            await selectDocumentAwaiting(id)
        } catch {
            errorMessage = "Failed to open library: \(error.localizedDescription)"
        }
    }

    // 4. Live YDocument arrives here — bind your TypedModels.
    //    `makeTypedModel(doc:documentId:)` also registers the model
    //    with the in-app debug inspector.
    override func onDocumentOpened(doc: YDocument, documentId: String) async {
        todos = makeTypedModel(doc: doc, documentId: documentId)
    }
}
```

That's the whole shape: subclass, override `connectClient` to drive the doc setup, override `onDocumentOpened(doc:documentId:)` to bind models. Views observe `appState.todos` and bind a `BaoDataLoader` against it (see §4f below).

### Multi-doc apps: library + per-item docs

`selectDocumentAwaiting(_:)` is the single-selected-doc lifecycle — it closes the previously selected doc before opening the new one. Right for "one document per user" apps; **wrong** for apps that keep one ambient doc open (e.g. a library/index doc) while opening N other docs alongside it.

For the multi-doc shape, use **`appState.openAuxiliaryDoc(_:modelType:)`** (and `closeAuxiliaryDoc(_:)`). These go through the same `JsBaoClient.openDocument(...)` path — DocumentManager registers the doc for sync, the inspector picks up the `TypedModel` — but they don't touch `selectedDocId` or call `onDocumentOpened`. The caller (typically a SwiftUI detail view) owns the lifecycle:

```swift
struct ItemDetailView: View {
    let documentId: String
    @EnvironmentObject var appState: MyAppState
    @State private var todos: TypedModel<TodoItem>?

    var body: some View {
        Group {
            if let todos { /* render */ }
            else { ProgressView() }
        }
        .task {
            do {
                let (_, model) = try await appState.openAuxiliaryDoc(
                    documentId,
                    modelType: TodoItem.self
                )
                todos = model
            } catch {
                /* surface error */
            }
        }
        .onDisappear {
            Task { await appState.closeAuxiliaryDoc(documentId) }
        }
    }
}
```

The library doc stays the `selectedDocId` (so the debug inspector points there); the auxiliary doc is open in parallel for the duration of the detail view.

`AuthGateView` is the built-in sign-in screen — it wraps your signed-in UI and shows OAuth / Magic Link / OTP / Passkey options until the user authenticates. To customize the UI, build a custom gate around `appState.authManager` directly instead of using `AuthGateView`.

Connection status, current user info, and credential source are all on `appState`:

```swift
@EnvironmentObject var appState: PrimitiveAppState

Text(appState.userName)
Text(appState.connectionStatus).foregroundStyle(appState.statusColor)
```

## Data Modeling: schema.toml + codegen + TypedModel\<T\>

### The pattern

1. Define models in a single `schema.toml`.
2. `swift-bao-codegen` emits a `PrimitiveModel` struct per `[models.X]` block into `Models/Generated/`.
3. Bind a generated record type to an open document with `TypedModel<T>`.
4. CRUD + queries go through the `TypedModel<T>` instance.

### 4a. Schema

`Sources/MyApp/Models/schema.toml`:

```toml
# TOML keys ARE the wire field names — once data is on disk, renaming
# a key orphans every existing record. Keep snake_case if other clients
# (web) read the same docs.

[models.todos]
class_name = "TodoItem"

[models.todos.fields.id]
type = "id"

[models.todos.fields.text]
type = "string"
required = true

[models.todos.fields.completed]
type = "boolean"
required = true

[models.todos.fields.createdAt]
type = "number"
required = true

[models.todos.fields.sortOrder]
type = "number"
required = true
indexed = true
```

Supported `type` values:

| TOML `type` | Swift storage | Notes |
|---|---|---|
| `id`        | `String` (non-optional) | Always emitted as a non-optional `String`; the runtime guarantees the value. Use exactly one `id` field per model. |
| `string`    | `String` / `String?` | |
| `number`    | `Double` / `Double?` | |
| `boolean`   | `Bool` / `Bool?` | |
| `date`      | `String` / `String?` (ISO-8601) | Round-trips as a `String` — the runtime treats it as ISO-8601, but no parsing happens at the storage boundary. For timestamps you'll compare or sort on, prefer `number` (epoch seconds) to skip per-read parsing. |
| `stringset` | `Set<String>` / `Set<String>?` | Insertion-orderless string set; emits the right `.asStringSet` / `.stringset` accessors. |

`required = true` makes the codegen-emitted `init?(record:)` reject construction without that field. `indexed = true` registers a SQLite index for query-path filtering.

### 4b. Dual-path codegen wiring

Two build paths, both need wiring:

- **SwiftPM** (`swift build`, `swift test`, `./run.sh` for macOS) — `JsBaoCodegenPlugin` from `swift-client` runs automatically and feeds output to the compiler.
- **Xcode / iOS** (`./run-ios.sh`, archives, TestFlight) — Xcode compiles from `.pbxproj` directly, SPM plugin never fires. Invoke the codegen tool manually before `xcodegen generate`, write into a gitignored `Models/Generated/` so xcodegen scans it.

Both producers would emit the same files into the same SPM source list, so the SPM target excludes the manual-output directory.

**Update `Package.swift`:**

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [
        .executable(name: "my-app", targets: ["MyApp"]),
    ],
    dependencies: [
        .package(url: "https://github.com/Primitive-Labs/swift-primitive-app.git", branch: "main"),
        // Direct dep on swift-client so JsBaoCodegenPlugin is reachable
        // from this target's plugins: block.
        .package(url: "https://github.com/Primitive-Labs/swift-client.git", branch: "main"),
    ],
    targets: [
        .executableTarget(
            name: "MyApp",
            dependencies: [
                .product(name: "PrimitiveApp", package: "swift-primitive-app"),
            ],
            path: "Sources/MyApp",
            // run-ios.sh writes into Models/Generated/. SPM would also
            // discover that dir — and the plugin emits its own copies
            // into the plugin work dir — giving two producers per file.
            // Exclude here so the plugin stays the single SPM source.
            exclude: ["Models/Generated"],
            plugins: [
                .plugin(name: "JsBaoCodegenPlugin", package: "swift-client"),
            ]
        ),
    ]
)
```

**Add to `run-ios.sh` (near the top, before `xcodegen generate`):**

```bash
# Model codegen (Xcode build path).
# `swift build` runs JsBaoCodegenPlugin automatically. The Xcode app
# target compiles its own source list from .pbxproj directly though, so
# the SPM plugin never fires on this path. Run codegen by hand here,
# writing into a gitignored Generated/ dir xcodegen picks up.
GEN_DIR="Sources/MyApp/Models/Generated"
SCHEMA_TOML="Sources/MyApp/Models/schema.toml"
mkdir -p "$GEN_DIR"
swift run --package-path . swift-bao-codegen \
    --input  "$SCHEMA_TOML" \
    --output "$GEN_DIR"
```

The first `swift run swift-bao-codegen` builds the codegen binary from the swift-client checkout (~30s one-time cost). Subsequent runs are instant. `writeIfChanged` keeps mtimes stable on no-op runs.

`Models/Generated/` is **gitignored** — it's regenerated on every `swift build` / `./run-ios.sh`, so it's never committed (only the directory's `README.md` is tracked). One footgun follows from this: if you edit `schema.toml` and then build by hitting **Run in Xcode directly** (instead of `./run-ios.sh`), Xcode compiles whatever stale or missing files are already in `Generated/` — there's no error pointing at the cause. Either build through `./run-ios.sh` (which regenerates first), or regenerate by hand before the Xcode build:

```bash
swift run --package-path . swift-bao-codegen \
    --input  Sources/MyApp/Models/schema.toml \
    --output Sources/MyApp/Models/Generated
```

### 4c. What codegen emits

For the schema above:

```swift
// Generated by swift-bao-codegen — DO NOT EDIT.
import Foundation
import PrimitiveApp

public struct TodoItem: PrimitiveModel, Equatable, Hashable, Codable {
    public static let modelName = "todos"
    public static let primitiveSchema = PrimitiveSchema(
        name: "todos",
        fields: [
            "id":         FieldDescriptor(type: .id),
            "text":       FieldDescriptor(type: .string, required: true),
            "completed":  FieldDescriptor(type: .boolean, required: true),
            "createdAt":  FieldDescriptor(type: .number, required: true),
            "sortOrder":  FieldDescriptor(type: .number, required: true, indexed: true),
        ]
    )

    public var id: String
    public var text: String
    public var completed: Bool
    public var createdAt: Double
    public var sortOrder: Double

    public init(id: String, text: String, completed: Bool, createdAt: Double, sortOrder: Double) { ... }
    public init?(record: PrimitiveRecord) { ... }
    public init?(row: [String: Any]) { ... }
    public func primitiveValues() -> [String: PrimitiveValue] { ... }
}
```

### 4d. Hand-written companion (`+Extensions.swift`)

Anything codegen can't emit — `Identifiable` conformance, computed helpers, camelCase aliases for snake_case wire keys, convenience inits with defaults — goes alongside (not inside) `Models/Generated/`:

```swift
// Sources/MyApp/Models/TodoItem+Extensions.swift
import Foundation
// No need to import `JsBaoClient` / `PrimitiveApp` here unless the
// companion actually references one of their types — `Identifiable` is
// stdlib and the convenience init only uses `UUID` / `Date`. The
// generated `TodoItem` is in the same module, so it's reachable
// without an import.

extension TodoItem: Identifiable {}

public extension TodoItem {
    init(text: String) {
        self.init(
            id: UUID().uuidString,
            text: text,
            completed: false,
            createdAt: Date().timeIntervalSince1970,
            sortOrder: Date().timeIntervalSince1970
        )
    }
}
```

The codegen sweep only deletes files starting with the `// Generated by swift-bao-codegen` banner. Companions survive every regen.

> **SourceKit footgun, first time only.** Editing your companion file (e.g. `TodoItem+Extensions.swift`) before codegen has run for the first time produces a red `No such module 'PrimitiveApp'` underline in Xcode/VS Code. The real cause is that `TodoItem` doesn't exist yet (codegen hasn't emitted it), but SourceKit's diagnostic blames the import instead. Run `swift build` once (or the codegen step from `run-ios.sh`) and the underline goes away. After the first generation, schema edits don't repeat this — only the very first scaffold.

### 4e. Binding to a document

**The canonical bind site is `onDocumentOpened(doc:documentId:)`** — see the `MyAppState` example in "App Lifecycle" above. The base class hands you the live `YDocument` for free; just bind through `makeTypedModel(...)`:

```swift
override func onDocumentOpened(doc: YDocument, documentId: String) async {
    todos = makeTypedModel(doc: doc, documentId: documentId)
}
```

If you genuinely need to open a doc outside the app-state lifecycle (e.g. a per-item doc opened from a list view), you can call `openDocument` directly — but go through `appState.makeTypedModel(...)` for the bind, not `TypedModel<TodoItem>(doc: doc)`, so the debug inspector picks it up:

```swift
let doc = try await client.openDocument(documentId, options: OpenDocumentOptions(
    waitForLoad: .network,
    enableNetworkSync: true
))
let todos: TypedModel<TodoItem> = appState.makeTypedModel(doc: doc, documentId: documentId)
```

One `TypedModel` per record type per document.

### 4f. Read

**For view-data binding, use `BaoDataLoader<[T]>` with `.onModelChange`, and render through `loader.phase` — this is the canonical view-reactivity pattern**:

```swift
struct TodoListView: View {
    @EnvironmentObject var appState: MyAppState
    @StateObject private var loader = BaoDataLoader<[TodoItem]>()

    var body: some View {
        Group {
            if let todos = appState.todos {
                // `loader.phase` is a trinary that distinguishes
                // "still loading" from "loaded but empty" — avoids the
                // empty-state flash that `List(loader.data ?? [])`
                // produces for ~50ms on first appearance.
                switch loader.phase {
                case .loading:
                    ProgressView()
                case .empty:
                    Text("No todos yet")
                case .loaded(let todos):
                    List(todos) { /* row */ }
                }
            } else {
                ProgressView()
            }
        }
        .task {
            guard let todos = appState.todos else { return }
            loader.bind(
                client: appState.client,
                subscribeTo: [.onModelChange(todos)]
            ) { _ in
                todos.findAll().sorted { $0.sortOrder < $1.sortOrder }
            }
        }
    }
}
```

> **Anti-pattern:** `List(loader.data ?? []) { … }` followed by
> `if loader.data?.isEmpty == true { Text("Empty") }`. The `?? []`
> collapses "not yet loaded" and "loaded, no items" into the same
> branch, so the empty-state placeholder flashes every time the view
> appears. `loader.phase` makes the wrong-by-default state unreachable.

`.onModelChange` fires whenever **any** record on the model is added, updated, or deleted — local writes (synchronous, on the same thread as the mutation) **and** remote writes (from the observer-drain queue). One trigger covers both reactivity sources. The loader debounces (default 50ms) so a burst of writes coalesces into one reload.

**Don't** roll your own `@Published var items` + `refresh()` pattern. It silently drifts whenever you add a new mutation site and forget to call `refresh()`, and it forces every mutation method to know about the cached list. See the Helper Preference Order table.

Under the loader, reads are **synchronous** against the local CRDT — no `async/await` — so the `load` closure is just a synchronous query:

```swift
todos.find("todo_123")                                  // -> TodoItem?
todos.findAll()                                         // -> [TodoItem]
todos.filter { !$0.completed }                           // -> [TodoItem]
todos.query(["completed": false])                       // MongoDB-style predicate
todos.query(
    ["completed": false],
    options: QueryOptions(sort: ["sortOrder": 1], limit: 50)
)
todos.count(["completed": true])
```

The `query` path is SQLite-backed; for small collections `findAll()` + Swift `filter` is fine. Supported operators in the predicate dict: equality, `$gt`/`$gte`/`$lt`/`$lte`, `$containsText`, `$or`/`$and`/`$not`.

### 4g. Write

Writes are **local-first** — applied to the CRDT immediately, sync to server in the background:

```swift
try todos.create(TodoItem(text: "Buy milk"))      // throws on schema-validation failure
todos.update("todo_123", ["completed": true])      // no throw — record already validated
todos.delete("todo_123")                           // no throw
```

`create` is the only CRUD method that throws — it has to validate the new record against the schema (required-field presence, type coercibility, unique-constraint conflicts) before inserting. `update` and `delete` operate on a record that's already on disk, so their inputs are pre-validated; if you mis-spell a field key in an `update` payload, the unknown key is dropped silently rather than thrown.

Wrap `try todos.create(...)` in a `do/catch` and surface the error through your app-state's transient-error channel (a toast, an inline row error) — `errorMessage` / fatal alerts are an awkward fit for per-mutation save failures.

A write is observable to local reads on the next line. Remote peers see it when the WS round-trip completes; a `.sync` event fires when the server acks.

## Documents

API surface mirrors JS — see [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) for conceptual model.

### Pick the right helper

| Shape | Use |
|---|---|
| Per-user singleton doc ("the user's library", "the user's inbox") | `client.documents.getOrCreateWithAlias(alias:title:)` |
| Fresh doc whose contents you'll write immediately (local-first) | `client.createDocument(options:)` — returns `(documentId, doc: YDocument?)` |
| Open an existing doc by id | `client.openDocument(id, options:)` |
| Open by alias string (e.g. from a URL) | `client.openDocumentByAlias(alias)` |
| Get an alias for an already-existing doc | `client.documents.aliases.set(scope:aliasKey:documentId:)` |

The lower-level `aliases.resolve(...)` + `createWithAlias(options:)` two-step **exists** (and is documented below for completeness) but should not be your default path — see the Helper Preference Order at the top of this guide.

### Canonical: resolve-or-create a per-user singleton doc

```swift
let result = try await client.documents.getOrCreateWithAlias(
    alias: ["scope": "user", "aliasKey": "library"],
    title: "Library"          // used only if creating
)
let documentId = result["documentId"] as! String
let didCreate = result["created"] as? Bool ?? false

// Then open it through the base class so onDocumentOpened fires:
await appState.selectDocumentAwaiting(documentId)
```

### Lower-level building blocks

```swift
// Open / close
let doc = try await client.openDocument(id, options: OpenDocumentOptions(
    waitForLoad: .network,
    enableNetworkSync: true
))
await client.closeDocument(id)

// Create (local-first; returns a writable YDocument immediately,
// server commit happens in the background)
let (documentId, doc) = try await client.createDocument(options: CreateDocumentOptions(
    title: "My Document",
    tags: ["project"]
))

// Legacy two-step (DO NOT use as the default path — see Helper
// Preference Order above)
_ = try await client.documents.createWithAlias(options: [
    "title": "My Library",
    "alias": ["scope": "user", "aliasKey": "library"],
])
let existing = try await client.documents.aliases.resolve(scope: "user", aliasKey: "library")
let id = existing?["documentId"] as? String

// Set an alias on an existing doc
try await client.documents.aliases.set(
    scope: "user",
    aliasKey: "library",
    documentId: docId,
    userId: nil,              // nil = current user
    mustNotExist: false
)
```

## Sharing (documents + collections)

Same shape on both surfaces: invite by email, list members, list pending invites, cancel an invite. Email-targeted invites route through the unified **deferred-grant** flow — if the email already corresponds to an app user the grant lands as a live permission; otherwise it sits as a `DeferredDocumentPermission` / `DeferredGroupAdd` row that resolves the moment that user signs up. Same `inviteToken` works across the signup boundary.

### Pick the right helper

| Shape | Use |
|---|---|
| Invite an email to a single document | `client.documents.invite(documentId:email:permission:)` |
| Invite an email to a collection (cascades to all docs in it) | `client.collections.invite(collectionId:email:permission:)` |
| Add a known user (by id) directly | `client.collections.addMember(collectionId:userId:permission:)` |
| List live members of a document | `client.documents.getPermissions(documentId:)` |
| List pending email invites on a document | `client.documents.listPendingInvitations(documentId:)` |
| List live members + pending invites of a collection | `client.collections.getAccess(collectionId:)` / `listPendingInvitations(collectionId:)` |
| Remove a member from a document (by email or userId) | `client.documents.removePermission(documentId:email:)` / `(userId:)` |
| Remove a member from a collection (by userId) | `client.collections.removeMember(collectionId:userId:)` |
| Cancel a pending email invite on a collection | `client.collections.cancelPendingInvitation(collectionId:email:)` |

Avoid the raw `[String: Any]` overloads (`updatePermissions(documentId:params:)`, `addMember(collectionId:params:)`) unless you genuinely need a key not exposed by the typed wrapper. The wrappers exist precisely because the raw shape's contract is opaque from Swift.

### Canonical: invite an email

```swift
// Single document
_ = try await client.documents.invite(
    documentId: listDocId,
    email: "friend@example.com",
    permission: .readWrite
)

// Collection cascade — friend gets access to every doc in the collection,
// and any doc added to the collection later inherits the grant.
_ = try await client.collections.invite(
    collectionId: collectionId,
    email: "friend@example.com",
    permission: .reader
)
```

Both return a dict carrying the grant status. Keys to look for:

| Key | Meaning |
|---|---|
| `status` | `"added"` / `"already_member"` / `"pending_signup"` |
| `userId` | Present when `status != "pending_signup"` |
| `inviteToken` | Present when `status == "pending_signup"` — pass to a recipient via your own out-of-band channel if you need a deep-link |
| `invitationId` / `deferredId` | Server ids; `deferredId` is required to revoke before signup |
| `expiresAt` | ISO-8601, when the deferred grant times out |

### Listing + revoking

```swift
// Live document members
let perms = try await client.documents.getPermissions(documentId: docId)

// Pending email invites on a document
let pending = try await client.documents.listPendingInvitations(documentId: docId)

// Remove either kind:
_ = try await client.documents.removePermission(documentId: docId, email: "friend@example.com")
_ = try await client.documents.removePermission(documentId: docId, userId: someUserId)

// Collection access (live + pending in one dict)
let access = try await client.collections.getAccess(collectionId: cid)
let collMembers = access["members"] as? [[String: Any]] ?? []
let collPending = try await client.collections.listPendingInvitations(collectionId: cid)

// Revoke:
_ = try await client.collections.removeMember(collectionId: cid, userId: someUserId)
let cancelled = try await client.collections.cancelPendingInvitation(
    collectionId: cid,
    email: "friend@example.com"
)
// `cancelled == false` if no pending invite for that email exists.
```

`cancelPendingInvitation` wraps the two-step "list pending → find by email → delete deferred grant" dance internally — under the hood it calls the global `DELETE /deferred-grants/:id?type=group` verb.

### Watching for permission changes / access loss

When a peer revokes your access (or hard-deletes a doc you have open), the server sends a `docMetadata` frame with `action: "deleted"`. The Swift client emits **both**:
- `.documentMetadataChanged` (typed `DocumentMetadataChangedEvent`) — general purpose
- `.documentDeleted` (typed `DocumentDeletedEvent`) — derived, for detail views to subscribe to specifically

The server collapses "doc was deleted" and "your access was revoked" to the same wire shape, so subscribers can't distinguish from the payload. Detail views should dismiss themselves on either signal — the user no longer sees the data either way.

```swift
private var deletedSub: EventSubscription?

.task {
    deletedSub = client.events.on(.documentDeleted) { [weak self] (ev: DocumentDeletedEvent) in
        Task { @MainActor in
            guard let self, ev.documentId == self.openDocId else { return }
            self.dismiss()
        }
    }
}
```

## Collections

Collections are server-side folders that cascade permissions to every document they contain. The same grant that's read off a doc directly is also read off any collection the doc belongs to — server resolves the max permission across all channels.

### Pick the right helper

| Shape | Use |
|---|---|
| Create a named collection | `client.collections.create(name:description:)` |
| List collections the user can see | `client.collections.list(options:)` |
| Get a collection's metadata | `client.collections.get(collectionId:)` |
| Rename / change metadata | `client.collections.update(collectionId:params:)` |
| Delete a collection (docs survive) | `client.collections.delete(collectionId:)` |
| Add an existing doc to a collection | `client.collections.addDocument(collectionId:documentId:)` |
| Remove a doc from a collection | `client.collections.removeDocument(collectionId:documentId:)` |
| List the docs inside a collection | `client.collections.listDocuments(collectionId:options:)` |
| Find which collections a doc belongs to | `client.collections.listCollectionsForDocument(documentId:)` |
| Invite / list / remove members | See **Sharing** section above |

### Add and remove a document

`addDocument` and `removeDocument` are idempotent — calling `addDocument` on a doc that's already in the collection is a no-op (no error), and `removeDocument` on a doc that isn't in the collection is also a no-op.

```swift
// Move a doc INTO a collection
_ = try await client.collections.addDocument(
    collectionId: collectionId,
    documentId: docId
)

// Move it OUT (back to "loose"). Other collections it belongs to are
// untouched — a doc can be in multiple collections.
_ = try await client.collections.removeDocument(
    collectionId: collectionId,
    documentId: docId
)
```

### What happens to permissions on add/remove

| Action | Effect on the doc's permissions |
|---|---|
| `addDocument` | Cascade members of the collection gain access to the doc immediately. Direct permissions on the doc are unaffected. |
| `removeDocument` | Cascade members lose access **only if** they don't have any other channel (direct grant, another collection that contains the doc). Server resolves the max across remaining channels. |
| `collections.delete` | All docs in the collection survive. Cascade members lose access through this collection (same "max across remaining channels" rule). |

### Who can add what

`addDocument` requires:
- The caller has at least `read-write` on **the document being added**, AND
- The caller is at least a `read-write` member of **the collection**.

A `reader`-only collection member cannot add docs (they can only see them). A `reader`-only doc permission can never put the doc into a collection.

`removeDocument` requires the same level of access.

### Multi-collection membership

A single document can live in any number of collections at once. The local app-state pattern in this template assumes **one collection per doc** (the `ListRef` has a single `collectionId` field) for UI simplicity; if you need multi-membership, model it as a separate `[String]` field or skip the local cache and query `listCollectionsForDocument(documentId:)` on demand.

## Blobs

Document-scoped — fetch the per-doc context. See [Blobs guide](AGENT_GUIDE_TO_PRIMITIVE_BLOBS.md) for caching and bucket semantics.

```swift
let blobs = client.document(documentId).blobs()

let result = try await blobs.upload(mimeType: "image/jpeg", data: jpegData)
let blobId = result["blobId"] as? String

let data = try await blobs.read(blobId: blobId, force: false)   // false = use LRU cache
let url = blobs.downloadUrl(blobId: blobId, disposition: .inline)
```

Default upload concurrency is 2. Override with `client.setBlobUploadConcurrency(4)`. The in-memory LRU cache from `read(force: false)` only persists for one session — for cross-session caching, layer your own (memory → disk → `read()`).

## Workflows

Workflows are server-side jobs delivered back via *apply* handlers — see [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) for the apply lifecycle and runKey semantics.

**The Swift pattern: pre-register the handler, bridge into async/await with a `CheckedContinuation`, guard on `runKey` to drop stale completions.**

```swift
func runOcr(image: Data, documentId: String) async throws -> [String: Any] {
    let runKey = "ocr-\(UUID().uuidString.prefix(12))"

    return try await withCheckedThrowingContinuation { continuation in
        var resolved = false

        // 1. Register the handler BEFORE starting the run.
        client.workflows.define("ocr-content") { [weak self] ctx in
            guard !resolved else { return }            // idempotency: server may retry
            guard ctx.runKey == runKey else { return } // stale completions from prior session
            resolved = true
            continuation.resume(returning: ctx.output)
        }

        // 2. Also subscribe to .workflowStatus so failed/terminated terminal states resolve.
        let statusSub = client.events.on(.workflowStatus) { [weak self] (ev: WorkflowStatusEvent) in
            guard ev.runKey == runKey, !resolved else { return }
            if ev.status == "failed" || ev.status == "terminated" {
                resolved = true
                continuation.resume(throwing: WorkflowError.failed(ev.error ?? "unknown"))
            }
        }

        // 3. Start the run, pinning to the runKey.
        Task {
            do {
                _ = try await client.workflows.start(
                    workflowKey: "ocr-content",
                    input: ["attachments": [["data": image.base64EncodedString(), "type": "image/jpeg"]]],
                    options: StartWorkflowOptions(runKey: runKey, contextDocId: documentId)
                )
            } catch {
                if !resolved {
                    resolved = true
                    continuation.resume(throwing: error)
                }
            }
        }

        // 4. Add a timeout (suggested ≥120s for LLM workflows) so the continuation can't leak.
        // ...
    }
}
```

**Mandatory guards:**

- **Register before start** — otherwise the apply may deliver before you subscribe.
- **`runKey`-match guard** — a `.workflowStatus` event from a prior session can otherwise resolve your fresh continuation.
- **`resolved` flag** — server retries can fire the handler multiple times; `CheckedContinuation` traps on double-resume.
- **Timeout** — long-running LLM workflows can exceed the default 120s client timeout.

### Recovery after reconnect

If the device was offline when the server finished the run, call `client.workflows.deliverPendingApplies(contextDocId:)` after reconnect — the handler fires then.

### Other workflow APIs

```swift
client.workflows.getStatus(workflowKey:, runKey:, contextDocId:)
client.workflows.terminate(workflowKey:, runKey:)
client.workflows.listRuns(options:)
client.workflows.getPendingApplies(contextDocId:)
client.workflows.undefine(workflowKey)
```

## Events

`client.events.on(...)` returns an `EventSubscription` — **retain it or it gets dropped**. Use `[weak self]` to avoid a retain cycle when the subscription is stored on `self`.

```swift
private var syncSub: EventSubscription?
private var remoteSub: EventSubscription?

func subscribeToDoc(_ docId: String) {
    syncSub = client.events.on(.sync) { [weak self] (event: SyncEvent) in
        Task { @MainActor in
            guard let self, event.documentId == docId, event.synced else { return }
            await self.refreshData()
        }
    }
    remoteSub = client.events.on(.remoteUpdate) { [weak self] (event: RemoteUpdateEvent) in
        Task { @MainActor in
            guard let self, event.documentId == docId else { return }
            await self.refreshData()
        }
    }
}

deinit {
    syncSub?.cancel()
    remoteSub?.cancel()
}
```

| Event | Payload | Fires when |
|---|---|---|
| `.sync` | `SyncEvent { documentId, synced: Bool }` | Server acknowledged our state matches theirs |
| `.remoteUpdate` | `RemoteUpdateEvent { documentId }` | Remote peer wrote to a doc we have open |
| `.workflowStatus` | `WorkflowStatusEvent { workflowKey, runKey, status, output, error, needsApply }` | Workflow run reached terminal state |
| `.status` | `StatusChangedEvent` | Connection state changed (connecting / connected / disconnected) |
| `.authSuccess` | `AuthSuccessEvent` | Token obtained or refreshed |
| `.documentMetadataChanged` | `DocumentMetadataChangedEvent { documentId, action, metadata?, changedFields?, source? }` | Server-pushed metadata change. `action` ∈ `"created" \| "updated" \| "deleted" \| "evicted"`. |
| `.documentDeleted` | `DocumentDeletedEvent { documentId, source }` | Derived from `action: "deleted"` — covers both hard-delete and access-revocation (server collapses both to the same wire shape). Detail views that have the doc open should subscribe to this and dismiss themselves. |

### BaoDataLoader — the canonical view-data binding

For **any** SwiftUI view that reads from a `TypedModel<T>`, use `BaoDataLoader` rather than subscribing to `client.events.on(...)` directly. The loader owns its subscriptions (cancelled on deinit), debounces bursts, and re-runs a `load` closure when triggered.

Trigger options (`LoaderTrigger`):

| Trigger | Fires on | Use when |
|---|---|---|
| `.onModelChange(TypedModel<T>)` | Any add/update/delete on **that specific model** | Reading from a single TypedModel — this is the default for model-backed views. Tighter than the doc-wide events. |
| `.onSync` | `.sync` event on any doc | REST-backed loaders that need a refresh after every sync ack. |
| `.onRemoteUpdate` | `.remoteUpdate` event on any doc | Doc-wide; coarser than `.onModelChange`. |
| `.onDocumentEvents` | `documentLoaded` + `documentClosed` | Loaders that care about doc lifecycle, not data. |
| `.onConnect` | Connection flips to `.connected` | REST-backed loaders that need to refresh after reconnect. |
| `.custom((client, reload) -> EventSubscription?)` | Whatever you install | Escape hatch for triggers not covered above. |

```swift
@StateObject private var loader = BaoDataLoader<[TodoItem]>()

var body: some View {
    Group {
        switch loader.phase {
        case .loading:           ProgressView()
        case .empty:             EmptyState()
        case .loaded(let items): List(items) { /* row */ }
        }
    }
    .task {
        loader.bind(
            client: appState.client,
            subscribeTo: [.onModelChange(todos)]
        ) { _ in
            todos.findAll().sorted { $0.createdAt > $1.createdAt }
        }
    }
}
```

`loader.reloadNow()` after writes is **not** required when you use `.onModelChange` — local writes fire the trigger synchronously. You only need it when the load closure depends on something the loader can't subscribe to (e.g. a REST resource).

#### `loader.phase` vs `loader.data ?? []`

`loader.phase` is the trinary view-facing state:

| Case | Meaning |
|---|---|
| `.loading` | First load hasn't completed yet. Show a spinner. |
| `.empty` | First load completed; data conforms to `LoaderEmptiness` and is empty (`[]`, `""`, etc.). Show your empty-state placeholder. |
| `.loaded(Data)` | First load completed and the data is non-empty. Render it. |

`[T]`, `String`, and `Optional<LoaderEmptiness>` get `LoaderEmptiness` conformance out of the box; custom `Data` types adopt the protocol if they want `.empty`.

Prefer this over the raw `loader.data ?? []` shape — it collapses "not yet loaded" with "loaded, no items" and produces the empty-state flash that views written from older snippets exhibit.

## Authentication

`AuthGateView` covers Google OAuth, Magic Link, OTP, and Passkeys out of the box. The auth manager (`appState.authManager`) exposes the underlying primitives if you need a custom UI:

```swift
appState.authManager.magicLinkRequest(email:)
appState.authManager.magicLinkVerify(email:, code:)
appState.authManager.otpRequest(email:)
appState.authManager.otpVerify(email:, code:)
appState.authManager.startOAuthFlow(provider: .google)
appState.authManager.handleOAuthCallback(url:)
appState.authManager.signOut()
```

See [Authentication guide](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md) for OAuth setup, server-side configuration, and per-method behavior. Token persistence is handled by `JsBaoClient` when `auth.persistJwtInStorage: true` (the template default).

## Other APIs (mirror JS, see linked guides)

| Sub-API | Swift access | Conceptual guide |
|---|---|---|
| Collections (folders) | `client.collections.list/create/addDocument/removeDocument` | [Sharing](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md) |
| Databases | `client.databases.connect/operation/subscribe` | [Databases](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) |
| Prompts | `client.prompts.execute` | [Prompts](AGENT_GUIDE_TO_PRIMITIVE_PROMPTS.md) |
| Integrations | `client.integrations.call` | [Integrations](AGENT_GUIDE_TO_PRIMITIVE_INTEGRATIONS.md) |
| Users | `client.me`, `client.users.lookup/get` | [Users & Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) |
| Groups | `client.groups.list/create/addMember/...` | [Users & Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) |
| Analytics | `client.analytics.log/...` | [Analytics](AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.md) |

## Reading the Swift source

When in doubt, the source is the ground truth. After `swift build` / `swift package resolve`, dependencies are at `.build/checkouts/`.

| File | Contents |
|---|---|
| `.build/checkouts/swift-client/Sources/JsBaoClient/JsBaoClient.swift` | Top-level client, connection, document open/close, auth methods |
| `.build/checkouts/swift-client/Sources/JsBaoClient/TypedModel.swift` | `PrimitiveModel` protocol, `TypedModel<T>` CRUD |
| `.build/checkouts/swift-client/Sources/JsBaoClient/DynamicModel.swift` | Runtime-schema model (when codegen can't be used) |
| `.build/checkouts/swift-client/Sources/SwiftBaoCodegen/` | `swift-bao-codegen` tool — input TOML schema, output structs |
| `.build/checkouts/swift-client/Sources/JsBaoClient/BaoModel.swift` | Legacy `BaoModelRecord` / `BaoModel<T>` — deprecated, don't use for new code |
| `.build/checkouts/swift-client/Sources/JsBaoClient/API/DocumentsAPI.swift` | Create / list / update / delete / invitations / permissions / tags / aliases |
| `.build/checkouts/swift-client/Sources/JsBaoClient/API/WorkflowsAPI.swift` | `start`, `define`, `claimApply`, pending-apply delivery |
| `.build/checkouts/swift-client/Sources/JsBaoClient/API/CollectionsAPI.swift` | Folders |
| `.build/checkouts/swift-client/Sources/JsBaoClient/Types/Events.swift` | Event enum + payload structs |
| `.build/checkouts/swift-client/Sources/JsBaoClient/Types/Options.swift` | Client / document / workflow option structs |
| `.build/checkouts/swift-client/Sources/JsBaoClient/Types/Errors.swift` | `JsBaoError`, `JsBaoErrorCode`, `AuthError`, `HttpError` |
| `.build/checkouts/swift-primitive-app/Sources/PrimitiveApp/State/PrimitiveAppState.swift` | App-state lifecycle, `makeTypedModel`, inspector registration |
| `.build/checkouts/swift-primitive-app/Sources/PrimitiveApp/State/BaoDataLoader.swift` | Reactive-load helper |
| `.build/checkouts/swift-primitive-app/Sources/PrimitiveApp/Views/PrimitiveLoginView.swift` | `AuthGateView` source |

## Shipping with Fastlane

The Apple template doesn't include Fastlane by default. Standard setup:

### Install

Add `Gemfile` at project root:

```ruby
source "https://rubygems.org"
gem "fastlane"
```

Then `bundle install && bundle exec fastlane init` (pick manual setup).

`fastlane/Appfile`:

```ruby
app_identifier "com.yourcompany.myapp"   # must match PRODUCT_BUNDLE_IDENTIFIER in project.yml
team_id "2J4V27W63D"
```

### App Store Connect API Key

Required for `upload_to_testflight` and `upload_to_app_store`. Username-based auth no longer works for upload.

1. [App Store Connect → Users and Access → Integrations → API Keys](https://appstoreconnect.apple.com/access/integrations/api) → create key with **App Manager** role.
2. Download the `.p8` (one-time download) to `fastlane/api_key.p8`. **Gitignore it.**
3. Note Key ID + Issuer ID.
4. Add `.env`:
   ```bash
   ASC_KEY_ID=ABC123XYZ
   ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
   ASC_KEY_PATH=./fastlane/api_key.p8
   ```

### Fastfile

```ruby
default_platform(:ios)

def load_api_key
  app_store_connect_api_key(
    key_id: ENV["ASC_KEY_ID"],
    issuer_id: ENV["ASC_ISSUER_ID"],
    key_filepath: ENV["ASC_KEY_PATH"] || "./fastlane/api_key.p8",
    in_house: false
  )
end

def current_version
  yml = File.read("../project.yml")
  v = yml.match(/MARKETING_VERSION:\s*"?([^"\n]+)"?/)&.captures&.first || "1.0"
  b = yml.match(/CURRENT_PROJECT_VERSION:\s*"?([^"\n]+)"?/)&.captures&.first || "1"
  { version: v, build: b.to_i }
end

platform :ios do
  lane :beta do
    api_key = load_api_key
    changelog_path = File.expand_path("changelog.txt", __dir__)
    changelog = File.exist?(changelog_path) ? File.read(changelog_path).strip : nil

    build_app(
      project: "MyApp.xcodeproj",
      scheme: "MyApp_iOS",
      destination: "generic/platform=iOS",
      export_method: "app-store",
      export_options: { signingStyle: "automatic" },
      xcargs: "-allowProvisioningUpdates",
      output_directory: ".build/archives",
      output_name: "MyApp-iOS.ipa",
      clean: true,
    )

    upload_to_testflight(
      api_key: api_key,
      skip_waiting_for_build_processing: true,
      skip_submission: true,
      changelog: changelog,
    )
  end

  lane :release do
    api_key = load_api_key

    build_app(
      project: "MyApp.xcodeproj",
      scheme: "MyApp_iOS",
      destination: "generic/platform=iOS",
      export_method: "app-store",
      export_options: { signingStyle: "automatic" },
      xcargs: "-allowProvisioningUpdates",
      output_directory: ".build/archives",
      output_name: "MyApp-iOS.ipa",
      clean: true,
    )

    upload_to_app_store(
      api_key: api_key,
      skip_metadata: true,
      skip_screenshots: true,
      precheck_include_in_app_purchases: false,
    )
  end

  lane :add_testers do |options|
    api_key = load_api_key
    emails = (options[:emails] || "").split(",").map(&:strip).reject(&:empty?)
    UI.user_error!('Pass emails: fastlane ios add_testers emails:"a@x.com,b@y.com"') if emails.empty?

    emails.each do |email|
      pilot(
        api_key: api_key,
        app_identifier: "com.yourcompany.myapp",
        email: email,
        first_name: email.split("@").first,
        last_name: "Tester",
      )
    end
  end
end

lane :bump do |options|
  type = (options[:type] || "patch").to_s
  v = current_version
  parts = v[:version].split(".").map(&:to_i)
  parts.push(0) while parts.length < 3
  case type
  when "major" then parts[0] += 1; parts[1] = 0; parts[2] = 0
  when "minor" then parts[1] += 1; parts[2] = 0
  when "patch" then parts[2] += 1
  end
  new_version = parts.join(".")
  new_build = v[:build] + 1

  yml = File.read("../project.yml")
  yml.gsub!(/MARKETING_VERSION:\s*"?[^"\n]+"?/, "MARKETING_VERSION: \"#{new_version}\"")
  yml.gsub!(/CURRENT_PROJECT_VERSION:\s*"?[^"\n]+"?/, "CURRENT_PROJECT_VERSION: \"#{new_build}\"")
  File.write("../project.yml", yml)
  sh("xcodegen generate --quiet")
end
```

### Register app on App Store Connect (one-time)

1. [App Store Connect → Apps → +](https://appstoreconnect.apple.com/apps) → New App.
2. Pick iOS, set name, primary language, bundle ID (must match `PRODUCT_BUNDLE_IDENTIFIER` in `project.yml`), SKU.
3. Full Access.

For macOS on the same listing, add the macOS platform from the app's **App Information** page.

### Ship a TestFlight build

```bash
bundle exec fastlane bump type:patch      # bumps version + build, regenerates xcodeproj
bundle exec fastlane ios beta             # archives, exports, uploads
```

Internal testers get builds immediately. External testers / groups need a one-time Beta App Review per major version. First upload takes 10–20 min between fastlane completing and the build appearing in TestFlight; subsequent uploads ~5 min.

### Submit to App Store

```bash
bundle exec fastlane bump type:minor
bundle exec fastlane ios release
```

`upload_to_app_store` uploads + submits for review. The lane skips metadata/screenshots — fill those in App Store Connect before submission can actually be reviewed.

## Common Patterns

### Pattern: Library doc + per-item docs

The most common shape — one library document per user (alias-resolved on launch) holds an index of refs to per-item documents (each shareable independently).

```swift
// Library doc holds LibraryItemRef records
[models.library_item_refs]
class_name = "LibraryItemRef"

[models.library_item_refs.fields.id]
type = "id"

[models.library_item_refs.fields.itemDocumentId]
type = "string"
required = true

[models.library_item_refs.fields.cachedTitle]
type = "string"

[models.library_item_refs.fields.deletedAt]    # tombstone, never hard-delete
type = "string"
```

Each item lives in its own document and is shared independently. The library doc holds a metadata-cached ref; mutations to the cache (`cachedTitle`, etc.) come from a hydrate step that opens the item doc, reads the live values, and writes back into the ref.

### Pattern: Tombstone instead of hard-delete

Soft-delete via a `deletedAt` field, filter at query time:

```swift
let alive = libraryRefs.query(["deletedAt": ""])
```

When access is revoked or the user removes an item, set `deletedAt` to an ISO timestamp instead of calling `.delete(...)`. Avoids race conditions where reconcile passes recreate a just-deleted ref because the server still reports it as accessible.

### Pattern: Reconcile pass (server state → local refs)

When sharing / unsharing / collection changes happen, run a single reconcile pass that takes the server's view of what the user has access to and applies it to local refs in lockstep:

1. Enumerate every potential access channel (cascade collections, direct grants, per-ref probes).
2. Compute the **max** permission across channels (server's resolution rule).
3. Apply: create missing refs, update cached fields, tombstone stale ones.
4. Serialize reconcile passes — one body at a time, callers arriving mid-pass coalesce into a rerun.

Idempotent, convergent (one pass reaches the right state from any starting state), atomic (single-collection failures bail the whole pass — no half-applied state).

## What's NOT Covered Here

- **Notarized DMG / standalone macOS distribution** — `archive.sh dmg` builds the bundle; notarization (`xcrun notarytool submit ... --wait`, then `stapler staple`) is an Apple-side flow not specific to Primitive.
- **CI** — both `./run-ios.sh` and `bundle exec fastlane ios beta` work in GitHub Actions on a macOS runner. Base64-encode `api_key.p8` into a secret, decode before the lane runs.
- **Custom auth UI** — build around `appState.authManager` instead of `AuthGateView`. See [Authentication guide](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md).
- **Per-prompt / per-database / per-integration / per-analytics specifics** — Swift API mirrors JS; consult the linked conceptual guides for behavior, then the Swift source under `.build/checkouts/swift-client/Sources/JsBaoClient/API/` for the typed signatures.

## Verification Checklist (After Writing Swift Code)

Before declaring Swift code complete:

**Helper choice (the high-leverage checks):**
- [ ] Used `documents.getOrCreateWithAlias(...)` for per-user singleton docs — NOT `aliases.resolve` + `createWithAlias` two-step.
- [ ] View-data binding is `BaoDataLoader<[T]>` + `.onModelChange(typedModel)` — NOT `@Published var items` + manual `refresh()`.
- [ ] Views render through `switch loader.phase` (`.loading | .empty | .loaded`) — NOT `List(loader.data ?? []) { … }` (which flashes the empty state for ~50ms on every appearance).
- [ ] Post-connect setup is `override func connectClient() async` — NOT a Combine sink on `$isConnected`.
- [ ] TypedModel binding is inside `onDocumentOpened(doc:documentId:)` — NOT a second `openDocument(...)` call to fetch a YDocument.
- [ ] Multi-doc app: per-item detail views use `appState.openAuxiliaryDoc(_:modelType:)` / `closeAuxiliaryDoc(_:)` — NOT `selectDocumentAwaiting(_:)` (which closes the ambient library doc).
- [ ] Fresh-doc creation that immediately writes uses `createDocument(options:)` and its returned YDocument — NOT `createWithAlias` + `openDocument(.network)` (which can park 15s on an empty doc).
- [ ] Email-based sharing uses `documents.invite(...)` / `collections.invite(...)` — NOT the raw `[String: Any]` overloads.
- [ ] Reconcile "every doc I can read" with `me.accessibleDocuments(tag:)` — NOT manual merge of `ownedDocuments` + `sharedDocuments`.
- [ ] Detail views subscribe to `.documentDeleted` to pop on delete/revoke — NOT `.documentMetadataChanged` filtered by `action == "deleted"`.

**Codegen and schema:**
- [ ] All models are in `schema.toml`, not hand-rolled `BaoModelRecord` structs.
- [ ] `Package.swift` has `JsBaoCodegenPlugin` on the target + `exclude: ["Models/Generated"]`.
- [ ] `run-ios.sh` invokes `swift run swift-bao-codegen` before `xcodegen generate`.
- [ ] All `TypedModel<T>` instances are constructed via `appState.makeTypedModel(doc:documentId:)`.
- [ ] Snake_case wire keys match what other clients (web) read/write — no rename without a migration plan.
- [ ] No `nil` values in CRDT-backed fields — `""` / `0` / sentinel timestamps instead.
- [ ] `Models/Generated/` is gitignored (regenerated on every build; only its `README.md` is tracked).

**Events and workflows:**
- [ ] All `EventSubscription` handles are stored on a property and `[weak self]` is used in the closure.
- [ ] Workflow `define(...)` is registered BEFORE the corresponding `workflows.start(...)`.
- [ ] Workflow handlers have a `runKey`-match guard and `resolved` flag.

**Build / ship:**
- [ ] `DEVELOPMENT_TEAM` set in `project.yml` (not Xcode UI) if shipping to device.
