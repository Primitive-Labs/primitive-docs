# Agent Guide to DevTools: Document Explorer and Test Harness

How AI agents use Primitive's browser-based DevTools to validate state and run tests.

## Overview

Primitive apps include three browser-based tools, accessible via a floating
DevTools button:

1. **Document Explorer** — inspect/manipulate js-bao documents, models, records
2. **Test Harness** — run browser-based tests with isolated ephemeral documents
3. **Blob Explorer** — browse, upload, download, delete blobs in documents

Provided by the `primitiveDevTools` Vite plugin. Active only when:

- `vite` is running in dev mode (`command === "serve"`), AND
- `enabled !== false`, AND
- The user is authenticated (button only shows after auth)

Excluded from production builds.

## Setup

Add the plugin in `vite.config.ts`:

```typescript
import { primitiveDevTools } from "primitive-app/vite";

export default defineConfig({
  plugins: [
    vue(),
    primitiveDevTools({
      appName: "My App",                       // Shown in header
      testsDir: "src/tests",                   // default
      testPattern: "**/*.primitive-test.ts",   // default
      enabled: true,                           // default true in dev
      keyboardShortcut: "cmd+shift+b",         // optional toggle
    }),
  ],
});
```

The plugin is loaded at Vite config time (Node), so `primitiveDevTools` MUST
be imported from `"primitive-app/vite"`, NOT from `"primitive-app"`.

```typescript
// WRONG — this entry point is browser-only and will fail at config time
import { primitiveDevTools } from "primitive-app";

// CORRECT
import { primitiveDevTools } from "primitive-app/vite";
```

## Opening DevTools

1. Wait for authentication (the floating Primitive-logo button only appears
   when `client.isAuthenticated()` is true).
2. The button is by default at the bottom-right corner; users can drag it to
   any edge. Position is saved in localStorage. Short click opens; drag moves.
3. Opening pushes `#devtools` to the URL hash. Refreshing with `#devtools`
   re-opens automatically. Browser back/forward open/close.
4. Close: click the X in the header, or press Escape.
5. Optional `keyboardShortcut` toggles the overlay.

The overlay is a DOM element teleported to `<body>`, NOT a route. It covers
the current page; the underlying app keeps running.

The active tab (`documents` / `tests` / `blobs`) is persisted to localStorage
under `primitive-devtools-active-tab`.

### Browser automation flow

```
1. Navigate to any page in the dev-mode app
2. Wait for auth → floating button appears
3. Click the floating button (avoid drag — keep movement under 3px)
4. Click a sidebar icon to switch tabs:
   - Document icon → Document Explorer
   - Clipboard/checklist icon → Test Harness
   - Cloud-upload icon → Blob Explorer
```

---

## Document Explorer

Three-panel unified view (no "index → model card" drilldown):

- **Left panel** — Document sidebar: search, "Add Document" button,
  document list, pending invitations, "Mass Delete Owned" action.
  Each row shows the document title plus a badge: `root` (amber) or
  permission label `Owner` / `Editor` / `Viewer`.
- **Middle panel** — Records table. Header has a "{ModelName} model"
  dropdown (switch model), an info button (toggles a Schema /
  Relationships / Methods / Indexes / Unique Constraints panel), and a
  "New {ModelName}" button (write users only). Below the header is a
  Filter Bar (filter chips + "Add filter" button), the records table,
  and pagination.
- **Right panel** — Document properties (only ≥ lg breakpoint by default,
  collapsible). Shows title, document ID (click to copy), created date,
  permission, tags, aliases, sharing, and a **Models** summary listing each
  model with `>0` records as a clickable name plus record count. Clicking
  a model name navigates the middle panel to that model.

### Common tasks

#### Verify a record exists

```
1. Sidebar → click target document
2. Middle panel header → click the "{ModelName} model" dropdown → choose model
   (or click the model name in the right-panel Models summary)
3. Use the Filter Bar to narrow down (see "Filtering")
4. Read the table rows
```

#### Verify record count

```
- Right panel → "Models" section shows "{count} records" per model
- Or middle panel → pagination footer shows total
- Or model selector dropdown → each entry shows its count
```

#### Verify field values

```
1. Navigate to model view (above)
2. Read cell values directly, OR
3. Click the row Edit (pencil) icon for full values in the edit dialog
```

#### Filtering

The Filter Bar sits below the model header. There is no per-column filter
icon.

