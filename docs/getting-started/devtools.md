# Dev Tools

Both starter templates include development tooling for inspecting live data, managing files, and running tests against the real client:

- **Web** — a browser overlay provided by the `primitiveDevTools` Vite plugin, with a Document Explorer, Test Harness, and Blob Explorer.
- **iOS** — the **Debug Inspector**, a local web UI served by the app itself in debug builds, which you open from a browser on your Mac.

Both are excluded from production automatically: the web overlay only renders in development mode, and the iOS inspector is compiled out of release builds entirely.

## Web: The Dev Tools Overlay

A floating button showing the Primitive logo appears at the edge of your app during development. Click it to open the dev tools overlay. The button is draggable and its position persists across sessions.

```typescript
// vite.config.ts
import { primitiveDevTools } from "primitive-app/vite";

export default defineConfig({
  plugins: [
    vue(),
    primitiveDevTools({
      appName: "My App",
      testsDir: "src/tests",
    }),
  ],
});
```

The overlay has three tabs: Document Explorer, Test Harness, and Blob Explorer.

### Document Explorer

Inspect and manage documents and data records:

- **Document sidebar** — all documents you have access to (owned and shared), with search, pagination, and permission badges. For documents you own: create, rename, delete, and mass-delete.
- **Data table** — select a document to see its registered models with record counts; click a model to view records in a filterable, sortable table with full CRUD (type-aware form editors for text, booleans, dates, StringSets).
- **Model info** — click the info icon on any model to view its schema: fields, types, indexes, unique constraints, and relationships.

### Blob Explorer

Browse and manage files stored with your documents: search by filename, filter by content type, upload, preview images, copy download URLs, and delete individually or in batch.

### Test Harness

