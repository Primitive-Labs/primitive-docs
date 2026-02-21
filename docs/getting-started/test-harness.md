# Browser-Based Test Harness

Primitive provides a built-in browser-based test harness for running automated tests against your application logic. Unlike traditional unit tests that run in Node.js, these tests execute in the actual browser environment—giving you confidence that your code works with real browser APIs, IndexedDB, and the Primitive sync layer.

## Why Browser-Based Tests?

Local-first apps have unique testing challenges:

- **IndexedDB** — Your data lives in the browser's IndexedDB, which doesn't exist in Node.js
- **Sync behavior** — Testing real sync operations requires the actual client connection
- **Vue reactivity** — Stores and composables need the full Vue runtime
- **Offline scenarios** — Testing offline behavior requires the real browser environment

The test harness solves these by running tests in the same environment as your app.

## What This Harness Is For

The test harness is designed for **testing business logic**, not UI interactions. It's ideal for testing:

- Data transformations and calculations
- Model validation and business rules
- Store actions and state management
- Integration with the Primitive sync layer
- Utility functions and helpers

For UI testing (clicking buttons, filling forms, visual regression), use dedicated tools like Playwright or Cypress instead.

::: tip Keep Business Logic Testable
We recommend keeping as much business logic as possible **outside of Vue components** and in `src/lib/` files. Functions in `/lib` can be easily imported and tested with this harness, while logic embedded in components is harder to test in isolation.

```
src/
├── components/     # Keep these thin - mostly template and UI state
├── lib/            # Business logic lives here - easy to test
│   ├── pricing.ts
│   ├── validation.ts
│   └── transforms.ts
├── models/         # Data models - testable via the harness
└── tests/          # Your test files
```

This separation makes your code more testable and keeps components focused on presentation.
:::

## Accessing the Test Harness

The debugging suite is available at `/debug` in your app. Navigate there while logged in to access:

- **Test Runner** — Run automated tests and view results
- **Document Debugger** — Explore and manage all data in your documents

## Setting Up Tests

### 1. Create a Test File

Create your test files in `src/tests/`. Each file exports a `PrimitiveTestGroup`:

```typescript
// src/tests/myFeatureTests.ts
import type { TestGroup } from "primitive-app";

export const myFeatureTestGroup: TestGroup = {
  name: "My Feature",
  tests: [
    {
      id: "my-feature-basic",
      name: "basic functionality works",
      async run(ctx, log?): Promise<string> {
        log?.("Starting test...");
        // ctx.docId is the automatically-created test document ID

        // Your test logic here
        const result = myFunction();

        if (result !== expected) {
          throw new Error(`Expected ${expected}, got ${result}`);
        }

        log?.("Test passed!");
        return "1/1 (100.0%)"; // Return score in this format
      },
    },
  ],
};
```

### 2. Create a Test Index

Group your test exports in `src/tests/index.ts`:

```typescript
// src/tests/index.ts
import type { TestGroup } from "primitive-app";
import { myFeatureTestGroup } from "./myFeatureTests";
import { userStoreTestGroup } from "./userStoreTests";

export const appTestGroups: TestGroup[] = [
  userStoreTestGroup,
  myFeatureTestGroup,
];
```

### 3. Configure the Vite Plugin

The test harness is provided by the `primitiveDevTools` Vite plugin. Configure it in your `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { primitiveDevTools } from "primitive-app/vite";

export default defineConfig({
  plugins: [
    vue(),
    primitiveDevTools({
      appName: "My App",
      testsDir: "src/tests",  // Directory containing your test files
    }),
  ],
});
```

The plugin automatically:
- Discovers test files matching `**/*.primitive-test.ts` in your tests directory
- Adds a floating button (in dev mode) to open the dev tools overlay
- Provides both the test runner and document explorer UIs

::: tip File Naming
Name your test files with the `.primitive-test.ts` suffix so the plugin can discover them automatically:
- `src/tests/myFeature.primitive-test.ts`
- `src/tests/userStore.primitive-test.ts`
:::

## Writing Tests

### Test Structure

Each test has three key properties:

| Property | Description |
|----------|-------------|
| `id` | Unique identifier for the test |
| `name` | Human-readable name shown in the UI |
| `run` | Async function that executes the test |