```
1. Click "Add filter"
2. Field dropdown: pick the field
3. Operator dropdown: equals / not equals / is null / is not null /
   contains / not contains / starts with / ends with / in list / not in list /
   > / >= / < / <=
4. Value input (hidden for is_null/is_not_null; boolean shows a select;
   number uses a number input; "in list"/"not in list" take comma-separated)
5. Click "Add" (or "Save" when editing an existing chip)
6. Click an existing filter chip to edit it; click its X to remove;
   "Clear all" clears the bar
```

Operators offered are filtered by field type:

- `string` → all
- `id` → equals/not_equals/is_null/is_not_null/in/not_in
- `number` → equality, list, gt/gte/lt/lte
- `boolean` → equality + null only
- `date` → equality + null + comparison (no text ops)
- `stringset` → equality + null + contains/not_contains + in/not_in

Filters are persisted per model in localStorage.

#### Sorting

Single-field only, via column header click. Sorting is **only allowed on
indexed fields** — clicking a non-indexed column header does nothing.

```
- 1st click on column header → ascending
- 2nd click → descending
- 3rd click → cleared (default id sort)
```

There is no separate "Sort tab" or multi-field sort UI.

#### Inspect schema / methods / indexes

```
1. Open a model in the middle panel
2. Click the info icon next to the model dropdown (title: "Show model properties")
3. Expandable panel reveals: Schema fields + types, Relationships,
   Instance/Static methods + getters, Indexes, Unique Constraints
```

#### Verify a record was deleted

```
1. Navigate to the model
2. Filter by id (operator "equals", value = the deleted ID), OR scroll
3. Confirm zero results / count decreased
```

### Element-identification cheat sheet

| Element | How to find it |
|---|---|
| DevTools floating button | `<button class="pdt-btn">` containing the Primitive logo image, fixed-position to one screen edge |
| Tab icons | Left icon bar in overlay; `title="Document Explorer" | "Test Harness" | "Blob Explorer"` |
| Document row | Left panel; text = title; trailing badge = `root` or `Owner`/`Editor`/`Viewer` |
| Add Document | Button in left panel header (write-permitted users only) |
| Model selector | Middle-panel header button: text "{ModelName} model ▾" |
| Schema/info toggle | Icon button next to model selector; `title="Show model properties"` |
| New Record | Primary button in middle-panel header right side; text "New {ModelName}" (write users) |
| Filter Bar | Strip below model header; "Add filter" button + chip list |
| Row edit / delete | Per-row icons in the data table (pencil / trash) |
| Bulk delete records | Selection action bar replaces model header when rows are checked; shows "{N} selected", Clear, Delete |
| Pagination | Footer of middle panel |
| Right-panel collapse | Arrow on the panel edge (≥ lg breakpoint only) |
| Dropdowns/modals | Tagged with `data-devtools-dropdown` / `data-devtools-modal` so Escape lets them handle the key first |

---

## Test Harness

Runs `.primitive-test.ts` files in the same authenticated session as the
host app. Key invariants:

1. **Per-test ephemeral document.** Before each test, the harness creates a
   local-only document titled `===TEST=== {timestamp}-{random}`, opens it
   with `enableNetworkSync: false`, and calls `client.setDefaultDocumentId(docId)`.
   Model operations like `.save()`, `.find()`, `.query()` use it implicitly.
2. **Document isolation between tests.** After each test (success or failure),
   the test document is closed and `evict()`ed (no server round-trip — they
   are local-only).
3. **Host-app docs are quiesced.** `beginTestRun()` closes every currently
   open host document; `endTestRun()` re-opens them after the run.
4. **Leftover cleanup.** `deleteAllTestDocuments()` runs on app start, when
   the overlay opens, and at the start of each run — anything titled with
   `===TEST===` is evicted.
5. **No timeout.** A test can hang indefinitely; the runner won't kill it.

### UI

**Left panel — selection:**
- Master "Available Tests" checkbox + "{N} selected" / Clear / Run bulk
  action bar (overlays header when any test is selected).
- All tests are auto-selected whenever the test list changes.
- Group rows: checkbox (full/partial/empty), group name, "{selected}/{total}".
- Test rows: checkbox, status icon (spinning clock = running, green check =
  passed, red X = failed, blue % circle = scored), test name, result badge
  ("Passed" / "Failed" / "{passed}/{total} ({pct}%)").
- Click a test name to focus the output log on that test (other lines dim
  to 20% opacity); click again to unfocus.
