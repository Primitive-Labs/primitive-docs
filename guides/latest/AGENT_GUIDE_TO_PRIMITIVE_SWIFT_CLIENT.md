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

2. **Wire codegen on both build paths.** `swift build` runs `JsBaoCodegenPlugin` automatically; the Xcode/iOS path does NOT. Invoke `swift run swift-bao-codegen` inline in `run-ios.sh` before `xcodegen generate`, write to a checked-in `Models/Generated/`, and add `exclude: ["Models/Generated"]` to the SPM target so the two producers don't collide. See [§4](#data-modeling-schematoml--codegen--typedmodelt).

3. **Wire `TypedModel<T>` instances through `appState.makeTypedModel(doc:documentId:)`.** Constructing `TypedModel<T>(doc:)` directly works but skips registration with the in-app debug inspector. Use `makeTypedModel` so the model shows up in the Debug Inspector tab.

4. **Snake_case wire field names are forever.** TOML keys are wire field names. Once data is on disk, renaming a key orphans every existing record (both Swift and JS clients reading the same doc). If snake_case reads awkwardly at call sites, add camelCase aliases in a hand-written `+Extensions.swift` companion file — but the underlying stored property keeps the wire key.

5. **No nulls in CRDT-backed fields.** The CRDT layer does not model `nil`. Use `""` for absent strings, `0` for absent numbers, sentinel timestamps for "never". Check those values explicitly.

6. **Numbers round-trip as `Double`.** Codegen emits `type = "number"` fields as `Double`. Cast to `Int` when reading, wrap in `Double(...)` when writing.

7. **IDs are `String`.** Use `UUID().uuidString` (or a ULID helper) when not supplied. The codegen-emitted `init?(record:)` reads `id` straight off the record.

8. **Store `EventSubscription` on a property; always `[weak self]` the closure.** `client.events.on(...)` returns a subscription that's dropped (and the handler unregistered) if the return value isn't retained. Holding the subscription strongly on `self` while the closure also captures `self` strongly creates a retain cycle. Call `.cancel()` on teardown.

9. **Register workflow `define(...)` handlers BEFORE calling `workflows.start(...)`.** If the server completes before the handler is registered, the apply event delivers to another connected client (or queues). Always define first, then start.

10. **Use `[weak self]` + a `runKey`-match guard inside workflow handlers.** Stale completions from a prior app session can otherwise resolve a fresh continuation.

11. **Open documents BEFORE constructing `TypedModel<T>` for them.** `TypedModel<T>(doc:)` requires the `YDocument` that `client.openDocument(...)` returns.

12. **Set `DEVELOPMENT_TEAM` in `project.yml` (NOT in Xcode UI) and regenerate the xcodeproj.** The xcodeproj is xcodegen output — any UI edits are wiped on the next `xcodegen generate`. The team ID is the only setting that has to exist for device, TestFlight, and App Store builds; simulator builds run unsigned.

13. **Use the `JsBaoClient` and `PrimitiveAppState` instances from `appState` — do NOT construct them yourself.** `PrimitiveAppState.initialize()` owns the client lifecycle, reads `primitive.json`, attaches the auth manager, and (in dev) auto-signs in via the CLI token. Manual instantiation breaks the dev-mode auth bypass and the inspector registration.

14. **Treat `[String: Any]` API responses as untyped at the boundary.** `documents.create`, `documents.aliases.resolve`, `blobs.upload`, etc. return `[String: Any]`. Cast at the call site (`result["documentId"] as? String`) and validate immediately — there's no compile-time response shape.

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

`PrimitiveAppState` is the `@StateObject` your app holds. Subclass it when you need app-specific state (document caches, `TypedModel` registry, etc.):

```swift
@MainActor
final class MyAppState: PrimitiveAppState {
    @Published private(set) var todos: TypedModel<TodoItem>?

    override func onDocumentOpened(_ doc: YDocument, documentId: String) async {
        // Called when the user's library/default doc opens.
        // Build per-doc TypedModel instances here.
        todos = makeTypedModel(doc: doc, documentId: documentId)
    }
}
```

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

Supported `type` values: `id`, `string`, `number`, `boolean`. `required = true` makes the codegen-emitted `init?(record:)` reject construction without that field. `indexed = true` registers a SQLite index for query-path filtering.

### 4b. Dual-path codegen wiring

Two build paths, both need wiring:

- **SwiftPM** (`swift build`, `swift test`, `./run.sh` for macOS) — `JsBaoCodegenPlugin` from `swift-client` runs automatically and feeds output to the compiler.
- **Xcode / iOS** (`./run-ios.sh`, archives, TestFlight) — Xcode compiles from `.pbxproj` directly, SPM plugin never fires. Invoke the codegen tool manually before `xcodegen generate`, write into a checked-in `Models/Generated/` so xcodegen scans it.

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
# writing into a checked-in Generated/ dir xcodegen picks up.
GEN_DIR="Sources/MyApp/Models/Generated"
SCHEMA_TOML="Sources/MyApp/Models/schema.toml"
mkdir -p "$GEN_DIR"
swift run --package-path . swift-bao-codegen \
    --input  "$SCHEMA_TOML" \
    --output "$GEN_DIR"
```

The first `swift run swift-bao-codegen` builds the codegen binary from the swift-client checkout (~30s one-time cost). Subsequent runs are instant. Files in `Models/Generated/` are committed to source control — they're what Xcode actually compiles. `writeIfChanged` keeps mtimes stable on no-op runs.

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
import PrimitiveApp

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

### 4e. Binding to a document

```swift
let doc = try await client.openDocument(documentId, options: OpenDocumentOptions(
    waitForLoad: .network,            // or .local / .localIfAvailableElseNetwork
    enableNetworkSync: true
))
let todos: TypedModel<TodoItem> = appState.makeTypedModel(doc: doc, documentId: documentId)
```

**Always** go through `appState.makeTypedModel(...)` rather than `TypedModel<TodoItem>(doc: doc)` directly — the convenience method registers the model with the in-app debug inspector. One `TypedModel` per record type per document.

### 4f. Read

Reads are **synchronous** and hit the local CRDT — no `async/await`:

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
todos.create(TodoItem(text: "Buy milk"))
todos.update("todo_123", ["completed": true])
todos.delete("todo_123")
```

A write is observable to local reads on the next line. Remote peers see it when the WS round-trip completes; a `.sync` event fires when the server acks.

## Documents

API surface mirrors JS — see [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) for conceptual model.

```swift
// Open / close
let doc = try await client.openDocument(id, options: OpenDocumentOptions(
    waitForLoad: .network,
    enableNetworkSync: true
))
await client.closeDocument(id)

// Create
let result = try await client.documents.create(options: [
    "title": "My Document",
    "tags": ["project"],
])
let documentId = result["documentId"] as? String

// Create + atomic alias (find this doc later without storing the ID anywhere)
_ = try await client.documents.createWithAlias(options: [
    "title": "My Library",
    "alias": ["scope": "user", "aliasKey": "library"],
])

// Resolve the alias on next launch
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

### Common pattern: library doc on first launch

```swift
let existing = try await client.documents.aliases.resolve(scope: "user", aliasKey: "library")
let libraryId: String
if let id = existing?["documentId"] as? String {
    libraryId = id
} else {
    let result = try await client.documents.createWithAlias(options: [
        "title": "Library",
        "alias": ["scope": "user", "aliasKey": "library"],
    ])
    libraryId = result["documentId"] as! String
}
let doc = try await client.openDocument(libraryId, options: OpenDocumentOptions(waitForLoad: .network, enableNetworkSync: true))
```

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

### Higher-level helper: BaoDataLoader

For most reactive-load patterns, use `BaoDataLoader` instead of subscribing manually — it takes a list of triggers (`.onSync`, `.onRemoteUpdate`, `.onDocumentEvents`) and re-runs a `load` closure when any fire. Cancels its own subscriptions on deinit.

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

- [ ] All models are in `schema.toml`, not hand-rolled `BaoModelRecord` structs.
- [ ] `Package.swift` has `JsBaoCodegenPlugin` on the target + `exclude: ["Models/Generated"]`.
- [ ] `run-ios.sh` invokes `swift run swift-bao-codegen` before `xcodegen generate`.
- [ ] All `TypedModel<T>` instances are constructed via `appState.makeTypedModel(doc:documentId:)`.
- [ ] All `EventSubscription` handles are stored on a property and `[weak self]` is used in the closure.
- [ ] Workflow `define(...)` is registered BEFORE the corresponding `workflows.start(...)`.
- [ ] Workflow handlers have a `runKey`-match guard and `resolved` flag.
- [ ] Snake_case wire keys match what other clients (web) read/write — no rename without a migration plan.
- [ ] `DEVELOPMENT_TEAM` set in `project.yml` (not Xcode UI) if shipping to device.
- [ ] No `nil` values in CRDT-backed fields — `""` / `0` / sentinel timestamps instead.
- [ ] `Models/Generated/` is committed to source control.
