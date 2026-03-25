# Agent Guide to DevTools: Document Explorer and Test Harness

Guidelines for AI agents using browser automation to validate data state and run tests in Primitive apps.

## Overview

Primitive apps include three browser-based development tools accessible via a floating DevTools button:

1. **Document Explorer** - Inspect and manipulate js-bao documents, models, and records
2. **Test Harness** - Run browser-based tests that exercise real CRUD operations
3. **Blob Explorer** - Browse, upload, download, and delete blobs attached to documents

DevTools are provided by the `primitiveDevTools` Vite plugin and only appear in development mode (`import.meta.env.DEV`). They are automatically excluded from production builds. Within development mode, the floating button only appears when a user is authenticated.

## Accessing DevTools

### Opening the DevTools Overlay

1. **Locate the floating DevTools button** - A small circular button showing the Primitive logo appears on one of the screen edges when authenticated. By default it is in the bottom-right corner, but users can drag it to any edge and its position is saved in localStorage.
2. **Click the DevTools button** - Opens a full-screen overlay. A short click opens the overlay; dragging repositions the button without opening it.
3. **Select a tool** - Use the left sidebar icons:
   - Document icon → Document Explorer
   - Clipboard/checklist icon → Test Harness
   - Cloud upload icon → Blob Explorer
4. **Close the overlay** - Click the X button or press Escape
5. **URL hash** - Opening the overlay pushes `#devtools` to the URL hash, so browser back/forward can close/reopen it. Refreshing with `#devtools` in the URL re-opens the overlay automatically.
6. **Keyboard shortcut** - If the app's `vite.config.ts` sets the `keyboardShortcut` option (e.g., `"cmd+shift+b"`), the overlay can be toggled with that shortcut. The floating button tooltip shows the shortcut hint.

### Vite Plugin Configuration

DevTools are enabled by the `primitiveDevTools` Vite plugin in `vite.config.ts`:

```typescript
import { primitiveDevTools } from "primitive-app/vite";

export default defineConfig({
  plugins: [
    vue(),
    primitiveDevTools({
      appName: "My App",           // Shown in the UI
      testsDir: "src/tests",       // Directory for test files (default: "src/tests")
      testPattern: "**/*.primitive-test.ts",  // Glob for test files (default)
      enabled: true,               // Whether to enable (default: true in dev)
      keyboardShortcut: "cmd+shift+b",  // Optional shortcut to toggle overlay
    }),
  ],
});
```

### Browser Automation Strategy

```
1. Navigate to any authenticated page (e.g., home page)
2. Wait for authentication to complete (DevTools button becomes visible)
3. Click the DevTools floating button
4. Wait for overlay to appear
5. Click the appropriate tab icon in the left sidebar
```

**Note:** The DevTools overlay is not a separate page or route. It's a DOM overlay teleported to `<body>` that appears on top of the current page. The `#devtools` hash fragment is used only for history navigation integration.

---

## Document Explorer

The Document Explorer allows inspection of all js-bao documents and their data. Use it to validate that CRUD operations have correctly modified document state.

### UI Structure

The Document Explorer has a two-panel layout:

**Left Panel - Document Sidebar:**
- Search input for filtering documents
- "Add Document" button for creating new documents
- Document list showing all accessible documents
- Each document shows: title, badges (Root, Owner, Editor, Viewer, Admin)
- Pagination controls for large document lists
- Per-document actions: rename (pencil icon), delete (trash icon)

**Right Panel - Content Area:**
- **Index View** (when a document is selected):
  - Document header with title, ID, and badges
  - "Add Record" dropdown for creating records
  - Model cards showing each model name and record count
  
- **Model View** (when a model card is clicked):
  - Header bar with back button, model name, record count
  - Model info button (shows schema details)
  - Data controls button (filtering/sorting)
  - "Show Hidden Fields" toggle
  - Add Record button
  - Mass Delete button
  - Data table with sortable columns
  - Row-level Edit and Delete buttons
  - Pagination controls