- Footer: "{total} tests in {N} groups" + green "{passed} passed" / red
  "{failed} failed" once results exist.

**Right panel — output:**
- Buttons: **Copy** (all output), **Copy Failing Tests** (lines whose
  `testId` matches a failed test), **Clear** (output + results + focus).
- Monospace lines: `HH:MM:SS AM/PM - <message>`. Per-test `log?.()`
  output is prefixed with `[<test-id>]`.
- During a run: progress bar at the bottom: "Running: {group} :: {name}"
  and "{completed}/{total}".

### Running tests

```
1. Open Test Harness tab
2. (All tests are pre-selected.) Adjust with checkboxes if needed.
3. Click "Run" in the bulk action bar (only visible when ≥1 test selected)
4. Wait for status icons to stop spinning and progress bar to reach total
5. Read result badges + footer summary
6. For failures: click the test name to focus its log lines, or use
   "Copy Failing Tests" to copy them for analysis
```

### Writing tests

Files: `src/tests/**/*.primitive-test.ts` (matches the configured
`testsDir` + `testPattern`). Default and named array exports both work;
the plugin's virtual module spreads arrays and wraps single groups.

```typescript
import type { TestGroup } from "primitive-app";
import { Task } from "@/models/Task";

const myTests: TestGroup = {
  name: "My Feature",                    // shown as group header
  tests: [
    {
      id: "task-create-find",            // MUST be globally unique
      name: "Task: create and find",     // shown in test row
      run: async (ctx, log) => {
        log?.("creating...");

        // ctx.docId is already set as the default document for model ops.
        const task = new Task({ title: "Hello" });
        await task.save();               // implicitly uses ctx.docId

        const found = await Task.find(task.id as string);
        if (!found) throw new Error("not found");
        if (found.title !== "Hello")
          throw new Error(`title=${found.title}`);

        return "ok";                     // PASS
      },
    },
  ],
};

export default myTests;
// or: export const myTests = [...]   // arrays are spread
```

The signature is fixed: `(ctx: TestDocContext, log?: TestLogFn) => Promise<string>`.

| Outcome | Produce by | UI shows |
|---|---|---|
| Pass | Return any string | Green "Passed" + the string |
| Fail | Throw an `Error` | Red "Failed" + `error.message` |
| Scored | Return a string starting with `N/M (P%)` (e.g. `"3/5 (60%)"`) | Blue score badge with the parsed numbers |

The score regex is `/^(\d+)\/(\d+)\s*\((\d+(?:\.\d+)?)%\)/` — it MUST
appear at the start of the returned string.

### Common test mistakes

