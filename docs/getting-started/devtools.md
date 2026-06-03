# Dev Tools

Primitive includes browser-based development tools for inspecting data, managing files, and running tests. They're provided by the `primitiveDevTools` Vite plugin and only appear in development mode.

::: info Web (Vite) only
This overlay is part of the web template's Vite tooling. Swift/iOS apps use the Swift client's built-in **Debug Inspector** instead (registered automatically when you create typed models through `PrimitiveAppState`) — the examples on this page are Vite/JavaScript-specific.
:::

## Accessing Dev Tools

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

## Document Explorer

Inspect and manage documents and data records.

### Document Sidebar
The left panel lists all documents you have access to (owned and shared), with search, pagination, and permission badges (Owner, Editor, Viewer).

### Document Actions
For documents you own: create, rename, delete, and mass-delete. Shared documents can only be deleted by their owner.

### Data Table
Select a document to see all registered models with record counts. Click a model to view its records in a filterable, sortable data table.

**Filtering:** Add multiple filters with operators (equals, contains, starts with, greater than, is null, etc.).

**Sorting:** Click column headers for quick sorting, or use multi-field sorting with drag-to-reorder priority.

**CRUD:** Create records with type-aware form editors (text, boolean toggles, date pickers, StringSet tag editors), edit existing records, and delete individually or in batch.

### Model Info
Click the info icon on any model to view its schema: fields, types, indexes, unique constraints, relationships, and methods.

## Blob Explorer

Browse and manage files stored with your documents.

### Three-Panel Layout
- **Left:** Document list (shared with Document Explorer)
- **Middle:** Blob table showing filename, size, and content type
- **Right:** Detail view with preview, metadata, and actions

### Features
- Search blobs by filename and filter by content type
- Upload new files directly
- Preview images and other supported types
- Copy download URLs for testing
- Delete individual or multiple blobs

## Test Harness

Run automated tests against your business logic in the actual browser environment — with real IndexedDB, the Primitive sync layer, and Vue reactivity.

### Why Browser Tests?
Local-first apps depend on browser APIs (IndexedDB, WebSocket) that don't exist in Node.js. The test harness runs tests in the same environment as your app, so you test real behavior.

### Writing Tests

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

Each test's `run` function receives a `log` callback for debug output and returns a string result.

### Tests That Need a Document

Tests that perform model operations (`.save()`, `.query()`, `.find()`, `.delete()`) need an ephemeral test document. Use `createTestDocument()` and `destroyTestDocument()` with a try/finally block:

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

`createTestDocument()` creates an isolated local-only document and sets it as the default for all model operations. `destroyTestDocument()` closes and evicts it. The `finally` block ensures cleanup even if the test throws.

Tests that don't touch the database — pure logic, validation, in-memory model instances — skip the document lifecycle entirely and just use the `(log) => ...` signature.

### Running Tests
1. Click the dev tools button and select **Test Harness**
2. Select tests to run (all are selected by default)
3. Click **Run Selected Tests**

Results show real-time log output, pass/fail status, execution time, and score summaries.

### Best Practices
- Keep business logic in `src/lib/` (not embedded in components) so it's easy to test
- Test real behavior — don't mock browser APIs
- Use `log()` for debugging output visible in the test results
- Only create test documents when your test actually needs database operations
- Always clean up test documents in a `finally` block

### Migrating from `primitive-app` &lt; 3.0

If upgrading from an earlier version of `primitive-app`, the test harness API has changed:

| Before | After |
|---|---|
| `run: async (ctx, log?) => { ... }` | `run: async (log) => { ... }` |
| `ctx.docId` provided automatically | Call `createTestDocument()` / `destroyTestDocument()` explicitly |
| `log` was optional (`log?.()`) | `log` is always provided (`log()`) |
| `TestDocContext` type | Removed |

For CRUD tests, replace the `ctx` parameter with explicit document lifecycle:

```typescript
// Before
run: async (ctx, log?) => {
  const task = new Task({ title: "test" });
  await task.save();
  log?.("saved");
  return "passed";
}

// After
run: async (log) => {
  const doc = await createTestDocument();
  try {
    const task = new Task({ title: "test" });
    await task.save();
    log("saved");
    return "passed";
  } finally {
    await destroyTestDocument(doc);
  }
}
```

For pure-logic tests, remove the unused `ctx` parameter and the optional chaining on `log`:

```typescript
// Before
run: async (_ctx, log?) => {
  log?.("testing...");
  return "passed";
}

// After
run: async (log) => {
  log("testing...");
  return "passed";
}
```

## Server Timing

Every REST response from the app and admin APIs carries a `Server-Timing: handler;dur=<milliseconds>` header so the browser's Network panel can attribute slow requests to server-side handler work. The CORS configuration exposes the header so cross-origin clients can read it too.

## Production Behavior

Dev tools are automatically excluded from production builds — the floating button and overlay won't appear when `import.meta.env.DEV` is false.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — The data you're inspecting
- **[Working with Data](./working-with-documents.md#crud-operations)** — CRUD operations to test
- **[Deploying to Production](./deploying-to-production.md)** — Where dev tools don't appear
