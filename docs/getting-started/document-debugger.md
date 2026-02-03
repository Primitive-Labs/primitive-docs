# Document Debugger

The Document Debugger is a powerful development tool included with `primitive-app` that lets you inspect and manage documents and data in your application. It's invaluable for debugging data issues, testing model relationships, and understanding how your data is structured.

## Accessing the Debugger

The Document Debugger is provided by the `primitiveDevTools` Vite plugin. In development mode, a floating button appears in the corner of your app that opens the dev tools overlay.

To enable it, configure the plugin in your `vite.config.ts`:

```typescript
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

Click the floating dev tools button to open the overlay, then select "Document Explorer" to access the debugger.

## Document Management

The left sidebar shows all documents you have access to—both documents you own and documents shared with you.

### Document List Features

- **Search** — Filter documents by title or ID using the search bar
- **Pagination** — Navigate through large document lists (25 per page)
- **Permission badges** — See your access level for each document (Owner, Editor, Viewer)
- **Active indicator** — Shows which document is currently open

### Document Actions

For documents you own, you can:

- **Create** — Click "Add" to create a new document
- **Rename** — Click the edit icon to rename a document
- **Delete** — Click the trash icon to delete a document (cannot delete the currently active document)
- **Mass Delete** — Delete multiple owned documents at once via the menu

::: tip
Shared documents (where you're an Editor or Viewer) cannot be deleted—only the owner can delete a document.
:::

## Exploring Data

When you select a document, the main panel shows all your js-bao models with their record counts. The debugger automatically discovers all models registered in your app.

### Model Overview

Each model card displays:

- **Model name** and table name
- **Record count** in the selected document
- Click to navigate to the detailed per-model view

### Per-Model View

Clicking a model takes you to a detailed view with a data table showing all records. From here you can:

**Filter records:**
- Add multiple filters with various operators (equals, contains, starts with, greater than, etc.)
- Combine filters for complex queries
- Clear individual filters or all at once

**Sort records:**
- Sort by any field (ascending or descending)
- Multi-field sorting with drag-to-reorder priority
- Click column headers for quick single-field sorting

**View data:**
- Toggle "Show hidden fields" to see internal fields (prefixed with `_`)
- Expand JSON fields in a full-screen editor
- See field relationships to other models

## CRUD Operations

The Document Debugger provides full Create, Read, Update, Delete capabilities:

### Creating Records

1. Click "Add Record" in the document header
2. Select which model to create a record for
3. Fill in the field values using type-aware editors
4. Click "Create Record"

The form automatically handles different field types:
- **Text fields** — Standard input
- **Boolean fields** — Toggle switch
- **Date fields** — Calendar picker
- **Relationship fields** — Dropdown of related records
- **StringSet fields** — Tag-style editor for adding/removing items
- **JSON fields** — Expandable textarea with pretty-print option

### Editing Records

1. Click the edit icon on any record row
2. Modify field values in the dialog
3. Click "Save Changes"

Note that the `id` field is read-only and cannot be modified.

### Deleting Records

- **Single record** — Click the trash icon on a record row and confirm
- **Mass delete** — Select multiple records and delete them in batch

## Model Information

Click the info icon on any model to view detailed schema information:

- **Fields** — All fields with their types, indexes, and properties
- **Indexed fields** — Fields that are indexed for faster queries
- **Unique constraints** — Field combinations that must be unique
- **Relationships** — How this model connects to other models
- **Instance methods** — Custom methods defined on the model
- **Static methods** — Class-level methods like custom finders

This is helpful for understanding your data model structure and debugging relationship issues.

## Scoped Queries

All queries in the Document Debugger are **scoped to the selected document**. This means:

- Record counts show only records in that document
- Filters apply only to data in the current document
- Creating records saves them to the current document

This matches how documents work in production—data is isolated per document unless you explicitly query across documents.

## Production Behavior

The dev tools overlay only appears in development mode (`import.meta.env.DEV`). In production builds, the floating button and overlay are automatically excluded, so you don't need to manually disable them.

## Next Steps

- **[Understanding Documents](./understanding-documents.md)** — Learn how documents and sharing work
- **[Working with Data](./working-with-data.md)** — Define models and perform CRUD operations
- **[Deploying to Production](./deploying-to-production.md)** — Deploy your app to Cloudflare Workers