```typescript
// WRONG — test signature mismatched: missing async / wrong return type
const bad: TestGroup = {
  name: "Bad",
  tests: [
    {
      id: "x",
      name: "x",
      run: (ctx) => "synchronous return"  // run MUST return Promise<string>
    } as any
  ]
};

// WRONG — duplicate id across files: only one will appear in the runner
{ id: "test-1", ... }   // in tests/a.primitive-test.ts
{ id: "test-1", ... }   // in tests/b.primitive-test.ts  — CONFLICT

// WRONG — no error means PASS even if the assertion is missing
run: async (_ctx) => {
  const found = await Task.find("nope");
  // forgot to throw if !found
  return "ok";
}

// WRONG — passing { targetDocument: ... } with the wrong id breaks isolation;
// rely on ctx.docId or pass it explicitly:
run: async (ctx) => {
  await new Task({ title: "x" }).save({ targetDocument: ctx.docId }); // ok
  // NOT { targetDocument: someOtherDoc } — that record won't get cleaned up
  return "ok";
}

// WRONG — the file extension matters. Vite plugin discovers
// `**/*.primitive-test.ts` only. `.test.ts` will be ignored.
//   src/tests/foo.test.ts          ← NOT discovered
//   src/tests/foo.primitive-test.ts ← discovered

// WRONG — log() will throw if log is undefined; always use optional chaining
run: async (_ctx, log) => {
  log("starting");      // may TypeError; do log?.("starting")
  return "ok";
}
```

### Scored test example

```typescript
{
  id: "compat",
  name: "compatibility checks",
  run: async (_ctx, log) => {
    const checks = [check1(), check2(), check3(), check4(), check5()];
    const passed = checks.filter(Boolean).length;
    const total = checks.length;
    const pct = ((passed / total) * 100).toFixed(1);
    log?.(`${passed}/${total} passed`);
    return `${passed}/${total} (${pct}%)`;   // blue score badge
  },
}
```

### Element-identification cheat sheet

| Element | How to find it |
|---|---|
| Test Harness tab | Sidebar icon, `title="Test Harness"` |
| Master checkbox | First checkbox in left panel header (adjacent to "Available Tests") |
| Bulk action bar | Overlays the left-panel header when ≥1 test selected; contains "{N} selected", Clear, Run |
| Run button | Inside the bulk action bar; play icon + text "Run" |
| Group row | Has the group name, a checkbox, and "{selected}/{total}" |
| Test row | Has a checkbox, a status icon, the test name, and (after run) a result badge |
| Output log line | Selector `[data-test-id="<test-id>"]` per per-test line |
| Copy / Copy Failing Tests / Clear | Top-right of the right panel |
| Progress bar | Bottom of right panel during a run |

---

## Blob Explorer

Three-panel layout sharing the document sidebar with Document Explorer.

- **Left** — Document sidebar (selection state shared with Document Explorer).
- **Middle** — Toolbar (document title, blob ID search, Refresh, Upload),
  paginated table (Filename / Content Type / Size / Uploaded / Blob ID),
  per-row hover Download/Delete, checkbox column for bulk select (write
  users only), and a bulk action bar showing selected count + Delete.
- **Right** — Collapsible blob detail (≥ lg breakpoint by default):
  Preview (images / PDFs / short text/CSV), Actions (Download, Open in
  new tab, Delete), Info (Blob ID, Filename, Content Type, Size,
  Uploaded date, SHA-256). IDs are click-to-copy.

Search mode: typing in the blob-ID search switches to exact server-side
lookup and hides pagination. Pagination size (10/25/50/100) is persisted
in localStorage. Upload requires write access. Bulk-delete requires write
access.

### Element-identification cheat sheet

| Element | How to find it |
|---|---|
| Blob Explorer tab | Sidebar icon, `title="Blob Explorer"` |
| Blob ID search | Text input in middle-panel toolbar |
| Upload | "Upload" button in toolbar (write users) |
| Refresh | Circular-arrow icon in toolbar |
| Row download / delete | Hover actions on each row |
| Bulk action bar | Replaces toolbar when rows are checked |
| Detail panel | Right edge; collapse arrow on its left edge |

---

## Browser-console debugging

When the host runs on a debug origin (`localhost`, `127.0.0.1`, `[::1]`,
`*.localhost`, `*.local`), the client and registered models are exposed
on `window`:

```javascript
// Models registered via the JsBaoClientService config (PascalCase keys)
Object.keys(window.__primitiveAppModels)
// → ["Task", "Product", ...]

await window.__primitiveAppModels.Task.query({})
await window.__primitiveAppModels.Task.query({ completed: false })
await window.__primitiveAppModels.Task.query({ priority: { $gte: 3 } })
await window.__primitiveAppModels.Task.find("some-id")
await window.__primitiveAppModels.Task.count({ completed: false })

// New record needs an explicit targetDocument when no default is set
const t = new window.__primitiveAppModels.Task({ title: "x" });
await t.save({ targetDocument: "some-doc-id" });

// Underlying client (auth, documents, etc.)
await window.__primitiveAppClient.me.get();
await window.__primitiveAppClient.documents.list();
```

Not exposed in production builds or non-debug hostnames.

---

## Browser automation tips

- Wait for the floating button before doing anything else — it's gated
  on auth and on host-app mount (a `MutationObserver` watches `#app`).
- The first overlay open runs `deleteAllTestDocuments()` (a syncMetadata
  + list + evict-each pass). On a slow connection this can take a few
  seconds — wait for the spinner labelled "Initializing dev tools..."
  to clear before interacting.
- If you see "Initialization Failed", click "Retry". This usually means
  leftover-test-doc cleanup hit an error.
- Validation workflow: act in the host app → open Document Explorer →
  pick the document → switch model via dropdown → filter → read.
- Test workflow: Test Harness tab → adjust selection → Run → wait for
  spinners to stop and progress to reach total → read badges → use
  "Copy Failing Tests" to capture failures.
- Don't try to drag the floating button — keep pointer movement under 3px
  during click, otherwise it repositions instead of opening.
- Escape behavior is layered: nested `[role=dialog][data-state=open]`,
  `[data-devtools-modal]`, `[data-devtools-dropdown]`, and focused
  inputs/textareas/selects all consume Escape before the overlay does.
