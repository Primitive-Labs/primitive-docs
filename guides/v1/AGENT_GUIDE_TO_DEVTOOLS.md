# Agent Guide to DevTools: Document Explorer and Test Harness

Guidelines for AI agents using browser automation to validate data state and run tests in Primitive apps.

## Overview

Primitive apps include two browser-based development tools accessible via a floating DevTools button:

1. **Document Explorer** - Inspect and manipulate js-bao documents, models, and records
2. **Test Harness** - Run browser-based tests that exercise real CRUD operations

Both tools require authentication. The DevTools button only appears when a user is signed in.

## Accessing DevTools

### Opening the DevTools Overlay

1. **Locate the floating DevTools button** - A small button appears in the bottom-right corner of the screen when authenticated
2. **Click the DevTools button** - Opens a full-screen overlay
3. **Select a tool** - Use the left sidebar icons:
   - Database icon → Document Explorer
   - Flask icon → Test Harness
4. **Close the overlay** - Click the X button or press Escape

### Browser Automation Strategy

```
1. Navigate to any authenticated page (e.g., home page)
2. Wait for authentication to complete (DevTools button becomes visible)
3. Click the DevTools floating button
4. Wait for overlay to appear
5. Click the appropriate tab icon in the left sidebar
```

**Note:** The DevTools overlay is not accessed via a URL route. It's a DOM overlay that appears on top of the current page.

---

## Document Explorer

The Document Explorer allows inspection of all js-bao documents and their data. Use it to validate that CRUD operations have correctly modified document state.

### UI Structure

The Document Explorer has a two-panel layout:

**Left Panel - Document Sidebar:**
- Search input for filtering documents
- "Add Document" button for creating new documents
- Document list showing all accessible documents
- Each document shows: title, badges (Root, Active, Owner, Editor, Viewer)
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
| DevTools button | Floating button in bottom-right corner |
| Document Explorer tab | Database/cylinder icon in left sidebar |
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
2. **Document isolation** - Each test gets its own ephemeral document (prefixed with `===TEST===`)
3. **Automatic cleanup** - Test documents are deleted after each test
4. **Host app protection** - App documents are closed during test runs and restored afterward

### UI Structure

**Left Panel - Test Selection:**
- "Select All" / "Deselect All" buttons
- "Run Selected" button (play icon)
- Test groups with:
  - Group-level checkbox (selects all tests in group)
  - Individual test checkboxes
  - Status indicators:
    - Clock (spinning) = running
    - Green checkmark = passed
    - Red alert = failed
    - Blue percentage badge = scored test
  - Result badges: "Passed", "Failed", or score (e.g., "5/10 (50%)")

**Right Panel - Test Output:**
- "Clear Output" button
- "Copy Output" button
- Monospace log area with timestamped entries
- Each log line shows: `[HH:MM:SS.mmm] [test-id] message`

### Running Tests

#### Basic Test Run

```
1. Open DevTools → Test Harness (flask icon)
2. Select tests:
   - Check individual test checkboxes, OR
   - Check group checkbox to select all tests in a group, OR
   - Click "Select All" for all tests
3. Click "Run Selected" (play button)
4. Watch status indicators update as tests run
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
4. Use "Copy Output" to capture full log
```

**Verify specific assertions:**
```
1. Tests use log?.() calls to output progress
2. Read log to see intermediate values and checks
3. Error messages indicate which assertion failed
```

### Writing Tests

Tests are TypeScript files in `src/tests/` with `.primitive-test.ts` extension.

#### Test File Structure

```typescript
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
        // ctx.docId = ephemeral test document ID
        // log?.("message") = output to test log
        
        // PASS: return a success message string
        return "Test passed successfully";
        
        // FAIL: throw an Error
        // throw new Error("Expected X but got Y");
      },
    },
  ],
};

export default myTests;
```

#### Test Context

Each test receives:
- `ctx.docId` - The ephemeral document ID created for this test
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
  run: async (_ctx, log) => {
    log?.("Creating a new task...");
    
    const task = new Task({
      title: "Test task",
      priority: 1,
    });
    await task.save();
    
    log?.(`Created task with ID: ${task.id}`);
    
    // Query it back
    const found = await Task.find(task.id);
    
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
| Test Harness tab | Flask/beaker icon in DevTools sidebar |
| Select All button | Button labeled "Select All" |
| Deselect All button | Button labeled "Deselect All" |
| Run Selected button | Play icon button |
| Test group | Container with group name and checkbox |
| Individual test | List item with checkbox, name, status icon |
| Running indicator | Spinning clock icon |
| Passed indicator | Green checkmark icon |
| Failed indicator | Red alert/X icon |
| Output log | Monospace text area in right panel |
| Clear Output | Trash icon button above output |
| Copy Output | Copy icon button above output |

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
3. Select target tests (group or individual)
4. Click Run Selected
5. Wait for all status indicators to show final state (not spinning)
6. Read final status badges
7. If failures, capture output log for debugging
8. Close DevTools overlay
```

### Handling Asynchronous Operations

- **Document switching** - Wait for document sidebar to update after selection
- **Record filtering** - Wait for table to re-render after applying filters
- **Test execution** - Wait for spinning indicators to stop before reading results
- **CRUD operations** - The Document Explorer auto-refreshes when data changes

### Error Recovery

- If DevTools overlay doesn't open, ensure user is authenticated
- If Document Explorer shows no documents, wait for document list to load
- If tests fail to run, ensure at least one test is selected
- If test hangs, check for infinite loops in test code; tests run with no timeout by default