### Common Validation Tasks

#### Task 1: Verify a Record Exists

```
1. Open DevTools → Document Explorer
2. Select the target document from the sidebar
3. Click the model card (e.g., "Task", "Product")
4. Use column filters or data controls to find the specific record
5. Verify the record appears in the table with expected field values
```

**Browser automation steps:**
```
- Click DevTools button
- Wait for overlay
- Click Document Explorer tab (database icon)
- In sidebar, click on document by title or search for it
- Click on the model card matching your model name
- Read table contents to verify record exists
```

#### Task 2: Verify Record Count

```
1. Open DevTools → Document Explorer
2. Select the target document
3. Read the record count badge on the model card
   - Format: "ModelName (N)" where N is the count
4. Alternatively, click into the model and check pagination info
```

#### Task 3: Verify Field Values

```
1. Navigate to the model view (see Task 1)
2. Locate the record row in the table
3. Read individual cell values
4. For complex fields, click the Edit button to see full values in the edit dialog
```

#### Task 4: Filter Records

**Quick Filter (single column):**
```
1. In model view, find the column header
2. Click the filter icon on that column header
3. Select an operator (equals, contains, starts with, etc.)
4. Enter the filter value
5. Click "Add Filter"
```

**Advanced Filter (multiple conditions):**
```
1. Click the "Data Controls" button (shows active filter count badge)
2. Switch to "Filters" tab
3. Add multiple filter conditions
4. Each filter has: field selector, operator dropdown, value input
5. Click "Apply" to filter the table
```

**Available filter operators:**
- equals / not equals
- is null / is not null
- contains / not contains
- starts with / ends with
- in list / not in list
- greater than / less than (for numbers/dates)
- greater than or equal / less than or equal

#### Task 5: Sort Records

**Quick Sort:**
```
1. Click any column header
2. First click: ascending (↑)
3. Second click: descending (↓)
4. Third click: removes sort
```

**Multi-field Sort:**
```
1. Click "Data Controls" button
2. Switch to "Sort" tab
3. Add fields in priority order
4. Toggle ascending/descending for each
5. Drag to reorder priority
6. Click "Apply"
```

#### Task 6: Verify Record Was Deleted

```
1. Navigate to the model containing the deleted record
2. Search/filter for the record by its known ID or unique fields
3. Verify zero results appear
4. Check record count decreased by expected amount
```

#### Task 7: Inspect Model Schema

```
1. Navigate to the model view
2. Click the "Model Info" button (info icon)
3. Dialog shows:
   - Field definitions (name, type, indexed, default)
   - Indexes
   - Unique constraints
   - Relationships
   - Custom methods
```

### Document Explorer Element Identifiers

For browser automation, look for these UI patterns:

| Element | Identification Strategy |
|---------|------------------------|
| DevTools button | Circular floating button showing the Primitive logo, fixed to one screen edge (default: bottom-right corner; position is user-configurable and saved in localStorage) |
| Document Explorer tab | Document icon in left sidebar |
| Document list items | List items with document titles in left panel |
| Model cards | Cards showing model name and count badge |
| Data table | Table element with sortable headers |
| Edit button | Pencil/edit icon in table row |
| Delete button | Trash icon in table row |
| Filter icon | Filter icon on column headers |
| Data controls | Button with filter/sort count badge |
| Model info | Info icon button in header bar |
| Back button | Arrow-left icon in model view header |

---

## Test Harness

The Test Harness runs browser-based tests that exercise real js-bao operations with isolated ephemeral documents.

### Key Concepts

1. **Tests run in the browser** - Uses the same authenticated session as the app
2. **Document isolation** - Each test gets its own ephemeral local-only document (prefixed with `===TEST===`), set as the default document for all model operations
3. **Automatic cleanup** - Test documents are evicted (local-only removal, no server round-trip) after each test, even on failure
4. **Host app protection** - All host app documents are closed before the test run begins (`beginTestRun()`) and restored after all tests complete (`endTestRun()`)
5. **Leftover cleanup** - Any leftover test documents from a previous interrupted run are automatically cleaned up when a new run starts or when the overlay opens