Run automated tests against your business logic with the real client — real storage, the Primitive sync layer, and Vue reactivity, no mocks. Tests are written once and run in two contexts: interactively in this panel during development, and headlessly in Node under vitest so CI can gate merges (see [Running tests headlessly](#running-tests-headlessly-ci)).

Create test files with the `.primitive-test.ts` suffix in your tests directory. Each file exports a `TestGroup`:

```typescript
// src/tests/myFeature.primitive-test.ts
import type { TestGroup } from "primitive-app";

const tests: TestGroup = {
  name: "My Feature",
  tests: [
    {
      id: "add-numbers",
      name: "Addition works",
      run: async (log) => {
        log("Testing 2 + 2...");
        if (2 + 2 !== 4) throw new Error("Math is broken");
        return "passed";
      },
    },
  ],
};

export default tests;
```

Tests that perform model operations (`.save()`, `.query()`, `.find()`, `.delete()`) need an ephemeral test document. Use `createTestDocument()` / `destroyTestDocument()` with a try/finally block:

```typescript
import { createTestDocument, destroyTestDocument } from "primitive-app";
import type { TestGroup } from "primitive-app";
import { Task } from "@/models/Task";

const tests: TestGroup = {
  name: "Task CRUD",
  tests: [
    {
      id: "task-save",
      name: "Task save and query",
      run: async (log) => {
        const doc = await createTestDocument();
        try {
          const task = new Task({ title: "Test Task", priority: 1 });
          await task.save();

          const found = await Task.find(task.id);
          if (found?.title !== "Test Task") {
            throw new Error("Task not found or title mismatch");
          }

          log(`Saved and retrieved task ${task.id}`);
          return "passed";
        } finally {
          await destroyTestDocument(doc);
        }
      },
    },
  ],
};

export default tests;
```

`createTestDocument()` creates an isolated local-only document and sets it as the default for all model operations; `destroyTestDocument()` closes and evicts it. Tests that don't touch the database — pure logic, validation — skip the document lifecycle and just use the `(log) => ...` signature.

For a test that performs server-side operations on the document — a blob upload or collection membership, which fail against a local-only document — pass `createTestDocument({ networkSync: true })` for a server-resident document; `destroyTestDocument()` then deletes it server-side so test documents don't pile up.

To run: open the dev tools overlay, select **Test Harness**, choose tests, and click **Run Selected Tests**. Results show real-time log output, pass/fail status, and execution time.

Best practices:

- Keep business logic in `src/lib/` (not embedded in components) so it's easy to test
- Test real behavior — don't mock browser APIs
- Only create test documents when your test actually needs database operations, and always clean them up in a `finally` block
- Scope queries to the test document. `createTestDocument()` sets its document as the default, but a model query spans every open document — so an unscoped `Task.query({ ... })` can pick up records from other documents open in the session and return more than the test created. Pass `{ documents: doc.docId }` (a single id or an array) so the assertion sees only its own data:

```ts
const doc = await createTestDocument();
try {
  await new Task({ title: "High priority", priority: 2 }).save();
  const highPriority = await Task.query({ priority: 2 }, { documents: doc.docId });
  // highPriority sees only this test's records
} finally {
  await destroyTestDocument(doc);
}
```

#### Environment-scoped tests

Most tests run in both contexts. When a test depends on a browser API — canvas, `MediaRecorder` — or on something Node-only, scope it with `environment` on the test or the whole group (a test-level value overrides the group's):

```typescript
const tests: TestGroup = {
  name: "Waveform rendering",
  environment: "browser", // every test in this group
  tests: [
    {
      id: "wave-render",
      name: "Waveform renders to canvas",
      run: async (log) => {
        /* ... */
        return "passed";
      },
    },
  ],
};
```

Each context reports the other's tests as skipped: the panel shows node-only tests as skipped, and the headless run skips browser-only tests without failing CI.

#### Running tests headlessly (CI)

The same registered tests run in Node under `vitest run`, so `pnpm test` can gate merges — the client runs the full document and model lifecycle natively in Node. The template ships the wiring: a spec entry that registers every `.primitive-test.ts` file with the harness adapter, a `vitest.config.ts` that merges your app's Vite config so aliases and codegen resolve exactly as in the browser, and the `vitest` and `ws` dev dependencies.

```typescript
// src/tests/primitive-tests.spec.ts
import { registerPrimitiveTests } from "primitive-app/testing";
import { allModels } from "@/models";

await registerPrimitiveTests({
  models: allModels,
  testModules: import.meta.glob("./**/*.primitive-test.ts"),
  appId: import.meta.env.VITE_APP_ID,
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
});
```

The run signs in as a real user through the [test-account OTP bypass](./authentication.md#test-user-sign-in-for-automated-testing): whitelist a base address once, then point the run at a bypass address:

```bash
primitive apps update <your-app-id> --test-account-bases "you@yourdomain.com"
PRIMITIVE_TEST_EMAIL="you+primitivetest-ci@yourdomain.com" pnpm test
```

Use a stable suffix per CI project so the run reuses one test user instead of provisioning a fresh account every time. For CI report ingestion, vitest's standard reporters apply: `pnpm vitest run --reporter=junit --outputFile=test-results.xml`.

A few behaviors differ from the panel:

- A scored result below full marks (`"7/10 (70%)"`) **fails** the run — the panel displays the score without failing.
- A test file that fails to load surfaces as a failing test, never a silent skip.
- Each test gets a 60-second timeout.
- Leftover test documents are cleaned up after the run, and the bypass token lives about 30 minutes — split very long suites.

## iOS: The Debug Inspector

The Swift client ships a **Debug Inspector** — a small HTTP server that runs inside your app in DEBUG builds and serves a live dashboard to any browser on the same network. When `PrimitiveAppState.initialize()` runs, the console prints a banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[PrimitiveInspector] listening on:
  http://localhost:9999
  http://192.168.1.42:9999
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Open one of those URLs in a browser on your Mac. The simulator shares your Mac's loopback interface, so `localhost:9999` works directly; a physical iPhone needs to be on the same Wi-Fi (iOS will show a one-time Local Network permission prompt).

The inspector covers the same ground as the web overlay, plus iOS-specific storage views:

| Tab | What it shows |
|---|---|
| **Overview** | Connection state, current user, document summary, recent events |
| **Documents** | Document list + per-model records browser with CRUD (the iOS counterpart of the Document Explorer) |
| **Tests** | Registered in-app tests with streaming output (the counterpart of the Test Harness) |
| **Databases** | Server-side databases — raw record browsing for admins, registered operations for everyone |
| **Collections** | Collection CRUD, membership, and access |
| **Blobs** | Per-document file browser with upload, preview, and download (the counterpart of the Blob Explorer) |
| **Performance** | A live timeline of document load/sync events — what data loaded, from where, in how long |
| **SQLite / Memory SQL** | The client's on-disk store and the in-memory SQL projection that backs queries, browsable directly |
| **Events / Logs** | The live client event stream and the inspector's own log tail |

Your models appear in the Documents tab automatically — the inspector reads the client's shared cross-document store, so every model registered with the client (`client.registerModels([...])`) or read/written once through its codegen'd facade is listed, per open document. To register in-app tests, conform your app state to `InspectorTestHost`:

```swift
extension MyAppState: InspectorTestHost {
  var inspectorTests: [InspectorTest] {
    [
      InspectorTest(group: "Client", name: "is connected") { [weak self] ctx in
        guard let self, let client = self.client else { throw TestFailure(message: "no client") }
        try ctx.check(client.isConnected, "client is not connected")
      },
    ]
  }
}
```

Tests run on the main actor and can call real client methods — they're the fastest way to build a repro for a bug.

A few knobs: set `PRIMITIVE_DEBUG_INSPECTOR=0` in the environment to disable the inspector for a run, or `PRIMITIVE_DEBUG_INSPECTOR_PORT=9998` to pin a different port.

::: warning Dev networks only
The inspector has no authentication — any HTTP client on the same LAN can reach it. It only exists in DEBUG builds, but don't run debug builds on networks you don't trust.
:::

## Server Timing

Every REST response from the platform carries a `Server-Timing: total;dur=<milliseconds>` header, so your browser's Network panel (or any HTTP tooling) can attribute slow requests to server-side handler work.

## Production Behavior

Dev tools never reach your users: the web overlay and floating button are excluded when `import.meta.env.DEV` is false, and the entire iOS inspector module is inside an `#if DEBUG` guard — release builds compile it out and never open the port.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — The data you're inspecting
- **[Working with Databases](./working-with-databases.md)** — The server-side databases both inspectors can browse
- **[Deploying to Production](./deploying-to-production.md)** — Where dev tools don't appear