The `run` function receives a `ctx` object (with `ctx.docId` — the auto-created test document ID) and an optional `log` callback for outputting progress messages. It should return a result string: either a plain message for a pass, or a score in the format `passed/total (percentage%)`.

### Using Stores in Tests

You can use Pinia stores directly in your tests (these are local files in your project from the template):

```typescript
// Import from your local stores (included in the template)
import { useUserStore } from "@/stores/userStore";

{
  id: "user-pref-read",
  name: "can read user preferences",
  async run(ctx, log?): Promise<string> {
    const user = useUserStore();
    
    log?.("Reading preferences from userStore...");
    const prefs = user.getAllPrefs();
    log?.(`Retrieved ${Object.keys(prefs).length} preference(s)`);
    
    return "1/1 (100.0%)";
  },
}
```

### Testing with Documents

The test harness automatically creates an isolated test document for each test and provides its ID via `ctx.docId`. Use it as the target for saving model data—no manual document creation or cleanup needed.

```typescript
import { Product } from "@/models/Product";

{
  id: "product-crud",
  name: "can create and read products",
  async run(ctx, log?): Promise<string> {
    let passed = 0;
    const total = 3;

    // Use ctx.docId — the auto-created, isolated test document
    const product = new Product({ name: "Test Product", quantity: 10 });
    await product.save({ targetDocument: ctx.docId });

    if (product.id) {
      log?.("✓ Product created with ID");
      passed++;
    }

    // Read it back
    const retrieved = await Product.find(product.id as string);

    if (retrieved?.name === "Test Product") {
      log?.("✓ Product name matches");
      passed++;
    }

    if (retrieved?.quantity === 10) {
      log?.("✓ Product quantity matches");
      passed++;
    }

    return `${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`;
  },
}
```

The test document is automatically deleted after each test, even if the test throws. If a test needs additional documents beyond the one in `ctx`, create them manually and clean them up in a `finally` block.

### Scoring Format

The test runner recognizes score strings in the format `passed/total (percentage%)`:

```typescript
// Helper function for consistent scoring
function formatScore(passed: number, total: number): string {
  const percentage = total === 0 ? 100 : (passed / total) * 100;
  return `${passed}/${total} (${percentage.toFixed(1)}%)`;
}

// Use it in your tests
return formatScore(3, 3); // "3/3 (100.0%)"
```

Tests that return a score are marked as "scored" in the UI, showing both pass/fail and the detailed breakdown.

## Running Tests

1. Navigate to `/debug` in your app
2. Click **Test Runner**
3. Select the tests you want to run (all are selected by default)
4. Click **Run Selected Tests**

The test runner executes tests sequentially and displays:

- Real-time log output
- Pass/fail status for each test
- Execution time
- Final score summary

## Best Practices

### Isolate Test Data

Use unique tags or identifiers to isolate test data from real user data:

```typescript
function uniqueTag(base: string): string {
  return `${base}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const tag = uniqueTag("test_product");
```

### Clean Up After Tests

Always clean up test documents and data, even if the test fails:

```typescript
async run(ctx, log?): Promise<string> {
  const extraDocIds: string[] = [];

  try {
    // ctx.docId is already provided and cleaned up automatically.
    // Only create additional documents if your test truly needs more than one.
    const doc = await documentsStore.createDocument("Extra Test Doc", [tag]);
    extraDocIds.push(doc.documentId);

    // ... test logic ...

  } finally {
    // Clean up any extra documents you created
    for (const docId of extraDocIds) {
      await documentsStore.deleteDocument(docId).catch(() => {});
    }
  }
}
```

### Use Descriptive Logging

The `log` callback helps debug test failures:

```typescript
log?.("Creating document with specific configuration...");
log?.(`Document created: ${doc.documentId}`);
log?.("✓ Document has expected tags");
log?.("✗ Document missing required tag");
```

### Test Real Behavior

Since tests run in the browser, test actual behavior rather than mocking:

```typescript
// ✅ Test actual store behavior
const user = useUserStore();
const pref = user.getPref("theme", "light");

// ❌ Don't mock browser APIs
// jest.mock('indexeddb')  // Not needed - use the real thing
```

## Next Steps

- **[Working with Data](./working-with-data.md)** — Learn about data models to test
- **[Understanding Documents](./understanding-documents.md)** — Understand document-based data organization