### UI Structure

**Left Panel - Test Selection:**
- Master checkbox at the top (selects/deselects all tests)
- Bulk action bar appears when tests are selected, showing: selected count, "Clear" button, "Run" button (play icon)
- All tests are selected by default
- Test groups with:
  - Group-level checkbox (selects all tests in group) with selected/total count
  - Individual test checkboxes
  - Status indicators:
    - Clock (spinning) = running
    - Green checkmark = passed
    - Red X circle = failed
    - Blue percentage badge = scored test
  - Result badges: "Passed", "Failed", or score (e.g., "5/10 (50%)")
  - Clicking a test name focuses/filters the output log to that test's entries
- Summary footer showing total tests, group count, and pass/fail counts

**Right Panel - Test Output:**
- "Copy" button (copies all output)
- "Copy Failing Tests" button (copies only output from failed tests)
- "Clear" button (clears output and resets results)
- Monospace log area with timestamped entries
- Each log line shows: `HH:MM:SS AM/PM - message` (with `[test-id]` prefix for per-test log calls)
- Progress bar at the bottom during test runs showing current test name and completion count

### Running Tests

#### Basic Test Run

```
1. Open DevTools → Test Harness (clipboard/checklist icon)
2. All tests are selected by default. Adjust selection if needed:
   - Uncheck individual test checkboxes, OR
   - Uncheck group checkbox to deselect all tests in a group, OR
   - Uncheck the master checkbox at the top to deselect all
3. Click "Run" in the bulk action bar (appears when tests are selected)
4. Watch status indicators and progress bar update as tests run
5. Review output log for details
6. Check final status badges (Passed/Failed/Score)
```

#### Validating Test Results

**Check overall pass/fail:**
```
1. After run completes, look at status badges next to each test
2. Green "Passed" = success
3. Red "Failed" = failure
4. Blue score (e.g., "8/10 (80%)") = scored test
```

**Review failure details:**
```
1. Check the output log panel
2. Failed tests show error messages
3. Log entries are prefixed with test ID for filtering
4. Use "Copy" to capture full log, or "Copy Failing Tests" for only failed test output
```

**Verify specific assertions:**
```
1. Tests use log?.() calls to output progress
2. Read log to see intermediate values and checks
3. Error messages indicate which assertion failed
4. Click a test name in the left panel to focus/filter the output log to that test's entries
5. Click again to unfocus and see all output
```

### Writing Tests

Tests are TypeScript files in `src/tests/` with `.primitive-test.ts` extension.

#### Test File Structure

```typescript
// src/tests/myFeature.primitive-test.ts
import type { TestGroup } from "primitive-app";
import { MyModel } from "@/models/MyModel";

const myTests: TestGroup = {
  name: "My Feature Tests",  // Group name shown in UI
  tests: [
    {
      id: "unique-test-id",           // Must be unique across all tests
      name: "Human-readable name",     // Shown in UI
      run: async (ctx, log) => {
        // Test logic here
        // ctx.docId = ephemeral test document ID (set as default for model operations)
        // log?.("message") = output to test log

        // PASS: return a success message string
        return "Test passed successfully";

        // FAIL: throw an Error
        // throw new Error("Expected X but got Y");
      },
    },
  ],
};

// Both default exports and named exports are supported
export default myTests;
```

The Vite plugin discovers test files matching `**/*.primitive-test.ts` in the configured `testsDir` (default: `src/tests`). It handles both default exports and array exports.

#### Test Context

