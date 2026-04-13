# Dev Tools

Primitive includes browser-based development tools for inspecting data, managing files, and running tests. They're provided by the `primitiveDevTools` Vite plugin and only appear in development mode.

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

Create test files with the `.primitive-test.ts` suffix in your tests directory:

```typescript
// src/tests/myFeature.primitive-test.ts
import type { TestGroup } from "primitive-app";
import { Task } from "@/models/Task";

export const taskTestGroup: TestGroup = {
  name: "Task Operations",
  tests: [
    {
      id: "task-crud",
      name: "can create and query tasks",
      async run(ctx, log?): Promise<string> {
        // ctx.docId is an auto-created isolated test document
        const task = new Task({ title: "Test Task", priority: 1 });
        await task.save({ targetDocument: ctx.docId });

        const found = await Task.find(task.id as string);
        if (found?.title !== "Test Task") {
          throw new Error("Task not found or title mismatch");
        }

        log?.("Task created and retrieved successfully");
        return "1/1 (100.0%)";
      },
    },
  ],
};
```

### Test Isolation
The harness automatically creates an isolated test document for each test (`ctx.docId`) and cleans it up afterward, even if the test throws. If you create additional documents, clean them up in a `finally` block.

### Running Tests
1. Click the dev tools button and select Test Runner
2. Select tests to run (all are selected by default)
3. Click **Run Selected Tests**

Results show real-time log output, pass/fail status, execution time, and score summaries.

### Best Practices
- Keep business logic in `src/lib/` (not embedded in components) so it's easy to test
- Test real behavior — don't mock browser APIs
- Use `log?.()` for debugging output
- Return scores in `passed/total (percentage%)` format

## Production Behavior

Dev tools are automatically excluded from production builds — the floating button and overlay won't appear when `import.meta.env.DEV` is false.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — The data you're inspecting
- **[Working with Data](./working-with-documents.md#crud-operations)** — CRUD operations to test
- **[Deploying to Production](./deploying-to-production.md)** — Where dev tools don't appear