Each test receives:
- `ctx.docId` - The ephemeral local-only document ID created for this test. This document is automatically set as the default document via `client.setDefaultDocumentId(docId)`, so model operations like `save()` use it by default. You can also pass it explicitly with `save({ targetDocument: ctx.docId })`.
- `log` - Optional logging function (use `log?.("message")`)

#### Test Results

| Result Type | How to Produce | UI Display |
|-------------|----------------|------------|
| Pass | Return a string message | Green "Passed" badge |
| Fail | Throw an Error | Red "Failed" badge |
| Scored | Return string matching `"X/Y (Z%)"` pattern | Blue score badge |

#### Example: CRUD Test

```typescript
{
  id: "task-create-and-query",
  name: "Create task and query it back",
  run: async (ctx, log) => {
    log?.("Creating a new task...");

    const task = new Task({
      title: "Test task",
      priority: 1,
    });
    // ctx.docId is already set as the default document, but you can be explicit:
    await task.save({ targetDocument: ctx.docId });

    log?.(`Created task with ID: ${task.id}`);

    // Query it back
    const found = await Task.find(task.id as string);

    if (!found) {
      throw new Error("Task not found after save");
    }

    if (found.title !== "Test task") {
      throw new Error(`Expected title "Test task", got "${found.title}"`);
    }

    log?.("Task retrieved successfully");
    return "CRUD operations work correctly";
  },
}
```

#### Example: Validation Test

```typescript
{
  id: "task-invalid-priority",
  name: "Task rejects invalid priority",
  run: async (_ctx, log) => {
    const task = new Task({ title: "Test" });
    
    log?.("Attempting to set invalid priority...");
    
    try {
      task.setPriority(-1);
      throw new Error("Should have thrown for negative priority");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid")) {
        log?.("Correctly rejected invalid input");
        return "Validation works correctly";
      }
      throw err;
    }
  },
}
```

#### Example: Scored Test

```typescript
{
  id: "feature-compatibility",
  name: "Feature compatibility check",
  run: async (_ctx, log) => {
    let passed = 0;
    const total = 5;
    
    // Run 5 checks
    if (checkFeature1()) { passed++; log?.("Feature 1: ✓"); }
    if (checkFeature2()) { passed++; log?.("Feature 2: ✓"); }
    if (checkFeature3()) { passed++; log?.("Feature 3: ✓"); }
    if (checkFeature4()) { passed++; log?.("Feature 4: ✓"); }
    if (checkFeature5()) { passed++; log?.("Feature 5: ✓"); }
    
    const pct = ((passed / total) * 100).toFixed(1);
    return `${passed}/${total} (${pct}%)`;  // Shows as blue score badge
  },
}
```

### Test Harness Element Identifiers

For browser automation:

| Element | Identification Strategy |
|---------|------------------------|
| Test Harness tab | Clipboard/checklist icon in DevTools sidebar |
| Master checkbox | Checkbox at top of left panel (selects/deselects all) |
| Bulk action bar | Overlay showing "N selected", "Clear" button, "Run" button (appears when tests are selected) |
| Run button | Play icon button in the bulk action bar |
| Test group | Container with group name, checkbox, and selected/total count |
| Individual test | List item with checkbox, name, status icon; clickable to focus output |
| Running indicator | Spinning clock icon (blue) |
| Passed indicator | Green checkmark circle icon |
| Failed indicator | Red X circle icon |
| Scored indicator | Blue circle with "%" |
| Output log | Monospace text area in right panel |
| Copy button | "Copy" text button above output (copies all output) |
| Copy Failing Tests button | "Copy Failing Tests" text button above output |
| Clear button | "Clear" text button with trash icon above output |
| Progress bar | Bar at bottom of right panel during test run, showing current test and completion count |
| Summary footer | Bottom of left panel showing total tests, group count, and pass/fail counts |

---

## Blob Explorer

The Blob Explorer lets you browse, upload, download, and delete binary files (blobs) stored within documents.

### UI Structure

The Blob Explorer has a three-panel layout:

**Left Panel - Document Sidebar:**
- Document list showing all accessible documents (shares selection state with Document Explorer)
- Role badges per document

**Middle Panel - Blob Table:**
- Toolbar with: document title, blob ID search input, Refresh button, Upload button (write users only)
- Table columns: Filename, Content Type, Size, Uploaded, Blob ID
- Row hover actions: Download button, Delete button (write users only)
- Checkbox column for bulk selection (write users only; hidden for viewers/readers)
- Bulk action bar (appears when blobs are checked): shows count, Clear, and Delete buttons
- Server-side cursor-based pagination (10 / 25 / 50 / 100 per page, persisted in localStorage)
- Search mode: when a blob ID is typed, the table switches to exact server-side lookup; pagination is hidden

**Right Panel - Blob Detail (collapsible):**
- Only visible on large screens (≥ lg breakpoint) by default; toggle with the collapse button on the panel edge
- **Preview section** (images, PDFs, text/CSV files up to ~600 chars)
- **Actions section**: Download, Open in new tab (for browser-renderable types), Delete blob (write users only)
- **Info section**: Blob ID (click to copy), Filename, Content Type, Size, Uploaded date, SHA-256 hash (click to copy, if available)

### Common Tasks

#### Task 1: Browse Blobs in a Document

```
1. Open DevTools → Blob Explorer (cloud upload icon)
2. Select a document from the left sidebar
3. Blob table populates with the document's blobs (paginated)
4. Use Previous/Next and page-size selector to navigate
```

#### Task 2: Find a Blob by ID

```
1. Open DevTools → Blob Explorer
2. Select the target document
3. Type the blob ID into the search field in the toolbar
4. Table switches to exact-ID lookup — shows the matching blob or "No blob found"
5. Clear the search field to return to paginated list view
```

#### Task 3: Upload a Blob

```
1. Open DevTools → Blob Explorer (requires write access to document)
2. Select the target document
3. Click the "Upload" button in the toolbar
4. Select a file in the upload dialog
5. A progress bar appears at the bottom while uploading
6. Table refreshes automatically after upload completes
```

#### Task 4: Download a Blob

**From the table row (hover actions):**
```
1. Hover over any blob row
2. Click the download icon that appears on the right
```

**From the detail panel:**
```
1. Click a blob row to open the right detail panel
2. Click "Download" in the Actions section
```

#### Task 5: Delete a Blob

**Single delete (row action):**
```
1. Hover over the blob row
2. Click the trash icon (write users only)
3. Confirm in the confirmation dialog
```

**Single delete (detail panel):**
```
1. Click a blob row to open the right detail panel
2. Click "Delete blob" in the Actions section (write users only)
3. Confirm in the confirmation dialog
```

**Bulk delete:**
```
1. Check one or more blob rows using the checkboxes (write users only)
2. A bulk action bar appears in the toolbar showing selected count
3. Click "Delete" in the bulk action bar
4. Confirm in the confirmation dialog
```

#### Task 6: Verify Blob Exists

```
1. Navigate to Blob Explorer and select the target document
2. Search for the blob by its ID using the search field
3. If the blob exists, it appears in the table
4. If not found, "No blob found with that ID" is shown
```

#### Task 7: View Blob Details / Metadata

```
1. Click a blob row — the right detail panel opens
2. Read Blob ID, Filename, Content Type, Size, Uploaded date, SHA-256
3. Click the Blob ID or SHA-256 to copy to clipboard
```

### Blob Explorer Element Identifiers

For browser automation:

| Element | Identification Strategy |
|---------|------------------------|
| Blob Explorer tab | Cloud upload icon in DevTools left sidebar |
| Blob ID search | Text input in middle panel toolbar |
| Upload button | "Upload" button in toolbar (write users) |
| Refresh button | Circular arrow icon in toolbar |
| Blob table rows | Table rows with filename, content type, size, date, blob ID |
| Row download button | Download arrow icon (appears on row hover) |
| Row delete button | Trash icon (appears on row hover, write users only) |
| Checkbox column | Checkboxes on left of rows (write users only) |
| Bulk action bar | Overlay in toolbar showing "N selected", Clear, Delete |
| Pagination controls | Previous / Next buttons + page-size selector in table footer |
| Right detail panel | Panel on right edge of the Blob Explorer |
| Collapse toggle | Small arrow button on the left edge of the detail panel |
| Preview area | "Preview" section in detail panel |
| Actions area | "Actions" section in detail panel |
| Info area | "Info" section with Blob ID, Filename, Content Type, etc. |

---

## Browser Console Debugging (for Agents)

When running locally (localhost), primitive-app exposes the js-bao client and registered models on the `window` object for interactive debugging. Agents can use browser automation tools to execute JavaScript in the console and query live data.

**Available globals (localhost only):**

- `window.__primitiveAppClient` - The initialized js-bao client instance
- `window.__primitiveAppModels` - Object containing all registered model classes, keyed by PascalCase name

**Example console commands:**

```javascript
// List available models
Object.keys(window.__primitiveAppModels)
// → ["Task", "Product", "UserPref"]

// Query all records of a model (returns { data: [...], ... })
await window.__primitiveAppModels.Task.query({})

// Query with filters
await window.__primitiveAppModels.Task.query({ completed: false })

// Query with operators
await window.__primitiveAppModels.Task.query({ priority: { $gte: 3 } })

// Get a single record by ID
await window.__primitiveAppModels.Task.find('some-id')

// Count records
await window.__primitiveAppModels.Task.count({ completed: false })

// Create and save a new record (targetDocument required for new records)
const task = new window.__primitiveAppModels.Task({ title: 'Debug task', priority: 1 })
await task.save({ targetDocument: 'document-id-here' })

// Access client methods (auth, documents, etc.)
await window.__primitiveAppClient.auth.getCurrentUser()
await window.__primitiveAppClient.documents.list()
```

These globals are only available in debug environments (localhost, 127.0.0.1, [::1], *.localhost, *.local) and are not exposed in production builds.

---

## Browser Automation Best Practices

### General Tips

1. **Wait for elements** - DevTools overlay and its contents load asynchronously
2. **Use incremental waits** - Check for element presence in short intervals rather than one long wait
3. **Verify state before acting** - Ensure previous action completed before next step
4. **Take snapshots** - Capture page state before and after critical operations

### Recommended Workflow for Validation

```
1. Perform application action (create/update/delete via app UI)
2. Open DevTools → Document Explorer
3. Navigate to relevant model
4. Apply filters if needed to locate specific record
5. Read and verify field values
6. Close DevTools overlay
```

### Recommended Workflow for Running Tests

```
1. Navigate to authenticated page
2. Open DevTools → Test Harness
3. All tests are selected by default; deselect any you don't want to run
4. Click "Run" in the bulk action bar
5. Wait for progress bar to complete and all status indicators to show final state (not spinning)
6. Read final status badges and summary footer
7. If failures, click a failed test name to focus its output, or use "Copy Failing Tests"
8. Close DevTools overlay
```

### Handling Asynchronous Operations

- **Document switching** - Wait for document sidebar to update after selection
- **Record filtering** - Wait for table to re-render after applying filters
- **Test execution** - Wait for spinning indicators to stop before reading results
- **CRUD operations** - The Document Explorer auto-refreshes when data changes

### Error Recovery

- If DevTools overlay doesn't open, ensure user is authenticated and the app is running in development mode
- If Document Explorer shows no documents, wait for document list to load
- If tests fail to run, ensure at least one test is selected (the "Run" button only appears in the bulk action bar when tests are selected)
- If test hangs, check for infinite loops in test code; tests run with no timeout by default
- If the overlay shows "Initialization Failed", click "Retry" -- this usually means leftover test document cleanup failed
